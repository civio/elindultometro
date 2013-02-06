# encoding: utf-8

require File.dirname(__FILE__) + '/csv_loader'
require File.dirname(__FILE__) + '/../app/model'

require 'date'

module Pardons

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

  def self.load_pardons(filename)
    puts "Borrando indultos de la base de datos..."
    Pardon.destroy

    puts "Cargando indultos de #{filename}..."
    CSVLoader.parseCSV(filename) do |line|
      next if line[0] =~ /^#/   # Ignore comments

      if line[0] == 'boe'       # Parse header
        parse_header(line)
        next
      end
      
      pYear = field(line, 'pardon_year')
      next if pYear.eql?"1995"  

      Pardon.create!( :id => field(line, 'boe'), 
                      :boe_date => date_field(line, 'boe_date'),
                      :ministry => field(line, 'ministry'),
                      :gender => field(line, 'gender'),
                      :court => field(line, 'court'),
                      :court_type => field(line, 'court_type'),
                      :region => field(line, 'court_region_id'),
                      :trial_date => date_field(line, 'trial_date'),
                      :role => field(line, 'role'),
                      :crime => field(line, 'crimes_sentences'),
                      :crime_start => field(line, 'crime_initial_year'),
                      :crime_end => field(line, 'crime_final_year'),
                      :pardon_type => field(line, 'pardon_type'),
                      :pardon => field(line, 'new_sentence'),
                      :caveats => field(line, 'condition'),
                      :pardon_date => date_field(line, 'pardon_date'),
                      :pardon_year => pYear,
                      :signature => field(line, 'signature')
                      )
    end
  end

end