Base para crear una APP
Deploy en vercel
BDD en supabase
Variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY OJO A esto!
APP NEXT.js
De base solo requiere visualizar la tabla HACK_URBA_1 en supabase
Schema de la tabla:create table public."HACK_URBA_1" (
  "ID" bigint not null,
  referencia_catastral text null,
  municipio text null,
  clase_suelo text null,
  categoria_suelo text null,
  ambito_planeamiento text null,
  ambito_codigo text null,
  unidad_ejecucion text null,
  zonificacion text null,
  subzonificacion text null,
  ordenanza text null,
  instrumento_planeamiento text null,
  edificabilidad_m2m2 double precision null,
  ocupacion_maxima_pct bigint null,
  altura_max_plantas bigint null,
  superficie_parcela_m2 bigint null,
  licencia_urbanistica text null,
  longitud numeric null,
  latitud numeric null,
  doc_url text null,
  constraint HACK_URBA_1_pkey primary key ("ID")
) TABLESPACE pg_default;

Actualiza Agents MD si en alguna versión se actualiza la tabla u otros detalles
Este Agents es solo una base inicial para la APP
