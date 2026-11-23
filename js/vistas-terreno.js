/* ATOS · terreno y cabinas: App Móvil de Terreno con sus cuatro perfiles (los tres internos operan sin
   conexión), terminal de cabina del equipo de patio, cabina de la grúa de muelle y Entorno Local de Continuidad. */
'use strict';

const APP_PERFILES = {
  ronda: { n: 'Ronda reefer y mantenimiento', tabs: [['alarmas', 'Alarmas', 'alerta'], ['ronda', 'Ronda', 'frio'], ['tareas', 'Tareas', 'bandeja'], ['bitacora', 'Bitácora', 'historial']] },
  supervisor: { n: 'Supervisor en terreno', tabs: [['verif', 'Verificar', 'ojo'], ['diverg', 'Divergencias', 'intercambio'], ['alarmas', 'Alarmas', 'alerta'], ['bitacora', 'Bitácora', 'historial']] },
  proteccion: { n: 'Protección y prevención', tabs: [['conteo', 'Conteo', 'personas'], ['zonas', 'Zonas', 'ubicacion'], ['tareas', 'Tareas', 'bandeja'], ['bitacora', 'Bitácora', 'historial']] },
  conductor: { n: 'Conductor externo', tabs: [['cita', 'Mi cita', 'calendario'], ['destino', 'Destino', 'ubicacion'], ['visita', 'Visita', 'camion'], ['ruta', 'Acceso', 'ruta']] },
};
R('/terreno', {
  id: 'terreno', t: 'App Móvil de Terreno', area: ['terreno', 'terreno.conductor'], mod: 'trans', ic: 'movil', rf: ['RF-APP-01', 'RNF-USA-04'],
  vista: () => { const p = E.sesion.perfil; const lista = p === 'conductor' ? ['conductor'] : Object.keys(APP_PERFILES);
    return `${encabezado('App Móvil de Terreno', 'Una sola app con cuatro perfiles. Los tres internos siguen operando sin conexión: guardan los registros en el equipo y los sincronizan al volver la red.')}
      <ul class="accesos">${lista.map((k) => `<li><a href="#/terreno/${k}">${ic('movil')}<span>${APP_PERFILES[k].n}</span></a></li>`).join('')}</ul>`; },
});
R('/terreno/:perfil', {
  id: 'terreno-app', t: (p) => 'App de terreno: ' + (APP_PERFILES[p.perfil]?.n || p.perfil), area: ['terreno', 'terreno.conductor'], mod: 'trans', padre: 'terreno', rf: ['RF-APP-01', 'RF-OPD-05', 'RF-OPD-06', 'RNF-USA-04', 'RNF-USA-05', 'RF-REF-10'],
  vista: (p) => {
    const ap = APP_PERFILES[p.perfil]; if (!ap) return vistaInexistente('pantalla', p.perfil);
    if (E.sesion.perfil === 'conductor' && p.perfil !== 'conductor') return RID.sinacceso.vista();
    const t = E.db.terreno; const sin = t.sinCobertura && p.perfil !== 'conductor'; const tab = (E.ui.appTab ||= {})[p.perfil] || ap.tabs[0][0];
    const pend = t.cola.length;
    return `${encabezado('App Móvil de Terreno', `Perfil ${ap.n}. Vista de teléfono de 375 × 812. Desde el panel de demostración puedes simular la pérdida de cobertura.`)}
      <div class="escenario-movil"><div class="telefono" role="region" aria-label="Pantalla del teléfono">
        <div class="app-barra sobre-oscuro"><h2>ATOS Terreno</h2><span>${ap.n}</span></div>
        <div class="app-estado ${sin ? 'sin' : ''}" role="status" aria-live="polite">${ic(sin ? 'sinsenal' : 'senal')}<span>${p.perfil === 'conductor' && t.sinCobertura ? 'Sin conexión: la app del conductor necesita red para recibir cambios' : sin ? `Sin conexión · ${pend} pendiente${pend === 1 ? '' : 's'} guardado${pend === 1 ? '' : 's'} en el equipo` : `En línea · ${t.sinc}`}</span>
          ${p.perfil !== 'conductor' ? btn('Sincronizar', { tipo: 'secundario', tam: 'chico', acc: 'app-sinc', id: 'b-sinc', disabled: sin || !pend, attrs: 'style="margin-left:auto"' }) : ''}</div>
        <div class="app-cuerpo" id="app-cuerpo">${cuerpoApp(p.perfil, tab, sin)}</div>
        <nav class="app-nav" aria-label="Secciones de la app">${ap.tabs.map(([k, n, i]) => `<button type="button" data-acc="app-tab" data-arg="${p.perfil}|${k}" id="at-${k}" ${tab === k ? 'aria-current="page"' : ''}>${ic(i)}${n}</button>`).join('')}</nav></div>
      <div class="tarjeta"><h2>Cómo funciona sin conexión</h2><ul><li>El indicador superior muestra siempre el estado de la conexión.</li><li>Sin conexión, cada registro queda en la cola del equipo con la hora del dispositivo.</li><li>Al recuperar la red se sincroniza solo, en orden.</li><li>Si dos personas confirman la misma alarma, queda la confirmación con la hora de dispositivo más temprana; la otra queda en la bitácora, sin intervención.</li><li>Los conflictos de posición siguen otra regla: primero la autoridad del dato, luego la credibilidad de la fuente, después el orden de la visita y, si nada lo resuelve, una verificación física.</li></ul>
        <p>${btn(t.sinCobertura ? 'Recuperar la cobertura' : 'Simular la pérdida de cobertura', { tipo: t.sinCobertura ? 'clave' : 'secundario', acc: 'app-cobertura', ic: t.sinCobertura ? 'senal' : 'sinsenal', id: 'b-cob' })}</p></div></div>`;
  },
});
function cuerpoApp(perfil, tab, sin) {
  const db = E.db; const t = db.terreno;
  if (tab === 'bitacora') return `<h3>Bitácora de sincronización</h3>${t.bitacora.length ? `<ul class="lista-simple">${t.bitacora.map((b) => `<li><strong>${b.hora}</strong> · ${esc(b.t)}${b.conflicto ? `<br>${insig('Conflicto resuelto', 'aviso')} <span class="detalle">${esc(b.conflicto)}</span>` : ''}</li>`).join('')}</ul>` : vacio('Sin movimientos', 'Aquí quedan las sincronizaciones y los conflictos resueltos.')}
    ${t.cola.length ? `<h3>Pendientes en el equipo</h3><ul class="lista-simple">${t.cola.map((c) => `<li>${insig('Pendiente', 'aviso')} ${esc(c.t)} · ${c.hora}</li>`).join('')}</ul>` : ''}`;
  if (perfil === 'ronda' || (perfil === 'supervisor' && tab === 'alarmas')) {
    if (tab === 'alarmas') { const as = alarmasActivas(); return as.length ? as.map((a) => { const enCola = t.cola.some((c) => c.alarma === a.id); return `<div class="tarea-app alarma"><h3>${ic('alerta')} ${a.tipo}</h3><p><strong>${a.tablero}, toma ${a.toma}</strong> · <span class="codigo">${a.cont}</span></p><p>${esc(a.detalle)}</p><p class="detalle">Evento ${a.evento} · aviso ${a.aviso}${a.escalada ? ' · escalada a la jefatura' : ''}</p>
      ${enCola ? insig('Confirmación guardada en el equipo', 'aviso') : `<label class="sr" for="aa-${a.id}">Acción tomada para ${a.id}</label><select id="aa-${a.id}"><option value="">Elige la acción que tomaste</option><option>Reconecté la toma</option><option>Revisé la consigna y el equipo</option><option>Avisé a mantenimiento eléctrico</option><option>Condición estable: falsa alarma</option></select><p></p>${btn('Confirmar la alarma', { tipo: 'peligro', acc: 'app-confirmar', arg: a.id, id: 'ac-' + a.id })}`}</div>`; }).join('') : vacio('Sin alarmas activas', 'Las alarmas nuevas llegan aquí al mismo tiempo que a la sala de control.'); }
    if (tab === 'ronda') return `<form data-form="app-ronda" novalidate><h3>Registrar una ronda</h3>${campo({ id: 'ar-tab', et: 'Tableros recorridos', tipo: 'select', opciones: ['TR-01 a TR-09 (bloque R1)', 'TR-10 a TR-18 (bloque R2)', 'TR-19 a TR-26 (bloque R3)'] })}<label class="opcion"><input type="checkbox" id="ar-ok" checked> Sin novedad</label>${campo({ id: 'ar-obs', et: 'Observaciones', tipo: 'textarea', filas: 2 })}${btn(sin ? 'Guardar en el equipo' : 'Registrar la ronda', { submit: true, tipo: 'clave', id: 'b-ronda' })}</form>
      <h3 style="margin-top:16px">Rondas de hoy</h3><ul class="lista-simple">${db.rondas.map((r) => `<li><strong>${r.hora}</strong> · ${r.tableros} · ${esc(r.obs)}</li>`).join('')}</ul>`;
    if (tab === 'tareas') return tareasApp();
  }
  if (perfil === 'supervisor') {
    if (tab === 'verif') { const vs = db.verificaciones.filter((v) => v.estado === 'Pendiente'); return vs.length ? vs.map((v) => `<div class="tarea-app"><h3>${v.id} · ${insig(v.prioridad, v.prioridad === 'Alta' ? 'aviso' : 'info')}</h3><p class="codigo">${v.cont}</p><p>${esc(v.motivo)}</p><p>Registrada: <strong>${v.esperada}</strong> · Leída: <strong>${v.leida}</strong></p>${t.cola.some((c) => c.verif === v.id) ? insig('Guardada en el equipo', 'aviso') : `<div class="grupo-botones">${btn('Está en la posición leída', { tipo: 'clave', acc: 'app-verif', arg: v.id + '|leida', id: 'av-' + v.id })}${btn('No lo encontré', { tipo: 'secundario', acc: 'app-verif', arg: v.id + '|no', id: 'avn-' + v.id })}</div>`}</div>`).join('') : vacio('Sin verificaciones', 'No hay contenedores por verificar en el patio.'); }
    if (tab === 'diverg') return `<h3>Divergencias con el TOS 2012</h3><ul class="lista-simple">${db.dominios.filter((d) => d.divAT + d.divTA).map((d) => `<li><strong>${d.n}</strong><br>ATOS → TOS 2012: ${d.divAT} · TOS 2012 → ATOS: ${d.divTA} ${d.avance === 'Detenido' ? insig('Avance detenido', 'error') : ''}</li>`).join('')}</ul><p><a href="#/convivencia">Abrir la consola de convivencia</a></p>`;
  }
  if (perfil === 'proteccion') {
    if (tab === 'conteo') { const em = E.ui.emergencia; return `<h3>Conteo de personas por zona</h3><p class="detalle">Funciona también sin conexión, con los últimos registros de ingreso y salida guardados en el equipo.</p>${em ? msj('alarma', 'Emergencia activa', `Iniciada a las ${em.hora}. Conteo con datos de ${sin ? 'el equipo (sin conexión)' : 'Identidad y Acceso en línea'}.`) : ''}
      <ul class="lista-simple">${db.zonas.map((z) => `<li class="fila-flex entre"><span>${z.n}</span><strong class="num">${z.presentes}</strong></li>`).join('')}<li class="fila-flex entre"><strong>Total</strong><strong class="num">${num(db.zonas.reduce((s, z) => s + z.presentes, 0))}</strong></li></ul>
      ${em ? btn('Cerrar la emergencia', { tipo: 'secundario', acc: 'emerg-fin', id: 'b-emerg' }) : btn('Iniciar conteo de emergencia', { tipo: 'peligro', acc: 'emerg-ini', ic: 'sirena', id: 'b-emerg' })}`; }
    if (tab === 'zonas') return `<h3>Zonas del terminal</h3>${db.zonas.map((z) => `<div class="tarea-app"><h3>${z.n}</h3><p>${z.presentes} personas · credencial temporal o permanente vigente</p></div>`).join('')}`;
    if (tab === 'tareas') return tareasApp();
  }
  if (perfil === 'conductor') {
    const v = db.visitas[0]; const f = franjaDe(v);
    if (tab === 'cita') return `<h3>Mi cita</h3>${v.franja != null && v.paso >= 1 ? `<div class="tarea-app"><p class="etiqueta">Franja</p><p class="medio num" style="font-size:1.75rem;font-weight:700">${textoFranja(f)}</p><p>Camión <span class="codigo">${v.patente}</span> · contenedor <span class="codigo">${v.cont}</span></p><p>${insig(estadoVisita(v), 'info')}</p></div>` : vacio('Sin cita confirmada', 'Tu empresa de transporte todavía no reserva la franja. Te avisaremos aquí.')}`;
    if (tab === 'destino') return v.posicion ? `<div class="tarea-app"><p class="etiqueta">Instrucción de destino</p><p style="font-size:1.6rem;font-weight:700;line-height:1.2">${textoPos(v.posicion)}</p><p>Grúa de patio ${v.rtg}. Sigue la señalética azul del bloque ${v.posicion.b}.</p></div>` : vacio('Todavía sin destino', 'El destino aparece aquí cuando se abre la barrera del gate.');
    if (tab === 'visita') return `<h3>Estado de la visita</h3><p>${insig(estadoVisita(v), 'solido')}</p>${lineaTiempo(v.eventos.slice().reverse())}`;
    if (tab === 'ruta') return `<h3>Congestión del acceso</h3>${filasCongestion().slice(0, 4).map((c) => `<p class="fila-flex entre"><span>${c.e}</span><strong>${c.v} min</strong></p>`).join('')}<p><a href="#/publico/congestion">Ver todo el acceso</a></p>`;
  }
  return '';
}
function tareasApp() { const ts = misTareas(); return `<h3>Mis tareas</h3>${ts.length ? ts.map((x) => `<div class="tarea-app"><p>${insigPrioridad(x.prioridad)}</p><p><a href="${x.href}">${esc(x.t)}</a></p></div>`).join('') : vacio('Sin tareas', 'Las tareas de tu perfil aparecerán aquí.')}`; }
ACC['app-tab'] = (el) => { const [p, k] = el.dataset.arg.split('|'); E.ui.appTab[p] = k; refrescar(); $('#at-' + k)?.focus(); };
ACC['app-cobertura'] = () => { const t = E.db.terreno; t.sinCobertura = !t.sinCobertura; if (!t.sinCobertura) sincronizarTerreno(); else aviso('Sin cobertura: la app sigue operando y guarda los registros en el equipo.'); refrescar(); $('#b-cob')?.focus(); };
ACC['app-sinc'] = () => { sincronizarTerreno(); refrescar(); };
function confirmarAlarma(a, por, hora, accion, canal) { a.estado = 'Confirmada'; a.confirmada = { por, hora, accion, canal }; E.db.tareas.filter((t) => t.alarma === a.id).forEach((t) => { t.hecha = true; }); E.db.notifs.filter((n) => n.t.includes(a.id)).forEach((n) => { n.leida = true; }); E.db.auditoria.unshift({ id: 'AU-' + (90100 + E.db.auditoria.length), hora, quien: por, accion: 'Confirmación de alarma reefer', objeto: `${a.id} · ${accion}`, modulo: 'Patio refrigerado', resultado: 'Correcto', ip: canal }); }
ACC['app-confirmar'] = (el) => {
  const a = E.db.alarmas.find((x) => x.id === el.dataset.arg); const accion = $('#aa-' + a.id).value; if (!accion) { aviso('Elige la acción que tomaste antes de confirmar la alarma.', 'error'); $('#aa-' + a.id).focus(); return; } const quien = persona().n; const hora = horaSim();
  if (E.db.terreno.sinCobertura) {
    E.db.terreno.cola.push({ tipo: 'alarma', alarma: a.id, t: `Confirmación de ${a.id}: ${accion}`, hora, por: quien, accion });
    if (a.id === 'AL-7781' || !E.db.alarmas.some((x) => x.confirmada)) setTimeout(() => { if (a.estado !== 'Confirmada') confirmarAlarma(a, 'Jorge Saavedra Pino', hm(aMin(hora) + 1), 'Confirmada desde la sala de control', 'Sala de control'); }, 300);
    aviso('Sin conexión: la confirmación quedó guardada en el equipo y se sincroniza al volver la red.'); refrescar(); return;
  }
  confirmarAlarma(a, quien, hora, accion, 'App Móvil de Terreno'); aviso(`${a.id} confirmada. Desapareció de la bandeja y quedó auditada.`); refrescar();
};
FORM['app-ronda'] = () => {
  const r = { hora: horaSim(), por: persona().n, tableros: $('#ar-tab').value, obs: $('#ar-ok').checked ? 'Sin novedad' : ($('#ar-obs').value || 'Con observaciones'), canal: 'App Móvil de Terreno' };
  if (E.db.terreno.sinCobertura) { E.db.terreno.cola.push({ tipo: 'ronda', t: `Ronda ${r.tableros}`, hora: r.hora, ronda: r }); aviso('Ronda guardada en el equipo. Se sincroniza al recuperar la red.'); }
  else { E.db.rondas.unshift(r); auditar('Ronda reefer registrada', r.tableros); aviso('Ronda registrada.'); }
  refrescar(); $('#b-ronda')?.focus();
};
ACC['app-verif'] = (el) => { const [id, res] = el.dataset.arg.split('|'); const v = E.db.verificaciones.find((x) => x.id === id); if (E.db.terreno.sinCobertura) { E.db.terreno.cola.push({ tipo: 'verif', verif: id, res, t: `Verificación ${id}: ${res === 'no' ? 'no encontrado' : 'en la posición leída'}`, hora: horaSim() }); aviso('Verificación guardada en el equipo.'); } else { v.estado = res === 'no' ? 'Escalada' : 'Resuelta'; auditar('Verificación física desde terreno', id); aviso('Verificación registrada.'); } refrescar(); };
function sincronizarTerreno() {
  const t = E.db.terreno; if (!t.cola.length) { t.sinc = 'Sincronizado ' + horaSim(); return; }
  const n = t.cola.length; const hora = horaSim();
  for (const c of t.cola) {
    if (c.tipo === 'alarma') { const a = E.db.alarmas.find((x) => x.id === c.alarma); if (a.estado === 'Confirmada' && a.confirmada.por !== c.por) { const gana = aMin(c.hora) <= aMin(a.confirmada.hora); const perdedor = gana ? `${a.confirmada.por} (${a.confirmada.hora})` : `${c.por} (${c.hora})`; if (gana) confirmarAlarma(a, c.por, c.hora, c.accion, 'App Móvil de Terreno, sincronizada'); t.bitacora.unshift({ hora, t: `${c.alarma}: dos confirmaciones del mismo evento`, conflicto: `Regla: gana la hora de dispositivo más temprana. Queda la de ${gana ? c.por + ' (' + c.hora + ')' : a.confirmada.por + ' (' + a.confirmada.hora + ')'}; la de ${perdedor} queda como duplicado.` }); } else { confirmarAlarma(a, c.por, c.hora, c.accion, 'App Móvil de Terreno, sincronizada'); t.bitacora.unshift({ hora, t: c.t + ' (sincronizada)' }); } }
    if (c.tipo === 'ronda') { E.db.rondas.unshift(c.ronda); t.bitacora.unshift({ hora, t: c.t + ' (sincronizada)' }); }
    if (c.tipo === 'verif') { const v = E.db.verificaciones.find((x) => x.id === c.verif); v.estado = c.res === 'no' ? 'Escalada' : 'Resuelta'; t.bitacora.unshift({ hora, t: c.t + ' (sincronizada)' }); }
  }
  t.cola = []; t.sinc = 'Sincronizado ' + hora; auditar('Sincronización de la App Móvil de Terreno', `${n} registros`); aviso(`Cobertura recuperada: ${n} registros sincronizados sin pérdida. Revisa la bitácora.`);
}
ACC['emerg-ini'] = async () => { if (!(await confirmar({ titulo: 'Iniciar conteo de emergencia', critico: true, texto: 'Se congela la nómina de presentes por zona y se avisa a los encargados de zona.', si: 'Iniciar' }))) return; E.ui.emergencia = { hora: horaSim() }; auditar('Inicio de conteo de emergencia', 'Todas las zonas'); notificar('Emergencia: conteo de personas por zona iniciado', '#/acceso/emergencia', ['proteccion', 'jefatura', 'supervisor'], true); refrescar(); };
ACC['emerg-fin'] = () => { E.ui.emergencia = null; auditar('Cierre de la emergencia', 'Todas las zonas'); aviso('Emergencia cerrada.'); refrescar(); };

