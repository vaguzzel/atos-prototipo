/* ATOS · armazón: estado, perfiles, enrutador por fragmento (#/ruta), menús, búsqueda, notificaciones,
   panel de demostración, atajos de teclado y recorrido guiado. */
'use strict';

/* ---------------------------------------------------------------- estado en memoria */
function estadoInicial() { return { db: semilla(), sesion: null, trazabilidad: false, ui: { tablas: {}, pestanas: {}, tablero: {}, menuAbierto: false, tourVisto: {}, atajos: true, destino: null, vistas: {} } }; }
let E = estadoInicial();

/* ---------------------------------------------------------------- módulos y perfiles */
const MODULOS = [
  { id: 'gate', n: ['Gate, patio y equipos', 'Gate, yard and equipment'], ic: 'camion' },
  { id: 'reefer', n: ['Patio refrigerado', 'Reefer yard'], ic: 'frio' },
  { id: 'nave', n: ['Nave y planificación', 'Vessel and planning'], ic: 'nave' },
  { id: 'evidencia', n: ['Evidencia comercial y regulatoria', 'Commercial and regulatory evidence'], ic: 'documento' },
  { id: 'portal', n: ['Portal e integraciones', 'Portal and integrations'], ic: 'intercambio' },
  { id: 'gestion', n: ['Gestión', 'Management'], ic: 'grafico', transversal: true },
  { id: 'trans', n: ['Servicios transversales', 'Shared services'], ic: 'capas', transversal: true },
];
const P = (n, en, ext, areas, extra = {}) => ({ n: [n, en], ext, areas, ...extra });
const A_JEF = ['gate', 'gate.flujo', 'patio', 'patio.cond', 'patio.verif', 'tractos', 'nucleo', 'in02', 'gemelo', 'cabina', 'terreno', 'reefer', 'nave', 'nave.plan', 'fact', 'insp', 'emis', 'hub', 'terceros', 'analitica', 'acceso', 'docs', 'firma', 'conv', 'elc', 'auditoria'];
const PERFILES = {
  transporte: P('Empresa de transporte', 'Transport company', true, ['portal', 'portal.citas', 'congestion', 'in02.ext']),
  conductor: P('Conductor de camión', 'Truck driver', true, ['terreno.conductor', 'congestion']),
  gate: P('Funcionario de gate', 'Gate officer', false, ['gate', 'gate.flujo', 'patio.ver', 'nucleo.ver', 'docs.ver', 'congestion']),
  carga: P('Cliente de carga', 'Cargo customer', true, ['portal', 'portal.carga', 'portal.docs', 'portal.fact', 'portal.frio', 'portal.insp', 'portal.ie', 'firma', 'in02.ext', 'congestion']),
  publico: P('Persona del público', 'Member of the public', true, [], { publico: true }),
  planificador: P('Planificador de estiba y patio', 'Stowage and yard planner', false, ['patio', 'patio.cond', 'patio.ver', 'nucleo.ver', 'nave', 'nave.plan', 'gemelo', 'in02', 'analitica', 'reefer.ver', 'gate.ver']),
  supervisor: P('Supervisor de turno y de patio', 'Shift and yard supervisor', false, ['gate', 'gate.flujo', 'patio', 'patio.ver', 'patio.verif', 'tractos', 'nucleo', 'nucleo.ver', 'cabina', 'terreno', 'reefer', 'reefer.ver', 'nave', 'insp.ver', 'conv', 'elc', 'analitica', 'acceso.ver', 'docs.ver']),
  operador_patio: P('Operador de equipo de patio', 'Yard equipment operator', false, ['cabina.patio']),
  operador_grua: P('Operador de grúa de muelle', 'Quay crane operator', false, ['cabina.grua']),
  jefatura: P('Jefatura de operaciones', 'Head of operations', false, [...A_JEF, 'portal.ver', 'patio.ver', 'nucleo.ver', 'reefer.ver', 'gate.ver', 'insp.ver', 'acceso.ver', 'docs.ver', 'cabina.patio', 'cabina.grua']),
  admin: P('Administrador funcional', 'Functional administrator', false, ['admin', 'portal.ver', 'terceros', 'hub', 'conv', 'elc', 'analitica', 'docs', 'docs.ver', 'acceso', 'acceso.ver', 'auditoria', 'gate.ver']),
  facturacion: P('Analista de facturación', 'Billing analyst', false, ['fact', 'terceros.ver', 'analitica', 'docs', 'docs.ver', 'firma']),
  documentacion: P('Área de documentación', 'Documentation office', false, ['insp', 'insp.ver', 'docs', 'docs.ver', 'firma', 'terceros.ver', 'hub.ver', 'gate.ver', 'patio.ver']),
  proteccion: P('Protección portuaria y prevención de riesgos', 'Port security and risk prevention', false, ['acceso', 'acceso.ver', 'terreno', 'auditoria']),
  trabajador: P('Trabajador portuario', 'Port worker', false, ['credencial']),
  inspector: P('Inspector de autoridad', 'Authority inspector', true, ['portal.insp', 'firma']),
  verificador: P('Verificador externo de emisiones', 'External emissions verifier', true, ['emis.verif']),
  ronda: P('Personal de ronda reefer y mantenimiento', 'Reefer patrol and maintenance', false, ['terreno', 'reefer', 'reefer.ver']),
  naviera_ni: P('Naviera no integrada', 'Non-integrated shipping line', true, ['puente', 'congestion']),
};
const perfilActual = () => (E.sesion ? PERFILES[E.sesion.perfil] : null);
const persona = () => (E.sesion ? PERSONAS[E.sesion.perfil] : null);
function permitido(def) {
  if (!def.area || def.area === 'publica') return true; if (!E.sesion) return false; if (def.area === 'base') return true;
  const areas = perfilActual().areas; return [].concat(def.area).some((a) => areas.includes(a));
}

