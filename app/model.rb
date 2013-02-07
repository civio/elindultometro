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
  property :court,        String, :length => 140
  property :court_type,   String, :length => 80
  property :region,       String, :length => 2
  property :trial_date,   Date
  property :role,         String, :length => 40
  property :crime,        String, :length => 1500
  property :crime_start,  String, :length => 4
  property :crime_end,    String, :length => 4
  property :pardon_type,  String, :length => 15
  property :pardon,       String, :length => 800
  property :caveats,      String, :length => 650
  property :pardon_date,  Date
  property :pardon_year,  String, :length => 4       # convenient
  property :signature,    String, :length => 70
  has n, :pardon_crime_categories
end

class PardonCrimeCategory
  include DataMapper::Resource

  property :id,             Serial, :key => true
  property :boe,            String, :length => 20
  property :crime,          String, :length => 100
  property :crime_cat,      String, :length => 2
  property :crime_sub_cat,  String, :length => 3
  belongs_to :pardon  # defaults to :required => true
end

class CrimeCategory
  include DataMapper::Resource

  property :id,             Serial, :key => true
  property :crime_cat,      String, :length => 2
  property :crime_sub_cat,  String, :length => 3
  property :description,    String, :length => 100
end

DataMapper.auto_upgrade!