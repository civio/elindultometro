require "rubygems"
require "bundler/setup"

require 'sinatra/base'
require 'json'
require './app/model'

class IndultometroApp < Sinatra::Base
  
  get '/' do
    content_type :json

    indultos = Indulto.all()
    indultos.to_json
  end
end
