require "rubygems"
require "bundler/setup"

require 'sinatra/base'
require 'json'
require './app/model'

class IndultometroApp < Sinatra::Base
  
  get '/' do
    # Indulto.all()
    content_type :json
    { :key1 => 'value1', :key2 => 'value2' }.to_json    
  end
end
