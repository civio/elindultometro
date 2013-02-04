# encoding: utf-8

require './data/pardon_loader'

namespace 'pardons' do

  desc "Carga información sobre indultos a la base de datos"
  task :load do
    Pardons::load_pardons('data/indultos.csv')
  end

end
