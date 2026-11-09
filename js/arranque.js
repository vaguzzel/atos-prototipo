/* ATOS · arranque: idioma persistente, orden de rutas (las fijas antes que las de parámetro), eventos y primer render. */
'use strict';
(function arrancar() {
  fijarIdioma(IDIOMA);
  RUTAS.sort((a, b) => a.claves.length - b.claves.length);
  instalarEventos();
  if (!location.hash) location.replace('#/');
  render();
}());
