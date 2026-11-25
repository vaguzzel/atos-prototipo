/* ATOS · módulo «Gate, patio y equipos»: flujo principal de ingreso de exportación (7 pasos) con sus dos
   excepciones, citas, puesto de atención, carril de excepción, estadía, retiro de importación, patio, condiciones
   dinámicas, verificaciones, remociones, barrido, núcleo operacional, tractocamiones, IN-02 e IN-03. */
'use strict';

const OFF = { cita: -45, prevalidacion: -20, aviso: -18, excepcion: 5, docCargado: 20, vuelveFila: 21, llegada: 4, masa: 6, destino: 8, barrera: 9, posicion: 21, salida: 38 };
const PASOS_EXP = [
  { n: 'Cita', est: 'Cita confirmada', actor: 'Empresa de transporte, en el portal' },
  { n: 'Prevalidación', est: 'Documentación validada', actor: 'Agencia de aduana, en el portal; ATOS valida' },
  { n: 'Llegada al gate', est: 'En gate', actor: 'ATOS y funcionario de gate, en el puesto de entrada' },
  { n: 'Masa bruta', est: 'Masa verificada', actor: 'Báscula del puesto de entrada; ATOS compara' },
  { n: 'Instrucción de destino', est: 'Destino asignado', actor: 'ATOS asigna; el funcionario de gate abre la barrera' },
  { n: 'Posición en el patio', est: 'Posición registrada', actor: 'Telemetría de la grúa de patio, sin confirmación del operador' },
  { n: 'Salida', est: 'Salida registrada', actor: 'Puesto de salida; ATOS calcula la estadía' },
];
const PASOS_IMP = [
  { n: 'Cita de retiro', est: 'Cita confirmada', actor: 'Empresa de transporte, en el portal' },
  { n: 'Liberación', est: 'Carga liberada', actor: 'ATOS verifica la liberación aduanera y que no haya inspección pendiente' },
  { n: 'Llegada al gate', est: 'En gate', actor: 'ATOS y funcionario de gate' },
  { n: 'Entrega en el patio', est: 'Contenedor cargado', actor: 'Telemetría de la grúa de patio' },
  { n: 'Salida', est: 'Salida registrada', actor: 'Puesto de salida, con lectura óptica del contenedor' },
];
function estadoVisita(v) {
  if (v.excepcion === 'doc') return 'En carril de excepción'; if (v.excepcion === 'masa') return 'Detenido por masa bruta';
  const L = v.tipo === 'imp' ? PASOS_IMP : PASOS_EXP; return v.paso ? L[v.paso - 1].est : 'Cita por reservar';
}
const franjaDe = (v) => (v.franja != null ? E.db.franjas[v.franja] : null);
const textoFranja = (f) => (f ? `${hm(f.ini)} – ${hm(f.fin)}` : 'por reservar');
function horaV(v, hecho) { const f = franjaDe(v) || E.db.franjas[9]; return hm(f.ini + OFF[hecho] + (v.retraso || 0)); }
function evento(v, hecho, t, fuente, clase = '') { v.eventos.push({ hora: horaV(v, hecho), t, fuente, clase, hecho }); }
const visitaPorId = (id) => E.db.visitas.find((v) => v.id === id) || E.db.retiros.find((v) => v.id === id);
const tolMasa = () => E.db.parametros.find((p) => p.id === 'P-GAT-01').valor;
const kgs = (n) => num(n) + ' kg';
const promEstadia = () => Math.round(E.db.estadias.reduce((s, x) => s + x.estadia, 0) / E.db.estadias.length);
const enExcepcion = () => E.db.visitas.filter((v) => v.excepcion === 'doc').length + 2; // + los dos camiones de otras empresas de la tabla del carril
VALIDADORES.kg = (s) => { const t = String(s).trim(); if (!t) return { ok: false, vacio: true, msg: 'Escribe la masa en kilos.' }; const n = Number(t.replace(/[.\s]/g, '')); return Number.isInteger(n) && n >= 1000 && n <= 40000 ? { ok: true, msg: '' } : { ok: false, msg: 'Escribe la masa en kilos, entre 1.000 y 40.000, sin decimales.' }; };
function citaBloqueada(c) {
  if (!['Confirmada', 'Reprogramada'].includes(c.estado)) return `La cita ${c.id} está ${c.estado.toLowerCase()}: ya no se puede cambiar.`;
  const v = c.visita ? visitaPorId(c.visita) : null;
  if (v && v.excepcion) return `El camión ${v.patente} está en el carril de excepción: primero se resuelve el documento.`;
  if (v && v.paso > 2) return `El camión ${v.patente} ya entró al gate: la cita ya no se puede cambiar.`;
  return '';
}
function asignarPosicion(v) {
  const base = { 'VIS-240871': { b: 'C', bahia: 14, fila: 3, alt: 2 }, 'VIS-240872': { b: 'C', bahia: 15, fila: 1, alt: 3 }, 'VIS-240873': { b: 'B', bahia: 9, fila: 2, alt: 1 } }[v.id] || { b: 'A', bahia: 5, fila: 2, alt: 2 };
  const cerrado = E.db.bloques.find((b) => b.id === base.b)?.cerrado;
  if (cerrado) return { b: 'D', bahia: 8, fila: 1, alt: 3, cambio: `El bloque ${base.b} está cerrado por una condición declarada: ATOS asigna el bloque D, con la misma nave y sin remociones.` };
  const viento = E.db.condActivas.some((c) => c.cond === 'CD-02' && c.objetivo === 'Bloque ' + base.b);
  if (viento && base.alt > 3) return { ...base, alt: 3, cambio: 'Viento sobre el umbral: la altura máxima baja a 3.' };
  return base;
}
const textoPos = (p) => `Bloque ${p.b}, bahía ${p.bahia}, fila ${p.fila}, altura ${p.alt}`;
function razonesPos(v, p) {
  return [`Bloque ${p.b}: recepción de exportación de la nave Cóndor Austral (REC-1184), cierre martes 7, 08:00.`, `Bahía ${p.bahia}: el plan de estiba propuesto la embarca en la secuencia 2 de la grúa G4.`, `Altura ${p.alt}: ${num(v.masaMed / 1000, 1)} toneladas, bajo los contenedores más livianos (regla RP-03, versión 2).`, 'Sin remociones previstas: sale antes que los que quedan debajo (regla RP-11, versión 4).', `${v.rtg} es la grúa de patio libre más cercana: menos recorrido y menos emisiones.`].concat(p.cambio ? [p.cambio] : []);
}

