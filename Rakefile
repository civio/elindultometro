# encoding: utf-8

require './data/pardon_loader'
require './data/pardonCrimeCategory_loader'

namespace 'pardons' do

  desc "Carga información sobre indultos a la base de datos"
  task :load do
    Pardons::load_pardons('data/indultos.csv')
  end

end

namespace 'crime_categories' do

  desc "Carga información sobre las categorías de los crímenes a la base de datos"
  task :load do
    PardonCrimeCategories::load_pardonCrimeCategory('data/indultos_cat_crimen.csv')
  end

end
