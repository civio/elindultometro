require "rubygems"
require "bundler/setup"

require 'sinatra/base'
require 'json'
require './app/model'

class IndultometroApp < Sinatra::Base

  before do
    # TODO: Improve caching with ETags http://www.sinatrarb.com/intro#Cache%20Control
    cache_control :public, :must_revalidate, :max_age => 3600
  end

  get '/' do
    indultos = Indulto.all()
    callback_name = params['callback']

    if callback_name
      response.headers['Content-Type'] = 'text/javascript; charset=utf8'
      response.headers['Access-Control-Allow-Origin'] = '*'
      response.headers['Access-Control-Max-Age'] = '3600'
      response.headers['Access-Control-Allow-Methods'] = 'GET'

      "#{callback_name}(#{indultos.to_json})"
    else
      content_type :json
      indultos.to_json
    end
  end
end