/* ---------------------------------------------------------------- flujo de ingreso de exportación */
R('/gate/visita/:id', {
  id: 'gate-visita', t: (p) => { const v = visitaPorId(p.id); return v?.tipo === 'imp' ? `Retiro ${p.id}` : `Ingreso de exportación ${p.id}`; }, area: 'gate.flujo', mod: 'gate', padre: 'gate-puesto',
  rf: ['RF-GAT-01', 'RF-GAT-02', 'RF-GAT-03', 'RF-GAT-04', 'RF-GAT-05', 'RF-GAT-06', 'RF-GAT-07', 'RF-GAT-08', 'RF-GAT-09', 'RF-GAT-10', 'RF-GAT-11', 'RF-GAT-12', 'RF-GAT-16', 'RF-PAT-03', 'RF-PAT-05', 'RF-PAT-06', 'RF-PAT-12'],
  vista: (p) => {
    const v = visitaPorId(p.id); if (!v) return vistaInexistente('visita', p.id); if (v.tipo === 'imp') return vistaRetiro(v);
    const ver = E.ui.verPaso?.[v.id]; const actual = Math.min(v.paso, 6); const mostrado = ver != null && ver < v.paso ? ver : actual;
    const f = franjaDe(v); const fin = v.paso >= 7;
    const quick = menuAcciones('Acciones rápidas', [{ t: 'Modificar la cita', acc: 'v-modificar', arg: v.id, ic: 'editar' }, { t: 'Cancelar la cita', acc: 'v-cancelar', arg: v.id, ic: 'cerrar' }, { t: 'Ver la ficha del contenedor', href: '#/contenedor/' + compacto(v.cont), ic: 'contenedor' }, { t: 'Ver la estadía de los camiones', href: '#/gate/estadia', ic: 'reloj' }], { id: 'qa-' + v.id });
    return `${encabezado(`Ingreso de exportación <span class="codigo">${v.id}</span>`, `${v.desc} · ${esc(v.carga)} · ${NAV[v.naviera].n}`, quick)}
      <div class="linea-estado" role="status" aria-live="polite"><span class="etiqueta">Estado</span>${v.excepcion ? insig(estadoVisita(v), 'error', 'alerta') : fin ? insig('Salida registrada', 'ok') : v.paso ? insig(estadoVisita(v), 'solido') : insig(estadoVisita(v), 'info')}
        <span>Contenedor <a class="codigo" href="#/contenedor/${compacto(v.cont)}">${v.cont}</a></span><span>Camión <span class="codigo">${v.patente}</span></span><span>Franja <span class="num">${textoFranja(f)}</span></span>${E.db.elc.sinEnlace ? insig('Operación sin enlace: se registra en el ELC', 'aviso') : ''}</div>
      ${pasos(PASOS_EXP.map((x, i) => ({ n: x.n, est: i < v.paso ? x.est : '' })), fin ? 7 : actual, { acc: 'v-ver-paso', etq: 'Pasos del ingreso de exportación', fallo: v.excepcion ? actual : undefined })}
      <div class="reticula" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)" id="flujo">
        <section class="tarjeta" aria-labelledby="t-paso">${fin && ver == null ? panelFin(v) : panelPaso(v, mostrado)}</section>
        <aside class="tarjeta" aria-labelledby="t-tiempo"><h2 id="t-tiempo">Línea de tiempo de la visita</h2>${lineaTiempo(v.eventos.slice().reverse(), { etq: 'Eventos de la visita', vacio: 'La visita empieza cuando la empresa de transporte confirma la cita.' })}</aside></div>`;
  },
});
function vistaInexistente(que, id) { return encabezado(`No existe la ${que} ${esc(id)}`) + vacio('Sin registro', 'Revisa el código o búscalo con la búsqueda global.', btn('Volver al inicio', { href: '#/inicio' })); }
function cabPaso(v, i, extra = '') { const x = PASOS_EXP[i]; return `<p class="etiqueta">Paso ${i + 1} de 7</p><h2 id="t-paso" tabindex="-1">${x.n}</h2><p>${insig('Lo hace: ' + x.actor, 'info', 'persona')}</p>${extra}`; }
function resumenPaso(v, i) {
  const ev = v.eventos.filter((e) => e.paso === i);
  return `${cabPaso(v, i)}${msj('ok', `Paso completado: ${PASOS_EXP[i].est}`, '')}${lineaTiempo(ev, { etq: 'Eventos del paso' })}${btn('Volver al paso actual', { tipo: 'secundario', acc: 'v-ver-paso', arg: 'actual', id: 'b-volver-paso' })}`;
}
function panelPaso(v, i) {
  if (i < v.paso) return resumenPaso(v, i);
  const db = E.db;
  if (i === 0) {
    const opciones = db.franjas.filter((f) => f.ini >= 600 && f.res < f.cap); const sin = db.franjas.filter((f) => f.ini >= 600 && f.res >= f.cap).length;
    return `${cabPaso(v, 0)}<form data-form="v-cita" data-arg="${v.id}" novalidate><fieldset><legend>Elige una franja de 30 minutos para hoy</legend>
      <p class="detalle">${sin ? `${sin} franja${sin > 1 ? 's' : ''} sin cupo por la capacidad declarada del gate no se ofrece${sin > 1 ? 'n' : ''}.` : ''} ${ctx('La capacidad de cada franja la declara el terminal y se cambia sin desarrollo en Administración, parámetros.')}</p>
      <div class="horas">${opciones.slice(0, 8).map((f, k) => `<label class="opcion tarjeta-op"><input type="radio" name="franja" value="${f.i}" id="fr-${f.i}" ${k === 0 ? 'required data-msg="Elige una franja."' : ''} ${v.franja === f.i ? 'checked' : ''}><span class="num">${hm(f.ini)} – ${hm(f.fin)}</span><small class="detalle">${f.cap - f.res} cupos</small></label>`).join('')}</div><span class="msg-campo" id="franja-msg" aria-live="polite"></span></fieldset>
      ${btn('Confirmar la cita', { submit: true, tipo: 'clave', ic: 'calendario', id: 'b-paso' })}</form>`;
  }
  if (i === 1) {
    const DOCS = [['guia', 'Guía de despacho', 'guia_despacho_0048391.pdf'], ['aduana', 'Autorización aduanera de exportación', 'autorizacion_exportacion_DUS.pdf'], ['vgm', 'Masa bruta verificada declarada', 'masa_bruta_verificada.pdf']];
    const res = v.resultadoDocs;
    return `${cabPaso(v, 1)}${res ? `<h3>Resultado de la validación</h3><ul class="lista-simple">${DOCS.map(([k, n]) => `<li class="fila-flex entre"><span>${n}</span>${v.docs[k] === 'ok' ? insig('Validado', 'ok') : insig('Falta o no corresponde', 'error')}</li>`).join('')}</ul>` : ''}
      ${v.faltante && v.docs[v.faltante] !== 'ok' ? msj('aviso', 'Falta la autorización aduanera de exportación', `ATOS avisó a ${v.agencia} a las ${horaV(v, 'aviso')}. La agencia puede subir el documento ahora; si el camión llega igual, pasa al carril de excepción sin ocupar un puesto del gate.`) : ''}
      <form data-form="v-docs" data-arg="${v.id}" novalidate><div class="reticula r3">${DOCS.map(([k, n, ej]) => (v.docs[k] === 'ok' ? `<div class="zona-carga cargada">${ic('check', 'g')}<p><strong>${n}</strong><br>Validado</p></div>` : zonaCarga({ id: `doc-${v.id}-${k}`, et: n, ayuda: 'PDF de hasta 10 MB.', ejemplo: ej }))).join('')}</div>
      ${v.docs.vgm !== 'ok' ? campo({ id: 'v-vgm', et: 'Masa bruta verificada declarada (kg)', valor: num(v.masaDecl), ayuda: 'La que firma el embarcador. Se compara con la báscula al llegar.', val: 'kg', req: true, modo: 'numeric' }) : ''}
      <div class="grupo-botones">${btn(res ? 'Corregir y reenviar' : 'Enviar a validación', { submit: true, tipo: 'clave', ic: 'subir', id: 'b-paso' })}${v.faltante && v.docs[v.faltante] !== 'ok' ? btn('Simular: el camión llega igual al gate', { tipo: 'secundario', acc: 'v-llega-sin', arg: v.id, id: 'b-llega-sin' }) : ''}</div></form>`;
  }
  if (i === 2) {
    if (v.excepcion === 'doc') return `${cabPaso(v, 2)}${msj('error', 'Camión en el carril de excepción', `Falta la autorización aduanera de exportación. El camión no ocupa un puesto del gate y conserva su franja ${textoFranja(franjaDe(v))}. ATOS avisó a ${v.agencia} a las ${horaV(v, 'excepcion')}.`)}
      <h3>La agencia carga el documento faltante</h3>${zonaCarga({ id: `exc-${v.id}`, et: 'Autorización aduanera de exportación', ejemplo: 'autorizacion_exportacion_DUS.pdf' })}
      <div class="grupo-botones" style="margin-top:12px">${btn('Validar y devolver el camión a la fila', { tipo: 'clave', acc: 'v-exc-resolver', arg: v.id, id: 'b-paso', disabled: !(ARCHIVOS[`exc-${v.id}`] || []).length })}<a href="#/gate/excepcion">Ver el carril de excepción</a></div>`;
    const leyendo = E.ui.leyendo === v.id;
    return `${cabPaso(v, 2)}<ul class="lista-simple"><li>${ic('reloj')} Llega a las ${horaV(v, 'llegada')}, dentro de su franja: ${insig('Prioridad por cita cumplida', 'ok')} ${ctx('Los camiones que llegan dentro de su franja (con 15 minutos de tolerancia) pasan antes que los que llegan sin cita o fuera de ella.')}</li><li>${ic('barrera')} Puesto de entrada ${v.carril}</li></ul>
      <div id="lectura">${leyendo ? progreso(60, 100, 'Leyendo el código del contenedor y la patente…', { indet: true, texto: 'Leyendo' }) : ''}</div>
      ${btn('Registrar la llegada y leer el contenedor', { tipo: 'clave', acc: 'v-llegada', arg: v.id, ic: 'ojo', id: 'b-paso', disabled: leyendo })}`;
  }
  if (i === 3) {
    const pesado = v.pesado; const dif = ((v.masaMed - v.masaDecl) / v.masaDecl) * 100; const tol = tolMasa();
    if (v.excepcion === 'masa') return `${cabPaso(v, 3)}${tablaMasa(v)}${msj('error', `Diferencia de ${num(dif, 1)} %: supera la tolerancia de ${num(tol, 1)} %`, 'ATOS detuvo el avance del camión, avisó al embarcador y marcó el plan de estiba de REC-1184 para replanificación.')}
      <ul class="lista-simple"><li>${ic('correo')} Aviso a ${esc(v.cliente)} y a ${esc(v.agencia)}: ${horaV(v, 'masa')}</li><li>${ic('nave')} ${enlaceSi('#/nave/plan/REC-1184', 'Plan de estiba de REC-1184')}: ${insig('Marcado para replanificar', 'error')}</li></ul>
      ${v.respuestaEmbarcador ? msj('info', 'El embarcador corrigió la masa bruta verificada', `Nueva masa declarada: ${kgs(v.masaMed)}, firmada a las ${horaV(v, 'barrera')}.`) + btn('Continuar con la masa corregida', { tipo: 'clave', acc: 'v-masa-continuar', arg: v.id, id: 'b-paso' }) : btn('Simular la respuesta del embarcador', { tipo: 'secundario', acc: 'v-masa-respuesta', arg: v.id, id: 'b-paso' })}`;
    return `${cabPaso(v, 3)}${pesado ? tablaMasa(v) : `<p>Masa bruta verificada declarada: <strong>${kgs(v.masaDecl)}</strong>. La báscula del puesto ${v.carril} pesa el camión con el contenedor y descuenta la tara registrada.</p>`}
      ${btn('Pesar en la báscula', { tipo: 'clave', acc: 'v-pesar', arg: v.id, ic: 'balanza', id: 'b-paso' })}`;
  }
  if (i === 4) {
    const pos = asignarPosicion(v);
    return `${cabPaso(v, 4)}<div class="tarjeta crema"><p class="etiqueta">Destino asignado por ATOS</p><p class="kpi"><span class="valor">${textoPos(pos)}</span><span class="meta">Grúa de patio ${v.rtg} · el conductor ve la instrucción en su app</span></p></div>
      <h3>Por qué esta posición</h3><ul>${razonesPos(v, pos).map((r) => `<li>${r}</li>`).join('')}</ul>
      ${btn('Abrir barrera', { tipo: 'clave', acc: 'v-barrera', arg: v.id, ic: 'barrera', id: 'b-paso' })}`;
  }
  if (i === 5) {
    const mov = E.ui.moviendo === v.id;
    return `${cabPaso(v, 5)}<p>El camión va a ${textoPos(v.posicion)}. La grúa ${v.rtg} levanta el contenedor y lo deposita: su telemetría registra el movimiento sin que el operador confirme nada.</p>
      <div id="mov">${mov ? progreso(50, 100, `Telemetría de ${v.rtg}: depósito en ejecución…`, { indet: true, texto: 'En curso' }) : ''}</div>
      ${btn('Ver el depósito registrado por telemetría', { tipo: 'clave', acc: 'v-posicion', arg: v.id, ic: 'antena', id: 'b-paso', disabled: mov })}`;
  }
  if (i === 6) return `${cabPaso(v, 6)}<p>El camión sale por el puesto de salida. ATOS registra la salida y calcula la estadía desde la entrada.</p>${btn('Registrar la salida', { tipo: 'clave', acc: 'v-salida', arg: v.id, ic: 'salir', id: 'b-paso' })}`;
  return '';
}
function tablaMasa(v) { const dif = ((v.masaMed - v.masaDecl) / v.masaDecl) * 100; return `<div class="desplaza" role="region" aria-label="Pesaje" tabindex="0"><table class="compacta"><caption class="sr">Masa declarada y medida</caption><tbody><tr><th scope="row">Masa bruta verificada declarada</th><td class="n">${kgs(v.masaDecl)}</td></tr><tr><th scope="row">Masa medida en la báscula</th><td class="n">${kgs(v.masaMed)}</td></tr><tr><th scope="row">Diferencia</th><td class="n">${num(dif, 1)} % ${Math.abs(dif) > tolMasa() ? insig('Sobre la tolerancia', 'error') : insig('Dentro de la tolerancia', 'ok')}</td></tr><tr><th scope="row">Tolerancia vigente</th><td class="n">${num(tolMasa(), 1)} %</td></tr></tbody></table></div>`; }
function panelFin(v) {
  const est = v.estadia;
  return `<p class="etiqueta">Visita terminada</p><h2 id="t-paso" tabindex="-1">Salida registrada</h2>${msj(est <= 45 ? 'ok' : 'aviso', `Estadía de ${est} minutos`, est <= 45 ? 'Dentro de la meta de 45 minutos del contrato de concesión.' : 'Sobre la meta de 45 minutos: queda trazada para el análisis de causas.')}
    ${progreso(est, 45, 'Estadía respecto de la meta de 45 minutos', { texto: `${est} / 45 min`, alerta: est > 45 })}
    <ul class="lista-simple" style="margin-top:12px"><li><a href="#/contenedor/${compacto(v.cont)}">Ficha del contenedor</a>: posición ${textoPos(v.posicion)}</li><li>${enlaceSi('#/evidencia/hechos', 'Hechos facturables generados')}: pesaje e inicio del almacenaje</li><li>${enlaceSi('#/documentos', 'Conformidad de recepción')} generada desde plantilla y lista para firma</li><li><a href="#/gate/estadia">Estadía de los camiones del turno</a></li></ul>`;
}
ACC['v-ver-paso'] = (el) => { const v = visitaPorId(rutaActual().params.id); (E.ui.verPaso ||= {})[v.id] = el.dataset.arg === 'actual' ? null : Number(el.dataset.arg); refrescar(); $('#t-paso')?.focus(); };
function avanzar(v, i, fuente) { v.paso = i + 1; v.eventos.filter((e) => e.paso == null).forEach((e) => { e.paso = i; }); (E.ui.verPaso ||= {})[v.id] = null; anunciar(`Estado: ${estadoVisita(v)}`); refrescar(); $('#t-paso')?.focus(); }
FORM['v-cita'] = (f) => {
  if (!validarForm(f)) return; const v = visitaPorId(f.dataset.arg); const fr = E.db.franjas[Number($('[name="franja"]:checked', f).value)];
  if (v.franja != null && v.cita) { E.db.franjas[v.franja].res--; }
  v.franja = fr.i; fr.res++;
  let c = E.db.citas.find((x) => x.visita === v.id); if (!c) { c = { id: 'CIT-' + (51300 + E.db.citas.length), transporte: v.transporte, patente: v.patente, cont: v.cont, naviera: v.naviera, tipo: 'Entrega de exportación', tresBandas: false, visita: v.id }; E.db.citas.push(c); }
  c.franja = fr.i; c.estado = 'Confirmada'; v.cita = c.id; E.ui.tablas.citas = { orden: 'hora', dir: 1, pagina: 1, q: v.patente, f: {}, sel: [] }; // al abrir las citas, se ve la recién confirmada
  v.eventos = v.eventos.filter((e) => e.hecho !== 'cita'); evento(v, 'cita', `Cita ${c.id} confirmada para ${textoFranja(fr)}`, `Portal de clientes · ${v.transporte}`, 'destacado');
  auditar('Cita confirmada', `${c.id} · ${v.patente}`); notificar(`Cita ${c.id} confirmada: ${v.patente} a las ${hm(fr.ini)}`, '#/gate/visita/' + v.id, ['gate', 'supervisor', 'transporte', 'conductor']);
  aviso(`Cita ${c.id} confirmada. Ya aparece en las citas del día.`, '', puedeIr('#/gate/citas') ? { href: '#/gate/citas', enlace: 'Ver citas' } : {}); avanzar(v, 0);
};
FORM['v-docs'] = async (f) => {
  const v = visitaPorId(f.dataset.arg); const b = $('#b-paso'); if (!validarForm(f)) return;
  const vg = $('#v-vgm', f); if (vg) v.masaDecl = Number(vg.value.replace(/[.\s]/g, ''));
  b.setAttribute('aria-busy', 'true'); b.disabled = true; await new Promise((r) => setTimeout(r, 600));
  for (const k of ['guia', 'aduana', 'vgm']) if ((ARCHIVOS[`doc-${v.id}-${k}`] || []).length) v.docs[k] = 'ok';
  v.resultadoDocs = true; const faltan = Object.entries(v.docs).filter(([, x]) => x !== 'ok').map(([k]) => k);
  if (!v.eventos.some((e) => e.hecho === 'prevalidacion')) evento(v, 'prevalidacion', faltan.length ? `Prevalidación con ${faltan.length} documento${faltan.length > 1 ? 's' : ''} pendiente${faltan.length > 1 ? 's' : ''}` : 'Documentación validada antes de salir a la ruta', `Portal de clientes · ${v.agencia}`);
  if (faltan.length) { aviso(`Faltan ${faltan.length} documentos. Súbelos y reenvía: la cita se mantiene.`, 'error'); refrescar(); $('#t-paso')?.focus(); return; }
  if (!v.eventos.some((e) => e.t.startsWith('Documentación validada'))) evento(v, 'prevalidacion', 'Documentación validada: guía, autorización aduanera y masa bruta verificada', 'ATOS · validación anticipada', 'destacado');
  aviso('Documentación validada. El camión puede salir a la ruta.'); auditar('Prevalidación documental', v.id); avanzar(v, 1);
};
ACC['v-llega-sin'] = (el) => {
  const v = visitaPorId(el.dataset.arg); v.paso = 2; v.eventos.filter((e) => e.paso == null).forEach((e) => { e.paso = 1; }); v.excepcion = 'doc'; v.sinValidar = true;
  evento(v, 'llegada', `Llega al gate a las ${horaV(v, 'llegada')} sin la validación completa`, `Lector de patente, puesto ${v.carril}`); evento(v, 'excepcion', 'Pasa al carril de excepción sin ocupar un puesto del gate', 'ATOS', 'alarma');
  notificar(`Camión ${v.patente} en el carril de excepción: falta la autorización aduanera de ${v.cont}`, '#/portal/documentos', ['carga', 'gate', 'supervisor']); tarea(`Subir la autorización aduanera de ${v.cont}: el camión ${v.patente} espera en el carril de excepción`, '#/portal/documentos', ['carga'], 'Crítica', 'Documentación');
  acumularELC(2); auditar('Camión al carril de excepción', `${v.patente} · ${v.cont}`, 'Documentación incompleta'); aviso(`${v.patente} pasó al carril de excepción. ATOS avisó a ${v.agencia}.`, 'error'); refrescar(); $('#t-paso')?.focus();
};
ACC['v-exc-resolver'] = (el) => resolverExcepcion(visitaPorId(el.dataset.arg));
function resolverExcepcion(v) {
  v.docs.aduana = 'ok'; v.excepcion = null; v.paso = Math.max(v.paso, 2);
  evento(v, 'docCargado', 'La agencia cargó la autorización aduanera; ATOS la validó', `Portal de clientes · ${v.agencia}`); evento(v, 'vuelveFila', `Vuelve a la fila conservando su franja ${textoFranja(franjaDe(v))}`, 'ATOS', 'destacado');
  v.retraso = (v.retraso || 0) + 18; // vuelve a la fila 18 min después: la visita queda ≥ 50 % más lenta que una validada (meta 13)
  v.paso = 2; v.eventos.filter((e) => e.paso == null).forEach((e) => { e.paso = 1; });
  E.db.tareas.filter((t) => t.t.includes(v.cont) && t.proceso === 'Documentación').forEach((t) => { t.hecha = true; }); E.db.tareas.filter((t) => t.id === 'TA-1').forEach((t) => { t.hecha = true; });
  notificar(`${v.patente} volvió a la fila del gate conservando su franja`, '#/gate/visita/' + v.id, ['gate', 'supervisor', 'carga']); auditar('Excepción documental resuelta', v.id); aviso('Documento validado: el camión vuelve a la fila con su franja.'); refrescar(); $('#t-paso')?.focus();
}
ACC['v-llegada'] = (el) => {
  const v = visitaPorId(el.dataset.arg);
  if (v.docs.aduana !== 'ok' || v.docs.guia !== 'ok' || v.docs.vgm !== 'ok') { ACC['v-llega-sin'](el); return; }
  E.ui.leyendo = v.id; refrescar();
  setTimeout(() => {
    E.ui.leyendo = null; const d = v.cont.slice(-1);
    evento(v, 'llegada', `Entrada al gate por el puesto ${v.carril}, dentro de su franja: prioridad por cita cumplida`, `Lector de patente: ${v.patente}`, 'destacado');
    evento(v, 'llegada', `Lectura óptica: ${v.cont}, dígito verificador ${d} correcto (ISO 6346), confianza 99,2 %`, `Lector óptico del puesto ${v.carril}`);
    evento(v, 'llegada', `Conductor ${v.conductor.n} habilitado (licencia ${v.conductor.lic} vigente)`, 'Identidad y Acceso');
    acumularELC(1); auditar('Llegada al gate', `${v.patente} · ${v.cont}`); avanzar(v, 2);
  }, 900);
};
ACC['v-pesar'] = (el) => {
  const v = visitaPorId(el.dataset.arg); v.pesado = true; const dif = ((v.masaMed - v.masaDecl) / v.masaDecl) * 100;
  E.db.hechos.unshift({ id: 'HF-' + (608500 + E.db.hechos.length), tipo: 'PES', cont: v.cont, naviera: v.naviera, cliente: v.cliente, cant: 1, dia: 0, hora: horaV(v, 'masa'), estado: E.db.elc.sinEnlace ? 'Registrado en el ELC' : 'Registrado', sello: 'a7c2 19fe 33d0 8b41', origen: `Báscula del gate, puesto ${v.carril}`, nuevo: true });
  acumularELC(1);
  if (Math.abs(dif) > tolMasa()) {
    v.excepcion = 'masa'; evento(v, 'masa', `Masa medida ${kgs(v.masaMed)}: ${num(dif, 1)} % sobre la declarada, supera la tolerancia de ${num(tolMasa(), 1)} %`, `Báscula del puesto ${v.carril}`, 'alarma');
    evento(v, 'masa', 'Avance detenido; aviso al embarcador; plan de estiba de REC-1184 marcado para replanificación', 'ATOS', 'alarma');
    E.db.planes['REC-1184'].marcado = true; E.db.planes['REC-1184'].motivoMarca = `Masa bruta de ${v.cont}: ${num(dif, 1)} % sobre la declarada`;
    notificar(`Masa bruta de ${v.cont} sobre la tolerancia: el plan de REC-1184 debe replanificarse`, '#/nave/plan/REC-1184', ['planificador', 'jefatura', 'supervisor']); tarea(`Replanificar REC-1184: masa bruta de ${v.cont} ${num(dif, 1)} % sobre la declarada`, '#/nave/plan/REC-1184', ['planificador'], 'Alta', 'Nave y planificación');
    auditar('Masa bruta sobre la tolerancia', v.cont, 'Avance detenido'); aviso(`Diferencia de ${num(dif, 1)} %: avance detenido y plan de estiba marcado.`, 'error'); refrescar(); $('#t-paso')?.focus(); return;
  }
  evento(v, 'masa', `Masa medida ${kgs(v.masaMed)}: diferencia de ${num(dif, 1)} %, dentro de la tolerancia`, `Báscula del puesto ${v.carril}`); evento(v, 'masa', 'Hecho facturable generado: pesaje', 'Servicio de Evidencia');
  aviso('Masa verificada. Se generó el hecho facturable del pesaje.', '', puedeIr('#/evidencia/hechos') ? { href: '#/evidencia/hechos', enlace: 'Ver evidencia' } : {}); avanzar(v, 3);
};
ACC['v-masa-respuesta'] = (el) => { const v = visitaPorId(el.dataset.arg); v.respuestaEmbarcador = true; evento(v, 'barrera', `${v.cliente} firmó una masa bruta verificada corregida de ${kgs(v.masaMed)}`, `Portal de clientes · ${v.agencia}`); refrescar(); $('#b-paso')?.focus(); };
ACC['v-masa-continuar'] = (el) => { const v = visitaPorId(el.dataset.arg); v.masaDecl = v.masaMed; v.excepcion = null; evento(v, 'barrera', 'Masa verificada con la declaración corregida', 'ATOS'); avanzar(v, 3); };
ACC['v-barrera'] = async (el) => {
  const v = visitaPorId(el.dataset.arg); const pos = asignarPosicion(v);
  const ok = await confirmar({ titulo: 'Abrir barrera', critico: true, texto: 'La barrera se abre y queda registrada la entrada al patio. Confirma que el camión y el contenedor son los de la pantalla.', detalle: datos([['Camión', `<span class="codigo">${v.patente}</span>`], ['Contenedor', `<span class="codigo">${v.cont}</span>`], ['Destino', textoPos(pos)]]), si: 'Abrir barrera' });
  if (!ok) { anunciar('La barrera sigue cerrada.'); return; }
  v.posicion = pos; evento(v, 'destino', `Destino asignado: ${textoPos(pos)}`, 'ATOS · asignación algorítmica'); evento(v, 'barrera', 'Barrera abierta; entrada al patio registrada', `Funcionaria de gate, puesto ${v.carril}`, 'destacado');
  E.db.cabina.instruccion = { cont: v.cont, pos, tracto: 'el camión ' + v.patente, eta: 3 }; acumularELC(1); auditar('Apertura de barrera', `${v.patente} · ${v.cont}`); aviso('Barrera abierta. La instrucción llegó a la app del conductor y a la cabina de la grúa ' + v.rtg + '.', '', puedeIr('#/cabina/patio') ? { href: '#/cabina/patio', enlace: 'Ver la cabina' } : {}); avanzar(v, 4);
};
ACC['v-posicion'] = (el) => {
  const v = visitaPorId(el.dataset.arg); E.ui.moviendo = v.id; refrescar();
  setTimeout(() => {
    E.ui.moviendo = null; evento(v, 'posicion', `Depósito en ${textoPos(v.posicion)} registrado por telemetría de ${v.rtg}, sin confirmación del operador`, `Telemetría de ${v.rtg}`, 'destacado');
    evento(v, 'posicion', 'Confianza de la posición: alta (la telemetría y la lectura óptica de la grúa coinciden)', 'ATOS · verificación cruzada');
    E.db.movimientos.unshift({ id: 'MV-' + (88200 + E.db.movimientos.length), hora: horaV(v, 'posicion'), cont: v.cont, tipo: 'Recepción en patio', equipo: v.rtg, fuente: 'Telemetría del equipo', confianza: 'Alta' });
    E.db.hechos.unshift({ id: 'HF-' + (608500 + E.db.hechos.length), tipo: 'ALM', cont: v.cont, naviera: v.naviera, cliente: v.cliente, cant: 0, dia: 0, hora: horaV(v, 'posicion'), estado: 'Registrado · cuenta desde hoy', sello: '4e91 c0d7 2a6b f310', origen: `Telemetría de ${v.rtg}`, nuevo: true });
    E.db.cabina.instruccion = null; acumularELC(2); auditar('Posición registrada por telemetría', v.cont); avanzar(v, 5);
  }, 1000);
};
ACC['v-salida'] = (el) => {
  const v = visitaPorId(el.dataset.arg); const f = franjaDe(v); v.estadia = OFF.salida - OFF.llegada + (v.retraso || 0);
  evento(v, 'salida', `Salida registrada; estadía de ${v.estadia} minutos frente a la meta de 45`, 'Puesto de salida 3', 'destacado');
  E.db.estadias.unshift({ id: v.id, patente: v.patente, cont: v.cont, naviera: v.naviera, transporte: v.transporte, entrada: f.ini + OFF.llegada + (v.retraso || 0), salida: f.ini + OFF.salida + (v.retraso || 0), estadia: v.estadia, puesto: v.carril, excepcion: v.sinValidar ? 'Documentación' : '', tipo: 'Exportación' });
  E.db.documentos.unshift({ id: 'DOC-' + (55130 + E.db.documentos.length), n: `Conformidad de recepción ${v.id}`, tipo: 'Conformidad de recepción', version: 1, autor: 'ATOS (desde plantilla DT-02 v2)', fecha: `lunes 6, ${horaV(v, 'salida')}`, etiquetas: [v.transporte, v.cont], acceso: 'Transporte, gate y cliente', firma: 'Pendiente' });
  const c = E.db.citas.find((x) => x.visita === v.id); if (c) c.estado = 'Completada'; acumularELC(1); auditar('Salida registrada', `${v.patente} · estadía ${v.estadia} min`); avanzar(v, 6);
};
ACC['v-modificar'] = (el) => { const v = visitaPorId(el.dataset.arg); if (v.excepcion) { aviso('El camión está en el carril de excepción: primero se resuelve el documento.', 'error'); return; } if (v.paso > 2) { aviso('La cita ya no se puede modificar: el camión entró al gate.', 'error'); return; } v.paso = 0; E.ui.verPaso = {}; aviso('Elige la nueva franja. La anterior se libera al confirmar.'); refrescar(); $('#t-paso')?.focus(); };
ACC['v-cancelar'] = async (el) => {
  const v = visitaPorId(el.dataset.arg); if (v.excepcion) { aviso('El camión está en el carril de excepción: primero se resuelve el documento.', 'error'); return; } if (v.paso > 2) { aviso('La cita ya no se puede cancelar: el camión entró al gate.', 'error'); return; } if (v.franja == null || !v.paso) { aviso('Esta visita todavía no tiene una cita confirmada.', 'error'); return; }
  const ok = await confirmar({ titulo: 'Cancelar la cita', critico: true, texto: `Se cancela la cita de ${v.patente} para ${textoFranja(franjaDe(v))} y se libera el cupo. El camión necesitará una cita nueva.`, si: 'Cancelar la cita', no: 'Mantener la cita' });
  if (!ok) return; E.db.franjas[v.franja].res--; const c = E.db.citas.find((x) => x.visita === v.id); if (c) c.estado = 'Cancelada'; v.eventos.push({ hora: hm(642), t: 'Cita cancelada; cupo liberado', fuente: 'Portal de clientes', paso: 0, clase: 'alarma' });
  v.paso = 0; v.franja = null; auditar('Cita cancelada', c?.id || v.id); aviso('Cita cancelada y cupo liberado.'); refrescar();
};

