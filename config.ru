RACK_ENV='development' if not defined?(RACK_ENV)

require 'rubygems'
require 'bundler'
Bundler.require(:default, RACK_ENV)

require 'sinatra'
require './app/api'

# Defined in ENV. To try locally, start memcached and uncomment:
# ENV["MEMCACHE_SERVERS"] = "localhost"
if memcache_servers = ENV["MEMCACHIER_SERVERS"]
  use Rack::Cache,
    verbose: true,
    metastore:   "memcached://#{memcache_servers}/meta",
    entitystore: "memcached://#{memcache_servers}/body"
end

# Make sure site can be embedded (ideally just the search form, but...)
use Rack::XFrameOptions, "ALLOWALL"

# get csv files with Rack
use Rack::Static, :urls => ["/data"]

run IndultometroApi
