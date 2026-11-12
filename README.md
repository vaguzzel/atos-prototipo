# Prototipo interactivo de ATOS

Prototipo de alta fidelidad de ATOS, la solución de Terabyte para el Terminal Portuario Aconcagua S.A.
(Bases Técnicas Transversales, Cap. 25; RT-25.01 a RT-25.10). Es un sitio estático: sin servicios de fondo, sin base de datos y sin
autenticación real. Los datos son simulados, viven en memoria y vuelven al estado inicial al recargar o con
«Reiniciar demostración». Nada se carga desde otro sitio: las fuentes (con su licencia OFL), los íconos y los
scripts van en el paquete, así que funciona igual en GitHub Pages y abriendo `index.html` desde el disco.

**Enlace publicado:** https://vaguzzel.github.io/atos-prototipo/, desde el repositorio público
`vaguzzel/atos-prototipo` (rama `main`, carpeta raíz). Para actualizarlo, se copia de nuevo esta carpeta sin `pruebas/`
y se sube a ese repositorio.

## Qué hay en la carpeta

| Ruta | Contenido |
|---|---|
| `index.html` | Página única; enrutamiento por fragmento (`#/ruta`) |
| `css/atos.css` | Sistema de diseño «Bahía serena»: cinco colores con sus tintes, dos familias, vidrio esmerilado, componentes y sus estados |
| `js/base.js` | Utilidades, idioma persistente, ISO 6346, RUT, patente, búsqueda tolerante e íconos |
| `js/datos.js` | Datos simulados con semilla fija (todo nombre de persona, empresa o nave es ficticio) |
| `js/componentes.js`, `js/graficos.js` | Componentes reutilizables y gráficos SVG con su tabla de datos |
| `js/marco.js` | Armazón: perfiles y permisos, menús, rastro, búsqueda, notificaciones, panel de demostración, atajos y recorrido guiado |
| `js/vistas-*.js` | Pantallas por módulo |
| `fuentes/` | Cormorant Garamond y Source Sans 3 (woff2) con su licencia |
| `docs/` | Guion de demostración y, escritos por las pruebas, la arquitectura de información, el sistema de diseño y el informe de pruebas |
| `pruebas/` | Pruebas en Edge sin interfaz y armado del `.zip` (no se publican) |

## Verlo en el computador

Abre `index.html` en el navegador. En el inicio de sesión eliges el perfil de demostración (19 perfiles);
cualquier correo válido y una contraseña de 8 caracteres o más sirven, y el segundo factor acepta cualquier
código de 6 dígitos. El botón «Demostración», abajo a la izquierda, cambia de perfil e idioma, simula la caída
del enlace (ELC) y la pérdida de cobertura en terreno, dispara una alarma reefer, salta al inicio de cada flujo
del guion, activa el modo trazabilidad, enciende o apaga el agua en movimiento de la portada y del acceso, y
reinicia la demostración. El botón de pausa del encabezado detiene todas las animaciones (WCAG 2.2.2); si el
sistema pide menos movimiento, la portada se muestra quieta en su estado final.

## Documentos que se entregan con el prototipo

El sistema de diseño (RT-25.05) y la arquitectura de información (RT-25.09) son obligatorios, pero no son pantallas
del prototipo: `prueba_edge.mjs` los escribe en `docs/sistema_diseno.md` y `docs/arquitectura_informacion.md`
desde el propio código, así que siempre coinciden con lo que se navega.

## Verificar antes de publicar

```
node prototipo/pruebas/prueba_edge.mjs <carpeta temporal> <ruta de axe.min.js>
```

`prueba_edge.mjs` necesita Node 22 o superior, Microsoft Edge y `axe-core` (por ejemplo, `npm install axe-core`
en una carpeta temporal; se usa solo para probar y no va en el paquete). Recorre todas las rutas con todos los
perfiles, corre axe-core en cada pantalla, revisa el desplazamiento horizontal en cinco tamaños, ejecuta los
flujos del guion, guarda capturas y escribe `docs/informe_pruebas.md` y `docs/arquitectura_informacion.md`.

## Paquete sin conexión (RT-25.10)

```
python prototipo/pruebas/empaquetar.py
```

Deja `build/prototipo/atos-prototipo.zip`. Se descomprime y se abre `atos-prototipo/index.html`, sin red.

## Publicarlo en GitHub Pages (RT-25.06 y RT-25.07)

El enlace público sale de un repositorio público dedicado al prototipo.

1. En GitHub, crea un repositorio **público**, por ejemplo `atos-prototipo`.
2. Sube a su raíz el contenido de esta carpeta, **sin** `pruebas/`: `index.html`, `README.md`,
   `css/`, `js/`, `fuentes/` y `docs/` (o descomprime el `.zip` y sube su contenido).
3. En *Settings* → *Pages*, elige *Deploy from a branch*, la rama `main` y la carpeta `/ (root)`, y guarda.
4. En uno o dos minutos queda en `https://<usuario>.github.io/atos-prototipo/`. Ábrelo en una ventana privada
   para comprobar que no pide iniciar sesión en GitHub.
5. RT-25.07 exige que siga disponible al menos seis meses: no borres ni archives ese repositorio.