/* ---------------------------------------------------------------- registro de rutas */
const RUTAS = []; const RID = {};
function R(ruta, def) {
  const claves = []; const rx = new RegExp('^' + ruta.replace(/:([a-z]+)/g, (_, k) => { claves.push(k); return '([^/]+)'; }) + '$');
  const d = { layout: 'app', rf: [], ...def, ruta, rx, claves }; RUTAS.push(d); RID[d.id] = d; return d;
}
function rutaActual() {
  const h = decodeURI(location.hash.slice(1) || '/'); const [camino, qs] = h.split('?'); const query = Object.fromEntries(new URLSearchParams(qs || ''));
  for (const d of RUTAS) { const m = camino.match(d.rx); if (m) return { def: d, params: Object.fromEntries(d.claves.map((k, i) => [k, decodeURIComponent(m[i + 1])])), query, camino }; }
  return { def: RID.noencontrada, params: {}, query, camino };
}
const titulo = (def, p = {}) => (typeof def.t === 'function' ? def.t(p) : ES(def.t));
function hrefDe(id, p = {}) { const d = RID[id]; return '#' + d.ruta.replace(/:([a-z]+)/g, (_, k) => encodeURIComponent(p[k])); }
function puedeIr(h) { const camino = String(h).replace(/^#/, '').split('?')[0]; const d = RUTAS.find((x) => x.rx.test(camino)); return !d || permitido(d); }
function enlaceSi(h, txt) { return puedeIr(h) ? `<a href="${h}">${txt}</a>` : txt; }
function ir(h) { if (location.hash === h) refrescar(); else location.hash = h; }
const compacto = (c) => String(c).replace(/\s/g, '');

/* ---------------------------------------------------------------- menú principal por perfil */
const MENU = [
  { mod: 'gate', items: ['gate-puesto', 'gate-citas', 'gate-excepcion', 'gate-estadia', 'gate-congestion', 'gate-retiro', 'patio-mapa', 'patio-condiciones', 'patio-verificaciones', 'patio-remociones', 'patio-barrido', 'nucleo', 'tractos', 'in02', 'gemelo', 'cabina-patio', 'cabina-grua'] },
  { mod: 'reefer', items: ['reefer-mapa', 'reefer-alarmas', 'reefer-evidencia', 'reefer-certificados', 'reefer-in04'] },
  { mod: 'nave', items: ['nave-recaladas', 'nave-programacion', 'nave-plan', 'nave-reglas', 'nave-productividad'] },
  { mod: 'evidencia', items: ['ev-hechos', 'ev-objeciones', 'ev-conciliacion', 'ev-recuperar', 'insp-lista', 'insp-cumplimiento', 'emis', 'emis-verif'] },
  { mod: 'portal', items: ['portal', 'portal-carga', 'portal-citas', 'portal-documentos', 'portal-ie', 'portal-facturacion', 'portal-frio', 'portal-inspecciones', 'hub', 'hub-puente', 'hub-autoridades'] },
  { mod: 'gestion', items: ['terceros', 'analitica', 'analitica-concedente', 'admin-personas', 'admin-roles', 'admin-parametros', 'admin-flujos', 'admin-notif', 'admin-docs', 'admin-retencion', 'admin-auditoria'] },
  { mod: 'trans', items: ['terreno', 'acceso', 'acceso-emergencia', 'credencial', 'documentos', 'firma', 'convivencia', 'continuidad'] },
];
const val = (x) => (typeof x === 'function' ? x() : x);
const modDe = (d) => val(d.mod);
function itemsDe(mod) { return (MENU.find((m) => m.mod === mod)?.items || []).map((id) => RID[id]).filter((d) => d && permitido(d)); }
function lateral(def) {
  const it = (d, sub) => `<li class="${sub ? 'sub' : ''}"><a href="${hrefDe(d.id, d.paramsMenu)}" ${def.id === d.id || (def.padre === d.id && d.menuPadre) ? 'aria-current="page"' : ''}>${sub ? '' : ic(d.ic || 'der')}<span>${titulo(d, d.paramsMenu || {})}</span></a></li>`;
  const grupos = MODULOS.map((m) => {
    const items = itemsDe(m.id); if (!items.length) return '';
    const activo = modDe(def) === m.id;
    return `<li><a href="${hrefDe(items[0].id, items[0].paramsMenu)}" class="${activo ? 'activo' : ''}" ${activo ? '' : ''}>${ic(m.ic)}<span>${ES(m.n)}</span></a>${activo ? `<ul aria-label="${esc(ES(m.n))}">${items.map((d) => it(d, true)).join('')}</ul>` : ''}</li>`;
  }).join('');
  return `<nav class="lateral ${E.ui.menuAbierto ? 'abierto' : ''}" id="menu-lateral" aria-label="${T('Menú principal', 'Main menu')}">
    <ul>${it(RID.inicio)}${it(RID.tareas)}${it(RID.notificaciones)}</ul>
    <h2>${T('Módulos', 'Modules')}</h2><ul>${grupos}</ul>
    <h2>${T('Ayuda', 'Help')}</h2><ul>${it(RID.ayuda)}</ul></nav>${E.ui.menuAbierto ? '<div class="velo-menu abierto" data-acc="menu" aria-hidden="true"></div>' : ''}`;
}
function submenu(def) {
  const md = modDe(def); if (!md || ['gestion', 'trans'].includes(md) && !def.submenu) return '';
  const items = itemsDe(md); if (items.length < 2) return '';
  return `<nav aria-label="${T('Menú del módulo', 'Module menu')} ${esc(ES(MODULOS.find((m) => m.id === md).n))}"><ul class="submenu">${items.map((d) => `<li><a href="${hrefDe(d.id, d.paramsMenu)}" ${def.id === d.id || def.padre === d.id ? 'aria-current="page"' : ''}>${titulo(d, d.paramsMenu || {})}</a></li>`).join('')}</ul></nav>`;
}
function rastro(def, p) {
  const cadena = []; let d = def; let guard = 0;
  while (d && guard++ < 6) { cadena.unshift([titulo(d, p), hrefDe(d.id, { ...d.paramsMenu, ...p })]); d = d.padre ? RID[val(d.padre)] : null; }
  const mod = MODULOS.find((m) => m.id === modDe(def));
  const base = [[T('Inicio', 'Home'), '#/inicio']]; if (mod) { const primero = itemsDe(mod.id)[0]; base.push([ES(mod.n), primero ? hrefDe(primero.id, primero.paramsMenu) : '#/inicio']); }
  const lista = def.id === 'inicio' ? [[T('Inicio', 'Home'), '#/inicio']] : base.concat(cadena.filter(([t]) => t !== ES(mod?.n)));
  return migas(lista);
}

/* ---------------------------------------------------------------- notificaciones, tareas y auditoría */
const misNotifs = () => (E.sesion ? E.db.notifs.filter((n) => n.perfiles.includes(E.sesion.perfil)) : []);
const misTareas = () => (E.sesion ? E.db.tareas.filter((t) => t.perfiles.includes(E.sesion.perfil) && !t.hecha) : []);
function notificar(t, href, perfiles, critica = false) {
  const ps = perfiles || (E.sesion ? [E.sesion.perfil] : []); E.db.notifs.unshift({ id: uid('NO-'), perfiles: ps, t, hora: horaSim(), leida: false, href, critica });
  const c = $('#cont-notif'); if (c) { const n = misNotifs().filter((x) => !x.leida).length; c.textContent = n; c.hidden = !n; }
}
function tarea(t, href, perfiles, prioridad = 'Alta', proceso = 'Operación', extra = {}) { E.db.tareas.unshift({ id: uid('TA-'), perfiles, t, href, prioridad, proceso, vence: extra.vence || T('Hoy', 'Today'), heredada: null, ...extra }); }
function auditar(accion, objeto, resultado = 'Correcto') { E.db.auditoria.unshift({ id: 'AU-' + (90100 + E.db.auditoria.length), hora: horaSim(), quien: persona()?.n || 'Persona del público', accion, objeto, modulo: ES(MODULOS.find((m) => m.id === modDe(rutaActual().def))?.n || ['Transversal', 'Shared']), resultado, ip: E.sesion?.fuera ? 'Fuera de la red corporativa · segundo factor' : 'Red corporativa' }); }
let _min = 10 * 60 + 42; function horaSim() { _min += 1; return hm(_min); }

/* ---------------------------------------------------------------- piezas del armazón */
function barraApp() {
  const p = perfilActual(), pe = persona(); const nn = misNotifs().filter((n) => !n.leida).length; const nt = misTareas().length; const elc = E.db.elc.sinEnlace;
  return `<header class="barra" role="banner">
    <button type="button" class="boton secundario menu-movil" id="b-menu" data-acc="menu" aria-expanded="${E.ui.menuAbierto}" aria-controls="menu-lateral">${ic('menu')}<span class="sr">${T('Abrir menú principal', 'Open main menu')}</span></button>
    <a class="marca" href="#/inicio" aria-label="ATOS Terminal Portuario Aconcagua, ${T('ir al inicio', 'go to home')}">${LOGO}<span class="nombre"><b>ATOS</b> <small>Terminal Portuario Aconcagua</small></span></a>
    <div class="busqueda-global" role="search" data-tour="buscar">${ic('buscar')}<label class="sr" for="busqueda">${T('Búsqueda global', 'Global search')}</label>
      <div class="ac"><input type="search" id="busqueda" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="busqueda-lista" data-ac="global" data-global="1" autocomplete="off" placeholder="${T('Buscar contenedor, camión, nave, documento o persona  ( / )', 'Search container, truck, vessel, document or person  ( / )')}" aria-keyshortcuts="/" aria-describedby="busqueda-ay"><span class="sr" id="busqueda-ay">${T('Tolera errores de escritura. Enter muestra todos los resultados.', 'Tolerates typos. Enter shows all results.')}</span>
      <div class="ac-lista" role="listbox" id="busqueda-lista" aria-label="${T('Resultados sugeridos', 'Suggested results')}" hidden></div></div></div>
    <span class="espacio"></span>
    ${(() => { const dentro = `${ic(elc ? 'sinsenal' : 'senal')}<span>${elc ? T('Operación sin enlace', 'Operating without link') : T('Enlace exterior en línea', 'External link online')}</span>`; return puedeIr('#/continuidad') ? `<a class="chip-enlace ${elc ? 'caido' : ''}" href="#/continuidad">${dentro}</a>` : `<span class="chip-enlace ${elc ? 'caido' : ''}" role="status">${dentro}</span>`; })()}
    <div class="acciones-barra">
      <div class="idioma" role="group" aria-label="${T('Idioma', 'Language')}"><button type="button" aria-pressed="${IDIOMA === 'es'}" data-acc="idioma" data-arg="es" lang="es">ES</button><button type="button" aria-pressed="${IDIOMA === 'en'}" data-acc="idioma" data-arg="en" lang="en">EN</button></div>
      <a class="boton-icono" href="#/tareas" data-tour="tareas" aria-label="${T('Bandeja de tareas', 'Task inbox')}: ${nt} ${T('pendientes', 'pending')}" aria-keyshortcuts="T">${ic('bandeja')}<span class="contador" aria-hidden="true" ${nt ? '' : 'hidden'}>${nt}</span></a>
      <div class="menu-acc" data-tour="notif"><button type="button" class="boton-icono" id="b-notif" aria-haspopup="true" aria-expanded="false" aria-controls="panel-notif" data-acc="notif-abrir" aria-label="${T('Notificaciones', 'Notifications')}: ${nn} ${T('sin leer', 'unread')}">${ic('campana')}<span class="contador" id="cont-notif" aria-hidden="true" ${nn ? '' : 'hidden'}>${nn}</span></button><div id="panel-notif" class="menu-ctx" style="position:absolute;width:min(380px,90vw)" hidden></div></div>
      ${menuAcciones(pe.n.split(' ')[0], [{ t: T('Mis preferencias', 'My preferences'), href: '#/perfil', ic: 'ajustes' }, { t: T('Ayuda y atajos', 'Help and shortcuts'), href: '#/ayuda', ic: 'ayuda' }, { t: T('Cambiar de perfil', 'Switch profile'), acc: 'demo-abrir', ic: 'personas' }, { t: T('Cerrar sesión', 'Sign out'), acc: 'salir', ic: 'salir' }], { id: 'm-perfil', clase: 'boton-icono', ic: 'persona' })}
      <div class="perfil-actual"><span class="avatar" aria-hidden="true">${esc(iniciales(pe.n))}</span><span><strong>${esc(pe.n)}</strong>${ES(p.n)}</span></div>
    </div></header><hr class="horizonte gruesa">`;
}
const iniciales = (n) => n.split(' ').filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase();
function barraPublica() {
  const actual = rutaActual().def.id;
  const enl = (h, id, t) => `<a href="${h}" ${actual === id ? 'aria-current="page"' : ''}>${t}</a>`;
  const cong = filasCongestion(); const prom = Math.round(cong.reduce((s, d) => s + d.v, 0) / cong.length);
  const prox = franjasLibres().find((f) => f.cap - f.res >= 8); const pausa = !!LS.get('pausa', false);
  return `<header class="cabecera-publica" role="banner">
    <section class="franja-estado" aria-label="${T('Estado del terminal', 'Terminal status')}"><span class="vivo" aria-hidden="true"></span><ul>
      <li><strong>Terminal Portuario Aconcagua</strong></li><li>${T(`Gate abierto · espera promedio de ${prom} min`, `Gate open · average wait ${prom} min`)}</li>
      ${prox ? `<li>${T(`Próxima franja con cupos: ${hm(prox.ini)}`, `Next slot with availability: ${hm(prox.ini)}`)}</li>` : ''}<li>${T('Cierre de recepción de la nave Cóndor Austral: martes 7 de noviembre, 08:00', 'Receiving cut-off for the vessel Cóndor Austral: Tuesday, November 7, 08:00')}</li></ul></section>
    <div class="barra barra-publica"><a class="marca" href="#/">${LOGO}<span class="nombre"><b>ATOS</b> <small>${T('Sistema de operación del terminal', 'Terminal operating system')}</small></span></a>
      <form class="buscador-publico" role="search" data-form="buscar-publico" novalidate>${ic('buscar')}<label class="sr" for="bp-q">${T('Buscar en el portal', 'Search the portal')}</label>
        <input type="search" id="bp-q" list="bp-sug" autocomplete="off" placeholder="${T('Contenedor o certificado', 'Container or certificate')}" aria-describedby="bp-ayuda"><span class="sr" id="bp-ayuda">${T('Por ejemplo, ATOU 482913 7 o CF-AC-2028-0418.', 'For example, ATOU 482913 7 or CF-AC-2028-0418.')}</span>
        <datalist id="bp-sug"><option value="ATOU 482913 7"></option><option value="CF-AC-2028-0418"></option><option value="${T('Congestión del gate', 'Gate congestion')}"></option><option value="${T('Verificar un certificado', 'Verify a certificate')}"></option><option value="${T('Registrar mi organización', 'Register my organization')}"></option><option value="${T('Recuperar el acceso', 'Recover access')}"></option></datalist>
        <button type="submit" class="boton">${T('Buscar', 'Search')}</button></form>
      <nav aria-label="${T('Portal público', 'Public portal')}" class="nav-pildora">${enl('#/publico/congestion', 'congestion', T('Congestión', 'Congestion'))}${enl('#/verificar', 'verificar', T('Verificar certificado', 'Verify certificate'))}</nav>
      <button type="button" class="boton-icono boton-pausa" data-acc="pausa" aria-pressed="${pausa}" aria-label="${T('Pausar las animaciones', 'Pause animations')}" title="${T('Pausar las animaciones', 'Pause animations')}">${ic(pausa ? 'reproducir' : 'pausa')}</button>
      <div class="idioma" role="group" aria-label="${T('Idioma', 'Language')}"><button type="button" aria-pressed="${IDIOMA === 'es'}" data-acc="idioma" data-arg="es" lang="es">ES</button><button type="button" aria-pressed="${IDIOMA === 'en'}" data-acc="idioma" data-arg="en" lang="en">EN</button></div>
      ${E.sesion ? btn(T('Volver a ATOS', 'Back to ATOS'), { href: '#/inicio', tipo: 'clave' }) : btn(T('Ingresar', 'Sign in'), { href: '#/ingresar', ic: 'persona', tipo: 'clave' })}</div></header><hr class="horizonte">`;
}
ACC.pausa = (el) => { const v = !LS.get('pausa', false); LS.set('pausa', v); document.body.classList.toggle('en-pausa', v); el.setAttribute('aria-pressed', String(v)); el.innerHTML = ic(v ? 'reproducir' : 'pausa'); anunciar(v ? T('Animaciones en pausa.', 'Animations paused.') : T('Animaciones reanudadas.', 'Animations resumed.')); };
FORM['buscar-publico'] = (f) => {
  const inp = $('#bp-q', f); const q = inp.value.trim();
  if (!q) { inp.focus(); aviso(T('Escribe un número de contenedor, un código de certificado o lo que buscas.', 'Type a container number, a certificate code or what you are looking for.')); return; }
  const v = validarContenedor(q); const compacto = q.toUpperCase().replace(/\s/g, '');
  if (v.ok) { ir('#/?c=' + compacto); return; }
  if (/^CF-?[A-Z]{2}-?\d{4}-?\d{3,4}$/.test(compacto)) { ir('#/verificar/' + encodeURIComponent(compacto)); return; }
  if (/^[A-Z]{4}\d/.test(compacto)) { aviso(v.msg); inp.focus(); return; }
  const n = q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const paginas = [[/congest|espera|fila|vial|traffic|wait/, '#/publico/congestion'], [/certific|frio|cadena|cold/, '#/verificar'], [/regist|organiz|cuenta|account/, '#/registro'], [/clave|contrase|recuper|password|recover/, '#/recuperar'], [/ingres|entrar|sesion|sign/, '#/ingresar'], [/cita|franja|cupo|slot/, '#/']];
  const hit = paginas.find(([rx]) => rx.test(n)); if (hit) { ir(hit[1]); return; }
  aviso(T(`No encontramos «${esc(q)}». Prueba con un número de contenedor, como ATOU 482913 7, o con un código de certificado, como CF-AC-2028-0418.`, `No results for “${esc(q)}”. Try a container number, such as ATOU 482913 7, or a certificate code, such as CF-AC-2028-0418.`));
};
function pie() {
  return `<footer class="pie" role="contentinfo"><span>ATOS · ${T('solución de Terabyte para el Terminal Portuario Aconcagua S.A. · Datos simulados de demostración: nada de lo que ingreses se guarda.', 'Terabyte solution for Terminal Portuario Aconcagua S.A. · Simulated demonstration data: nothing you enter is stored.')}</span></footer>`;
}
function bandaELC() {
  const e = E.db.elc; if (!e.sinEnlace && !e.entregando) return '';
  return e.sinEnlace ? `<div class="banda-elc" role="status">${ic('sinsenal')}<span>${T(`Operación sin enlace exterior desde las ${e.desde}: el gate, el patio y los hechos facturables siguen funcionando en el Entorno Local de Continuidad (ELC). Por entregar: ${e.acumulados} registros.`, `Operating without external link since ${e.desde}: gate, yard and billable events keep working in the Local Continuity Environment (ELC). Pending delivery: ${e.acumulados} records.`)}</span>${puedeIr('#/continuidad') ? `<a href="#/continuidad">${T('Ver estado', 'View status')}</a>` : ''}</div>`
    : `<div class="banda-elc" role="status" style="background:var(--indigo)">${ic('actualizar')}<span>${T(`Enlace restablecido: entregando lo acumulado (${e.acumulados} registros).`, `Link restored: delivering backlog (${e.acumulados} records).`)}</span></div>`;
}
function bloqueTraza(def) { return E.trazabilidad && def.rf?.length ? `<div class="traza" role="note"><strong>${T('Modo trazabilidad', 'Traceability mode')}:</strong> ${T('esta pantalla cumple', 'this screen covers')} ${def.rf.map((c) => `<code>${c}</code>`).join(' ')}</div>` : ''; }
function encabezado(t, intro = '', acciones = '', o = {}) {
  return `<div class="cabecera"><div class="intro"><h1 tabindex="-1" id="titulo-pagina">${t}</h1>${intro ? `<p class="detalle">${intro}</p>` : ''}</div>${acciones ? `<div class="acciones">${acciones}</div>` : ''}</div>`;
}
function encabezadoAmplio(t, intro = '', acciones = '', o = {}) {
  return `<section class="cabecera-amplia" aria-labelledby="titulo-pagina">${o.olas ? olas(220) : `<div class="deco" aria-hidden="true">${ondas('d').replace('class="ondas d"', 'class="ondas" style="position:static;width:100%;height:100%"')}</div>`}<div class="contenido-cab"><h1 tabindex="-1" id="titulo-pagina">${t}</h1>${intro ? `<p>${intro}</p>` : ''}${acciones ? `<div class="grupo-botones">${acciones}</div>` : ''}</div></section>`;
}

/* ---------------------------------------------------------------- render */
let _ultimaRuta = null;
function render(opc = {}) {
  document.body.classList.toggle('sin-agua', !LS.get('agua', true)); document.body.classList.toggle('en-pausa', !!LS.get('pausa', false));
  const { def, params, query, camino } = rutaActual();
  if (def.layout === 'app' || def.layout === 'cabina') {
    if (!E.sesion) { E.ui.destino = location.hash; location.replace('#/ingresar'); return; }
  }
  const navego = _ultimaRuta !== location.hash; _ultimaRuta = location.hash;
  if (navego) { E.ui.menuAbierto = false; if (def.id !== E.ui.rutaPrevia) { /* nueva pantalla */ } E.ui.rutaPrevia = def.id; }
  const ok = permitido(def);
  const vistaDef = ok ? def : RID.sinacceso;
  let cuerpo;
  const cargar = navego && vistaDef.carga && !opc.sinEsqueleto;
  try { cuerpo = cargar ? esqueleto(4) : vistaDef.vista(params, query); } catch (e) { console.warn(e); cuerpo = vistaError(e); }
  const t = titulo(vistaDef, params);
  document.title = `${t.replace(/<[^>]+>/g, '')} · ATOS`;
  const lang = IDIOMA === 'en' && vistaDef.layout === 'app' && !vistaDef.bilingue ? 'lang="es"' : '';
  let html;
  if (vistaDef.layout === 'publico' || vistaDef.layout === 'auth') html = `${bandaELC()}${barraPublica()}<main id="contenido" tabindex="-1" class="${vistaDef.layout === 'auth' ? 'auth' : ''}" ${lang}>${vistaDef.layout === 'auth' ? capaAgua() + ondas('a') + ondas('b') : ''}${cuerpo}</main>${pie()}`;
  else if (vistaDef.layout === 'cabina') html = `${bandaELC()}<main id="contenido" tabindex="-1" class="cabina" ${lang}>${cuerpo}</main>`;
  else html = `${bandaELC()}${barraApp()}<div class="marco">${lateral(vistaDef)}<main id="contenido" tabindex="-1" class="principal" ${lang} aria-busy="${!!cargar}">${rastro(vistaDef, params)}${bloqueTraza(vistaDef)}${submenu(vistaDef)}${cuerpo}</main></div>${pie()}`;
  const foco = !navego ? document.activeElement?.id : null; const scroll = window.scrollY;
  $('#app').innerHTML = html;
  $('#saltar').textContent = T('Saltar al contenido', 'Skip to content');
  $('#b-demo').innerHTML = ic('demo') + `<span>${T('Demostración', 'Demo')}</span>`; $('#b-demo').setAttribute('aria-label', T('Abrir el panel de demostración', 'Open the demonstration panel'));
  if (!cargar) { try { vistaDef.montar?.(params, query); } catch (e) { console.warn(e); } }
  if (navego) { window.scrollTo(0, 0); const h1 = $('#titulo-pagina') || $('#contenido'); if (opc.sinFoco !== true) h1?.focus({ preventScroll: true }); if (cargar) anunciar(T('Cargando ', 'Loading ') + t.replace(/<[^>]+>/g, '')); }
  else { window.scrollTo(0, scroll); const el = foco && document.getElementById(foco); if (el) el.focus({ preventScroll: true }); else if (opc.foco) document.getElementById(opc.foco)?.focus({ preventScroll: true }); }
  if (cargar) { const h = location.hash; setTimeout(() => { if (location.hash === h) { _ultimaRuta = h; render({ sinEsqueleto: true, foco: 'titulo-pagina' }); $('#titulo-pagina')?.focus({ preventScroll: true }); } }, 320); }
  if (def.id === 'inicio' && E.sesion && !E.ui.tourVisto[E.sesion.perfil] && !cargar) setTimeout(() => iniciarTour(), 200);
}
function refrescar(o = {}) { render({ ...o, sinEsqueleto: true }); }
function vistaError() { return encabezado(T('No pudimos mostrar esta pantalla', 'We could not display this screen'), '') + msj('error', T('Ocurrió un problema al armar la vista.', 'Something went wrong while building the view.'), T('Vuelve al inicio e inténtalo de nuevo. Si se repite, reinicia la demostración desde el panel.', 'Go back home and try again. If it happens again, restart the demonstration from the panel.')) + btn(T('Ir al inicio', 'Go home'), { href: '#/inicio' }); }

/* ---------------------------------------------------------------- búsqueda global con tolerancia a errores (RF-ADM-12) */
function indiceBusqueda() {
  const p = E.sesion?.perfil; const ext = perfilActual()?.ext; const db = E.db; const out = [];
  const cliente = p === 'carga' ? ['Exportadora Valle Alto S.A.', 'Agencia de Aduana del Pacífico'] : null; const transp = p === 'transporte' || p === 'conductor' ? 'Transportes Cordillera Sur Ltda.' : null;
  const contHref = (c) => (ext ? '#/portal/carga?c=' + compacto(c) : '#/contenedor/' + compacto(c));
  const vistos = new Set(); const addC = (c, sub, dueno) => { if (vistos.has(c)) return; if (cliente && !cliente.includes(dueno)) return; if (transp && dueno !== transp) return; if (p === 'naviera_ni' && !c.startsWith('IMCU')) return; vistos.add(c); out.push({ grupo: T('Contenedores', 'Containers'), t: c, sub, href: contHref(c) }); };
  db.visitas.concat(db.retiros).forEach((v) => addC(v.cont, `${v.tipo === 'exp' ? T('Exportación', 'Export') : T('Importación', 'Import')} · ${v.patente}`, cliente ? v.cliente === cliente[0] || v.agencia === cliente[1] ? cliente[0] : '' : transp ? v.transporte : ''));
  if (!ext) { db.tableros.forEach((tb) => tb.tomas.forEach((tm) => tm.cont && (tm.est !== 'ok' || vistos.size < 60) && addC(tm.cont.cont, `${T('Refrigerado', 'Reefer')} · ${tb.id}/${tm.n} · ${tm.cont.carga}`))); db.inspecciones.forEach((i) => addC(i.cont, `${i.autoridad} · ${i.id}`)); db.hechos.slice(0, 20).forEach((h) => addC(h.cont, `${db.tiposHF[h.tipo].n} · ${h.id}`)); }
  else if (cliente) db.tableros.forEach((tb) => tb.tomas.forEach((tm) => tm.cont && tm.cont.cliente === cliente[0] && tm.est !== 'ok' && addC(tm.cont.cont, `${T('Refrigerado', 'Reefer')} · ${tm.cont.carga}`, cliente[0])));
  const pats = new Set(); db.visitas.concat(db.retiros).forEach((v) => { if (transp && v.transporte !== transp) return; if (ext && !transp) return; if (pats.has(v.patente)) return; pats.add(v.patente); out.push({ grupo: T('Camiones', 'Trucks'), t: v.patente, sub: `${v.transporte} · ${v.id}`, href: ext ? '#/portal/citas' : '#/gate/visita/' + v.id }); });
  if (!ext) excepcionOtras().forEach((x) => { addC(x.cont, `${T('Exportación', 'Export')} · ${x.patente}`); if (pats.has(x.patente)) return; pats.add(x.patente); out.push({ grupo: T('Camiones', 'Trucks'), t: x.patente, sub: `${x.agencia} · ${T('carril de excepción', 'exception lane')}`, href: '#/gate/excepcion' }); });
  if (!ext) db.estadias.forEach((v) => out.push({ grupo: T('Camiones', 'Trucks'), t: v.patente, sub: `${v.transporte} · ${T('estadía', 'stay')} ${v.estadia} min`, href: '#/gate/estadia?v=' + v.id }));
  if (!ext || p === 'carga' || p === 'naviera_ni') db.recaladas.forEach((r) => { if (p === 'naviera_ni' && r.naviera !== 'IMC') return; out.push({ grupo: T('Naves', 'Vessels'), t: `${r.nave} (${r.id})`, sub: `${NAV[r.naviera].n} · ${T('sitio', 'berth')} ${r.sitio} · ${r.eta}`, href: ext ? '#/portal' : '#/nave/recalada/' + r.id }); });
  db.documentos.forEach((d) => { if (ext && !(p === 'carga' && /Valle Alto|IE-20871|CF-AC/.test(d.n + d.etiquetas.join(' '))) && !(p === 'inspector' && /Acta/.test(d.n))) return; out.push({ grupo: T('Documentos', 'Documents'), t: d.n, sub: `${d.tipo} · v${d.version}`, href: ext ? '#/firma' : '#/documentos/' + d.id }); });
  if (!ext) db.inspecciones.slice(0, 27).forEach((i) => out.push({ grupo: T('Documentos', 'Documents'), t: `${T('Inspección', 'Inspection')} ${i.id}`, sub: `${i.autoridad} · ${i.estado}`, href: '#/inspecciones/' + i.id }));
  if (!ext && ['admin', 'jefatura', 'supervisor', 'proteccion'].includes(p)) db.usuarios.forEach((u) => out.push({ grupo: T('Personas', 'People'), t: u.n, sub: `${ES(PERFILES[u.rol].n)} · ${u.unidad}`, href: p === 'admin' ? '#/admin/personas?u=' + u.id : '#/acceso' }));
  return out;
}
function buscarGlobal(q, max = 4) {
  const res = indiceBusqueda().map((x) => ({ ...x, s: Math.max(parecido(q, x.t), parecido(q, x.sub || '') - 25) })).filter((x) => x.s >= 40).sort((a, b) => b.s - a.s);
  if (max === Infinity) return res; const porGrupo = {}; return res.filter((x) => ((porGrupo[x.grupo] = (porGrupo[x.grupo] || 0) + 1) <= max));
}
AC_FUENTES.global = (q) => buscarGlobal(q, 4);

/* ---------------------------------------------------------------- panel de demostración */
function panelDemo() {
  const perfiles = Object.entries(PERFILES);
  const saltos = [
    ['gate', '#/gate/visita/VIS-240871', T('Flujo principal: ingreso de exportación por el gate', 'Main flow: export container gate-in'), '2 min'],
    ['gate', '#/gate/visita/VIS-240872', T('Excepción: documentación incompleta', 'Exception: incomplete documents'), '1 min'],
    ['documentacion', '#/inspecciones/INS-3307', T('Proceso secundario: inspección de autoridad', 'Secondary process: authority inspection'), '2 min'],
    ['ronda', '#/terreno/ronda', T('Terreno sin conexión: App Móvil de Terreno', 'Field without connection: mobile app'), '2 min'],
    ['operador_patio', '#/cabina/patio', T('Terminal de cabina del equipo de patio', 'Yard equipment cab terminal'), '30 s'],
    ['supervisor', '#/reefer/alarmas', T('Patio refrigerado: alarmas y cadena de frío', 'Reefer yard: alarms and cold chain'), '2 min'],
    ['jefatura', '#/analitica', T('Tablero analítico', 'Analytics dashboard'), '2 min'],
    ['admin', '#/admin/parametros', T('Administración: parámetros con simulación', 'Administration: parameters with simulation'), '1 min'],
    ['publico', '#/?lang=en', T('Portal público en inglés', 'Public portal in English'), '1 min'],
  ];
  return `<div class="panel-lateral" role="dialog" aria-modal="true" aria-labelledby="demo-t" id="panel-demo">
    <div class="fila-flex entre"><h2 id="demo-t" tabindex="-1">${ic('demo')} ${T('Panel de demostración', 'Demonstration panel')}</h2>${btn(`<span class="sr">${T('Cerrar panel', 'Close panel')}</span>`, { tipo: 'secundario', ic: 'cerrar', acc: 'demo-cerrar', id: 'demo-x' })}</div>
    <p class="detalle">${T('Herramientas para recorrer el prototipo. No forman parte de la interfaz de operación.', 'Tools to walk through the prototype. Not part of the operational interface.')}</p>
    <div class="campo"><label for="demo-perfil">${T('Entrar como', 'Sign in as')}</label><select id="demo-perfil">${perfiles.map(([k, p]) => `<option value="${k}" ${E.sesion?.perfil === k ? 'selected' : ''}>${ES(p.n)}${p.ext ? ' · ' + T('externo', 'external') : ''}</option>`).join('')}</select></div>
    ${btn(T('Cambiar de perfil', 'Switch profile'), { acc: 'demo-perfil', id: 'demo-b-perfil', ic: 'personas' })}
    <hr class="sep">
    <fieldset><legend>${T('Idioma', 'Language')}</legend><div class="idioma" role="group" aria-label="${T('Idioma', 'Language')}"><button type="button" aria-pressed="${IDIOMA === 'es'}" data-acc="idioma" data-arg="es" lang="es">Español</button><button type="button" aria-pressed="${IDIOMA === 'en'}" data-acc="idioma" data-arg="en" lang="en">English</button></div></fieldset>
    <fieldset><legend>${T('Simulaciones', 'Simulations')}</legend>
      <label class="opcion"><input type="checkbox" id="demo-elc" data-cambio="demo-elc" ${E.db.elc.sinEnlace ? 'checked' : ''}>${T('Caída del enlace exterior (sigue operando el ELC)', 'External link down (ELC keeps operating)')}</label>
      <label class="opcion"><input type="checkbox" id="demo-cob" data-cambio="demo-cob" ${E.db.terreno.sinCobertura ? 'checked' : ''}>${T('Pérdida de cobertura en terreno', 'Loss of field coverage')}</label>
      <label class="opcion"><input type="checkbox" id="demo-agua" data-cambio="demo-agua" ${LS.get('agua', true) ? 'checked' : ''}>${T('Agua en movimiento en los fondos de la portada y del acceso', 'Moving water in the home and sign-in backgrounds')}</label>
      <label class="opcion"><input type="checkbox" id="demo-traza" data-cambio="demo-traza" ${E.trazabilidad ? 'checked' : ''}>${T('Modo trazabilidad (requerimientos por pantalla)', 'Traceability mode (requirements per screen)')}</label>
      ${btn(T('Disparar una alarma reefer', 'Trigger a reefer alarm'), { tipo: 'peligro', acc: 'demo-alarma', id: 'demo-b-alarma', ic: 'alerta' })}</fieldset>
    <h3>${T('Guion de demostración (15 minutos)', 'Demonstration script (15 minutes)')}</h3>
    <ol class="lista-simple">${saltos.map(([p, h, t, m], i) => `<li><button type="button" class="enlace" data-acc="demo-saltar" data-arg="${p}|${h}" id="demo-s${i}">${t}</button> <span class="detalle">· ${m}</span></li>`).join('')}</ol>
    <hr class="sep">${btn(T('Reiniciar demostración', 'Restart demonstration'), { tipo: 'secundario', acc: 'demo-reiniciar', id: 'demo-b-reset', ic: 'actualizar' })}</div>`;
}
function abrirDemo() {
  const raiz = $('#demo-raiz'); const previo = document.activeElement; raiz.innerHTML = `<div class="velo" style="justify-content:flex-end;padding:0" data-acc="demo-cerrar-velo"></div>` + panelDemo(); $('#app').inert = true;
  const panel = $('#panel-demo'); $('#demo-t').focus();
  const teclas = (e) => { if (e.key === 'Escape') cerrarDemo(); if (e.key === 'Tab') { const f = $$('button:not([disabled]), input, select, a[href]', panel); const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } } };
  panel.addEventListener('keydown', teclas); E.ui._demoPrevio = previo;
}
function cerrarDemo() { $('#demo-raiz').innerHTML = ''; $('#app').inert = false; const p = E.ui._demoPrevio; (p && document.contains(p) ? p : $('#b-demo')).focus(); }
function entrar(perfil, o = {}) {
  if (perfil === 'publico') { E.sesion = null; aviso(T('Estás en el portal público, sin sesión.', 'You are on the public portal, without a session.')); ir(o.destino || '#/'); return; }
  E.sesion = { perfil, fuera: !!o.fuera || PERFILES[perfil].ext, desde: horaSim() }; auditar('Inicio de sesión', ES(PERFILES[perfil].n), 'Correcto');
  const d = o.destino || E.ui.destino || '#/inicio'; E.ui.destino = null; ir(d);
}
ACC['demo-abrir'] = () => abrirDemo();
ACC['demo-cerrar'] = () => cerrarDemo();
ACC['demo-cerrar-velo'] = () => cerrarDemo();
ACC['demo-perfil'] = () => { const p = $('#demo-perfil').value; cerrarDemo(); E.ui.tablas = {}; entrar(p, { destino: p === 'publico' ? '#/' : '#/inicio' }); };
ACC['demo-saltar'] = (el) => { const [p, h] = el.dataset.arg.split('|'); cerrarDemo(); if (h.includes('lang=en')) { fijarIdioma('en'); E.sesion = null; ir('#/'); return; } if (E.sesion?.perfil !== p) { E.ui.tourVisto[p] = true; entrar(p, { destino: h }); } else ir(h); };
ACC['demo-reiniciar'] = async () => { cerrarDemo(); const ok = await confirmar({ titulo: T('¿Reiniciar la demostración?', 'Restart the demonstration?'), texto: T('Todo vuelve al estado inicial: citas, alarmas, hechos facturables y la sesión. El idioma elegido se conserva.', 'Everything returns to its initial state: appointments, alarms, billable events and the session. The chosen language is kept.'), si: T('Reiniciar', 'Restart') }); if (!ok) return; E = estadoInicial(); for (const k in ARCHIVOS) delete ARCHIVOS[k]; _min = 10 * 60 + 42; aviso(T('Demostración reiniciada.', 'Demonstration restarted.')); ir('#/'); };
ACC['demo-alarma'] = () => { cerrarDemo(); dispararFallaTablero(); };
CAMBIO['demo-elc'] = (el) => { simularELC(el.checked); };
CAMBIO['demo-cob'] = (el) => { E.db.terreno.sinCobertura = el.checked; if (!el.checked) sincronizarTerreno(); else aviso(T('Terreno sin cobertura: la App Móvil de Terreno sigue operando y guarda los registros en el equipo.', 'Field without coverage: the mobile app keeps working and stores records on the device.')); refrescar(); };
CAMBIO['demo-agua'] = (el) => { LS.set('agua', el.checked); document.body.classList.toggle('sin-agua', !el.checked); };
CAMBIO['demo-traza'] = (el) => { E.trazabilidad = el.checked; refrescar(); };
function simularELC(caido) {
  const e = E.db.elc;
  if (caido) { e.sinEnlace = true; e.desde = horaSim(); e.acumulados = 0; auditar('Caída del enlace exterior', 'Entorno Local de Continuidad', 'Operación sin enlace'); aviso(T('Enlace exterior caído: la operación crítica sigue en el Entorno Local de Continuidad.', 'External link down: critical operation continues in the Local Continuity Environment.'), 'error'); refrescar(); return; }
  e.sinEnlace = false; e.entregando = true; const n = e.acumulados; refrescar();
  setTimeout(() => { e.entregando = false; e.acumulados = 0; auditar('Entrega de lo acumulado en el ELC', `${n} registros`, 'Correcto'); aviso(T(`Enlace restablecido. Se entregaron ${n} registros acumulados al sistema de gestión empresarial, a las navieras y a las autoridades.`, `Link restored. ${n} accumulated records were delivered.`)); refrescar(); }, 1800);
}
function acumularELC(n = 1) { if (E.db.elc.sinEnlace) E.db.elc.acumulados += n; }

/* ---------------------------------------------------------------- recorrido guiado de primer ingreso */
const TOUR = [
  ['[data-tour="buscar"]', ['Búsqueda global', 'Global search'], ['Busca cualquier contenedor, camión, nave, documento o persona, aunque escribas con errores. Atajo: tecla /.', 'Find any container, truck, vessel, document or person, even with typos. Shortcut: / key.']],
  ['#menu-lateral', ['Menú principal', 'Main menu'], ['Los cinco módulos y los servicios transversales, filtrados según tu perfil. Cada función está a tres interacciones o menos.', 'The five modules and shared services, filtered by your profile. Every function is three interactions away or less.']],
  ['[data-tour="accesos"]', ['Accesos rápidos', 'Quick access'], ['Tus funciones más usadas, a un clic.', 'Your most used functions, one click away.']],
  ['[data-tour="tablero"]', ['Tu tablero', 'Your dashboard'], ['Agrega, quita, reordena (arrastrando o con los botones) y cambia el tamaño de los componentes. Puedes restaurar la configuración inicial.', 'Add, remove, reorder (drag or use the buttons) and resize widgets. You can restore the default layout.']],
  ['[data-tour="tareas"]', ['Bandeja de tareas', 'Task inbox'], ['Las tareas de todos los procesos, con prioridad, vencimiento y lo que traspasó el turno anterior.', 'Tasks from every process, with priority, due time and what the previous shift handed over.']],
  ['[data-tour="notif"]', ['Notificaciones', 'Notifications'], ['Las alertas del turno. Las críticas no se pueden desactivar.', 'Shift alerts. Critical ones cannot be turned off.']],
];
function iniciarTour(paso = 0) {
  if (!E.sesion || rutaActual().def.id !== 'inicio') return; cerrarTour(false);
  const pasosOk = TOUR.filter(([s]) => $(s)); if (!pasosOk.length) return; paso = Math.min(paso, pasosOk.length - 1); E.ui.tourPaso = paso;
  const [sel, t, x] = pasosOk[paso]; const obj = $(sel); obj.classList.add('tour-marca'); obj.scrollIntoView?.({ block: 'nearest' });
  const d = document.createElement('div'); d.className = 'tour'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'tour-t'); d.id = 'tour';
  d.innerHTML = `<p class="etiqueta">${T('Recorrido guiado', 'Guided tour')} · ${T('paso', 'step')} ${paso + 1} ${T('de', 'of')} ${pasosOk.length}</p><h2 id="tour-t" tabindex="-1">${ES(t)}</h2><p>${ES(x)}</p>${progreso(paso + 1, pasosOk.length, T('Avance del recorrido', 'Tour progress'), { texto: `${paso + 1}/${pasosOk.length}` })}
    <div class="grupo-botones" style="margin-top:12px">${paso ? btn(T('Anterior', 'Previous'), { tipo: 'secundario', acc: 'tour', arg: paso - 1, id: 'tour-ant' }) : ''}${paso < pasosOk.length - 1 ? btn(T('Siguiente', 'Next'), { acc: 'tour', arg: paso + 1, id: 'tour-sig' }) : btn(T('Terminar', 'Finish'), { acc: 'tour-fin', id: 'tour-fin' })}${btn(T('Saltar el recorrido', 'Skip the tour'), { tipo: 'terciario', acc: 'tour-fin', id: 'tour-saltar' })}</div>`;
  document.body.append(d); $('#tour-t').focus();
  d.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarTour();
    if (e.key === 'Tab') { const f = $$('button:not([disabled]), a[href]', d); const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
  });
}
function cerrarTour(marcar = true) { $$('.tour-marca').forEach((x) => x.classList.remove('tour-marca')); $('#tour')?.remove(); if (marcar && E.sesion) { E.ui.tourVisto[E.sesion.perfil] = true; } }
ACC.tour = (el) => iniciarTour(Number(el.dataset.arg));
ACC['tour-fin'] = () => { cerrarTour(); aviso(T('Puedes retomar el recorrido desde Ayuda.', 'You can resume the tour from Help.'), '', { href: '#/ayuda', enlace: T('Ayuda', 'Help') }); $('#titulo-pagina')?.focus(); };