/* ---------------------------------------------------------------- retiro de un contenedor de importación */
function vistaRetiro(v) {
  const fin = v.paso >= 5; const i = Math.min(v.paso, 4); const f = franjaDe(v);
  const panel = fin ? `${msj('ok', 'Salida registrada', `Estadía de ${v.estadia} minutos. Se generó la conformidad de entrega para firma.`)}<p><a href="#/contenedor/${compacto(v.cont)}">Ficha del contenedor</a></p>`
    : [
      `<p>Cita de retiro confirmada por ${esc(v.transporte)} para ${textoFranja(f)} (${E.db.citas.find((c) => c.visita === v.id)?.id}).</p>${btn('Continuar: verificar la liberación', { tipo: 'clave', acc: 'r-avanzar', arg: v.id, id: 'b-paso' })}`,
      `<ul class="lista-simple"><li>${insig('Liberado', 'ok')} Liberación aduanera recibida de la Aduana</li><li>${insig('Sin pendientes', 'ok')} No tiene inspecciones abiertas</li><li>${insig('Sin retención', 'ok')} La naviera ${NAV[v.naviera].n} liberó el contenedor</li></ul>${btn('Confirmar la liberación', { tipo: 'clave', acc: 'r-avanzar', arg: v.id, id: 'b-paso' })}`,
      `<p>Lectura de patente <span class="codigo">${v.patente}</span> y habilitación del conductor ${esc(v.conductor.n)}.</p>${btn('Registrar la llegada', { tipo: 'clave', acc: 'r-avanzar', arg: v.id, id: 'b-paso' })}`,
      `<p>El contenedor está en ${textoPos(v.posicion)}. La grúa de patio lo carga al camión y la telemetría registra la entrega.</p>${btn('Ver la entrega registrada por telemetría', { tipo: 'clave', acc: 'r-avanzar', arg: v.id, id: 'b-paso' })}`,
      `<p>La lectura óptica del puesto de salida confirma que el contenedor es <span class="codigo">${v.cont}</span>.</p>${btn('Registrar la salida', { tipo: 'clave', acc: 'r-avanzar', arg: v.id, id: 'b-paso' })}`,
    ][i];
  return `${encabezado(`Retiro de importación <span class="codigo">${v.id}</span>`, `${v.desc} · ${esc(v.cliente)} · ${NAV[v.naviera].n}`)}
    <div class="linea-estado" role="status" aria-live="polite"><span class="etiqueta">Estado</span>${insig(estadoVisita(v), fin ? 'ok' : 'solido')}<span>Contenedor <span class="codigo">${v.cont}</span></span><span>Camión <span class="codigo">${v.patente}</span></span></div>
    ${pasos(PASOS_IMP.map((x, k) => ({ n: x.n, est: k < v.paso ? x.est : '' })), fin ? 5 : i, { etq: 'Pasos del retiro de importación' })}
    <div class="reticula" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)"><section class="tarjeta" aria-labelledby="t-paso"><p class="etiqueta">${fin ? 'Visita terminada' : `Paso ${i + 1} de 5`}</p><h2 id="t-paso" tabindex="-1">${fin ? 'Retiro completado' : PASOS_IMP[i].n}</h2>${fin ? '' : `<p>${insig('Lo hace: ' + PASOS_IMP[i].actor, 'info', 'persona')}</p>`}${panel}</section>
    <aside class="tarjeta"><h2>Línea de tiempo</h2>${lineaTiempo(v.eventos.slice().reverse(), { vacio: 'Los eventos aparecerán al avanzar el retiro.' })}</aside></div>`;
}
ACC['r-avanzar'] = (el) => {
  const v = visitaPorId(el.dataset.arg); const f = franjaDe(v); const t = (m) => hm(f.ini + m);
  const ev = [['Cita de retiro confirmada', 'Portal de clientes', -40], ['Liberación aduanera y de la naviera verificadas', 'Hub de Integración · Aduana y naviera', -10], ['Entrada al gate; patente y conductor verificados', `Lector de patente, puesto 5`, 3], [`Contenedor cargado al camión desde ${textoPos(v.posicion)}`, 'Telemetría de RTG-11', 15], ['Salida registrada; lectura óptica confirma el contenedor', 'Puesto de salida 2', 31]][v.paso];
  v.eventos.push({ hora: t(ev[2]), t: ev[0], fuente: ev[1], clase: v.paso === 4 ? 'destacado' : '' });
  if (v.paso === 4) { v.estadia = 28; E.db.estadias.unshift({ id: v.id, patente: v.patente, cont: v.cont, naviera: v.naviera, transporte: v.transporte, entrada: f.ini + 3, salida: f.ini + 31, estadia: 28, puesto: 5, excepcion: '', tipo: 'Importación' }); E.db.documentos.unshift({ id: 'DOC-' + (55160 + E.db.documentos.length), n: `Conformidad de entrega ${v.id}`, tipo: 'Conformidad de entrega', version: 1, autor: 'ATOS (desde plantilla DT-03 v2)', fecha: 'lunes 6, ' + t(31), etiquetas: [v.transporte, v.cont], acceso: 'Transporte, gate y cliente', firma: 'Pendiente' }); }
  v.paso++; acumularELC(1); auditar('Retiro de importación: ' + PASOS_IMP[v.paso - 1].est, v.id); anunciar('Estado: ' + estadoVisita(v)); refrescar(); $('#t-paso')?.focus();
};
R('/gate/retiro/:id', { id: 'gate-retiro-id', t: (p) => `Retiro ${p.id}`, area: 'gate.flujo', mod: 'gate', padre: 'gate-retiro', rf: ['RF-GAT-02', 'RF-GAT-11', 'RF-GAT-12', 'RF-PAT-05'], vista: (p) => { const v = visitaPorId(p.id); return v ? vistaRetiro(v) : vistaInexistente('visita', p.id); } });
R('/gate/retiros', {
  id: 'gate-retiro', t: 'Retiro de importación', area: 'gate.flujo', mod: 'gate', ic: 'camion', rf: ['RF-GAT-02', 'RF-GAT-11'], paramsMenu: {},
  vista: () => `${encabezado('Retiro de importación', 'Camiones que vienen a retirar contenedores de importación, de la cita a la salida.')}
    ${tabla({ id: 'retiros', titulo: 'Retiros de importación del turno', filas: E.db.retiros, exportar: false, columnas: [{ k: 'id', t: 'Visita', html: (f) => `<a href="#/gate/retiro/${f.id}">${f.id}</a>` }, { k: 'cont', t: 'Contenedor', html: (f) => `<span class="codigo">${f.cont}</span>` }, { k: 'patente', t: 'Camión', html: (f) => `<span class="codigo">${f.patente}</span>` }, { k: 'cliente', t: 'Importador' }, { k: 'estado', t: 'Estado', v: (f) => estadoVisita(f) }] })}`,
});

