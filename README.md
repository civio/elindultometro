El indultometro 
============

TODO: Documentar esto mucho mejor :/

#### Instalación del front-end

 * [Instalar Jekyll][1]
        
 * Arrancar Jekyll: `jekyll --serve --auto`

[1]: http://jekyllbootstrap.com/usage/jekyll-quick-start.html

#### Despliegue del front-end

 * Github Pages: no está permitido usar plugins, pero necesito de i18n de Jekyll
 
 * Heroku: se puede, pero quiero tener dos apps Heroku para esto?
 
 * Dropbox/Site44: podría llegar a alcanzar el límite de ancho de banda
 
 * Amazon S3

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
     
     $ CREATE TEXT SEARCH CONFIGURATION unaccent ( COPY = pg_catalog.simple );

     $ ALTER TEXT SEARCH CONFIGURATION unaccent
        ALTER MAPPING FOR hword, hword_part, word
        WITH unaccent, simple;

via [esto](https://devcenter.heroku.com/articles/heroku-postgres-extensions-postgis-full-text-search#full-text-search-dictionaries) y [esto](http://domas.monkus.lt/full-text-search-postgresql)