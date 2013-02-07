# encoding: utf-8

require File.dirname(__FILE__) + '/csv_loader'
require File.dirname(__FILE__) + '/../app/model'

require 'date'

module CrimeCategories

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

  def self.load_crimeCategory(filename)
    puts "Borrando las categorias del código penal de la base de datos..."
    CrimeCategory.destroy

    puts "Cargando las categorias del código penal de #{filename}..."
    CSVLoader.parseCSV(filename) do |line|
      next if line[0] =~ /^#/   # Ignore comments

      if line[0] == 'crime_cat'       # Parse header
        parse_header(line)
        next
      end  

      CrimeCategory.create!(:crime_cat => field(line, 'crime_cat'),
                      :crime_sub_cat => field(line, 'crime_sub_cat'),
                      :description => field(line, 'description'),
                      )
    end
  end

end