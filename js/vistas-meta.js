/* ATOS · documentos de referencia que se entregan junto al prototipo y no son pantallas de él: la arquitectura de
   información (RT-25.09) y el sistema de diseño (RT-25.05). prueba_edge.mjs los escribe en docs/ en Markdown. */
'use strict';

/* ---------------------------------------------------------------- contraste WCAG */
function luminancia(hex) { const c = hex.replace('#', '').match(/../g).map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function contraste(a, b) { const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); }
const COLORES = [
  { n: 'Índigo', tonos: [['Índigo', '#2B3A7A'], ['Índigo secundario', '#4A5788'], ['Índigo profundo', '#1B1F3B'], ['Índigo luz', '#6573A6'], ['Índigo suave', '#7381B0']], uso: 'Texto (índigo); títulos (secundario); degradado de los botones primarios (luz a secundario); bordes de campos y controles (suave); portada y cabinas (profundo)' },
  { n: 'Cielo', tonos: [['Cielo', '#BFD6EE'], ['Cielo claro', '#DCE8F5'], ['Bruma', '#EEF4FB']], uso: 'Fondo de bruma, paneles, cabeceras de tabla y tintes de información' },
  { n: 'Crema perla', tonos: [['Crema perla', '#F5F0EA']], uso: 'Tarjetas secundarias, fondos de advertencia y título de la portada' },
  { n: 'Coral', tonos: [['Coral', '#E07A7F'], ['Coral oscuro', '#A63D46'], ['Tinte coral', '#F9E7E8']], uso: 'Único acento cálido: acción clave, sol y puntos decorativos; en su tono oscuro, alarmas y errores; su tinte, fondo de error' },
  { n: 'Blanco', tonos: [['Blanco', '#FFFFFF']], uso: 'Superficies de lectura y de vidrio esmerilado' },
];
const COMBINACIONES = [ // [texto o gráfico, fondo, uso, mínimo exigido]
  ['#2B3A7A', '#FFFFFF', 'Texto principal sobre tarjetas, tablas y formularios', 4.5], ['#2B3A7A', '#DCE8F5', 'Texto sobre el fondo de bruma', 4.5], ['#2B3A7A', '#BFD6EE', 'Texto sobre la zona más oscura del fondo de bruma', 4.5], ['#2B3A7A', '#F5F0EA', 'Texto sobre tarjetas crema', 4.5],
  ['#4A5788', '#FFFFFF', 'Títulos y texto secundario', 4.5], ['#4A5788', '#DCE8F5', 'Títulos y texto secundario sobre cielo claro', 4.5], ['#4A5788', '#BFD6EE', 'Títulos sobre la zona más oscura del fondo de bruma', 4.5],
  ['#6573A6', '#FFFFFF', 'Palabra en cursiva de los títulos (texto grande)', 3], ['#6573A6', '#BFD6EE', 'Palabra en cursiva sobre la zona más oscura del fondo (texto grande)', 3],
  ['#FFFFFF', '#6573A6', 'Botón primario y elemento activo, extremo claro del degradado', 4.5], ['#FFFFFF', '#4A5788', 'Botón primario, extremo oscuro del degradado', 4.5],
  ['#F5F0EA', '#4A5788', 'Título de la portada sobre el extremo claro de su zona de texto', 4.5], ['#F5F0EA', '#1B1F3B', 'Título de la portada sobre su extremo oscuro', 4.5], ['#BFD6EE', '#4A5788', 'Palabra en cursiva del título de la portada (texto grande)', 3],
  ['#1B1F3B', '#E07A7F', 'Botón de la acción clave', 4.5], ['#FFFFFF', '#A63D46', 'Alarmas y banda del ELC', 4.5], ['#A63D46', '#F9E7E8', 'Distintivo y mensaje de error', 4.5], ['#A63D46', '#F5F0EA', 'Texto de advertencia', 4.5], ['#A63D46', '#FFFFFF', 'Texto de error en los campos', 4.5],
  ['#7381B0', '#FFFFFF', 'Borde de campos, casillas y botones de opción', 3], ['#7381B0', '#DCE8F5', 'Borde de campos sobre cielo claro', 3], ['#6573A6', '#EEF4FB', 'Barras de espera sobre su riel', 3], ['#A63D46', '#EEF4FB', 'Barra de espera alta sobre su riel', 3],
  ['#2B3A7A', '#FFFFFF', 'Anillo de foco', 3], ['#F5F0EA', '#2B3A7A', 'Anillo de foco sobre la portada', 3], ['#FFFFFF', '#1B1F3B', 'Cabinas de equipos (máximo contraste)', 4.5],
];
const DESCARTADAS = [['#E07A7F', '#FFFFFF', 'Coral como texto o indicador sobre blanco'], ['#E07A7F', '#F5F0EA', 'Coral como texto sobre crema'], ['#BFD6EE', '#FFFFFF', 'Cielo como borde de campos y controles'], ['#6573A6', '#DCE8F5', 'Índigo luz como texto pequeño sobre cielo claro (solo va en títulos grandes)'], ['#FFFFFF', '#7381B0', 'Texto blanco sobre índigo suave']];

