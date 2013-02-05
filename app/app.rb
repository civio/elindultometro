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

  get '/api/summary' do
    set_cache_headers

    count = repository(:default).adapter.select('SELECT pardon_year, count(pardon_year) FROM pardons GROUP BY pardon_year ORDER BY pardon_year ASC')
    result = []
    count.each do |item| 
      result.push({ :year => item.pardon_year.to_i, :count => item.count })
    end

    send_response(response, result.to_json, params)
  end

  get '/api/pardons' do
    set_cache_headers

    year = params['year'] || '2013'
    pardons = Pardon.all(:pardon_year => year, :fields => [:id, :pardon_date, :role, :crime])
    result = pardons.to_json
    
    send_response(response, result, params)
  end

  get '/api/search' do
  end

  def set_cache_headers
    # TODO: Improve caching with ETags http://www.sinatrarb.com/intro#Cache%20Control
    cache_control :public, :must_revalidate, :max_age => 3600
  end

  def send_response(response, result, params)
    if params['callback']
      response.headers['Content-Type'] = 'text/javascript; charset=utf8'
      response.headers['Access-Control-Allow-Origin'] = '*'
      # FIXME response.headers['Access-Control-Max-Age'] = '3600'
      response.headers['Access-Control-Allow-Methods'] = 'GET'

      "#{params['callback']}(#{result})"
    else
      content_type :json
      result
    end
  end
end
