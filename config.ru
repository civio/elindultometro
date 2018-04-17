require 'newrelic_rpm'

require_relative 'app/api'

# get csv files with Rack
use Rack::Static, :urls => ["/data"]

run IndultometroApi