/* ---------------------------------------------------------------- puesto de atención del gate */
R('/gate/puesto', {
  id: 'gate-puesto', t: 'Puesto de atención', area: 'gate', mod: 'gate', ic: 'barrera', rf: ['RF-GAT-02', 'RF-GAT-05', 'RF-GAT-06', 'RF-GAT-07', 'RF-GAT-15'], carga: true,
  vista: () => {
    const enCola = E.db.visitas.filter((v) => v.paso >= 2 && v.paso < 5 && v.excepcion !== 'doc');
    const filas = [...enCola.map((v) => ({ id: v.id, patente: v.patente, cont: v.cont, franja: textoFranja(franjaDe(v)), prioridad: v.paso >= 3 ? 'Cita cumplida' : 'Con cita, por llegar', estado: estadoVisita(v), puesto: v.carril, href: '#/gate/visita/' + v.id })),
      ...[['DPKR-17', 'Sin cita', 'Sin cita: espera', 1], ['LBVT-90', 'Llegó 30 min tarde', 'En fila', 3], ['XYCW-55', 'Cita cumplida', 'En fila', 7]].map(([pa, pr, es, pu], k) => ({ id: 'EXT-' + k, patente: pa, cont: codigoISO(['MCSU', 'PMLU', 'OANU'][k], String(201300 + k * 77)), franja: '10:00 – 10:30', prioridad: pr, estado: es, puesto: pu, href: '' }))];
    return `${encabezado('Puesto de atención', 'Fila del gate por prioridad: primero quien cumple su cita. Los camiones con documentación incompleta van al carril de excepción.', btn('Carril de excepción', { href: '#/gate/excepcion', tipo: 'secundario', ic: 'alerta' }) + btn('Ingreso guiado de exportación', { href: '#/gate/visita/VIS-240871', tipo: 'clave', ic: 'camion' }))}
      <div class="reticula r4" style="margin-bottom:16px">${kpi('Camiones en la fila', filas.length, 'en los 8 puestos de entrada')}${kpi('En carril de excepción', enExcepcion(), 'no ocupan puesto', '#/gate/excepcion')}${kpi('Conciliación con el TOS 2012', '0', 'divergencias en el gate (umbral cero)', '#/convivencia')}${kpi('Procesamiento por camión', '96 s', 'de la barrera a la instrucción de destino')}</div>
      ${tabla({ id: 'puesto', titulo: 'Fila del gate', filas, ordenInicial: 'prioridad', exportar: false, columnas: [{ k: 'patente', t: 'Camión', html: (f) => `<span class="codigo">${f.patente}</span>` }, { k: 'cont', t: 'Contenedor', html: (f) => `<span class="codigo">${f.cont}</span>` }, { k: 'franja', t: 'Franja' }, { k: 'prioridad', t: 'Prioridad', o: (f) => (f.prioridad === 'Cita cumplida' ? 0 : 1), html: (f) => insig(f.prioridad, f.prioridad === 'Cita cumplida' ? 'ok' : 'aviso') }, { k: 'puesto', t: 'Puesto', n: true }, { k: 'estado', t: 'Estado' }, { k: 'a', t: 'Acción', orden: false, html: (f) => (f.href ? `<a class="boton secundario chico" href="${f.href}">Atender</a>` : `<span class="detalle">En espera</span>`) }] })}`;
  },
});
// Camiones de otras empresas que esperan en el carril de excepción (la tabla y la búsqueda global los comparten).
const excepcionOtras = () => [{ id: 'EX-1', patente: 'RJVB-31', cont: codigoISO('CHNU', '510882'), falta: 'Guía de despacho', agencia: 'Agencia Litoral Central', aviso: '10:31', franja: '10:00 – 10:30', href: '' }, { id: 'EX-2', patente: 'SFKT-08', cont: codigoISO('NVCU', '233410'), falta: 'Masa bruta verificada declarada', agencia: 'Agencia de Aduanas Puerto Claro', aviso: '10:37', franja: '10:30 – 11:00', href: '' }];
R('/gate/excepcion', {
  id: 'gate-excepcion', t: 'Carril de excepción', area: 'gate', mod: 'gate', ic: 'alerta', rf: ['RF-GAT-04'],
  vista: () => {
    const vs = E.db.visitas.filter((v) => v.excepcion === 'doc');
    const filas = [...vs.map((v) => ({ id: v.id, patente: v.patente, cont: v.cont, falta: 'Autorización aduanera de exportación', agencia: v.agencia, aviso: horaV(v, 'excepcion'), franja: textoFranja(franjaDe(v)), href: '#/gate/visita/' + v.id })),
      ...excepcionOtras()];
    return `${encabezado('Carril de excepción', 'El 22 % de los camiones llegaba con documentación incompleta o errónea y ocupaba un puesto del gate. Aquí esperan sin ocuparlo, con su franja conservada, mientras la agencia sube el documento.')}
      ${tabla({ id: 'excepcion', titulo: 'Camiones en el carril de excepción', filas, exportar: false, columnas: [{ k: 'patente', t: 'Camión', html: (f) => `<span class="codigo">${f.patente}</span>` }, { k: 'cont', t: 'Contenedor', html: (f) => `<span class="codigo">${f.cont}</span>` }, { k: 'falta', t: 'Documento faltante' }, { k: 'agencia', t: 'Agencia avisada' }, { k: 'aviso', t: 'Aviso' }, { k: 'franja', t: 'Franja conservada' }, { k: 'a', t: 'Acción', orden: false, html: (f) => (f.href ? `<a class="boton secundario chico" href="${f.href}">Atender</a>` : '<span class="detalle">Esperando a la agencia</span>') }], vacioT: 'Carril de excepción vacío' })}`;
  },
});
R('/gate/citas', {
  id: 'gate-citas', t: 'Citas del día', area: ['gate', 'gate.ver'], mod: 'gate', ic: 'calendario', rf: ['RF-GAT-01', 'RF-GAT-02', 'RF-GAT-16'], nuevo: '#/gate/citas/nueva', carga: true,
  vista: () => `${encabezado('Citas del día', 'Las citas que reservan las empresas de transporte en el portal. Las nuevas aparecen aquí y en el puesto de atención.', btn('Nueva cita', { href: '#/gate/citas/nueva', tipo: 'clave', ic: 'mas' }))}
    ${tabla({ id: 'citas', titulo: 'Citas del día', filas: E.db.citas.map((c) => ({ ...c, hora: hm(E.db.franjas[c.franja].ini) })), ordenInicial: 'hora', porPagina: 12, ctx: (k) => [{ t: 'Ver la visita', href: E.db.citas.find((c) => c.id === k)?.visita ? '#/gate/visita/' + E.db.citas.find((c) => c.id === k).visita : '#/gate/puesto', ic: 'ojo' }, { t: 'Reprogramar a la siguiente franja', acc: 'cita-reprog', arg: k, ic: 'reloj' }, { t: 'Cancelar', acc: 'cita-cancelar', arg: k, ic: 'cerrar' }],
      columnas: [{ k: 'id', t: 'Cita' }, { k: 'hora', t: 'Franja', v: (f) => `${f.hora} – ${hm(E.db.franjas[f.franja].fin)}` }, { k: 'patente', t: 'Camión', html: (f) => `<span class="codigo">${f.patente}</span>` }, { k: 'cont', t: 'Contenedor', html: (f) => `<span class="codigo">${f.cont}</span>` }, { k: 'transporte', t: 'Empresa de transporte' }, { k: 'tipo', t: 'Tipo' }, { k: 'estado', t: 'Estado', html: (f) => insigCita(f.estado) + (f.tresBandas ? ' ' + insig('A tres bandas', 'info') : '') }, { k: 'acc', t: 'Acciones', orden: false, noCSV: true, html: (f) => menuAcciones('Acciones', [{ t: 'Reprogramar', acc: 'cita-reprog', arg: f.id, ic: 'reloj' }, { t: 'Cancelar', acc: 'cita-cancelar', arg: f.id, ic: 'cerrar' }], { id: 'mc-' + f.id, clase: 'boton-icono', soloIcono: true }) }],
      filtros: [{ k: 'estado', t: 'Estado' }, { k: 'tipo', t: 'Tipo' }, { k: 'transporte', t: 'Empresa' }],
      masivas: [{ t: 'Reprogramar a la siguiente franja', confirmar: 'Las citas seleccionadas pasan a la siguiente franja con cupo y se avisa a cada empresa', fn: (ids) => { const ok = ids.filter(reprogramar).length; aviso(ok === ids.length ? `${ok} citas reprogramadas y avisadas.` : `${ok} de ${ids.length} citas reprogramadas; las demás ya no se pueden cambiar.`, ok === ids.length ? '' : 'error'); } }, { t: 'Cancelar', critico: true, confirmar: 'Se cancelan las citas seleccionadas y se liberan sus cupos', fn: (ids) => { const ok = ids.filter((id) => cancelarCita(E.db.citas.find((x) => x.id === id))).length; aviso(ok === ids.length ? `${ok} citas canceladas.` : `${ok} de ${ids.length} citas canceladas; las demás ya no se pueden cambiar.`, ok === ids.length ? '' : 'error'); } }] })}
    ${fab('Nueva cita', { href: '#/gate/citas/nueva' })}`,
});
function reprogramar(id) {
  const c = E.db.citas.find((x) => x.id === id); if (citaBloqueada(c)) return false; const sig = E.db.franjas.find((f) => f.i > c.franja && f.res < f.cap); if (!sig) return false;
  E.db.franjas[c.franja].res--; sig.res++; c.franja = sig.i; c.estado = 'Reprogramada';
  const v = c.visita ? visitaPorId(c.visita) : null; if (v && v.franja != null) { v.franja = sig.i; v.eventos.push({ hora: horaSim(), t: `Cita ${c.id} reprogramada a ${textoFranja(sig)}`, fuente: 'Gate', paso: 0, clase: '' }); }
  auditar('Cita reprogramada', id); return true;
}
function cancelarCita(c) {
  if (citaBloqueada(c)) return false; c.estado = 'Cancelada'; E.db.franjas[c.franja].res--;
  const v = c.visita ? visitaPorId(c.visita) : null; if (v && v.franja != null) { v.franja = null; v.paso = 0; v.eventos.push({ hora: horaSim(), t: 'Cita cancelada; cupo liberado', fuente: 'Gate', paso: 0, clase: 'alarma' }); }
  auditar('Cita cancelada', c.id); return true;
}
ACC['cita-reprog'] = (el) => { const c = E.db.citas.find((x) => x.id === el.dataset.arg); const no = citaBloqueada(c); if (no) { aviso(no, 'error'); return; } const ok = reprogramar(c.id); aviso(ok ? `Cita ${c.id} reprogramada a la siguiente franja con cupo.` : 'No quedan franjas con cupo después de esta.', ok ? '' : 'error'); refrescar(); };
ACC['cita-cancelar'] = async (el) => { const c = E.db.citas.find((x) => x.id === el.dataset.arg); const no = citaBloqueada(c); if (no) { aviso(no, 'error'); return; } if (!(await confirmar({ titulo: `Cancelar la cita ${c.id}`, critico: true, texto: `Se libera el cupo de ${c.patente}.`, si: 'Cancelar la cita', no: 'Mantener' }))) return; cancelarCita(c); aviso('Cita cancelada y cupo liberado.'); refrescar(); };
R('/gate/citas/nueva', {
  id: 'gate-cita-nueva', t: ['Nueva cita', 'New appointment'], area: ['gate', 'portal.citas'], bilingue: true, mod: () => (PERFILES[E.sesion?.perfil]?.ext ? 'portal' : 'gate'), padre: () => (PERFILES[E.sesion?.perfil]?.ext ? 'portal-citas' : 'gate-citas'), rf: ['RF-GAT-01', 'RF-GAT-16', 'RF-INT-08'],
  vista: () => {
    const n = (E.ui.nuevaCita ||= { paso: 0, d: {} }); const d = n.d; const opciones = E.db.franjas.filter((f) => f.ini >= 600 && f.res < f.cap);
    const cuerpo = [
      `${autocompletar({ id: 'nc-cont', et: 'Contenedor', fuente: 'contenedores', req: true, valor: d.cont, ayuda: 'Escribe parte del número; se valida el dígito verificador ISO 6346.' })}${campo({ id: 'nc-tipo', et: 'Tipo de visita', tipo: 'select', valor: d.tipo, opciones: ['Entrega de exportación', 'Retiro de importación', 'Retiro de vacío'] })}`,
      `<fieldset><legend>Franja</legend><div class="horas">${opciones.slice(0, 10).map((f, k) => `<label class="opcion tarjeta-op"><input type="radio" name="nc-franja" value="${f.i}" id="ncf-${f.i}" ${d.franja === f.i ? 'checked' : ''} ${k === 0 ? 'required data-msg="Elige una franja."' : ''}><span class="num">${hm(f.ini)}</span><small class="detalle">${f.cap - f.res} cupos</small></label>`).join('')}</div><span class="msg-campo" id="nc-franja-msg" aria-live="polite"></span></fieldset>`,
      `<div class="form-fila">${campo({ id: 'nc-pat', et: 'Patente del camión', val: 'patente', req: true, valor: d.pat, ph: 'KTRP-51' })}${campo({ id: 'nc-rut', et: 'RUT del conductor', val: 'rut', req: true, valor: d.rut, ph: '13.482.771-8' })}</div>${campo({ id: 'nc-emp', et: 'Empresa de transporte', tipo: 'select', valor: d.emp, opciones: ['Transportes Cordillera Sur Ltda.', 'Transportes Ruta Cinco SpA', 'Logística Quebrada Verde SpA', 'Fletes Costa Brava Ltda.'] })}`,
    ][n.paso];
    return `${encabezado('Nueva cita', 'Formulario de tres pasos. Solo se ofrecen las franjas con cupo según la capacidad declarada.')}
      <div class="tarjeta" style="max-width:860px">${pasos(['Contenedor', 'Franja', 'Camión y conductor'], n.paso, { etq: 'Pasos de la nueva cita' })}
      <form data-form="nueva-cita" novalidate>${cuerpo}<div class="grupo-botones">${n.paso ? btn('Anterior', { tipo: 'secundario', acc: 'nc-atras', id: 'nc-atras' }) : ''}${btn(n.paso === 2 ? 'Confirmar la cita' : 'Siguiente', { submit: true, tipo: n.paso === 2 ? 'clave' : '', id: 'nc-sig' })}${btn('Cancelar', { tipo: 'terciario', href: '#/gate/citas', acc: 'nc-salir' })}</div></form></div>`;
  },
});
AC_FUENTES.contenedores = (q) => { const set = new Set(); const out = []; const add = (c, sub) => { if (!set.has(c) && parecido(q, c) >= 40) { set.add(c); out.push({ grupo: 'Contenedores', t: c, sub, valor: c }); } }; E.db.visitas.concat(E.db.retiros).forEach((v) => add(v.cont, v.cliente)); E.db.citas.forEach((c) => add(c.cont, NAV[c.naviera].n)); E.db.inspecciones.forEach((i) => add(i.cont, i.autoridad)); return out.slice(0, 8); };
FORM['nueva-cita'] = (f) => {
  const n = E.ui.nuevaCita; const d = n.d;
  if (n.paso === 0) { const c = $('#nc-cont'); const v = validarContenedor(c.value); if (!v.ok) { marcarCampo(c, v, true); c.setAttribute('aria-invalid', 'true'); c.focus(); return; } d.cont = v.codigo; d.tipo = $('#nc-tipo').value; }
  else if (!validarForm(f)) return;
  if (n.paso === 1) d.franja = Number($('[name="nc-franja"]:checked').value);
  if (n.paso === 2) {
    d.pat = validarPatente($('#nc-pat').value).codigo; d.rut = $('#nc-rut').value; d.emp = $('#nc-emp').value; const fr = E.db.franjas[d.franja]; fr.res++;
    const c = { id: 'CIT-' + (51300 + E.db.citas.length), franja: d.franja, transporte: d.emp, patente: d.pat, cont: d.cont, naviera: (NAVIERAS.find((x) => d.cont.startsWith(x.pref)) || NAVIERAS[0]).id, tipo: d.tipo, estado: 'Confirmada', tresBandas: false, nueva: true };
    E.db.citas.push(c); auditar('Cita creada', `${c.id} · ${c.patente}`); notificar(`Nueva cita ${c.id}: ${c.patente} a las ${hm(fr.ini)}`, '#/gate/citas', ['gate', 'supervisor']); E.ui.nuevaCita = null; E.ui.tablas.citas = { orden: 'hora', dir: 1, pagina: 1, q: c.patente, f: {}, sel: [] };
    aviso(`Cita ${c.id} confirmada para ${hm(fr.ini)}. Ya está en la lista de citas del día.`); ir(PERFILES[E.sesion.perfil].ext ? '#/portal/citas' : '#/gate/citas'); return;
  }
  n.paso++; refrescar(); $('#titulo-pagina').focus();
};
ACC['nc-atras'] = () => { E.ui.nuevaCita.paso--; refrescar(); $('#titulo-pagina').focus(); };
ACC['nc-salir'] = () => { E.ui.nuevaCita = null; ir(PERFILES[E.sesion.perfil].ext ? '#/portal/citas' : '#/gate/citas'); };
R('/gate/estadia', {
  id: 'gate-estadia', t: 'Estadía por camión', area: ['gate', 'gate.ver'], mod: 'gate', ic: 'reloj', rf: ['RF-GAT-11', 'RF-GAT-12'], carga: true,
  vista: (p, q) => {
    const es = E.db.estadias; const prom = Math.round(es.reduce((s, x) => s + x.estadia, 0) / es.length); const porHora = {};
    es.forEach((x) => { const h = hm(Math.floor(x.entrada / 60) * 60); (porHora[h] ||= []).push(x.estadia); });
    if (q.v) setTimeout(() => { history.replaceState(null, '', '#/gate/estadia'); ACC['estadia-ver']({ dataset: { arg: q.v } }); }, 50);
    return `${encabezado('Estadía por camión', `Desde la entrada hasta la salida de cada camión. Promedio del turno: ${prom} minutos; meta del contrato: 45 (línea base: 78).`)}
      <div class="tarjeta" style="margin-bottom:16px">${gBarras({ titulo: 'Estadía promedio por hora de entrada (minutos)', datos: Object.entries(porHora).map(([h, xs]) => ({ e: h, v: Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) })), meta: 45, unidad: 'min' })}</div>
      ${tabla({ id: 'estadias', titulo: 'Visitas cerradas del turno', filas: es, ordenInicial: 'estadia', dirInicial: -1, porPagina: 10, columnas: [{ k: 'id', t: 'Visita', html: (f) => `<button type="button" class="enlace" data-acc="estadia-ver" data-arg="${f.id}">${f.id}</button>` }, { k: 'patente', t: 'Camión', html: (f) => `<span class="codigo">${f.patente}</span>` }, { k: 'cont', t: 'Contenedor', html: (f) => `<span class="codigo">${f.cont}</span>` }, { k: 'transporte', t: 'Empresa' }, { k: 'entrada', t: 'Entrada', v: (f) => hm(f.entrada) }, { k: 'salida', t: 'Salida', v: (f) => hm(f.salida) }, { k: 'estadia', t: 'Estadía (min)', n: true, html: (f) => `${f.estadia} ${f.estadia > 45 ? insig('Sobre 45', 'aviso') : ''}` }, { k: 'excepcion', t: 'Excepción', v: (f) => f.excepcion || '—' }], filtros: [{ k: 'tipo', t: 'Tipo' }, { k: 'transporte', t: 'Empresa' }] })}`;
  },
});
ACC['estadia-ver'] = (el) => {
  const x = E.db.estadias.find((e) => e.id === el.dataset.arg); if (!x) return; const v = visitaPorId(x.id);
  const evs = v ? v.eventos.slice().reverse() : [{ hora: hm(x.salida), t: 'Salida registrada', fuente: `Puesto de salida ${(x.puesto % 6) + 1}`, clase: 'destacado' }, { hora: hm(x.entrada + Math.round(x.estadia * 0.55)), t: 'Posición registrada por telemetría', fuente: 'Telemetría de la grúa de patio' }, { hora: hm(x.entrada + 4), t: 'Barrera abierta; destino asignado', fuente: `Puesto de entrada ${x.puesto}` }, { hora: hm(x.entrada), t: 'Entrada al gate', fuente: `Lector de patente, puesto ${x.puesto}` }];
  dialogo({ titulo: `Visita ${x.id} · estadía de ${x.estadia} minutos`, ancho: true, html: `<p><span class="codigo">${x.patente}</span> · <span class="codigo">${x.cont}</span> · ${esc(x.transporte)}</p>${lineaTiempo(evs, { etq: 'Eventos de origen de la estadía' })}${v ? `<p><a href="#/gate/visita/${v.id}">Abrir la visita completa</a></p>` : ''}` });
};
R('/gate/congestion', {
  id: 'gate-congestion', t: 'Congestión y capacidad', area: ['gate', 'gate.ver'], mod: 'gate', ic: 'ruta', rf: ['RF-GAT-13', 'RF-GAT-16'],
  vista: () => `${encabezado('Congestión y capacidad de franjas', 'Lo que se publica en el portal y la capacidad declarada por franja, que limita las citas que se ofrecen.', btn('Cambiar la capacidad declarada', { href: '#/admin/parametros', tipo: 'secundario', ic: 'ajustes' }))}
    <div class="reticula r2"><div class="tarjeta">${gBarras({ titulo: 'Espera por puesto de entrada (minutos)', datos: filasCongestion(), meta: 15, unidad: 'min', metaEt: 'Espera alta sobre' })}</div>
    <div class="tarjeta">${tabla({ id: 'franjas', titulo: 'Capacidad declarada por franja', filas: E.db.franjas.map((f) => ({ ...f, id: f.i, hora: hm(f.ini), libres: f.cap - f.res })), porPagina: 8, exportar: false, sinHerramientas: true, columnas: [{ k: 'hora', t: 'Franja', v: (f) => `${hm(f.ini)} – ${hm(f.fin)}` }, { k: 'cap', t: 'Capacidad', n: true }, { k: 'res', t: 'Reservadas', n: true }, { k: 'libres', t: 'Estado', html: (f) => (f.libres ? insig(`${f.libres} libres`, 'ok') : insig('Sin cupo: no se ofrece', 'error')) }] })}</div></div>`,
});

