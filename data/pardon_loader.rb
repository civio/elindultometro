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

      if line[0] == 'BOE'       # Parse header
        parse_header(line)
        next
      end

      # FIXME: Remove year 1995

      Pardon.create!( :id => field(line, 'BOE'), 
                      :boe_date => date_field(line, 'Fecha_BOE'),
                      :ministry => field(line, 'Departamento'),
                      :gender => field(line, 'Género'),
                      :court => field(line, 'Tribunal'),
                      :court_type => field(line, 'Tipo_Tribunal'),
                      :region => field(line, 'idCCAA_Tribunal'),
                      :trial_date => date_field(line, 'Fecha_Condena'),
                      :role => field(line, 'Papel'),
                      :crime => field(line, 'Crimen_Sentencia'),
                      :crime_start => field(line, 'Año_Inicio_Crimen'),
                      :crime_end => field(line, 'Año_Fin_Crimen'),
                      :pardon_type => field(line, 'Tipo_Indulto'),
                      :pardon => field(line, 'Reducción/Nueva_Condena'),
                      :caveats => field(line, 'Condición'),
                      :pardon_date => date_field(line, 'Fecha Concesión'),
                      :pardon_year => field(line, 'Año_Concesión'),
                      :signature => field(line, 'Ministro')
                      )

    end
  end

end