/* ---------------------------------------------------------------- terminal de cabina del equipo de patio */
R('/cabina/patio', {
  id: 'cabina-patio', t: 'Terminal de cabina RTG-07', layout: 'cabina', area: ['cabina.patio', 'cabina'], mod: 'gate', ic: 'grua', rf: ['RF-PAT-08', 'RF-PAT-09', 'RF-TRA-03', 'RNF-DIS-03', 'RNF-USA-05'],
  vista: () => {
    const c = E.db.cabina; const ins = c.instruccion || { cont: codigoISO('MCSU', '388104'), pos: { b: 'C', bahia: 12, fila: 2, alt: 3 }, tracto: 'el tractocamión TC-15', eta: 2, sig: true };
    const sinCob = E.db.terreno.sinCobertura; const buf = c.buffer || 0;
    return `<div class="cab-barra"><h1 tabindex="-1" id="titulo-pagina">RTG-07 · Bloque C</h1><span>${esc(PERSONAS.operador_patio.n)}</span><span>${ic(sinCob ? 'sinsenal' : 'senal')} ${sinCob ? `Sin cobertura · ${buf} registros guardados en el equipo` : 'Cobertura inalámbrica normal'}</span><span class="espacio" style="flex:1"></span><a href="#/inicio">Salir de la cabina</a></div>
      <div class="instruccion" aria-live="polite">
        <div class="caja-cab blanca"><p class="etiqueta">${ins.sig ? 'Siguiente instrucción' : 'Instrucción vigente'}</p>
          <p class="medio">LEVANTAR desde ${ins.sig ? `C-12-02-${ins.pos.alt}` : esc(ins.tracto)}</p>
          <p class="gigante">${ins.cont}</p>
          <p class="medio">DEPOSITAR en ${ins.sig ? esc(ins.tracto) : `Bloque ${ins.pos.b} · Bahía ${ins.pos.bahia} · Fila ${ins.pos.fila} · Altura ${ins.pos.alt}`}</p>
          <p class="medio">${ins.sig ? 'Tractocamión TC-15' : 'Camión ' + esc(ins.tracto.replace('el camión ', ''))} llega en ${ins.eta} min</p></div>
        <div class="pila"><div class="caja-cab"><p class="etiqueta" style="color:#fff">Estado del equipo</p><p class="medio">${c.enMovimiento ? 'En movimiento · 6 km/h' : 'Detenido'}</p></div>
          <div class="caja-cab"><p class="etiqueta" style="color:#fff">Vía de excepción</p><p>${c.enMovimiento ? 'Se habilita solo con el equipo detenido (interlock).' : 'Habilitada: el equipo está detenido.'}</p>${btn('Usar la vía de excepción', { tipo: 'secundario', acc: 'cab-excepcion', id: 'b-exc', disabled: c.enMovimiento })}</div>
          <div class="caja-cab"><p class="etiqueta" style="color:#fff">Autonomía sin cobertura</p><p>8 horas sin perder registros. Pendientes en el equipo: <strong>${buf}</strong>.</p></div></div></div>
      <div class="sim" role="group" aria-label="Simulación de la demostración"><strong>Simulación de la demostración:</strong>${btn(c.enMovimiento ? 'Detener el equipo' : 'Poner el equipo en movimiento', { tipo: 'secundario', acc: 'cab-mov', id: 'b-mov' })}${btn(sinCob ? 'Recuperar la cobertura' : 'Perder la cobertura', { tipo: 'secundario', acc: 'cab-cob', id: 'b-cabcob' })}</div>`;
  },
});
ACC['cab-mov'] = () => { E.db.cabina.enMovimiento = !E.db.cabina.enMovimiento; anunciar(E.db.cabina.enMovimiento ? 'Equipo en movimiento: vía de excepción bloqueada.' : 'Equipo detenido: vía de excepción habilitada.'); refrescar(); $('#b-mov')?.focus(); };
ACC['cab-cob'] = () => { const t = E.db.terreno; const c = E.db.cabina; t.sinCobertura = !t.sinCobertura; if (t.sinCobertura) { c.buffer = 3; aviso('Sin cobertura: la terminal sigue mostrando la instrucción y guarda los movimientos en el equipo.'); } else { aviso(`Cobertura recuperada: se entregaron ${c.buffer || 0} registros sin pérdida.`); auditar('Entrega de registros de cabina', `${c.buffer || 0} registros RTG-07`); c.buffer = 0; (c.excPend || []).forEach(registrarExcepcionCabina); c.excPend = []; } refrescar(); $('#b-cabcob')?.focus(); };
ACC['cab-excepcion'] = async () => {
  if (E.db.cabina.enMovimiento) return; const r = await dialogo({ titulo: 'Vía de excepción', html: `<fieldset><legend>Motivo</legend>${['Posición de destino ocupada', 'Código del contenedor ilegible', 'Contenedor dañado', 'Falla del equipo'].map((m, i) => `<label class="opcion"><input type="radio" name="cex" value="${m}" ${i ? '' : 'checked'}> ${m}</label>`).join('')}</fieldset>`, botones: [{ t: 'Cancelar', v: null, tipo: 'secundario' }, { t: 'Registrar la excepción', tipo: 'clave', v: (c) => $('[name="cex"]:checked', c).value }] });
  if (!r) return; if (E.db.terreno.sinCobertura) { const c = E.db.cabina; c.buffer = (c.buffer || 0) + 1; (c.excPend ||= []).push(r); auditar('Excepción desde la cabina guardada en el equipo', r); aviso('Sin cobertura: la excepción quedó guardada en el equipo y se envía al recuperar la cobertura.'); refrescar(); return; }
  registrarExcepcionCabina(r);
};
function registrarExcepcionCabina(r) {
  E.db.verificaciones.unshift({ id: 'VF-' + (940 + E.db.verificaciones.length), cont: E.db.cabina.instruccion?.cont || codigoISO('MCSU', '388104'), motivo: 'Excepción desde la cabina de RTG-07: ' + r, esperada: 'C-12-02-3', leida: '—', estado: 'Pendiente', asignada: 'Jorge Saavedra Pino', hora: horaSim(), prioridad: 'Alta' }); auditar('Excepción desde la cabina', r); aviso('Excepción registrada: el supervisor recibió una tarea de verificación.');
};
R('/cabina/grua', {
  id: 'cabina-grua', t: 'Cabina de la grúa de muelle G2', layout: 'cabina', area: ['cabina.grua', 'cabina'], mod: 'gate', ic: 'grua', rf: ['RF-NAV-10', 'RF-NAV-11'],
  vista: () => { const c = E.db.cabina; const r = azar(c.plan); const movs = Array.from({ length: 4 }, (_, i) => ({ tipo: i % 2 ? 'Embarque' : 'Descarga', bahia: 22 + Math.floor(i / 2) * 2, fila: String(r.ent(1, 8)).padStart(2, '0'), nivel: 80 + r.ent(1, 5) * 2, cont: codigoISO(r.de(['NAPU', 'ACLU', 'ATOU']), String(r.ent(100000, 999999))), tracto: 'TC-' + (11 + i * 3) }));
    return `<div class="cab-barra"><h1 tabindex="-1" id="titulo-pagina">Grúa de muelle G2 · Andes Pacífico (REC-1183)</h1><span>${esc(PERSONAS.operador_grua.n)}</span><span class="espacio" style="flex:1"></span><a href="#/inicio">Salir de la cabina</a></div>
      <div class="instruccion"><div class="caja-cab blanca ${c.alertaGrua ? 'destello' : ''}" aria-live="assertive"><p class="etiqueta">Plan vigente · versión ${c.plan}${c.alertaGrua ? ' · actualizado' : ''}</p><p class="medio">${movs[0].tipo.toUpperCase()} · Bahía ${movs[0].bahia} · Fila ${movs[0].fila} · Nivel ${movs[0].nivel}</p><p class="gigante">${movs[0].cont}</p><p class="medio">${movs[0].tipo === 'Descarga' ? 'Al tractocamión' : 'Desde el tractocamión'} ${movs[0].tracto}: llega en 1 min</p></div>
        <div class="caja-cab"><p class="etiqueta" style="color:#fff">Próximos movimientos</p><table><caption class="sr">Próximos movimientos del plan</caption><thead><tr><th scope="col">Tipo</th><th scope="col">Bahía</th><th scope="col">Contenedor</th></tr></thead><tbody>${movs.slice(1).map((m) => `<tr><td>${m.tipo}</td><td>${m.bahia}</td><td class="codigo">${m.cont}</td></tr>`).join('')}</tbody></table><p style="margin-top:12px">Productividad: <strong>${num(E.db.productividad[1].movh, 1)} mov/h</strong> · meta 30</p></div></div>
      <div class="sim" role="group" aria-label="Simulación de la demostración"><strong>Simulación de la demostración:</strong>${btn('El planificador actualiza el plan', { tipo: 'secundario', acc: 'grua-plan', id: 'b-plan' })}<span>El operador no toca la pantalla: el plan cambia solo, con alerta visual y sonora.</span></div>`; },
});
ACC['grua-plan'] = () => { const c = E.db.cabina; c.plan++; c.alertaGrua = true; try { const ac = new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(); const g = ac.createGain(); o.frequency.value = 880; g.gain.value = 0.08; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.35); } catch { /* sin audio: queda la alerta visual y el anuncio */ } auditar('Plan de grúa actualizado', `REC-1183 versión ${c.plan}`); anunciar(`Plan actualizado a la versión ${c.plan}.`); refrescar(); $('#b-plan')?.focus(); setTimeout(() => { c.alertaGrua = false; }, 2500); };

