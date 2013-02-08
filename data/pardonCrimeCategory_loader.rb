# encoding: utf-8

require File.dirname(__FILE__) + '/csv_loader'
require File.dirname(__FILE__) + '/../app/model'

require 'date'

module PardonCrimeCategories

  @@fields = {}

  def self.parse_header(header)
    header.each_with_index do |field, i|
      @@fields[field] = i  
    end
  end

  def self.field(line, field)
    line[@@fields[field]]
  end

  def self.date_field(line, field)
    value = field(line, field)
    value.nil? ? nil : Date.strptime(value, '%Y-%m-%d')
  end

  def self.load_pardonCrimeCategory(filename)
    puts "Borrando las categorias de los indultos de la base de datos..."
    PardonCrimeCategory.destroy

    puts "Cargando las categorias de los indultos de #{filename}..."
    CSVLoader.parseCSV(filename) do |line|
      next if line[0] =~ /^#/   # Ignore comments

      if line[0] == 'boe'       # Parse header
        parse_header(line)
        next
      end  
      
      pYear = field(line, 'pardon_year')
      next if pYear.eql?"1995"

      PardonCrimeCategory.create!( :boe => field(line, 'boe'), 
                      :crime => field(line, 'crime'),
                      :crime_cat => field(line, 'crime_cat'),
                      :crime_sub_cat => field(line, 'crime_sub_cat'),
                      )
    end
  end

end