# encoding: utf-8

require './csv_loader'
require '../app/model'

filename = 'indultos.csv'

puts "Borrando indultos de la base de datos..."
Indulto.destroy

puts "Cargando indultos de #{filename}..."
CSVLoader.parseCSV(filename) do |line|
  next if line[0] =~ /^#/   # Ignore comments
  Indulto.create(:id => line[0], :year => line[1], :delito => line[2])
end
