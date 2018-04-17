RACK_ENV='development' if not defined?(RACK_ENV)

require 'rubygems'
require 'bundler'
Bundler.require(:default, RACK_ENV)

require 'sinatra'
require './app/api'

# get csv files with Rack
use Rack::Static, :urls => ["/data"]

run IndultometroApi