/* ---------------------------------------------------------------- acciones comunes del armazón */
ACC.menu = () => { E.ui.menuAbierto = !E.ui.menuAbierto; refrescar(); if (E.ui.menuAbierto) $('#menu-lateral a')?.focus(); else $('#b-menu')?.focus(); };
ACC.idioma = (el) => { fijarIdioma(el.dataset.arg); const enDemo = !!$('#panel-demo'); refrescar(); anunciar(IDIOMA === 'en' ? 'Language: English' : 'Idioma: español'); if (enDemo) { cerrarDemo(); abrirDemo(); } else document.querySelector(`[data-acc="idioma"][data-arg="${IDIOMA}"]`)?.focus(); };
ACC.salir = async () => { const ok = await confirmar({ titulo: T('¿Cerrar la sesión?', 'Sign out?'), texto: T('Volverás al portal público. Lo que hiciste en esta demostración se conserva hasta que recargues la página.', 'You will return to the public portal. What you did in this demo is kept until you reload.'), si: T('Cerrar sesión', 'Sign out') }); if (!ok) return; auditar('Cierre de sesión', ES(perfilActual().n)); E.sesion = null; ir('#/'); };
ACC.pestana = (el) => { const [id, p] = el.dataset.arg.split('|'); E.ui.pestanas[id] = p; refrescar(); document.getElementById(`tab-${id}-${p}`)?.focus(); };
ACC['menu-abrir'] = (el) => { const m = document.getElementById(el.getAttribute('aria-controls')); const abrir = m.hidden; cerrarMenus(); if (abrir) { m.hidden = false; el.setAttribute('aria-expanded', 'true'); m.querySelector('[role="menuitem"]')?.focus(); } };
ACC['notif-abrir'] = (el) => {
  const pan = $('#panel-notif'); const abrir = pan.hidden; cerrarMenus(); if (!abrir) return;
  const ns = misNotifs().slice(0, 6);
  pan.innerHTML = `<div style="padding:8px"><div class="fila-flex entre"><strong>${T('Notificaciones', 'Notifications')}</strong><a href="#/notificaciones">${T('Ver todas', 'View all')}</a></div><ul class="lista-simple">${ns.map((n) => `<li class="${n.leida ? '' : 'no-leida'}"><a href="${n.href}" data-acc="notif-leer" data-arg="${n.id}">${n.critica ? insig(T('Crítica', 'Critical'), 'error') + ' ' : ''}${esc(n.t)}</a><br><span class="detalle">${n.hora}</span></li>`).join('') || `<li>${T('No tienes notificaciones.', 'No notifications.')}</li>`}</ul>${btn(T('Marcar todas como leídas', 'Mark all as read'), { tipo: 'secundario', tam: 'chico', acc: 'notif-todas', id: 'notif-todas' })}</div>`;
  pan.hidden = false; el.setAttribute('aria-expanded', 'true'); pan.querySelector('a')?.focus();
};
ACC['notif-leer'] = (el) => { const n = E.db.notifs.find((x) => x.id === el.dataset.arg); if (n) n.leida = true; };
ACC['notif-todas'] = () => { misNotifs().forEach((n) => { n.leida = true; }); aviso(T('Todas las notificaciones quedaron como leídas.', 'All notifications marked as read.')); refrescar(); $('#b-notif')?.focus(); };
function cerrarMenus() { $$('[role="menu"]:not([hidden]), #panel-notif:not([hidden])').forEach((m) => { m.hidden = true; const b = document.querySelector(`[aria-controls="${m.id}"]`); b?.setAttribute('aria-expanded', 'false'); }); $('.menu-ctx.flotante')?.remove(); }
function ayudaAtajos() {
  return dialogo({ titulo: T('Atajos de teclado', 'Keyboard shortcuts'), html: `<table><caption class="sr">${T('Atajos', 'Shortcuts')}</caption><thead><tr><th scope="col">${T('Tecla', 'Key')}</th><th scope="col">${T('Acción', 'Action')}</th></tr></thead><tbody>
    <tr><td><kbd>/</kbd></td><td>${T('Ir a la búsqueda global', 'Go to global search')}</td></tr><tr><td><kbd>N</kbd></td><td>${T('Registro nuevo en la pantalla actual (cita, inspección, contraparte, persona…)', 'New record on the current screen')}</td></tr>
    <tr><td><kbd>T</kbd></td><td>${T('Abrir la bandeja de tareas', 'Open the task inbox')}</td></tr><tr><td><kbd>?</kbd></td><td>${T('Mostrar esta ayuda', 'Show this help')}</td></tr><tr><td><kbd>Esc</kbd></td><td>${T('Cerrar diálogos, menús y sugerencias', 'Close dialogs, menus and suggestions')}</td></tr></tbody></table>
    <p class="detalle">${T('Los atajos de una tecla se pueden desactivar en Mis preferencias.', 'Single-key shortcuts can be turned off in My preferences.')}</p>` });
}

