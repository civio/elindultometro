# encoding: utf-8

require './data/carga_indultos'

namespace 'indultos' do

  desc "Carga información sobre indultos a la base de datos"
  task :load do
    Indultos::carga_indultos('data/indultos.csv')
  end

end
