require "rubygems"
require "bundler/setup"

require 'sinatra/base'
require 'dalli'

require 'json'
require './app/model'

# Enable New Relic plugin
configure :production do
  require 'newrelic_rpm'
end

class IndultometroApi < Sinatra::Base

  set :cache, Dalli::Client.new

  # Return a yearly pardon count
  get '/api/summary' do
    set_cache_headers

    sql =   'SELECT
              pardon_year,
              count(pardon_year)
            FROM
              pardons p '
    unless params['is_corruption'].nil? or params['is_corruption']==''
      sql += 'WHERE id IN (SELECT boe FROM pardon_crime_categories WHERE is_corruption = TRUE)'
    end
    sql += 'GROUP BY p.pardon_year
            ORDER BY p.pardon_year ASC'

    count = repository(:default).adapter.select(sql)
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

  # Return all categories and subcategories.
  # Subcategories are expressed in the form <category id>.<subcategory id>
  get '/api/categories' do
    set_cache_headers

    categories = CrimeCategory.all
    result = {}
    categories.each do |category|
      if category.crime_sub_cat.nil?
        result[category.crime_cat] = category.description
      else
        result["#{category.crime_cat}.#{category.crime_sub_cat}"] = category.description
      end
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

  # Return <limit> pardons with the least timeDiff between trial and sentence dates
  get '/api/pardons/timediff/:limit' do
    set_cache_headers

    pardons = []
    if ( params['limit'] ) # Otherwise returning the whole DB is too much
      # Define basic query. We need custom SQL for free-text stuff
      sql_arguments = []
      sql = "SELECT
          p.id,
          p.pardon_date,
          p.pardon_type,
          p.crime,
          (p.pardon_date - p.trial_date) as diffdays
        FROM
          pardons as p
        WHERE
          CAST(pardon_year AS INT) > 1995
        ORDER BY
          diffdays asc
        LIMIT ?"
      sql_arguments.push params['limit']
      result = []
      pardons = repository(:default).adapter.select(sql, *sql_arguments)
      pardons.each do |item|
        result.push({ :id => item.id, :pardon_date => item.pardon_date,
                      :pardon_type => item.pardon_type, :crime => item.crime, :diffdays => item.diffdays.to_i})
      end
    end

    send_response(response, result, params)
  end

  # Return percentiles timeDiff by crime category
  get '/api/categories/percentiles' do
    set_cache_headers

    percentiles = repository(:default).adapter.select('
      SELECT
        pcc.crime_cat as crime_cat,
        count(*) as num_crimes,
        my_percentile_cont(array_agg(p.pardon_date - p.trial_date),0.25) as q1,
        my_percentile_cont(array_agg(p.pardon_date - p.trial_date),0.50) as q2,
        my_percentile_cont(array_agg(p.pardon_date - p.trial_date),0.75) as q3
      FROM
        pardons as p,
        pardon_crime_categories as pcc
      WHERE
        p.id = pcc.boe AND
        p.trial_date IS NOT NULL AND
        CAST(p.pardon_year AS INT) > 1995
      GROUP BY
        pcc.crime_cat
      ORDER BY
        q2 asc')
    result = []
    percentiles.each do |item|
      result.push({ :crime_cat => item.crime_cat.to_i, :count => item.num_crimes,
                    :q1 => item.q1, :q2 => item.q2, :q3 => item.q3})
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
            p.id, p.pardon_date, p.pardon_year, p.pardon_type, p.crime, p.trial_date, p.gender, p.ministry, p.signature
          FROM
            pardons p,
            pardon_crime_categories as pcc
          WHERE
            p.id = pcc.boe"

    # Add extra conditions, if present
    unless params['q'].nil? or params['q']==''
      # NOTE: You'll need to create the unaccent dictionary and search configuration, as
      # described in the documentation added spanish stemming.
      sql += " AND (to_tsvector('unaccent_spa', p.crime) @@ plainto_tsquery('unaccent_spa', ?) OR \
                  to_tsvector('unaccent_spa', p.signature) @@ plainto_tsquery('unaccent_spa', ?))"
      sql_arguments.push params['q']
      sql_arguments.push params['q']
    end

    unless params['year'].nil? or params['year']==''
      sql += " AND p.pardon_year = ?"
      sql_arguments.push params['year']
    end

    unless params['region'].nil? or params['region']==''
      # TODO: This handling of NULLs is a hack: we should set a special value in the loader
      if ( params['region'] == 'NULL' )
        sql += " AND p.region IS NULL"
      else
        sql += " AND p.region = ?"
        sql_arguments.push params['region']
      end
    end

    unless params['category'].nil? or params['category']==''
      # The given argument could be a subcategory (category.subcategory), so we split along '.'
      category, subcategory = params['category'].split('.')

      # The category is always there...
      sql += " AND pcc.crime_cat = ?"
      sql_arguments.push category

      # The subcategory sometimes
      if subcategory
        sql += " AND pcc.crime_sub_cat = ?"
        sql_arguments.push subcategory
      end
    end

    unless params['is_corruption'].nil? or params['is_corruption']==''
      sql += " AND pcc.is_corruption = TRUE"
    end

    # Run the query and return the results.
    # XXX: Returns the whole database if no filters are given: we used to return a blank response,
    # which was very confusing and had bad UX (since we didn't handle it in the front-end).
    # The full serialized DB is around 3.5MB, so we'll leave like this for now.
    # TODO: Adding the group by here is a bit of a last minute hack
    result = []
    result = repository(:default).adapter.select(sql+" GROUP BY p.id", *sql_arguments)
    result.collect! {|pardon| pardon_summary(pardon) }
    send_response(response, result, params)
  end

  def pardon_summary(pardon)
    summary = {}
    [:id, :pardon_date, :pardon_year, :pardon_type, :trial_date, :gender, :ministry, :signature, :crime].each do |field|
      summary[field] = pardon[field]
    end
    summary
  end

  def set_cache_headers
    # TODO: Improve caching with ETags http://www.sinatrarb.com/intro#Cache%20Control
    cache_control :public, :must_revalidate, :max_age => 3600
  end

  def send_response(response, result, params)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET'
    content_type :json
    result.to_json
  end
end
