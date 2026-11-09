# ATOS · Sistema de diseño «Bahía serena»

Sistema de diseño del prototipo interactivo de ATOS, la solución de Terabyte para el Terminal Portuario Aconcagua S.A. Se arma desde los estilos y los datos del propio prototipo, y el contraste de cada combinación se calcula con la fórmula de luminancia relativa de WCAG 2.2.

Diseño costero y calmo: un fondo de bruma en cielo y blanco, superficies de vidrio esmerilado, títulos en serif con una palabra en cursiva y un solo acento cálido, el coral, reservado para la acción clave, la decoración y, en su tono oscuro, las alarmas. Cumple WCAG 2.2 AA.

## 1. Colores principales (cinco)

| Color | Tonos | Uso |
|---|---|---|
| Índigo | Índigo `#2B3A7A` · Índigo secundario `#4A5788` · Índigo profundo `#1B1F3B` · Índigo luz `#6573A6` · Índigo suave `#7381B0` | Texto (índigo); títulos (secundario); degradado de los botones primarios (luz a secundario); bordes de campos y controles (suave); portada y cabinas (profundo) |
| Cielo | Cielo `#BFD6EE` · Cielo claro `#DCE8F5` · Bruma `#EEF4FB` | Fondo de bruma, paneles, cabeceras de tabla y tintes de información |
| Crema perla | Crema perla `#F5F0EA` | Tarjetas secundarias, fondos de advertencia y título de la portada |
| Coral | Coral `#E07A7F` · Coral oscuro `#A63D46` · Tinte coral `#F9E7E8` | Único acento cálido: acción clave, sol y puntos decorativos; en su tono oscuro, alarmas y errores; su tinte, fondo de error |
| Blanco | Blanco `#FFFFFF` | Superficies de lectura y de vidrio esmerilado |

Los tonos de cada color son tintes del mismo color principal: no suman colores a la paleta.

## 2. Contraste medido de cada combinación que se usa

| Texto o gráfico | Fondo | Uso | Contraste | Mínimo | Resultado |
|---|---|---|---|---|---|
| `#2B3A7A` | `#FFFFFF` | Texto principal sobre tarjetas, tablas y formularios | 10,56:1 | 4,5:1 | Cumple |
| `#2B3A7A` | `#DCE8F5` | Texto sobre el fondo de bruma | 8,50:1 | 4,5:1 | Cumple |
| `#2B3A7A` | `#BFD6EE` | Texto sobre la zona más oscura del fondo de bruma | 7,07:1 | 4,5:1 | Cumple |
| `#2B3A7A` | `#F5F0EA` | Texto sobre tarjetas crema | 9,32:1 | 4,5:1 | Cumple |
| `#4A5788` | `#FFFFFF` | Títulos y texto secundario | 6,98:1 | 4,5:1 | Cumple |
| `#4A5788` | `#DCE8F5` | Títulos y texto secundario sobre cielo claro | 5,62:1 | 4,5:1 | Cumple |
| `#4A5788` | `#BFD6EE` | Títulos sobre la zona más oscura del fondo de bruma | 4,67:1 | 4,5:1 | Cumple |
| `#6573A6` | `#FFFFFF` | Palabra en cursiva de los títulos (texto grande) | 4,61:1 | 3:1 | Cumple |
| `#6573A6` | `#BFD6EE` | Palabra en cursiva sobre la zona más oscura del fondo (texto grande) | 3,09:1 | 3:1 | Cumple |
| `#FFFFFF` | `#6573A6` | Botón primario y elemento activo, extremo claro del degradado | 4,61:1 | 4,5:1 | Cumple |
| `#FFFFFF` | `#4A5788` | Botón primario, extremo oscuro del degradado | 6,98:1 | 4,5:1 | Cumple |
| `#F5F0EA` | `#4A5788` | Título de la portada sobre el extremo claro de su zona de texto | 6,16:1 | 4,5:1 | Cumple |
| `#F5F0EA` | `#1B1F3B` | Título de la portada sobre su extremo oscuro | 14,19:1 | 4,5:1 | Cumple |
| `#BFD6EE` | `#4A5788` | Palabra en cursiva del título de la portada (texto grande) | 4,67:1 | 3:1 | Cumple |
| `#1B1F3B` | `#E07A7F` | Botón de la acción clave | 5,56:1 | 4,5:1 | Cumple |
| `#FFFFFF` | `#A63D46` | Alarmas y banda del ELC | 6,22:1 | 4,5:1 | Cumple |
| `#A63D46` | `#F9E7E8` | Distintivo y mensaje de error | 5,22:1 | 4,5:1 | Cumple |
| `#A63D46` | `#F5F0EA` | Texto de advertencia | 5,49:1 | 4,5:1 | Cumple |
| `#A63D46` | `#FFFFFF` | Texto de error en los campos | 6,22:1 | 4,5:1 | Cumple |
| `#7381B0` | `#FFFFFF` | Borde de campos, casillas y botones de opción | 3,82:1 | 3:1 | Cumple |
| `#7381B0` | `#DCE8F5` | Borde de campos sobre cielo claro | 3,08:1 | 3:1 | Cumple |
| `#6573A6` | `#EEF4FB` | Barras de espera sobre su riel | 4,16:1 | 3:1 | Cumple |
| `#A63D46` | `#EEF4FB` | Barra de espera alta sobre su riel | 5,62:1 | 3:1 | Cumple |
| `#2B3A7A` | `#FFFFFF` | Anillo de foco | 10,56:1 | 3:1 | Cumple |
| `#F5F0EA` | `#2B3A7A` | Anillo de foco sobre la portada | 9,32:1 | 3:1 | Cumple |
| `#FFFFFF` | `#1B1F3B` | Cabinas de equipos (máximo contraste) | 16,08:1 | 4,5:1 | Cumple |