/* ---------------------------------------------------------------- patio y posición */
R('/patio', {
  id: 'patio-mapa', t: 'Mapa del patio', area: ['patio', 'patio.ver'], mod: 'gate', ic: 'patio', rf: ['RF-PAT-01', 'RF-PAT-03', 'RF-PAT-04'], carga: true,
  vista: () => {
    const horas = ['07', '08', '09', '10', '11', '12', '13', '14']; const r = azar(31);
    const valores = E.db.bloques.map((b) => horas.map((_, j) => Math.min(99, Math.round((b.ocup / b.cap) * 100 + (j - 3) * 1.5 + r.ent(-4, 4)))));
    return `${encabezado('Mapa del patio', '18 hectáreas, 12.400 TEU de capacidad. La posición de cada contenedor la registra la telemetría de los equipos, verificada por lectura óptica.')}
      <div class="reticula" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr);margin-bottom:16px"><div class="tarjeta"><h2>Bloques</h2><p class="detalle">Ocupación de cada bloque sobre su capacidad en TEU.</p><div class="mapa-patio">${E.db.bloques.map((b) => `<a class="bloque ${b.cerrado ? 'cerrado' : ''}" href="#/patio/condiciones"><strong>Bloque ${b.id}</strong><span class="detalle">${b.uso === 'Vacíos' ? 'Contenedores vacíos' : b.uso}</span><span class="ocup">${Math.round((b.ocup / b.cap) * 100)} % <small>ocupado</small></span>${b.cerrado ? insig('Cerrado', 'error') : ''}</a>`).join('')}</div></div>
      <form class="tarjeta" data-form="pos-buscar" novalidate><h2>Consulta de posición</h2>${campo({ id: 'pq', et: 'Contenedor', val: 'iso', req: true, ph: 'ATOU 482913 7' })}${btn('Consultar posición', { submit: true, ic: 'ubicacion' })}<div id="pq-res" aria-live="polite"></div></form></div>
      <div class="tarjeta">${gCalor({ titulo: 'Ocupación del patio por bloque y hora (%)', filas: E.db.bloques.map((b) => b.id), columnas: horas.map((h) => h + ':00'), valores })}</div>`;
  },
});
FORM['pos-buscar'] = (f) => {
  const i = $('#pq'); if (!validarCampo(i, true)) { i.focus(); return; } const r = buscarContenedor(i.value); const pos = posicionDe(r);
  $('#pq-res').innerHTML = pos ? `${msj('ok', pos.txt, 'Confianza: ' + pos.conf)}<a href="#/contenedor/${compacto(r.cod)}">Abrir la ficha del contenedor</a>` : msj('info', 'Sin posición en el patio', 'El contenedor no está en el patio o todavía no ingresa.');
};
R('/patio/condiciones', {
  id: 'patio-condiciones', t: 'Condiciones dinámicas', area: ['patio', 'patio.ver'], mod: 'gate', ic: 'alerta', rf: ['RF-PAT-07', 'RF-PAT-06'],
  vista: () => {
    const puede = perfilActual().areas.includes('patio.cond'); const s = E.ui.simCond;
    const proximos = E.db.visitas.filter((v) => v.paso < 5);
    return `${encabezado('Condiciones dinámicas del patio', 'El planificador declara una condición y ATOS cambia la asignación de posiciones al instante, sin desarrollo.')}
      <div class="reticula r2"><div class="tarjeta"><h2>Catálogo de condiciones</h2><ul class="lista-simple">${E.db.condiciones.map((c) => `<li><strong>${c.n}</strong><br><span class="detalle">${c.efecto}</span></li>`).join('')}</ul></div>
      <div class="tarjeta"><h2>Condiciones activas</h2>${E.db.condActivas.length ? `<ul class="lista-simple">${E.db.condActivas.map((a) => `<li class="fila-flex entre"><span><strong>${E.db.condiciones.find((c) => c.id === a.cond).n}</strong> · ${a.objetivo}<br><span class="detalle">De ${a.desde} a ${a.hasta} · declarada por ${a.por}</span></span>${puede ? btn('Retirar', { tipo: 'secundario', tam: 'chico', acc: 'cond-retirar', arg: a.id, id: 'cr-' + a.id }) : ''}</li>`).join('')}</ul>` : vacio('Sin condiciones activas', 'El patio opera con las reglas normales.')}</div></div>
      <div class="tarjeta" style="margin-top:16px"><h2>Declarar una condición</h2>${puede ? `<form data-form="cond-sim" novalidate><div class="form-fila">${campo({ id: 'cd-cond', et: 'Condición', tipo: 'select', opciones: E.db.condiciones.filter((c) => c.param === 'bloque').map((c) => [c.id, c.n]), valor: s?.cond || 'CD-01' })}${campo({ id: 'cd-bloque', et: 'Bloque', tipo: 'select', opciones: E.db.bloques.map((b) => [b.id, 'Bloque ' + b.id]), valor: s?.bloque || 'C' })}${campo({ id: 'cd-desde', et: 'Desde', tipo: 'time', valor: '10:45' })}${campo({ id: 'cd-hasta', et: 'Hasta', tipo: 'time', valor: '14:45' })}</div>
        <div class="grupo-botones">${btn('Simular el efecto', { submit: true, tipo: 'secundario', ic: 'ojo' })}${s ? btn('Declarar la condición', { tipo: 'clave', acc: 'cond-declarar', id: 'b-declarar' }) : ''}</div></form>
        ${s ? `<h3 style="margin-top:16px">Efecto en la asignación de los próximos camiones</h3><div class="desplaza" role="region" aria-label="Efecto de la condición" tabindex="0"><table><caption class="sr">Antes y después de la condición</caption><thead><tr><th scope="col">Visita</th><th scope="col">Contenedor</th><th scope="col">Asignación actual</th><th scope="col">Con la condición</th></tr></thead><tbody>${s.efecto.map((x) => `<tr><th scope="row">${x.id}</th><td class="codigo">${x.cont}</td><td>${x.antes}</td><td>${x.antes !== x.despues ? `<strong>${x.despues}</strong> ${insig('Cambia', 'aviso')}` : x.despues}</td></tr>`).join('')}</tbody></table></div>` : ''}`
        : msj('info', 'Solo el planificador declara condiciones', 'Tu perfil puede ver las condiciones activas y su efecto.')}</div>`;
  },
});
FORM['cond-sim'] = () => {
  const cond = $('#cd-cond').value, bloque = $('#cd-bloque').value; const b = E.db.bloques.find((x) => x.id === bloque); const prev = b.cerrado;
  const antes = E.db.visitas.filter((v) => v.paso < 5).map((v) => ({ id: v.id, cont: v.cont, antes: textoPos(asignarPosicion(v)) }));
  if (cond === 'CD-01') b.cerrado = true; const tmp = { id: 'tmp', cond, objetivo: 'Bloque ' + bloque }; if (cond === 'CD-02') E.db.condActivas.push(tmp);
  const despues = E.db.visitas.filter((v) => v.paso < 5).map((v) => textoPos(asignarPosicion(v)));
  b.cerrado = prev; E.db.condActivas = E.db.condActivas.filter((x) => x !== tmp);
  E.ui.simCond = { cond, bloque, desde: $('#cd-desde').value, hasta: $('#cd-hasta').value, efecto: antes.map((a, i) => ({ ...a, despues: despues[i] })) };
  refrescar(); $('#b-declarar')?.focus(); anunciar('Simulación lista: revisa el efecto antes de declarar.');
};
ACC['cond-declarar'] = async () => {
  const s = E.ui.simCond; const c = E.db.condiciones.find((x) => x.id === s.cond);
  if (!(await confirmar({ titulo: 'Declarar la condición', texto: `${c.n} en el bloque ${s.bloque}, de ${s.desde} a ${s.hasta}. ATOS cambia la asignación desde ahora.`, si: 'Declarar' }))) return;
  if (s.cond === 'CD-01') E.db.bloques.find((b) => b.id === s.bloque).cerrado = true;
  E.db.condActivas.push({ id: uid('CA-'), cond: s.cond, objetivo: 'Bloque ' + s.bloque, desde: s.desde, hasta: s.hasta, por: persona().n });
  auditar('Condición de patio declarada', `${c.n} · bloque ${s.bloque}`); notificar(`Condición declarada: ${c.n} en el bloque ${s.bloque}`, '#/patio/condiciones', ['supervisor', 'jefatura', 'gate']); E.ui.simCond = null; aviso('Condición declarada. Las próximas asignaciones ya la consideran.'); refrescar();
};
ACC['cond-retirar'] = (el) => { const a = E.db.condActivas.find((x) => x.id === el.dataset.arg); if (a.cond === 'CD-01') E.db.bloques.find((b) => 'Bloque ' + b.id === a.objetivo).cerrado = false; E.db.condActivas = E.db.condActivas.filter((x) => x !== a); auditar('Condición de patio retirada', a.objetivo); aviso('Condición retirada.'); refrescar(); };
R('/patio/verificaciones', {
  id: 'patio-verificaciones', t: 'Verificaciones físicas', area: ['patio.verif', 'patio.ver'], mod: 'gate', ic: 'ojo', rf: ['RF-PAT-02', 'RF-PAT-03', 'RF-PAT-04'],
  vista: () => `${encabezado('Verificaciones físicas', 'Cuando la lectura óptica no coincide con la telemetría, o la confianza baja, ATOS crea una tarea de verificación en terreno.')}
    ${tabla({ id: 'verif', titulo: 'Tareas de verificación', filas: E.db.verificaciones, exportar: false, columnas: [{ k: 'id', t: 'Tarea' }, { k: 'cont', t: 'Contenedor', html: (f) => `<a class="codigo" href="#/contenedor/${compacto(f.cont)}">${f.cont}</a>` }, { k: 'motivo', t: 'Motivo' }, { k: 'esperada', t: 'Posición registrada' }, { k: 'leida', t: 'Posición leída' }, { k: 'estado', t: 'Estado', html: (f) => insig(f.estado, f.estado === 'Resuelta' ? 'ok' : 'aviso') }, { k: 'a', t: 'Acción', orden: false, html: (f) => (f.estado === 'Pendiente' && perfilActual().areas.includes('patio.verif') ? btn('Registrar resultado', { tipo: 'secundario', tam: 'chico', acc: 'verif-resolver', arg: f.id, id: 'vr-' + f.id }) : '—') }], filtros: [{ k: 'estado', t: 'Estado' }] })}`,
});
ACC['verif-resolver'] = async (el) => {
  const v = E.db.verificaciones.find((x) => x.id === el.dataset.arg);
  const r = await dialogo({ titulo: `Resultado de la verificación ${v.id}`, html: `<p><span class="codigo">${v.cont}</span>: ${esc(v.motivo)}.</p><fieldset><legend>¿Dónde está el contenedor?</legend><label class="opcion"><input type="radio" name="vres" value="leida" checked> En la posición leída (${v.leida})</label><label class="opcion"><input type="radio" name="vres" value="esperada"> En la posición registrada (${v.esperada})</label><label class="opcion"><input type="radio" name="vres" value="no"> No lo encontré</label></fieldset>`, botones: [{ t: 'Cancelar', v: null, tipo: 'secundario' }, { t: 'Registrar', tipo: 'clave', v: (c) => $('[name="vres"]:checked', c).value }] });
  if (!r) return; v.estado = r === 'no' ? 'Escalada' : 'Resuelta'; auditar('Verificación física registrada', `${v.id} · ${r}`); aviso(r === 'no' ? 'Escalada a la jefatura: contenedor no encontrado.' : 'Verificación resuelta; la posición quedó corregida y la confianza vuelve a alta.'); refrescar();
};
R('/patio/remociones', { id: 'patio-remociones', t: 'Remociones programadas', area: ['patio', 'patio.ver'], mod: 'gate', ic: 'actualizar', rf: ['RF-PAT-10', 'RF-INS-03'], vista: () => `${encabezado('Remociones programadas', 'Las remociones son el 18 % de los movimientos de patio; la meta es 14 % o menos. Cada una tiene su motivo.')}${tabla({ id: 'remo', titulo: 'Remociones', filas: E.db.remociones, columnas: [{ k: 'id', t: 'Remoción' }, { k: 'cont', t: 'Contenedor', html: (f) => `<span class="codigo">${f.cont}</span>` }, { k: 'motivo', t: 'Motivo' }, { k: 'desde', t: 'Desde' }, { k: 'hacia', t: 'Hacia' }, { k: 'hora', t: 'Hora' }, { k: 'movs', t: 'Movimientos', n: true }, { k: 'estado', t: 'Estado', html: (f) => insig(f.estado, f.estado === 'En ejecución' ? 'solido' : 'info') }] })}` });
R('/patio/barrido', {
  id: 'patio-barrido', t: 'Barrido de bloques', area: ['patio', 'patio.ver'], mod: 'gate', ic: 'buscar', rf: ['RF-CON-09', 'RF-PAT-02'],
  vista: () => { const b = E.db.barridos; const enCurso = E.ui.barrido; return `${encabezado('Barrido de bloques', 'Se congela el bloque, se lee cada contenedor y ATOS concilia lo leído con lo registrado. Las diferencias pasan a verificación física.')}
    ${tabla({ id: 'barridos', titulo: 'Barridos del día', filas: b.map((x) => ({ ...x, id: x.bloque })), exportar: false, columnas: [{ k: 'bloque', t: 'Bloque' }, { k: 'estado', t: 'Estado', html: (f) => insig(f.estado, f.estado === 'Conciliado' ? 'ok' : f.estado === 'Congelado' ? 'error' : 'info') }, { k: 'hora', t: 'Horario' }, { k: 'esperados', t: 'Esperados', n: true }, { k: 'leidos', t: 'Leídos', n: true }, { k: 'difer', t: 'Diferencias', n: true }, { k: 'a', t: 'Acción', orden: false, html: (f) => (f.estado === 'Programado' && perfilActual().areas.includes('patio') ? btn('Congelar e iniciar', { tipo: 'clave', tam: 'chico', acc: 'barrido-ini', arg: f.bloque, id: 'bi-' + f.bloque }) : f.estado === 'Congelado' ? btn('Conciliar y descongelar', { tipo: 'secundario', tam: 'chico', acc: 'barrido-fin', arg: f.bloque, id: 'bf-' + f.bloque }) : '—') }] })}
    ${enCurso ? `<div class="tarjeta" style="margin-top:16px">${progreso(enCurso.leidos, enCurso.esperados, `Leyendo el bloque ${enCurso.bloque}`, { texto: `${num(enCurso.leidos)} de ${num(enCurso.esperados)}` })}</div>` : ''}`; },
});
ACC['barrido-ini'] = async (el) => { const b = E.db.barridos.find((x) => x.bloque === el.dataset.arg); if (!(await confirmar({ titulo: `Congelar el bloque ${b.bloque}`, critico: true, texto: 'Mientras dure el barrido, ATOS no asigna posiciones en el bloque ni acepta movimientos que no sean del barrido.', si: 'Congelar e iniciar' }))) return; b.estado = 'Congelado'; b.hora = '10:46 a —'; b.leidos = 1011; b.difer = 1; E.ui.barrido = { bloque: b.bloque, esperados: b.esperados, leidos: 1011 }; auditar('Bloque congelado para barrido', 'Bloque ' + b.bloque); aviso(`Bloque ${b.bloque} congelado; barrido en ejecución.`); refrescar(); };
ACC['barrido-fin'] = (el) => { const b = E.db.barridos.find((x) => x.bloque === el.dataset.arg); b.estado = 'Conciliado'; b.hora = '10:46 a 11:18'; b.nota = 'Una diferencia enviada a verificación física'; E.ui.barrido = null; E.db.verificaciones.unshift({ id: 'VF-0935', cont: codigoISO('ECSU', '612077'), motivo: `Barrido del bloque ${b.bloque}: leído en una bahía distinta`, esperada: 'B-04-02-2', leida: 'B-05-02-2', estado: 'Pendiente', asignada: 'Jorge Saavedra Pino', hora: '11:18', prioridad: 'Media' }); auditar('Barrido conciliado', 'Bloque ' + b.bloque); aviso('Barrido conciliado: 1 diferencia pasó a verificación física.', '', { href: '#/patio/verificaciones', enlace: 'Ver verificaciones' }); refrescar(); };

