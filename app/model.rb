require "rubygems"
require "bundler/setup"
require 'data_mapper'

DataMapper.setup(:default, ENV['DATABASE_URL'] || "postgres://localhost/indultometro")

class Pardon
  include DataMapper::Resource

  property :id,           String, :length => 20, :key => true
  property :boe_date,     Date
  property :ministry,     String, :length => 30
  property :gender,       String, :length => 1
  property :court,        String, :length => 70
  property :court_type,   String, :length => 50
  property :region,       String, :length => 2
  property :trial_date,   Date
  property :role,         String, :length => 10
  property :crime,        String, :length => 200
  property :crime_start,  String, :length => 4
  property :crime_end,    String, :length => 4
  property :pardon_type,  String, :length => 10
  property :pardon,       String, :length => 100
  property :caveats,      String, :length => 100
  property :pardon_date,  Date
  property :pardon_year,  String, :length => 40       # convenient
  property :signature,    String, :length => 40
end

DataMapper.auto_upgrade!