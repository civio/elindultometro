RACK_ENV='development' if not defined?(RACK_ENV)

require 'rubygems'
require 'bundler'
Bundler.require(:default, RACK_ENV)

require 'sinatra'
require './app/api'

# Make sure site can be embedded (ideally just the search form, but...)
use Rack::XFrameOptions, "ALLOWALL"

# get csv files with Rack
use Rack::Static, :urls => ["/data"]

run IndultometroApi
