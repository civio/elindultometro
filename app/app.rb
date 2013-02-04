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

  get '/api/' do
    # TODO: Improve caching with ETags http://www.sinatrarb.com/intro#Cache%20Control
    cache_control :public, :must_revalidate, :max_age => 3600

    indultos = Indulto.all(:pardon_year => '2012', :fields => [:id, :pardon_date, :gender, :role, :crime, :signature])
    result = indultos.to_json

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
