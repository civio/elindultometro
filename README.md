El indultometro 
============

TODO: Documentar esto mucho mejor :/

#### Instalación del front-end

 * [Instalar Jekyll][1]
        
 * Arrancar Jekyll: `jekyll --serve --auto`

[1]: http://jekyllbootstrap.com/usage/jekyll-quick-start.html

#### Instalación del back-end

 * `bundle install`
 
 * Crear base de datos Postgres, 'indultometro': `createdb indultometro`
 
 * Cargar datos: 

       $ rake crime_categories:load
       $ rake pardon_crime_categories:load
       $ rake pardons:load
 
 * Arrancar el servidor: `./server`
 
#### Configuración de la búsqueda en PostgreSQL

Para poder hacer búsquedas sin tener en cuenta los acentos, vía la consola de PostgreSQL (`psql` o `heroku pg:psql`):

     $ CREATE EXTENSION unaccent;
     
     $ CREATE TEXT SEARCH CONFIGURATION unaccent_spa ( COPY = pg_catalog.spanish );

     $ ALTER TEXT SEARCH CONFIGURATION unaccent_spa
        ALTER MAPPING FOR hword, hword_part, word
        WITH unaccent, spanish_stem;

via [esto](https://devcenter.heroku.com/articles/heroku-postgres-extensions-postgis-full-text-search#full-text-search-dictionaries) y [esto](http://domas.monkus.lt/full-text-search-postgresql)