/* ATOS · componentes reutilizables. Cada uno se usa en al menos una pantalla real del caso
   (tabla «componente → pantalla» en la arquitectura de información). */
'use strict';

const ACC = {};   // acciones por data-acc
const FORM = {};  // envíos por data-form
const CAMBIO = {}; // cambios por data-cambio
const TABLAS = {};
let _uid = 100; const uid = (p = 'u') => p + (++_uid); // empieza sobre los identificadores de partida (TA-1 a TA-23, NO-1 a NO-16)

/* ---------------------------------------------------------------- piezas simples */
function btn(txt, o = {}) {
  const cls = `boton ${o.tipo || ''} ${o.tam || ''}`.trim();
  const attrs = `${o.id ? `id="${o.id}"` : ''} ${o.acc ? `data-acc="${o.acc}"` : ''} ${o.arg != null ? `data-arg="${esc(o.arg)}"` : ''} ${o.attrs || ''} ${o.etq ? `aria-label="${esc(o.etq)}"` : ''}`;
  const cont = `${o.ic ? ic(o.ic) : ''}<span>${txt}</span>${o.flecha ? `<span class="circulo-flecha" aria-hidden="true">${ic('flecha')}</span>` : ''}`;
  if (o.href && !o.disabled) return `<a class="${cls}" href="${o.href}" ${attrs}>${cont}</a>`;
  return `<button type="${o.submit ? 'submit' : 'button'}" class="${cls}" ${attrs} ${o.disabled ? 'disabled' : ''} ${o.describe ? `aria-describedby="${o.describe}"` : ''}>${cont}</button>`;
}
const ICONO_TIPO = { ok: 'check', aviso: 'exclama', error: 'error', info: 'info', alarma: 'alerta', solido: 'check' };
function insig(txt, tipo = 'info', icono) { const i = icono || ICONO_TIPO[tipo]; return `<span class="insignia ${tipo}">${i ? ic(i) : ''}${txt}</span>`; }
function msj(tipo, titulo, texto = '', extra = '') {
  const rol = tipo === 'error' || tipo === 'alarma' ? 'role="alert"' : '';
  return `<div class="mensaje ${tipo}" ${rol}>${ic(ICONO_TIPO[tipo] || 'info')}<div><strong>${titulo}</strong>${texto ? `<p>${texto}</p>` : ''}${extra}</div></div>`;
}
function ctx(texto, etq) { const id = uid('tt'); return `<span class="ctx"><button type="button" aria-describedby="${id}" aria-label="${esc(etq || T('Más información', 'More information'))}" data-ctx-tt>${ic('info')}</button><span role="tooltip" id="${id}">${texto}</span></span>`; }
function datos(pares) { return `<dl class="datos">${pares.filter(Boolean).map(([k, v]) => `<div class="dato"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`; }
function progreso(valor, max, etq, o = {}) {
  const p = max ? Math.max(0, Math.min(100, (valor / max) * 100)) : 0; const id = uid('pg');
  return `<div class="progreso"><div class="fila-flex entre"><span id="${id}">${etq}</span><span class="num"><strong>${o.texto ?? num(p, 0) + ' %'}</strong></span></div>
    <div class="riel ${o.indet ? 'indet' : ''}" role="progressbar" aria-labelledby="${id}" aria-valuemin="0" aria-valuemax="${max}" ${o.indet ? '' : `aria-valuenow="${valor}" aria-valuetext="${esc(o.texto ?? num(p, 0) + ' %')}"`}><span class="relleno ${o.alerta ? 'alerta' : ''}" style="width:${p}%"></span></div></div>`;
}
function esqueleto(n = 3) { return `<div aria-hidden="true">${'<span class="esqueleto titulo"></span><span class="esqueleto"></span><span class="esqueleto alto"></span>'.repeat(1)}${'<span class="esqueleto"></span>'.repeat(n)}</div><span class="sr" role="status">${T('Cargando…', 'Loading…')}</span>`; }
function vacio(titulo, texto, accion = '') { return `<div class="vacio">${olas(200)}<h3>${titulo}</h3><p>${texto}</p>${accion}</div>`; }
function lineaTiempo(evs, o = {}) {
  if (!evs.length) return vacio(T('Sin eventos todavía', 'No events yet'), o.vacio || T('Los eventos aparecerán aquí a medida que ocurran.', 'Events will appear here as they happen.'));
  return `<ol class="tiempo" aria-label="${esc(o.etq || T('Línea de tiempo', 'Timeline'))}">${evs.map((e) => `<li class="${e.clase || ''}"><span class="hora">${esc(e.hora)}</span><strong>${e.t}</strong>${e.fuente ? `<span class="fuente">${e.fuente}</span>` : ''}</li>`).join('')}</ol>`;
}
function pasos(lista, actual, o = {}) {
  return `<ol class="pasos" aria-label="${esc(o.etq || T('Pasos del proceso', 'Process steps'))}">${lista.map((p, i) => {
    const cls = o.fallo === i ? 'fallo' : i < actual ? 'hecho' : i === actual ? 'actual' : '';
    const est = i < actual ? T('completado', 'completed') : i === actual ? T('paso actual', 'current step') : T('pendiente', 'pending');
    const nombre = typeof p === 'string' ? p : p.n; const sub = typeof p === 'string' ? '' : p.est;
    const txt = o.acc && i < actual ? `<button type="button" data-acc="${o.acc}" data-arg="${i}">${nombre}</button>` : nombre;
    return `<li class="${cls}" ${i === actual ? 'aria-current="step"' : ''}>${txt}<span class="sr">, ${est}</span>${sub ? `<span class="est">${sub}</span>` : ''}</li>`;
  }).join('')}</ol>`;
}
function pestanas(id, items, activa) {
  const sel = activa || E.ui.pestanas[id] || items[0].id;
  return `<div class="pestanas" data-pestanas="${id}"><div role="tablist" aria-label="${esc(items.etq || T('Secciones', 'Sections'))}">${items.map((p) => `<button role="tab" type="button" id="tab-${id}-${p.id}" aria-controls="pan-${id}-${p.id}" aria-selected="${p.id === sel}" tabindex="${p.id === sel ? 0 : -1}" data-acc="pestana" data-arg="${id}|${p.id}">${p.t}</button>`).join('')}</div>
    ${items.map((p) => `<div role="tabpanel" id="pan-${id}-${p.id}" aria-labelledby="tab-${id}-${p.id}" tabindex="0" ${p.id === sel ? '' : 'hidden'}>${p.id === sel ? (typeof p.html === 'function' ? p.html() : p.html) : ''}</div>`).join('')}</div>`;
}
function acordeon(items) { return items.map((it) => `<details class="acordeon" ${it.abierto ? 'open' : ''}><summary>${it.t}</summary><div>${it.html}</div></details>`).join(''); }
function migas(lista) {
  return `<nav class="migas" aria-label="${T('Rastro de navegación', 'Breadcrumb')}"><ol>${lista.map(([t, h], i) => i === lista.length - 1 ? `<li><span aria-current="page">${t}</span></li>` : `<li><a href="${h}">${t}</a></li>`).join('')}</ol></nav>`;
}
function menuAcciones(etq, items, o = {}) {
  const id = o.id || uid('ma');
  return `<div class="menu-acc"><button type="button" class="${o.clase || 'boton secundario'}" id="${id}" aria-haspopup="menu" aria-expanded="false" aria-controls="${id}-m" data-acc="menu-abrir">${ic(o.ic || 'opciones')}<span class="${o.soloIcono ? 'sr' : ''}">${etq}</span></button>
    <ul role="menu" id="${id}-m" aria-labelledby="${id}" hidden>${items.map((it) => `<li role="none">${it.href ? `<a role="menuitem" tabindex="-1" href="${it.href}">${it.ic ? ic(it.ic) : ''}${it.t}</a>` : `<button role="menuitem" type="button" tabindex="-1" data-acc="${it.acc}" ${it.arg != null ? `data-arg="${esc(it.arg)}"` : ''}>${it.ic ? ic(it.ic) : ''}${it.t}</button>`}</li>`).join('')}</ul></div>`;
}
function fab(txt, o) { return `<a class="boton clave fab" href="${o.href}" ${o.id ? `id="${o.id}"` : ''} aria-keyshortcuts="N">${ic(o.ic || 'mas')}<span>${txt}</span></a>`; }

/* ---------------------------------------------------------------- campos con validación en tiempo real */
function campo(o) {
  const id = o.id; const ayuda = o.ayuda ? `<span class="ayuda" id="${id}-ay">${o.ayuda}</span>` : '';
  const desc = [o.ayuda ? `${id}-ay` : '', `${id}-msg`].filter(Boolean).join(' ');
  const comunes = `id="${id}" name="${o.name || id}" ${o.val ? `data-val="${o.val}"` : ''} ${o.req ? 'required aria-required="true"' : ''} aria-describedby="${desc}" ${o.attrs || ''} ${o.disabled ? 'disabled' : ''} ${o.readonly ? 'readonly' : ''}`;
  let control;
  if (o.tipo === 'select') control = `<select ${comunes}>${(o.opciones || []).map((op) => { const [v, t] = Array.isArray(op) ? op : [op, op]; return `<option value="${esc(v)}" ${String(v) === String(o.valor ?? '') ? 'selected' : ''}>${t}</option>`; }).join('')}</select>`;
  else if (o.tipo === 'textarea') control = `<textarea ${comunes} rows="${o.filas || 3}" ${o.ph ? `placeholder="${esc(o.ph)}"` : ''}>${esc(o.valor || '')}</textarea>`;
  else control = `<input type="${o.tipo || 'text'}" ${comunes} value="${esc(o.valor ?? '')}" ${o.ph ? `placeholder="${esc(o.ph)}"` : ''} ${o.auto ? `autocomplete="${o.auto}"` : 'autocomplete="off"'} ${o.modo ? `inputmode="${o.modo}"` : ''} ${o.min != null ? `min="${o.min}"` : ''} ${o.max != null ? `max="${o.max}"` : ''} ${o.paso != null ? `step="${o.paso}"` : ''}>`;
  return `<div class="campo ${o.clase || ''}"><label for="${id}">${o.et}${o.req ? ` <span aria-hidden="true">*</span>` : ''}</label>${ayuda}${control}<span class="msg-campo" id="${id}-msg" aria-live="polite"></span></div>`;
}
function marcarCampo(el, res, forzar = false) {
  const msg = document.getElementById(el.id + '-msg'); if (!msg) return;
  if (res.ok) { el.setAttribute('aria-invalid', 'false'); msg.className = 'msg-campo ok'; msg.innerHTML = res.msg ? ic('check') + `<span>${res.msg}</span>` : ''; }
  else if (res.vacio && !forzar) { el.removeAttribute('aria-invalid'); msg.className = 'msg-campo'; msg.innerHTML = ''; }
  else { el.setAttribute('aria-invalid', 'true'); msg.className = 'msg-campo error'; msg.innerHTML = ic('error') + `<span>${res.msg}</span>`; }
}
function validarCampo(el, forzar = false) {
  const v = el.dataset.val; if (!v) return true;
  let res = VALIDADORES[v] ? VALIDADORES[v](el.value) : { ok: true };
  if (res.vacio && !el.required) res = { ok: true, msg: '' };
  marcarCampo(el, res, forzar); return res.ok;
}
function validarForm(form) {
  const campos = $$('[data-val]', form).filter((c) => !c.disabled); let malos = 0;
  for (const c of campos) if (!validarCampo(c, true)) malos++;
  for (const c of $$('[required]:not([data-val])', form)) {
    const vacioG = c.type === 'checkbox' ? !c.checked : c.type === 'radio' ? !$$(`[name="${c.name}"]`, form).some((x) => x.checked) : !String(c.value).trim();
    const msg = document.getElementById(c.id + '-msg') || document.getElementById(c.name + '-msg');
    if (vacioG) { malos++; c.setAttribute('aria-invalid', 'true'); if (msg) { msg.className = 'msg-campo error'; msg.innerHTML = ic('error') + `<span>${c.dataset.msg || T('Este campo es obligatorio.', 'This field is required.')}</span>`; } }
    else { c.removeAttribute('aria-invalid'); if (msg && c.type !== 'text') { msg.className = 'msg-campo'; msg.innerHTML = ''; } }
  }
  if (malos) { const primero = $('[aria-invalid="true"]', form); primero?.focus(); anunciar(malos === 1 ? T('Hay 1 campo por corregir.', '1 field needs correction.') : T(`Hay ${malos} campos por corregir.`, `${malos} fields need correction.`)); }
  return malos === 0;
}

/* ---------------------------------------------------------------- tabla con orden, filtro, paginación, selección y acciones masivas */
function estadoTabla(id, cfg) { return (E.ui.tablas[id] ||= { orden: cfg.ordenInicial || null, dir: cfg.dirInicial || 1, pagina: 1, q: '', f: {}, sel: [] }); }
function tabla(cfg) { TABLAS[cfg.id] = cfg; return `<div class="bloque-tabla" id="tb-${cfg.id}">${tablaInterior(cfg)}</div>`; }
function filasTabla(cfg) {
  const st = estadoTabla(cfg.id, cfg); let filas = cfg.filas.slice();
  const val = (c, f) => (c.v ? c.v(f) : f[c.k]);
  if (st.q) filas = filas.filter((f) => cfg.columnas.some((c) => parecido(st.q, String(val(c, f) ?? '')) >= 40));
  for (const fl of cfg.filtros || []) if (st.f[fl.k]) filas = filas.filter((f) => String(fl.v ? fl.v(f) : f[fl.k]) === st.f[fl.k]);
  if (st.orden) { const c = cfg.columnas.find((x) => x.k === st.orden); if (c) filas.sort((a, b) => { const x = c.o ? c.o(a) : val(c, a), y = c.o ? c.o(b) : val(c, b); return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'es', { numeric: true })) * st.dir; }); }
  return filas;
}
function tablaInterior(cfg) {
  const st = estadoTabla(cfg.id, cfg); const filas = filasTabla(cfg); const clave = cfg.clave || 'id';
  const pp = cfg.porPagina || 10; const npag = Math.max(1, Math.ceil(filas.length / pp)); st.pagina = Math.min(st.pagina, npag);
  const vis = filas.slice((st.pagina - 1) * pp, st.pagina * pp);
  const masivas = cfg.masivas && st.sel.length ? `<div class="barra-masiva" role="region" aria-label="${T('Acciones masivas', 'Bulk actions')}"><strong>${st.sel.length} ${T('seleccionados', 'selected')}</strong>${cfg.masivas.map((m, i) => btn(m.t, { tipo: 'secundario', tam: 'chico', acc: 'tabla-masiva', arg: `${cfg.id}|${i}`, id: `tm-${cfg.id}-${i}` })).join('')}${btn(T('Quitar selección', 'Clear selection'), { tipo: 'terciario', acc: 'tabla-limpiar', arg: cfg.id, attrs: 'style="color:#fff"' })}</div>` : '';
  const herramientas = cfg.sinHerramientas ? '' : `<div class="herramientas-tabla">
    <div class="campo q"><label for="tq-${cfg.id}">${T('Buscar en la tabla', 'Search the table')}</label><input type="search" id="tq-${cfg.id}" data-tabla-q="${cfg.id}" value="${esc(st.q)}" autocomplete="off" aria-describedby="tr-${cfg.id}"></div>
    ${(cfg.filtros || []).map((fl) => { const ops = fl.opciones || [...new Set(cfg.filas.map((f) => String(fl.v ? fl.v(f) : f[fl.k])))].sort(); return `<div class="campo"><label for="tf-${cfg.id}-${fl.k}">${fl.t}</label><select id="tf-${cfg.id}-${fl.k}" data-tabla-f="${cfg.id}" data-k="${fl.k}"><option value="">${T('Todos', 'All')}</option>${ops.map((o) => `<option ${st.f[fl.k] === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`; }).join('')}
    ${cfg.exportar === false ? '' : btn(T('Exportar CSV', 'Export CSV'), { tipo: 'secundario', ic: 'bajar', acc: 'tabla-csv', arg: cfg.id, id: `tx-${cfg.id}` })}
    ${cfg.extra || ''}</div>`;
  const cab = cfg.columnas.map((c) => {
    const ord = st.orden === c.k ? (st.dir > 0 ? 'ascending' : 'descending') : 'none';
    return `<th scope="col" class="${c.n ? 'n' : ''}" ${c.orden === false ? '' : `aria-sort="${ord}"`}>${c.orden === false ? c.t : `<button type="button" class="orden" id="to-${cfg.id}-${c.k}" data-acc="tabla-orden" data-arg="${cfg.id}|${c.k}">${c.t}${ic(ord === 'ascending' ? 'arriba' : ord === 'descending' ? 'abajo' : 'ordenar')}</button>`}</th>`;
  }).join('');
  const filasHtml = vis.map((f) => {
    const k = f[clave]; const sel = st.sel.includes(String(k));
    return `<tr ${cfg.masivas && sel ? 'class="sel"' : ''} ${cfg.ctx ? `data-ctx-fila="${cfg.id}|${esc(k)}"` : ''}>${cfg.masivas ? `<td class="celda-check"><input type="checkbox" id="ts-${cfg.id}-${esc(k)}" data-tabla-sel="${cfg.id}" value="${esc(k)}" ${sel ? 'checked' : ''} aria-label="${T('Seleccionar', 'Select')} ${esc(k)}"></td>` : ''}${cfg.columnas.map((c, i) => { const cont = c.html ? c.html(f) : esc(c.v ? c.v(f) : f[c.k]); return i === 0 && !cfg.sinCabFila ? `<th scope="row" class="${c.n ? 'n' : ''}">${cont}</th>` : `<td class="${c.n ? 'n' : ''}">${cont}</td>`; }).join('')}</tr>`;
  }).join('');
  const todosSel = vis.length && vis.every((f) => st.sel.includes(String(f[clave])));
  const desde = filas.length ? (st.pagina - 1) * pp + 1 : 0, hasta = Math.min(filas.length, st.pagina * pp);
  const pagBtns = []; for (let p = 1; p <= npag; p++) pagBtns.push(`<li><button type="button" id="tp-${cfg.id}-${p}" data-acc="tabla-pagina" data-arg="${cfg.id}|${p}" ${p === st.pagina ? 'aria-current="page"' : ''} aria-label="${T('Página', 'Page')} ${p}">${p}</button></li>`);
  return `${herramientas}${masivas}<p class="sr" id="tr-${cfg.id}" aria-live="polite">${filas.length} ${T('resultados', 'results')}</p>
    ${filas.length ? `<div class="desplaza" role="region" aria-label="${esc(cfg.titulo)}" tabindex="0"><table class="${cfg.clase || ''}"><caption class="${cfg.verCaption ? '' : 'sr'}">${cfg.titulo}</caption><thead><tr>${cfg.masivas ? `<th scope="col" class="celda-check"><input type="checkbox" id="tsa-${cfg.id}" data-tabla-todos="${cfg.id}" ${todosSel ? 'checked' : ''} aria-label="${T('Seleccionar todos los de esta página', 'Select all on this page')}"></th>` : ''}${cab}</tr></thead><tbody>${filasHtml}</tbody></table></div>
    ${npag > 1 || cfg.verConteo ? `<nav class="paginacion" aria-label="${T('Paginación de', 'Pagination of')} ${esc(cfg.titulo)}"><span>${T(`Mostrando ${desde} a ${hasta} de ${filas.length}`, `Showing ${desde} to ${hasta} of ${filas.length}`)}</span><ul>
      <li><button type="button" id="tp-${cfg.id}-ant" data-acc="tabla-pagina" data-arg="${cfg.id}|${st.pagina - 1}" ${st.pagina === 1 ? 'disabled' : ''} aria-label="${T('Página anterior', 'Previous page')}">${ic('izq')}</button></li>${pagBtns.join('')}
      <li><button type="button" id="tp-${cfg.id}-sig" data-acc="tabla-pagina" data-arg="${cfg.id}|${st.pagina + 1}" ${st.pagina === npag ? 'disabled' : ''} aria-label="${T('Página siguiente', 'Next page')}">${ic('der')}</button></li></ul></nav>` : ''}`
    : vacio(cfg.vacioT || T('No hay resultados', 'No results'), cfg.vacioX || T('Ninguna fila cumple la búsqueda o los filtros. Prueba con otro término o quita un filtro.', 'No rows match the search or filters. Try another term or remove a filter.'), st.q || Object.values(st.f).some(Boolean) ? btn(T('Quitar búsqueda y filtros', 'Clear search and filters'), { tipo: 'secundario', acc: 'tabla-reset', arg: cfg.id, id: `tz-${cfg.id}` }) : '')}`;
}
function refrescarTabla(id) {
  const cont = document.getElementById('tb-' + id); const cfg = TABLAS[id]; if (!cont || !cfg) return;
  const foco = document.activeElement?.id; const pos = document.activeElement?.selectionStart;
  cont.innerHTML = tablaInterior(cfg);
  const el = foco && document.getElementById(foco); if (el) { el.focus(); if (pos != null && el.setSelectionRange) try { el.setSelectionRange(pos, pos); } catch { /* campo sin cursor */ } }
}
ACC['tabla-orden'] = (el) => { const [id, k] = el.dataset.arg.split('|'); const st = E.ui.tablas[id]; if (st.orden === k) st.dir = -st.dir; else { st.orden = k; st.dir = 1; } refrescarTabla(id); };
ACC['tabla-pagina'] = (el) => { const [id, p] = el.dataset.arg.split('|'); E.ui.tablas[id].pagina = Math.max(1, Number(p)); refrescarTabla(id); const b = document.getElementById(`tp-${id}-${E.ui.tablas[id].pagina}`); b?.focus(); };
ACC['tabla-reset'] = (el) => { const st = E.ui.tablas[el.dataset.arg]; st.q = ''; st.f = {}; st.pagina = 1; refrescarTabla(el.dataset.arg); $(`#tq-${el.dataset.arg}`)?.focus(); };
ACC['tabla-limpiar'] = (el) => { E.ui.tablas[el.dataset.arg].sel = []; refrescarTabla(el.dataset.arg); $(`#tsa-${el.dataset.arg}`)?.focus(); };
ACC['tabla-csv'] = (el) => { const cfg = TABLAS[el.dataset.arg]; const filas = filasTabla(cfg); exportarCSV(cfg.archivo || cfg.id, cfg.columnas.filter((c) => !c.noCSV), filas, cfg.titulo); };
ACC['tabla-masiva'] = async (el) => {
  const [id, i] = el.dataset.arg.split('|'); const cfg = TABLAS[id]; const m = cfg.masivas[i]; const st = E.ui.tablas[id];
  const ok = m.confirmar ? await confirmar({ titulo: m.t, texto: `${m.confirmar} (${st.sel.length})`, si: m.t, critico: m.critico }) : true;
  if (!ok) return; m.fn(st.sel.slice()); st.sel = []; refrescar();
};

/* ---------------------------------------------------------------- calendario con disponibilidad y selector de hora */
function calendario(o) {
  const dsem = T(['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'], ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']);
  const desfase = (o.dias[0].d.getDay() + 6) % 7;
  return `<fieldset><legend>${o.et}</legend><div class="calendario" role="group" aria-label="${esc(o.et)}">${(Array.isArray(dsem) ? dsem : dsem.split(',')).map((d) => `<span class="dsem" aria-hidden="true">${d}</span>`).join('')}
    ${'<span></span>'.repeat(desfase)}${o.dias.map((x, i) => { const sin = !x.cupos; return `<button type="button" id="${o.id}-d${i}" data-acc="${o.acc}" data-arg="${i}" aria-pressed="${o.sel === i}" ${sin ? 'disabled' : ''} aria-label="${x.d.getDate()} ${sin ? T('sin cupo', 'full') : x.cupos + ' ' + T('libres', 'free')}: ${fFecha(x.d)}">${x.d.getDate()} <small>${sin ? T('sin cupo', 'full') : x.cupos + ' ' + T('libres', 'free')}</small></button>`; }).join('')}</div></fieldset>`;
}
function selectorHoras(o) {
  return `<fieldset><legend>${o.et}</legend><div class="horas">${o.horas.map((h, i) => `<label class="opcion tarjeta-op"><input type="radio" name="${o.id}" id="${o.id}-${i}" value="${h.h}" ${h.libre ? '' : 'disabled'} ${o.sel === h.h ? 'checked' : ''} ${i === 0 ? `required data-msg="${T('Elige una hora.', 'Choose a time.')}"` : ''}><span>${h.h}${h.libre ? '' : ' · ' + T('ocupada', 'taken')}</span></label>`).join('')}</div><span class="msg-campo" id="${o.id}-msg" aria-live="polite"></span></fieldset>`;
}

/* ---------------------------------------------------------------- carga de archivos con arrastrar y soltar (y alternativa por teclado) */
const ARCHIVOS = {};
function zonaCarga(o) {
  const lista = ARCHIVOS[o.id] || [];
  return `<div class="zona-carga ${lista.length ? 'cargada' : ''}" data-zona="${o.id}" id="zc-${o.id}">
    ${ic('subir', 'g')}<p><strong>${o.et}</strong><br><span class="detalle">${o.ayuda || T('Arrastra el archivo aquí, o elígelo desde tu equipo. PDF, JPG o PNG de hasta 10 MB.', 'Drag the file here, or choose it from your device. PDF, JPG or PNG up to 10 MB.')}</span></p>
    <input type="file" id="fi-${o.id}" hidden data-archivo="${o.id}" ${o.multiple ? 'multiple' : ''} accept="${o.acepta || '.pdf,.jpg,.jpeg,.png,.xlsx,.csv'}">
    <div class="grupo-botones">${btn(T('Elegir archivo', 'Choose file'), { tipo: 'secundario', acc: 'elegir-archivo', arg: o.id, ic: 'documento', id: `be-${o.id}` })}${btn(T('Usar archivo de ejemplo', 'Use sample file'), { tipo: 'terciario', acc: 'archivo-ejemplo', arg: `${o.id}|${o.ejemplo || 'documento.pdf'}`, id: `bx-${o.id}` })}</div>
    <ul class="archivos" aria-live="polite" aria-label="${T('Archivos cargados', 'Uploaded files')}">${lista.map((a) => `<li>${ic('check')}<span><strong>${esc(a.n)}</strong> · ${esc(a.t)}</span></li>`).join('')}</ul></div>`;
}
function agregarArchivos(id, archivos) {
  const malos = [];
  for (const f of archivos) { if (f.size > 10 * 1024 * 1024) { malos.push(f.name); continue; } (ARCHIVOS[id] ||= []).push({ n: f.name, t: f.size ? num(Math.max(1, Math.round(f.size / 1024))) + ' KB' : T('ejemplo', 'sample') }); }
  if (malos.length) aviso(T(`No se cargó ${malos.join(', ')}: supera los 10 MB. Comprime el archivo o divídelo.`, `${malos.join(', ')} was not uploaded: it exceeds 10 MB. Compress or split it.`), 'error');
  const z = document.getElementById('zc-' + id); z?.dispatchEvent(new CustomEvent('archivos', { bubbles: true, detail: { id } }));
  CARGA[id]?.(ARCHIVOS[id] || []);
  refrescar();
  setTimeout(() => document.getElementById('be-' + id)?.focus(), 0);
}
const CARGA = {}; // reacciones por zona de carga
ACC['elegir-archivo'] = (el) => document.getElementById('fi-' + el.dataset.arg)?.click();
ACC['archivo-ejemplo'] = (el) => { const [id, n] = el.dataset.arg.split('|'); agregarArchivos(id, [{ name: n, size: 248 * 1024 }]); };

/* ---------------------------------------------------------------- autocompletado (combobox) */
const AC_FUENTES = {};
function autocompletar(o) {
  return `<div class="campo ${o.clase || ''}"><label for="${o.id}">${o.et}</label>${o.ayuda ? `<span class="ayuda" id="${o.id}-ay">${o.ayuda}</span>` : ''}
    <div class="ac"><input type="text" id="${o.id}" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${o.id}-lista" data-ac="${o.fuente}" autocomplete="off" value="${esc(o.valor || '')}" ${o.req ? 'required aria-required="true"' : ''} ${o.ph ? `placeholder="${esc(o.ph)}"` : ''} aria-describedby="${o.ayuda ? o.id + '-ay ' : ''}${o.id}-msg">
    <div class="ac-lista" role="listbox" id="${o.id}-lista" aria-label="${T('Sugerencias', 'Suggestions')}" hidden></div></div><span class="msg-campo" id="${o.id}-msg" aria-live="polite"></span></div>`;
}
function acMostrar(inp) {
  const lista = document.getElementById(inp.getAttribute('aria-controls')); const fuente = AC_FUENTES[inp.dataset.ac]; if (!lista || !fuente) return;
  const res = inp.value.trim().length >= (inp.dataset.min ? Number(inp.dataset.min) : 1) ? fuente(inp.value.trim()) : [];
  if (!inp.value.trim()) { acCerrar(inp); return; }
  const grupos = {}; res.forEach((x) => (grupos[x.grupo || ''] ||= []).push(x));
  let k = 0;
  lista.innerHTML = res.length ? Object.entries(grupos).map(([g, xs]) => { const gid = uid('acg'); return `<div role="group" aria-labelledby="${gid}"><div class="grupo" id="${gid}">${g}</div>${xs.map((x) => `<div role="option" id="${inp.id}-op${k++}" aria-selected="false" data-href="${esc(x.href || '')}" data-valor="${esc(x.valor ?? x.t)}">${x.t}${x.sub ? `<small>${x.sub}</small>` : ''}</div>`).join('')}</div>`; }).join('')
    : `<div class="vacia" role="option" aria-selected="false" aria-disabled="true" id="${inp.id}-op-vacia">${T('Sin coincidencias. Revisa la escritura o busca por otro dato.', 'No matches. Check the spelling or search by another field.')}</div>`;
  lista.hidden = false; inp.setAttribute('aria-expanded', 'true'); inp.removeAttribute('aria-activedescendant');
  anunciar(res.length ? T(`${res.length} sugerencias. Usa las flechas para recorrerlas.`, `${res.length} suggestions. Use the arrow keys.`) : T('Sin coincidencias.', 'No matches.'));
}
function acCerrar(inp) { const lista = document.getElementById(inp.getAttribute('aria-controls')); if (lista) { lista.hidden = true; lista.innerHTML = ''; } inp.setAttribute('aria-expanded', 'false'); inp.removeAttribute('aria-activedescendant'); }
function acElegir(inp, op) {
  if (!op || op.getAttribute('aria-disabled') === 'true') return;
  acCerrar(inp);
  if (op.dataset.href) { inp.value = ''; ir(op.dataset.href); } else { inp.value = op.dataset.valor; inp.dispatchEvent(new CustomEvent('ac-elegido', { bubbles: true })); }
}

/* ---------------------------------------------------------------- diálogos, confirmación de acciones críticas y avisos */
function dialogo({ titulo, html = '', botones = [{ t: T('Cerrar', 'Close'), v: false, tipo: 'secundario' }], critico = false, ancho = false, alAbrir }) {
  return new Promise((resolver) => {
    const raiz = $('#modal-raiz'); const previo = document.activeElement; const app = $('#app');
    raiz.innerHTML = `<div class="velo"><div class="dialogo ${critico ? 'critico' : ''} ${ancho ? 'ancho' : ''}" role="${critico ? 'alertdialog' : 'dialog'}" aria-modal="true" aria-labelledby="dlg-t" aria-describedby="dlg-c">
      <h2 id="dlg-t" tabindex="-1">${critico ? ic('alerta') + ' ' : ''}${titulo}</h2><div id="dlg-c">${html}</div>
      <div class="acciones">${botones.map((b, i) => `<button type="button" class="boton ${b.tipo || ''}" id="dlg-b${i}" data-dlg="${i}">${b.ic ? ic(b.ic) : ''}<span>${b.t}</span></button>`).join('')}</div></div></div>`;
    app.inert = true; const demo = $('#demo-raiz'); if (demo) demo.inert = true;
    const caja = $('.dialogo', raiz);
    const cerrar = (v) => { raiz.innerHTML = ''; app.inert = false; if (demo) demo.inert = false; document.removeEventListener('keydown', teclas, true); if (previo && document.contains(previo)) previo.focus(); resolver(v); };
    const teclas = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); cerrar(null); }
      if (e.key === 'Tab') { const f = $$('button:not([disabled]), input:not([disabled]), select, textarea, a[href], [tabindex="0"]', caja); if (!f.length) return; const i = f.indexOf(document.activeElement); if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
    };
    document.addEventListener('keydown', teclas, true);
    botones.forEach((b, i) => $(`#dlg-b${i}`, raiz).addEventListener('click', () => { if (b.validar && !b.validar(caja)) return; cerrar(typeof b.v === 'function' ? b.v(caja) : b.v); }));
    alAbrir?.(caja, cerrar);
    const primero = $('input:not([type=hidden]):not([disabled]), select, textarea', caja) || $(`#dlg-b${Math.max(0, botones.findIndex((b) => b.foco))}`, raiz);
    (primero || $('#dlg-t', raiz)).focus();
  });
}
function confirmar({ titulo, texto, si, no = T('Cancelar', 'Cancel'), critico = false, detalle = '' }) {
  return dialogo({ titulo, critico, html: `<p>${texto}</p>${detalle}`, botones: [{ t: no, v: false, tipo: 'secundario', foco: true }, { t: si, v: true, tipo: critico ? 'peligro' : 'clave' }] });
}
function aviso(texto, tipo = '', o = {}) {
  const d = document.createElement('div'); d.className = `aviso-flotante ${tipo}`;
  d.innerHTML = `${ic(tipo === 'error' ? 'error' : 'check')}<div>${texto}${o.href ? ` <a href="${o.href}">${o.enlace || T('Ver', 'View')}</a>` : ''}</div><button type="button" class="cerrar-aviso" aria-label="${T('Cerrar aviso', 'Dismiss')}">${ic('cerrar')}</button>`;
  $('#avisos').append(d); $('.cerrar-aviso', d).addEventListener('click', () => d.remove());
  if (o.href) return; // con un enlace, el aviso queda hasta que se cierra (WCAG 2.2.1)
  let t; const programar = () => { clearTimeout(t); t = setTimeout(() => d.remove(), o.ms || 7000); };
  d.addEventListener('mouseenter', () => clearTimeout(t)); d.addEventListener('focusin', () => clearTimeout(t)); d.addEventListener('mouseleave', programar); d.addEventListener('focusout', programar); programar();
}
function anunciar(t) { const a = $('#anuncio'); if (!a) return; a.textContent = ''; setTimeout(() => { a.textContent = t; }, 60); }

/* ---------------------------------------------------------------- descargas simuladas: CSV real y PDF mínimo, registradas en la auditoría */
function descargar(nombre, contenido, tipo) {
  try { const b = contenido instanceof Blob ? contenido : new Blob([contenido], { type: tipo }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nombre; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400); }
  catch { aviso(T('El navegador no permitió la descarga. Intenta de nuevo.', 'The browser blocked the download. Try again.'), 'error'); }
}
function exportarCSV(nombre, columnas, filas, titulo) {
  const celda = (t) => `"${String(t ?? '').replace(/"/g, '""')}"`;
  const csv = '﻿' + [columnas.map((c) => celda(c.t)).join(';'), ...filas.map((f) => columnas.map((c) => celda(c.csv ? c.csv(f) : c.v ? c.v(f) : f[c.k])).join(';'))].join('\r\n');
  descargar(nombre + '.csv', csv, 'text/csv;charset=utf-8');
  auditar('Exportación CSV', titulo, 'Correcto'); aviso(T(`Exportado: ${titulo} (${filas.length} filas, CSV). Quedó en la auditoría.`, `Exported: ${titulo} (${filas.length} rows, CSV). Logged in the audit trail.`));
}
function pdfSimple(titulo, lineas) {
  const lat = (s) => String(s).replace(/[—–]/g, '-').replace(/₂/g, '2').replace(/→/g, '->').replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/…/g, '...').replace(/[^\x20-\xff]/g, '?').replace(/[\\()]/g, '\\$&');
  const ls = [`BT /F1 18 Tf 56 790 Td (${lat(titulo)}) Tj ET`, `BT /F1 10 Tf 56 770 Td (${lat('Terminal Portuario Aconcagua · ATOS · ' + fFecha(HOY))}) Tj ET`];
  lineas.slice(0, 52).forEach((l, i) => ls.push(`BT /F1 10 Tf 56 ${740 - i * 13} Td (${lat(l)}) Tj ET`));
  const cont = ls.join('\n');
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>', `<< /Length ${cont.length} >>\nstream\n${cont}\nendstream`];
  let pdf = '%PDF-1.4\n'; const offs = [];
  objs.forEach((o, i) => { offs.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([Uint8Array.from(pdf, (c) => c.charCodeAt(0) & 0xff)], { type: 'application/pdf' });
}
function exportarInforme({ titulo, lineas, formato = 'PDF', asincrono = false, filas, columnas }) {
  const generar = () => (formato === 'PDF' ? pdfSimple(titulo, lineas) : new Blob(['﻿' + [columnas.map((c) => c.t).join(';'), ...filas.map((f) => columnas.map((c) => String(c.v ? c.v(f) : f[c.k]).replace(/;/g, ',')).join(';'))].join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const nombre = normal(titulo).replace(/ /g, '_') + (formato === 'PDF' ? '.pdf' : '.csv');
  if (!asincrono) { descargar(nombre, generar()); auditar(`Exportación ${formato} inmediata`, titulo, 'Correcto'); aviso(T(`Informe descargado: ${titulo} (${formato}).`, `Report downloaded: ${titulo} (${formato}).`)); return; }
  const ex = { id: 'EX-' + (4100 + E.db.exportaciones.length), titulo, formato, estado: T('En preparación', 'Preparing'), pedido: hm(642 + E.db.exportaciones.length), nombre, blob: null };
  E.db.exportaciones.unshift(ex); auditar(`Exportación ${formato} asíncrona pedida`, titulo, 'En curso');
  aviso(T(`Preparando «${titulo}» en segundo plano. Te avisaremos en el centro de notificaciones.`, `Preparing “${titulo}” in the background. We will notify you.`), '', { href: '#/exportaciones', enlace: T('Ver exportaciones', 'View exports') });
  setTimeout(() => { ex.blob = generar(); ex.estado = T('Lista', 'Ready'); notificar(T(`Tu exportación «${titulo}» está lista para descargar`, `Your export “${titulo}” is ready`), '#/exportaciones'); auditar(`Exportación ${formato} asíncrona terminada`, titulo, 'Correcto'); if (rutaActual().def.id === 'exportaciones') refrescar(); }, 2600);
}