/* ---------------------------------------------------------------- núcleo operacional y tractocamiones */
R('/patio/movimientos', {
  id: 'nucleo', t: 'Núcleo operacional', area: ['nucleo', 'nucleo.ver'], mod: 'gate', ic: 'antena', rf: ['RF-PAT-05', 'RF-PAT-12', 'RF-PAT-13', 'RF-TRA-04', 'RF-TRA-06', 'RF-INT-08'],
  vista: () => { const porEq = {}; E.db.movimientos.forEach((m) => { porEq[m.equipo] = (porEq[m.equipo] || 0) + 1; });
    return `${encabezado('Núcleo operacional', 'Cada movimiento lo registra la telemetría del equipo, con el código ISO 6346 del contenedor. El alta manual está bloqueada.', btn('Registrar un movimiento a mano', { tipo: 'secundario', acc: 'mov-manual', ic: 'candado', id: 'b-manual' }))}
      <div class="reticula r2" style="margin-bottom:16px"><div class="tarjeta">${gBarras({ titulo: 'Movimientos por equipo en la última hora', datos: Object.entries(porEq).map(([e, v]) => ({ e, v: v * 4 })), unidad: 'mov' })}</div>
      <div class="tarjeta"><h2>Detenciones de grúa por espera de equipo</h2>${tabla({ id: 'deten', titulo: 'Detenciones de grúa', filas: E.db.detenciones.map((d, i) => ({ ...d, id: i })), exportar: false, sinHerramientas: true, columnas: [{ k: 'grua', t: 'Grúa' }, { k: 'desde', t: 'Desde' }, { k: 'min', t: 'Minutos', n: true }, { k: 'causa', t: 'Causa' }] })}</div></div>
      ${tabla({ id: 'movs', titulo: 'Movimientos registrados por telemetría', filas: E.db.movimientos, columnas: [{ k: 'id', t: 'Movimiento' }, { k: 'hora', t: 'Hora' }, { k: 'cont', t: 'Contenedor', html: (f) => `<a class="codigo" href="#/contenedor/${compacto(f.cont)}">${f.cont}</a>` }, { k: 'tipo', t: 'Tipo' }, { k: 'equipo', t: 'Equipo' }, { k: 'fuente', t: 'Fuente' }, { k: 'confianza', t: 'Confianza', html: (f) => insig(f.confianza, f.confianza === 'Alta' ? 'ok' : 'aviso') }], filtros: [{ k: 'equipo', t: 'Equipo' }, { k: 'tipo', t: 'Tipo' }] })}`; },
});
ACC['mov-manual'] = () => { auditar('Intento de alta manual de movimiento', '—', 'Rechazado: solo telemetría'); dialogo({ titulo: 'El alta manual de movimientos está bloqueada', critico: true, html: `${msj('error', 'No se puede registrar un movimiento a mano', 'Los movimientos los registra solo la telemetría de los equipos, para que la posición y la evidencia facturable sean confiables. El intento quedó en la auditoría.')}<p>Si un equipo no reporta, crea una verificación física desde el mapa del patio.</p>` }); };
R('/patio/tractos', {
  id: 'tractos', t: 'Despacho de tractocamiones', area: 'tractos', mod: 'gate', ic: 'camion', rf: ['RF-TRA-01', 'RF-TRA-02', 'RF-TRA-05'],
  vista: () => `${encabezado('Despacho de tractocamiones', 'ATOS asigna cada tractocamión al próximo movimiento de grúa según su posición y su estado, y lo reasigna si queda indisponible.', btn('Simular la indisponibilidad de TC-14', { tipo: 'secundario', acc: 'tracto-falla', ic: 'herramienta', id: 'b-tracto' }))}
    ${E.ui.reasignado ? msj('ok', 'Reasignación automática', E.ui.reasignado) : ''}
    ${tabla({ id: 'tractos', titulo: 'Tractocamiones del muelle', filas: E.db.tractos, exportar: false, columnas: [{ k: 'id', t: 'Tractocamión' }, { k: 'estado', t: 'Estado', html: (f) => insig(f.estado, f.estado === 'Asignado' ? 'solido' : f.estado === 'Disponible' ? 'ok' : 'aviso') }, { k: 'grua', t: 'Grúa' }, { k: 'mov', t: 'Movimiento asignado', html: (f) => (f.mov ? esc(f.mov) : '—') }, { k: 'pos', t: 'Posición' }, { k: 'eta', t: 'Llega a la grúa en', v: (f) => (f.estado === 'Asignado' ? f.eta + ' min' : '—') }], filtros: [{ k: 'estado', t: 'Estado' }, { k: 'grua', t: 'Grúa' }] })}`,
});
ACC['tracto-falla'] = () => { const a = E.db.tractos.find((t) => t.id === 'TC-14'); const b = E.db.tractos.find((t) => t.estado === 'Disponible'); if (!b || a.estado !== 'Asignado') { aviso('No hay un tractocamión disponible para reasignar.', 'error'); return; } b.estado = 'Asignado'; b.mov = a.mov; b.grua = a.grua; b.eta = 2; a.estado = 'Indisponible'; a.mov = ''; E.ui.reasignado = `TC-14 reportó una falla. Su movimiento pasó a ${b.id}, el disponible más cercano a la grúa ${b.grua}: llega en 2 minutos.`; auditar('Reasignación automática de tractocamión', `TC-14 → ${b.id}`); aviso(E.ui.reasignado); refrescar(); };

