require "rubygems"
require "bundler/setup"
require 'data_mapper'

DataMapper.setup(:default, ENV['DATABASE_URL'] || "postgres://localhost/indultometro")

class Indulto
  include DataMapper::Resource

  property :id,           String, :length => 20, :key => true
  property :year,         String, :length => 5
  property :delito,       String, :length => 100
end

DataMapper.auto_upgrade!