/* ---------------------------------------------------------------- arquitectura de información */
const GLOSARIO = [
  ['ATOS', 'Aconcagua Terminal Operating System: la plataforma de operación del terminal que propone Terabyte.'], ['CLIENTE / Terminal Portuario Aconcagua', 'En los documentos, «el CLIENTE»; en la interfaz, Terminal Portuario Aconcagua.'],
  ['TOS 2012', 'El sistema de operación de 2012, que convive con ATOS hasta su retiro. Siempre con este nombre.'], ['Adaptador del TOS 2012', 'La fachada única por la que ATOS y el TOS 2012 conviven.'],
  ['Hub de Integración', 'El componente de intercambio de mensajes con navieras, autoridades y el sistema de gestión empresarial.'], ['Entorno Local de Continuidad (ELC)', 'La infraestructura local que mantiene la operación crítica sin enlace exterior.'],
  ['Operación sin enlace', 'El estado en que el terminal opera con el ELC porque cayó el enlace exterior.'], ['Marcha blanca', 'Período de operación supervisada antes de la producción plena.'],
  ['Validación en sombra', 'Una regla o versión nueva se compara contra lo vigente sin afectar la operación.'], ['Hecho facturable', 'Evento operacional sellado que respalda un cobro: tipo, cantidad, regla aplicada y evidencia.'],
  ['Instrucción de embarque', 'Lo que el cliente instruye sobre su carga (consignatario, destino, bultos). No es sinónimo de orden de embarque.'], ['Orden de embarque', 'La orden operacional del terminal para cargar un contenedor en la nave.'],
  ['Nombrada', 'El turno asignado a un trabajador eventual; origina su credencial temporal.'], ['Congelamiento', 'Período sin cambios en temporada (15 de diciembre a 30 de abril).'],
];
const COMPONENTES = [
  ['Menú principal', 'Todas las pantallas con sesión', '#/inicio'], ['Menú secundario contextual', 'Cada módulo (barra bajo el rastro)', '#/gate/puesto'], ['Rastro de navegación', 'Todas las pantallas', '#/inspecciones/INS-3307'], ['Paginación', 'Inspecciones, citas, hechos facturables', '#/inspecciones'],
  ['Pestañas', 'Ficha del contenedor, ficha de contraparte', '#/terceros/AAS'], ['Acordeones', 'Reglas del planificador, portal público', '#/nave/reglas'], ['Navegación por pasos', 'Ingreso de exportación, registro, nueva cita', '#/gate/visita/VIS-240871'], ['Menú de acciones rápidas', 'Visita del gate, citas, personas usuarias', '#/gate/visita/VIS-240871'],
  ['Validación en tiempo real', 'Consulta pública (ISO 6346), registro (RUT), nueva cita (patente)', '#/'], ['Selectores y desplegables', 'Filtros del tablero analítico', '#/analitica'], ['Casillas y botones de opción', 'Inicio de sesión, roles y permisos', '#/admin/roles'], ['Selectores de fecha y hora', 'Nueva cita de inspección, recuperar evidencia', '#/inspecciones/nueva'],
  ['Carga de archivos (arrastrar y soltar)', 'Prevalidación, registro, canal puente', '#/hub/puente'], ['Autocompletado', 'Búsqueda global, nueva cita, emisiones por contenedor', '#/gate/citas/nueva'], ['Formularios de varios pasos', 'Registro externo, nueva cita, alta de contraparte', '#/registro'],
  ['Tablas con orden y filtro', 'Todas las listas', '#/evidencia/hechos'], ['Gráfico de barras', 'Tablero analítico, congestión', '#/analitica'], ['Gráfico de líneas', 'Tablero analítico, serie térmica', '#/analitica'], ['Gráfico circular (anillo)', 'Tablero analítico, sobretiempo', '#/nave/productividad'], ['Área apilada', 'Tablero analítico, emisiones', '#/emisiones'], ['Mapa de calor', 'Ocupación del patio', '#/patio'], ['Dispersión', 'Productividad frente a espera', '#/nave/productividad'], ['Indicador de aguja', 'Lectura óptica, estadía', '#/analitica'],
  ['Tarjetas de información', 'Inicio de cada perfil', '#/inicio'], ['Líneas de tiempo', 'Visita, inspección, programación de sitios', '#/nave/programacion'], ['Indicadores de progreso', 'Registro, recorrido guiado, barrido', '#/registro'], ['Distintivos y etiquetas', 'Estados en todas las tablas', '#/gate/citas'], ['Información contextual emergente', 'Hechos facturables, franjas', '#/evidencia/hechos'],
  ['Mensajes de éxito, error, advertencia e información', 'Ingreso por el gate, registro y consulta pública', '#/gate/visita/VIS-240871'], ['Ventanas modales y diálogos', 'Resolver objeción, confirmar alarma', '#/evidencia/objeciones'], ['Notificaciones emergentes', 'Cada acción que cambia datos', '#/gate/visita/VIS-240871'], ['Esqueletos de carga', 'Al entrar a listas y tableros', '#/analitica'], ['Estados vacíos ilustrados', 'Bandeja vacía, filtros sin resultados', '#/exportaciones'],
  ['Botones primarios, secundarios y terciarios', 'Todas las pantallas', '#/gate/visita/VIS-240871'], ['Botón de acción flotante', 'Citas, inspecciones, contrapartes', '#/gate/citas'], ['Acciones en línea', 'Filas de tablas (Atender, Confirmar)', '#/gate/puesto'], ['Menús contextuales', 'Clic derecho en filas de citas, hechos, inspecciones', '#/gate/citas'], ['Acciones masivas', 'Citas, inspecciones, bandeja de tareas, personas', '#/inspecciones'], ['Confirmación de acciones críticas', 'Abrir barrera, suspender, transferir autoridad', '#/gate/visita/VIS-240871'],
];
function permitidoPara(def, p) { if (!def.area || def.area === 'publica' || def.area === 'base') return true; return [].concat(def.area).some((a) => PERFILES[p].areas.includes(a)); }
function menusPorPerfil() { return Object.entries(PERFILES).filter(([k]) => k !== 'publico').map(([k, pf]) => ({ k, n: ES(pf.n), mods: MENU.map((m) => ({ mod: ES(MODULOS.find((x) => x.id === m.mod).n), items: m.items.map((id) => RID[id]).filter((d) => d && permitidoPara(d, k)).map((d) => titulo(d, d.paramsMenu || {})) })).filter((m) => m.items.length) })); }
function rutasTres() { const out = []; Object.entries(INICIO).forEach(([k, cfg]) => { cfg.atajos.forEach(([h, t]) => out.push({ p: ES(PERFILES[k].n), f: ES(t), r: `Inicio → acceso rápido «${ES(t)}»`, n: 1, h })); out.push({ p: ES(PERFILES[k].n), f: 'Bandeja de tareas', r: 'Inicio → ícono de bandeja en la barra superior', n: 1, h: '#/tareas' }); out.push({ p: ES(PERFILES[k].n), f: 'Búsqueda global', r: 'Cualquier pantalla → campo de búsqueda (tecla /) → resultado', n: 2, h: '#/buscar?q=atou' }); }); MENU.forEach((m) => m.items.forEach((id) => { const d = RID[id]; if (!d) return; out.push({ p: 'Perfiles con acceso', f: titulo(d, d.paramsMenu || {}), r: `Menú principal «${ES(MODULOS.find((x) => x.id === m.mod).n)}» → «${titulo(d, d.paramsMenu || {})}»`, n: 2, h: hrefDe(d.id, d.paramsMenu) }); })); return out; }
function mapaSitio() { const raiz = RUTAS.filter((d) => !['sinacceso', 'noencontrada'].includes(d.id)); const por = {}; raiz.forEach((d) => { const m = typeof d.mod === 'function' ? d.mod() : d.mod; (por[m || (d.layout === 'publico' || d.layout === 'auth' ? 'pub' : 'base')] ||= []).push(d); }); return por; }
const nombreGrupo = (g) => (g === 'pub' ? 'Capa pública y acceso' : g === 'base' ? 'Comunes a todos los perfiles' : ES(MODULOS.find((m) => m.id === g)?.n || [g, g]));
const EJ_ID = { 'gate-visita': 'VIS-240871', 'gate-retiro-id': 'VIS-240880', 'tercero': 'AAS', 'insp-detalle': 'INS-3307', 'nave-plan': 'REC-1184', 'nave-recalada': 'REC-1184', 'reefer-tablero': 'TR-07', 'hub-mensaje': 'MSG-770300', 'ev-hecho': 'HF-608403', 'documento': 'DOC-55120', 'auditoria-evento': 'AU-90011', 'indicador': 'estadia', 'verificar-id': 'CF-AC-2028-0418' };
const ejemploRuta = (d) => '#' + d.ruta.replace(':id', EJ_ID[d.id] || 'x').replace(':c', d.id === 'reefer-cont' ? 'PRLU6044186' : 'ATOU4829137').replace(':perfil', 'ronda');
function iaMarkdown() {
  const L = ['# ATOS · Arquitectura de información', '', 'Prototipo interactivo de ATOS, la solución de Terabyte para el Terminal Portuario Aconcagua S.A. Documento generado desde el enrutador del prototipo.', '', '## 1. Mapa del sitio', ''];
  Object.entries(mapaSitio()).forEach(([g, ds]) => { L.push(`### ${nombreGrupo(g)}`, ''); ds.forEach((d) => L.push(`- ${String(titulo(d, d.paramsMenu || { id: EJ_ID[d.id] || 'x', c: 'ATOU4829137', perfil: 'ronda' })).replace(/<[^>]+>/g, '')} — \`#${d.ruta}\``)); L.push(''); });
  L.push('## 2. Diagrama de navegación', '', '- Portal público → Ingresar → (Segundo factor) → Inicio del perfil', '- Inicio → Citas → Visita de 7 pasos → Estadía; Visita ↔ Carril de excepción; Visita → Ficha del contenedor', '- Inicio → Inspecciones → Detalle y aprobación → Acta firmada', '- Inicio → Alarmas reefer → App de terreno; Alarmas → Evidencia y certificado', '', '## 3. Taxonomía y nomenclatura', '', '| Término | Significado |', '|---|---|');
  GLOSARIO.forEach(([t, s]) => L.push(`| ${t} | ${s} |`));
  L.push('', '## 4. Menús por perfil', ''); menusPorPerfil().forEach((m) => { L.push(`### ${m.n}`, ''); m.mods.forEach((x) => L.push(`- **${x.mod}**: ${x.items.join(' · ')}`)); L.push(''); });
  L.push('## 5. Jerarquía de la información', '', '1. Nivel 1, módulo (menú principal).', '2. Nivel 2, función (menú del módulo).', '3. Nivel 3, registro (ficha o detalle).', '4. Nivel 4, evento de origen (evidencia).', '', '## 6. Rutas de tres interacciones o menos', '', '| Perfil | Función | Ruta | Interacciones |', '|---|---|---|---|');
  rutasTres().forEach((x) => L.push(`| ${x.p} | ${x.f} | ${x.r} | ${x.n} |`));
  L.push('', '## 7. Componentes por pantalla', '', '| Componente | Dónde aparece | Ruta |', '|---|---|---|'); COMPONENTES.forEach(([c, p, h]) => L.push(`| ${c} | ${p} | \`${h}\` |`));
  return L.join('\n') + '\n';
}
function sdMarkdown() {
  const f2 = (x) => x.toFixed(2).replace('.', ',');
  const L = ['# ATOS · Sistema de diseño «Bahía serena»', '',
    'Sistema de diseño del prototipo interactivo de ATOS, la solución de Terabyte para el Terminal Portuario Aconcagua S.A. Se arma desde los estilos y los datos del propio prototipo, y el contraste de cada combinación se calcula con la fórmula de luminancia relativa de WCAG 2.2.', '',
    'Diseño costero y calmo: un fondo de bruma en cielo y blanco, superficies de vidrio esmerilado, títulos en serif con una palabra en cursiva y un solo acento cálido, el coral, reservado para la acción clave, la decoración y, en su tono oscuro, las alarmas. Cumple WCAG 2.2 AA.', '',
    '## 1. Colores principales (cinco)', '', '| Color | Tonos | Uso |', '|---|---|---|'];
  COLORES.forEach((c) => L.push(`| ${c.n} | ${c.tonos.map(([n, h]) => `${n} \`${h}\``).join(' · ')} | ${c.uso} |`));
  L.push('', 'Los tonos de cada color son tintes del mismo color principal: no suman colores a la paleta.', '', '## 2. Contraste medido de cada combinación que se usa', '', '| Texto o gráfico | Fondo | Uso | Contraste | Mínimo | Resultado |', '|---|---|---|---|---|---|');
  COMBINACIONES.forEach(([fr, fo, u, m]) => { const c = contraste(fr, fo); L.push(`| \`${fr}\` | \`${fo}\` | ${u} | ${f2(c)}:1 | ${m === 3 ? '3' : '4,5'}:1 | ${c >= m ? 'Cumple' : 'No cumple'} |`); });
  L.push('', 'El mínimo de 3:1 vale para el texto grande (24 px, o 19 px en negrita), los bordes de los controles, los anillos de foco y los gráficos; el de 4,5:1, para todo otro texto.', '', '### Combinaciones descartadas (no se usan)', '');
  DESCARTADAS.forEach(([fr, fo, u]) => L.push(`- ${u}: ${f2(contraste(fr, fo))}:1, bajo el mínimo.`));
  L.push('- Verde o ámbar para los estados: sumarían colores principales y pasarían el límite de cinco.', '',
    '## 3. Estados, solo con la paleta y siempre con ícono y texto', '',
    '- **Información**: fondo cielo claro, barra izquierda índigo suave e ícono «i».',
    '- **Éxito**: fondo blanco, barra índigo secundario e ícono «✓».',
    '- **Advertencia**: fondo crema, barra y texto coral oscuro e ícono «!».',
    '- **Error**: tinte coral, barra y texto coral oscuro e ícono de error.',
    '- **Alarma**: coral oscuro con texto blanco, para las alarmas del patio refrigerado y la caída del enlace.', '',
    '## 4. Tipografía (dos familias)', '',
    '- **Cormorant Garamond**, grosor 500 y su cursiva: títulos de página y de sección, desde 24 px. La palabra destacada va en cursiva.',
    '- **Source Sans 3**, grosores 400, 600 y 700: texto, datos, botones y subtítulos, con 16 px de base y 1,5 de interlineado, y cifras tabulares en tablas, códigos y horas.',
    '- La serif no se usa en texto corrido, tablas ni pantallas de terreno o de cabina.', '',
    '## 5. Iconografía', '', 'Una sola familia de trazo uniforme (1,75 px en una retícula de 24 px), siempre acompañada de texto o de una etiqueta accesible:', '',
    Object.keys(ICONOS).map((k) => `\`${k}\``).join(' · '), '',
    '## 6. Retícula y espaciado', '',
    '- Espaciado: 4 · 8 · 12 · 16 · 24 · 32 · 48 px.', '- Retícula: 12 columnas lógicas, con tableros de 4, 2 y 1 columnas y un ancho de contenido de 1.240 px como máximo.',
    '- Puntos de quiebre: 1.280 · 1.100 · 860 · 600 px.', '- Objetivos táctiles: 44 × 44 px o más; 56 a 64 px en terreno y cabina.',
    '- Radios: 18 px en tarjetas, 14 px en paneles y 10 px en campos; botones, pestañas y menús en forma de píldora.',
    '- Foco: anillo índigo de 2 px separado del control; sobre la portada, anillo crema.', '',
    '## 7. Recursos gráficos', '',
    '- **Fondo de bruma**: degradados suaves de cielo, blanco y crema, fijos detrás de las pantallas públicas y con sesión.',
    '- **Vidrio esmerilado**: tarjetas, barra superior, menú lateral y diálogos en blanco translúcido, con borde blanco y sombra azulada, sin bordes oscuros.',
    '- **Portada de la bahía**: degradado de índigo profundo a cielo, con el sol coral, anillos de luz, grúas de muelle y pilas de contenedores sobre el horizonte, y el borde inferior en forma de ola. Es decorativa y estática, y queda detrás del formulario de consulta, nunca detrás del texto.',
    '- **Línea de horizonte**: línea fina bajo la barra superior y sobre el pie, de índigo suave a coral en el centro.',
    '- **Círculos de luz y olas**: en el inicio de sesión, el registro, las cabeceras amplias y los estados vacíos. No aparecen en las pantallas de operación, de terreno ni de cabina.',
    '- **Logotipo**: la bahía al amanecer, con una grúa de muelle sobre el horizonte.', '',
    '## 8. Componentes y sus estados', '',
    '- **Botones**: primario en degradado índigo, de `#6573A6` a `#4A5788`, con texto blanco; secundario de vidrio con borde índigo suave; terciario como enlace; acción clave en coral; acción crítica en coral oscuro. Estados de posado (degradado más profundo), foco, activo, deshabilitado (borde punteado) y cargando (indicador giratorio).',
    '- **Campos**: borde índigo suave de 1,5 px; al posar, índigo secundario; con foco, anillo índigo y halo cielo; con error, borde coral oscuro y mensaje con ícono; deshabilitado, borde punteado; solo lectura, fondo crema.',
    '- **Casillas y botones de opción**: propios del sistema, con borde índigo suave y marca en el degradado de acción; las opciones en tarjeta se marcan con borde índigo secundario y fondo cielo.',
    '- **Navegación**: menú lateral de vidrio con el elemento actual en blanco y una barra de acción; menú del módulo, pestañas y navegación pública en píldoras; rastro de navegación; pasos numerados con el actual en el degradado de acción.',
    '- **Distintivos, mensajes y avisos flotantes**: con los tintes de la sección 3.', '',
    'La tabla de componentes por pantalla está en `arquitectura_informacion.md`, sección 7.');
  return L.join('\n') + '\n';
}
