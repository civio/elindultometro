require "rubygems"
require "bundler/setup"

require 'sinatra/base'

# require './app/model'

class IndultometroApp < Sinatra::Base
  
  get '/' do
    "Hello world!"
  end
end