/* ---------------------------------------------------------------- Entorno Local de Continuidad (ELC) */
R('/continuidad', {
  id: 'continuidad', t: 'Continuidad: operación sin enlace', area: ['elc', 'base'], mod: 'trans', ic: 'servidor', rf: ['RF-OPD-01', 'RF-OPD-02', 'RF-OPD-07', 'RF-OPD-08', 'RF-GAT-14'],
  vista: () => { const e = E.db.elc; const puede = perfilActual().areas.includes('elc');
    const dest = [['Sistema de gestión empresarial (hechos facturables)', Math.round(e.acumulados * 0.4)], ['Navieras integradas (CODECO y COARRI)', Math.round(e.acumulados * 0.3)], ['Autoridades', Math.round(e.acumulados * 0.2)], ['Portal de clientes', e.acumulados - Math.round(e.acumulados * 0.4) - Math.round(e.acumulados * 0.3) - Math.round(e.acumulados * 0.2)]];
    return `${encabezadoAmplio('Entorno Local de Continuidad (ELC)', 'Si cae el enlace exterior, la operación crítica sigue en el terminal: gate, patio, hechos facturables, credenciales y conteo de emergencia. Al volver el enlace, ATOS entrega lo acumulado en orden.', puede ? btn(e.sinEnlace ? 'Restablecer el enlace' : 'Simular la caída del enlace', { tipo: e.sinEnlace ? 'clave' : 'secundario', acc: 'elc-toggle', id: 'b-elc', ic: e.sinEnlace ? 'senal' : 'sinsenal' }) : '')}
      <div class="reticula r2"><div class="tarjeta"><h2>Estado</h2>${e.sinEnlace ? msj('alarma', 'Operación sin enlace', `Desde las ${e.desde}. ${e.acumulados} registros esperan la entrega.`) : e.entregando ? msj('info', 'Entregando lo acumulado', `${e.acumulados} registros en entrega.`) : msj('ok', 'Enlace exterior en línea', 'El ELC está sincronizado con los servicios en la nube.')}
        <h3>Sigue funcionando sin enlace</h3><ul>${['Gate: citas confirmadas, lectura óptica, báscula, barrera y salida', 'Patio: asignación de posición y registro por telemetría', 'Hechos facturables: se generan y se sellan en el terminal', 'Identidad y Acceso: credenciales y conteo de emergencia', 'Patio refrigerado: alarmas al personal de ronda'].map((x) => `<li>${x}</li>`).join('')}</ul></div>
        <div class="tarjeta"><h2>Por entregar al volver el enlace</h2>${tabla({ id: 'elc', titulo: 'Registros acumulados por destino', filas: dest.map(([d, n]) => ({ id: d, d, n })), exportar: false, sinHerramientas: true, columnas: [{ k: 'd', t: 'Destino' }, { k: 'n', t: 'Registros', n: true }] })}<p class="detalle">Prueba: con el enlace caído, avanza el ingreso guiado de exportación; cada paso suma registros aquí.</p>${btn('Ir al ingreso guiado', { href: '#/gate/visita/VIS-240871', tipo: 'secundario' })}</div></div>`; },
});
ACC['elc-toggle'] = () => { simularELC(!E.db.elc.sinEnlace); };