/* ---------------------------------------------------------------- eventos globales delegados */
function instalarEventos() {
  document.addEventListener('click', (e) => {
    const s = e.target.closest('#saltar'); if (s) { e.preventDefault(); const m = $('#titulo-pagina') || $('#contenido'); m?.focus(); return; }
    const op = e.target.closest('[role="option"]'); if (op) { const inp = document.querySelector(`[aria-controls="${op.closest('[role="listbox"]').id}"]`); if (inp) { e.preventDefault(); acElegir(inp, op); return; } }
    if (!e.target.closest('.menu-acc')) cerrarMenus();
    const a = e.target.closest('[data-acc]'); if (a && !a.disabled && ACC[a.dataset.acc]) { if (a.tagName !== 'A' || a.dataset.acc !== 'notif-leer') e.preventDefault(); ACC[a.dataset.acc](a, e); return; }
    if (!e.target.closest('.ac')) $$('[role="combobox"][aria-expanded="true"]').forEach(acCerrar);
  });
  document.addEventListener('submit', (e) => { const f = e.target.closest('form[data-form]'); if (f && FORM[f.dataset.form]) { e.preventDefault(); FORM[f.dataset.form](f, e); } });
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.val) validarCampo(t);
    if (t.dataset.tablaQ) { E.ui.tablas[t.dataset.tablaQ].q = t.value; E.ui.tablas[t.dataset.tablaQ].pagina = 1; refrescarTabla(t.dataset.tablaQ); }
    if (t.dataset.ac) acMostrar(t);
    if (t.dataset.entrada && CAMBIO[t.dataset.entrada]) CAMBIO[t.dataset.entrada](t, e);
  });
  document.addEventListener('focusout', (e) => { const t = e.target; if (t.dataset?.val && t.value) validarCampo(t, true); });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.tablaF) { E.ui.tablas[t.dataset.tablaF].f[t.dataset.k] = t.value; E.ui.tablas[t.dataset.tablaF].pagina = 1; refrescarTabla(t.dataset.tablaF); }
    if (t.dataset.tablaSel) { const st = E.ui.tablas[t.dataset.tablaSel]; st.sel = t.checked ? [...new Set([...st.sel, t.value])] : st.sel.filter((x) => x !== t.value); refrescarTabla(t.dataset.tablaSel); }
    if (t.dataset.tablaTodos) { const id = t.dataset.tablaTodos; const cfg = TABLAS[id]; const st = E.ui.tablas[id]; const pp = cfg.porPagina || 10; const vis = filasTabla(cfg).slice((st.pagina - 1) * pp, st.pagina * pp).map((f) => String(f[cfg.clave || 'id'])); st.sel = t.checked ? [...new Set([...st.sel, ...vis])] : st.sel.filter((x) => !vis.includes(x)); refrescarTabla(id); }
    if (t.dataset.archivo) agregarArchivos(t.dataset.archivo, [...t.files]);
    if (t.dataset.cambio && CAMBIO[t.dataset.cambio]) CAMBIO[t.dataset.cambio](t, e);
  });
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t.getAttribute?.('role') === 'combobox') {
      const lista = document.getElementById(t.getAttribute('aria-controls')); const ops = lista && !lista.hidden ? $$('[role="option"]:not([aria-disabled="true"])', lista) : [];
      const act = document.getElementById(t.getAttribute('aria-activedescendant') || ''); let i = ops.indexOf(act);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { if (!ops.length) { acMostrar(t); return; } e.preventDefault(); i = e.key === 'ArrowDown' ? (i + 1) % ops.length : (i - 1 + ops.length) % ops.length; ops.forEach((o) => o.setAttribute('aria-selected', 'false')); ops[i].setAttribute('aria-selected', 'true'); t.setAttribute('aria-activedescendant', ops[i].id); ops[i].scrollIntoView({ block: 'nearest' }); return; }
      if (e.key === 'Enter') { if (act) { e.preventDefault(); acElegir(t, act); return; } if (t.dataset.global && t.value.trim()) { e.preventDefault(); const q = t.value.trim(); acCerrar(t); ir('#/buscar?q=' + encodeURIComponent(q)); return; } }
      if (e.key === 'Escape') { if (lista && !lista.hidden) { e.preventDefault(); acCerrar(t); return; } }
    }
    if (e.key === 'Escape') { const ab = $('[role="menu"]:not([hidden]), #panel-notif:not([hidden])'); const origen = ab && ab.contains(t) ? document.querySelector(`[aria-controls="${ab.id}"]`) : null; cerrarMenus(); $$('.ctx.visible').forEach((c) => c.classList.remove('visible')); if (E.ui.menuAbierto) ACC.menu(); origen?.focus(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && t instanceof SVGElement && t.dataset?.acc && ACC[t.dataset.acc]) { e.preventDefault(); ACC[t.dataset.acc](t, e); return; }
    const menu = t.closest?.('[role="menu"]');
    if (menu && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) { e.preventDefault(); const it = $$('[role="menuitem"]', menu); let i = it.indexOf(t); i = e.key === 'Home' ? 0 : e.key === 'End' ? it.length - 1 : e.key === 'ArrowDown' ? (i + 1) % it.length : (i - 1 + it.length) % it.length; it[i].focus(); return; }
    if (t.getAttribute?.('role') === 'tab' && ['ArrowRight', 'ArrowLeft'].includes(e.key)) { const tabs = $$('[role="tab"]', t.closest('[role="tablist"]')); let i = tabs.indexOf(t); i = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; tabs[i].click(); return; }
    const escribiendo = /INPUT|TEXTAREA|SELECT/.test(t.tagName) || t.isContentEditable; if (escribiendo || e.ctrlKey || e.metaKey || e.altKey || !E.ui.atajos) return;
    if ($('#modal-raiz').children.length || $('#panel-demo')) return;
    if (e.key === '/' && $('#busqueda')) { e.preventDefault(); $('#busqueda').focus(); }
    else if (e.key === '?') { e.preventDefault(); ayudaAtajos(); }
    else if ((e.key === 'n' || e.key === 'N') && E.sesion) { const d = rutaActual().def; if (d.nuevo) { e.preventDefault(); ir(d.nuevo); } else aviso(T('En esta pantalla no hay un registro nuevo. Prueba en citas, inspecciones, contrapartes o personas usuarias.', 'There is no new record on this screen.')); }
    else if ((e.key === 't' || e.key === 'T') && E.sesion) { e.preventDefault(); ir('#/tareas'); }
  });
  const tt = (e, ver) => { const c = e.target.closest?.('.ctx'); if (c) c.classList.toggle('visible', ver); };
  document.addEventListener('mouseover', (e) => tt(e, true)); document.addEventListener('mouseout', (e) => { if (!e.relatedTarget?.closest?.('.ctx')) tt(e, false); });
  document.addEventListener('focusin', (e) => tt(e, true)); document.addEventListener('focusout', (e) => tt(e, false));
  document.addEventListener('contextmenu', (e) => { const f = e.target.closest('[data-ctx-fila]'); if (!f) return; const [id, k] = f.dataset.ctxFila.split('|'); const cfg = TABLAS[id]; if (!cfg?.ctx) return; e.preventDefault(); abrirMenuCtx(cfg.ctx(k), e.clientX, e.clientY); });
  ['dragenter', 'dragover'].forEach((ev) => document.addEventListener(ev, (e) => { const z = e.target.closest?.('[data-zona]'); if (z) { e.preventDefault(); z.classList.add('encima'); } }));
  document.addEventListener('dragleave', (e) => { const z = e.target.closest?.('[data-zona]'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('encima'); });
  document.addEventListener('drop', (e) => { const z = e.target.closest?.('[data-zona]'); if (z) { e.preventDefault(); z.classList.remove('encima'); agregarArchivos(z.dataset.zona, [...(e.dataTransfer?.files || [])]); } });
  window.addEventListener('hashchange', () => { cerrarTour(false); render(); });
}
function abrirMenuCtx(items, x, y) {
  cerrarMenus(); const m = document.createElement('ul'); m.className = 'menu-ctx flotante'; m.setAttribute('role', 'menu'); m.setAttribute('aria-label', T('Acciones de la fila', 'Row actions'));
  m.style.left = Math.min(x, innerWidth - 250) + 'px'; m.style.top = Math.min(y, innerHeight - items.length * 48 - 16) + 'px';
  m.innerHTML = items.map((it) => `<li role="none">${it.href ? `<a role="menuitem" tabindex="-1" href="${it.href}">${ic(it.ic || 'der')}${it.t}</a>` : `<button role="menuitem" tabindex="-1" type="button" data-acc="${it.acc}" data-arg="${esc(it.arg)}">${ic(it.ic || 'der')}${it.t}</button>`}</li>`).join('');
  document.body.append(m); m.querySelector('[role="menuitem"]').focus(); m.addEventListener('click', () => setTimeout(() => m.remove(), 0));
}