/* ---------------------------------------------------------------- innovaciones IN-02 e IN-03 */
R('/in02', {
  id: 'in02', t: 'Citas a tres bandas', area: ['in02', 'in02.ext'], mod: 'gate', ic: 'personas', rf: ['RF-GAT-01', 'RF-GAT-16'],
  vista: () => { const cs = E.db.citas.filter((c) => c.tresBandas).slice(0, 8); const ext = perfilActual().ext;
    return `${encabezadoAmplio('Cita convenida a tres bandas', 'La cita es un acuerdo entre el dueño de la carga, el transportista y el terminal: la confirmación de carga lista del dueño libera la franja del camión, y si no llega a tiempo, la franja se reprograma sola.')}
      ${tabla({ id: 'tresb', titulo: 'Citas a tres bandas de hoy', filas: cs.map((c) => ({ ...c, hora: hm(E.db.franjas[c.franja].ini), carga: c.cargaLista ? 'Confirmada' : c.estado === 'Reprogramada' ? 'No llegó a tiempo' : 'Esperando' })), exportar: false, columnas: [{ k: 'id', t: 'Cita' }, { k: 'hora', t: 'Franja' }, { k: 'patente', t: 'Camión', html: (f) => `<span class="codigo">${f.patente}</span>` }, { k: 'transporte', t: 'Transportista' }, { k: 'carga', t: 'Carga lista', html: (f) => insig(f.carga, f.carga === 'Confirmada' ? 'ok' : f.carga === 'Esperando' ? 'info' : 'aviso') }, { k: 'estado', t: 'Franja', html: (f) => insigCita(f.cargaLista ? 'Liberada' : f.estado) }, { k: 'a', t: 'Acción', orden: false, html: (f) => (!f.cargaLista && f.estado !== 'Reprogramada' ? `${btn(ext ? 'Confirmar carga lista' : 'Confirmar como dueño de la carga', { tipo: 'secundario', tam: 'chico', acc: 'tb-confirmar', arg: f.id, id: 'tbc-' + f.id })} ${btn('Sin confirmación a tiempo', { tipo: 'terciario', acc: 'tb-vence', arg: f.id, id: 'tbv-' + f.id })}` : '—') }] })}`; },
});
ACC['tb-confirmar'] = (el) => { const c = E.db.citas.find((x) => x.id === el.dataset.arg); c.cargaLista = true; auditar('Carga lista confirmada (IN-02)', c.id); notificar(`Franja liberada para ${c.patente}: la carga está lista`, '#/in02', ['transporte', 'gate']); aviso(`Carga lista confirmada: la franja de ${c.patente} quedó liberada y el transportista fue avisado.`); refrescar(); };
ACC['tb-vence'] = (el) => { const c = E.db.citas.find((x) => x.id === el.dataset.arg); reprogramar(c.id); notificar(`La cita ${c.id} se reprogramó: no llegó la confirmación de carga lista`, '#/in02', ['transporte', 'carga']); aviso(`Sin confirmación a tiempo: ATOS reprogramó la cita ${c.id} a la siguiente franja con cupo y avisó a las tres partes.`); refrescar(); };
const ESCENARIOS = [
  { id: 'base', n: 'Operación calibrada de hoy', est: 47, fila: 18, rem: 15.2, movh: 27.4, emis: 11.6 },
  { id: 'cerrarC', n: 'Cerrar el bloque C por 4 horas', est: 52, fila: 26, rem: 16.8, movh: 26.1, emis: 12.1 },
  { id: 'cap50', n: 'Capacidad de 50 camiones por franja de 07:00 a 10:00', est: 44, fila: 11, rem: 15.4, movh: 27.6, emis: 11.7 },
  { id: 'elec', n: 'Equipos eléctricos en los ciclos de mayor intensidad', est: 47, fila: 18, rem: 15.1, movh: 27.5, emis: 11.1 },
];
R('/patio/gemelo', {
  id: 'gemelo', t: 'Gemelo de operación', area: 'gemelo', mod: 'gate', ic: 'gemelo', rf: ['RF-CON-11'],
  vista: () => { const g = E.ui.gemelo; const base = ESCENARIOS[0];
    return `${encabezadoAmplio('Gemelo de operación del Terminal Aconcagua', 'Un modelo del terminal calibrado con la telemetría real, para ensayar un cambio antes de tocar la operación.')}
      ${msj('info', 'Sin autoridad operacional', 'El gemelo lee de los almacenes de datos y no escribe en la operación. Cada resultado declara su error de calibración.')}
      <form class="tarjeta" data-form="gemelo" novalidate><h2>Escenario a ensayar</h2><fieldset><legend>Elige un escenario</legend>${ESCENARIOS.slice(1).map((e, i) => `<label class="opcion"><input type="radio" name="esc" value="${e.id}" ${i === 0 ? 'checked' : ''}> ${e.n}</label>`).join('')}</fieldset>${btn('Simular el escenario', { submit: true, tipo: 'clave', ic: 'reproducir', id: 'b-gemelo', disabled: g?.corriendo })}</form>
      ${g?.corriendo ? `<div class="tarjeta" style="margin-top:16px">${progreso(1, 3, 'Simulando un turno completo con eventos discretos…', { indet: true, texto: 'En curso' })}</div>` : ''}
      ${g?.res ? `<div class="tarjeta" style="margin-top:16px"><h2>Comparación con la operación calibrada</h2><p class="detalle">Error de calibración declarado: ± 6 % sobre la estadía y ± 4 % sobre los movimientos por hora (contraste con las últimas cuatro semanas).</p>
        <div class="desplaza" role="region" aria-label="Comparación de escenarios" tabindex="0"><table><caption class="sr">Escenario frente a la operación calibrada</caption><thead><tr><th scope="col">Indicador</th><th scope="col" class="n">${base.n}</th><th scope="col" class="n">${g.res.n}</th><th scope="col">Efecto</th></tr></thead><tbody>
        ${[['Estadía del camión (min)', 'est', true], ['Fila máxima en el acceso (camiones)', 'fila', true], ['Remociones (%)', 'rem', true], ['Productividad de grúa (mov/h)', 'movh', false], ['Intensidad de carbono (kg CO₂e por contenedor)', 'emis', true]].map(([n, k, menor]) => { const d = g.res[k] - base[k]; const mejor = menor ? d < 0 : d > 0; return `<tr><th scope="row">${n}</th><td class="n">${num(base[k], 1)}</td><td class="n">${num(g.res[k], 1)}</td><td>${d === 0 ? insig('Sin cambio', 'info') : mejor ? insig('Mejora', 'ok') : insig('Empeora', 'aviso')}</td></tr>`; }).join('')}</tbody></table></div></div>` : ''}`; },
});
FORM.gemelo = (f) => { const id = $('[name="esc"]:checked', f).value; E.ui.gemelo = { corriendo: true }; refrescar(); setTimeout(() => { E.ui.gemelo = { res: ESCENARIOS.find((e) => e.id === id) }; auditar('Simulación en el gemelo de operación', ESCENARIOS.find((e) => e.id === id).n); anunciar('Simulación terminada.'); refrescar(); }, 1200); };
