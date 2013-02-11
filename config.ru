RACK_ENV='development' if not defined?(RACK_ENV)

require 'rubygems'
require 'bundler'
Bundler.require(:default, RACK_ENV)

# Defined in ENV on Heroku. To try locally, start memcached and uncomment:
# ENV["MEMCACHIER_SERVERS"] = "localhost"
# see http://henrik.nyh.se/2012/07/sinatra-with-rack-cache-on-heroku/
if memcache_servers = ENV["MEMCACHIER_SERVERS"]
  use Rack::Cache,
    verbose: true,
    metastore:   "memcached://#{memcache_servers}",
    entitystore: "memcached://#{memcache_servers}"
end

require 'sinatra'
require './app/app'
run IndultometroApp
