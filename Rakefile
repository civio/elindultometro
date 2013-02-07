# encoding: utf-8

require './data/pardon_loader'
require './data/pardonCrimeCategory_loader'
require './data/crimeCategory_loader'

namespace 'pardons' do

  desc "Carga información sobre indultos a la base de datos"
  task :load do
    Pardons::load_pardons('data/indultos.csv')
  end

end

namespace 'pardon_crime_categories' do

  desc "Carga información sobre las categorización de los crímenes de cada indulto a la base de datos"
  task :load do
    PardonCrimeCategories::load_pardonCrimeCategory('data/indultos_cat_crimen.csv')
  end

end

namespace 'crime_categories' do

  desc "Carga información sobre las categorías de los crímenes basado en el código penal a la base de datos"
  task :load do
    CrimeCategories::load_crimeCategory('data/codigo_penal.csv')
  end

end
