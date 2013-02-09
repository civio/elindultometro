require "rubygems"
require "bundler/setup"

require 'sinatra/base'
require 'json'
require './app/model'

class IndultometroApp < Sinatra::Base

  # Enable serving of static files
  set :static, true
  set :public_folder, 'web/_site'

  get '/' do
    redirect '/index.html'
  end

  # Return a yearly pardon count
  get '/api/summary' do
    set_cache_headers

    count = repository(:default).adapter.select('
      SELECT 
        pardon_year, 
        count(pardon_year) 
      FROM 
        pardons 
      GROUP BY pardon_year 
      ORDER BY pardon_year ASC')
    result = []
    count.each do |item| 
      result.push({ :year => item.pardon_year.to_i, :count => item.count })
    end

    send_response(response, result, params)
  end
  
  # TODO: This is for treemap only. Remove if not used
  get '/api/cat_summary' do
    set_cache_headers
    count = repository(:default).adapter.select('
      SELECT 
        pcc.crime_cat, 
        cc.description, 
        count(*) as count 
      FROM 
        pardon_crime_categories as pcc, 
        crime_categories as cc
      WHERE 
        pcc.crime_cat = cc.crime_cat AND
        cc.crime_sub_cat IS NULL
      GROUP BY 
        pcc.crime_cat,
        cc.description 
      ORDER BY 
        pcc.crime_cat')
    result = []
    count.each do |item| 
      result.push({ :crime_cat => item.crime_cat.to_i, :description => item.description, :count => item.count })
    end

    send_response(response, result, params)
  end

  # Return all categories and subcategories
  get '/api/categories' do
    set_cache_headers

    categories = CrimeCategory.all(:crime_sub_cat => nil)
    result = categories.collect do |category|
      { 
        :category => category.crime_cat,
        :description => category.description
      }
    end

    send_response(response, result, params)
  end

  # Return all pardons for a given year
  get '/api/pardons/year/:year' do
    set_cache_headers

    pardons = []
    if ( params['year'] ) # Otherwise returning the whole DB is too much
      pardons = Pardon.all(:pardon_year => params['year'])
      # Keep only a summary of the data. I tried using DataMapper's field option, 
      # but didn't work, it kept populating the JSON with all the fields (!?)
      result = pardons.map {|pardon| pardon_summary(pardon) }
    end

    send_response(response, result, params)
  end

  # Return all known details for a given pardon id
  get '/api/pardons/:id' do
    set_cache_headers
    pardon = Pardon.get(params[:id])
    send_response(response, pardon, params)
  end

  # Search for pardons fulfilling a variable number of criteria
  get '/api/search' do
    set_cache_headers

    # Define basic query. We need custom SQL for free-text stuff
    sql_arguments = []
    sql = "SELECT
            p.id, p.pardon_date, p.pardon_type, p.crime, p.pardon_year
          FROM 
            pardons p,
            pardon_crime_categories as pcc
          WHERE 
            p.id = pcc.boe"

    # Add extra conditions, if present
    unless params['q'].nil? or params['q']==''
      # NOTE: You'll need to create the unaccent dictionary and search configuration, as
      # described in the documentation added spanish stemming.
      sql += " AND to_tsvector('unaccent_spa', p.crime) @@ plainto_tsquery('unaccent_spa', ?)"
      sql_arguments.push params['q']
    end

    unless params['category'].nil? or params['category']==''
      sql += " AND pcc.crime_cat = ?"
      sql_arguments.push params['category']
    end

    # Run the query and return the results. Return nothing if no parameters are sent
    result = []
    result = repository(:default).adapter.select(sql, *sql_arguments) unless sql_arguments.empty?
    result.collect! {|pardon| pardon_summary(pardon) }
    send_response(response, result, params)
  end

  def pardon_summary(pardon)
    summary = {}
    [:id, :pardon_date, :pardon_type, :crime, :pardon_year].each do |field|
      summary[field] = pardon[field]
    end
    summary
  end

  def set_cache_headers
    # TODO: Improve caching with ETags http://www.sinatrarb.com/intro#Cache%20Control
    # FIXME: sort out dev/prod caching
    # cache_control :public, :must_revalidate, :max_age => 3600
  end

  def send_response(response, result, params)
    if params['callback']
      response.headers['Content-Type'] = 'text/javascript; charset=utf8'
      response.headers['Access-Control-Allow-Origin'] = '*'
      # FIXME response.headers['Access-Control-Max-Age'] = '3600'
      response.headers['Access-Control-Allow-Methods'] = 'GET'

      "#{params['callback']}(#{result.to_json})"
    else
      content_type :json
      result.to_json
    end
  end
end
