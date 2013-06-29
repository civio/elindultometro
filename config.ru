RACK_ENV='development' if not defined?(RACK_ENV)

require 'rubygems'
require 'bundler'
Bundler.require(:default, RACK_ENV)

require 'sinatra'
require './app/app'

# Defined in ENV on Heroku. To try locally, start memcached and uncomment:
# ENV["MEMCACHE_SERVERS"] = "localhost"
if memcache_servers = ENV["MEMCACHIER_SERVERS"]
  use Rack::Cache,
    verbose: true,
    metastore:   "memcached://#{memcache_servers}",
    entitystore: "memcached://#{memcache_servers}"
end

# get csv files with Rack
map "/get/rel_post_gender.csv" do
    run Rack::File.new("./data/rel_post_gender.csv")
end

map "/get/rel_post_crime.csv" do
    run Rack::File.new("./data/rel_post_crime.csv")
end

run IndultometroApp
 