El mínimo de 3:1 vale para el texto grande (24 px, o 19 px en negrita), los bordes de los controles, los anillos de foco y los gráficos; el de 4,5:1, para todo otro texto.

### Combinaciones descartadas (no se usan)

- Coral como texto o indicador sobre blanco: 2,89:1, bajo el mínimo.
- Coral como texto sobre crema: 2,55:1, bajo el mínimo.
- Cielo como borde de campos y controles: 1,49:1, bajo el mínimo.
- Índigo luz como texto pequeño sobre cielo claro (solo va en títulos grandes): 3,71:1, bajo el mínimo.
- Texto blanco sobre índigo suave: 3,82:1, bajo el mínimo.
- Verde o ámbar para los estados: sumarían colores principales y pasarían el límite de cinco.

## 3. Estados, solo con la paleta y siempre con ícono y texto

- **Información**: fondo cielo claro, barra izquierda índigo suave e ícono «i».
- **Éxito**: fondo blanco, barra índigo secundario e ícono «✓».
- **Advertencia**: fondo crema, barra y texto coral oscuro e ícono «!».
- **Error**: tinte coral, barra y texto coral oscuro e ícono de error.
- **Alarma**: coral oscuro con texto blanco, para las alarmas del patio refrigerado y la caída del enlace.

## 4. Tipografía (dos familias)

- **Cormorant Garamond**, grosor 500 y su cursiva: títulos de página y de sección, desde 24 px. La palabra destacada va en cursiva.
- **Source Sans 3**, grosores 400, 600 y 700: texto, datos, botones y subtítulos, con 16 px de base y 1,5 de interlineado, y cifras tabulares en tablas, códigos y horas.
- La serif no se usa en texto corrido, tablas ni pantallas de terreno o de cabina.

## 5. Iconografía

Una sola familia de trazo uniforme (1,75 px en una retícula de 24 px), siempre acompañada de texto o de una etiqueta accesible:

`inicio` · `camion` · `contenedor` · `patio` · `grua` · `frio` · `nave` · `documento` · `escudo` · `persona` · `personas` · `ajustes` · `campana` · `buscar` · `check` · `alerta` · `info` · `error` · `exclama` · `cerrar` · `der` · `izq` · `abajo` · `arriba` · `flecha` · `menu` · `mas` · `subir` · `bajar` · `calendario` · `reloj` · `ubicacion` · `enlace` · `senal` · `sinsenal` · `termometro` · `rayo` · `hoja` · `grafico` · `filtro` · `ordenar` · `editar` · `candado` · `llave` · `ojo` · `movil` · `firma` · `bandeja` · `actualizar` · `globo` · `ayuda` · `teclado` · `capas` · `paleta` · `bandera` · `balanza` · `barrera` · `ruta` · `edificio` · `correo` · `historial` · `papelera` · `opciones` · `herramienta` · `antena` · `servidor` · `datos` · `salir` · `agarre` · `sirena` · `credencial` · `intercambio` · `demo` · `objetivo` · `tren` · `pausa` · `reproducir` · `ampliar` · `sello` · `gemelo`

## 6. Retícula y espaciado

- Espaciado: 4 · 8 · 12 · 16 · 24 · 32 · 48 px.
- Retícula: 12 columnas lógicas, con tableros de 4, 2 y 1 columnas y un ancho de contenido de 1.240 px como máximo.
- Puntos de quiebre: 1.280 · 1.100 · 860 · 600 px.
- Objetivos táctiles: 44 × 44 px o más; 56 a 64 px en terreno y cabina.
- Radios: 18 px en tarjetas, 14 px en paneles y 10 px en campos; botones, pestañas y menús en forma de píldora.
- Foco: anillo índigo de 2 px separado del control; sobre la portada, anillo crema.

## 7. Recursos gráficos

- **Fondo de bruma**: degradados suaves de cielo, blanco y crema, fijos detrás de las pantallas públicas y con sesión.
- **Vidrio esmerilado**: tarjetas, barra superior, menú lateral y diálogos en blanco translúcido, con borde blanco y sombra azulada, sin bordes oscuros.
- **Portada de la bahía**: degradado de índigo profundo a cielo, con el sol coral, anillos de luz, grúas de muelle y pilas de contenedores sobre el horizonte, y el borde inferior en forma de ola. Es decorativa y estática, y queda detrás del formulario de consulta, nunca detrás del texto.
- **Línea de horizonte**: línea fina bajo la barra superior y sobre el pie, de índigo suave a coral en el centro.
- **Círculos de luz y olas**: en el inicio de sesión, el registro, las cabeceras amplias y los estados vacíos. No aparecen en las pantallas de operación, de terreno ni de cabina.
- **Logotipo**: la bahía al amanecer, con una grúa de muelle sobre el horizonte.

## 8. Componentes y sus estados

- **Botones**: primario en degradado índigo, de `#6573A6` a `#4A5788`, con texto blanco; secundario de vidrio con borde índigo suave; terciario como enlace; acción clave en coral; acción crítica en coral oscuro. Estados de posado (degradado más profundo), foco, activo, deshabilitado (borde punteado) y cargando (indicador giratorio).
- **Campos**: borde índigo suave de 1,5 px; al posar, índigo secundario; con foco, anillo índigo y halo cielo; con error, borde coral oscuro y mensaje con ícono; deshabilitado, borde punteado; solo lectura, fondo crema.
- **Casillas y botones de opción**: propios del sistema, con borde índigo suave y marca en el degradado de acción; las opciones en tarjeta se marcan con borde índigo secundario y fondo cielo.
- **Navegación**: menú lateral de vidrio con el elemento actual en blanco y una barra de acción; menú del módulo, pestañas y navegación pública en píldoras; rastro de navegación; pasos numerados con el actual en el degradado de acción.
- **Distintivos, mensajes y avisos flotantes**: con los tintes de la sección 3.

La tabla de componentes por pantalla está en `arquitectura_informacion.md`, sección 7.
