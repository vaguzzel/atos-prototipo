/* ATOS · capa pública y acceso: portal público, congestión, verificación de certificados, inicio de sesión,
   segundo factor, recuperación y registro de una organización externa. Todo en español e inglés. */
'use strict';

function estadoPublico(cod) { // estado mínimo y seguro: sin posición exacta, contenido, ruta ni datos comerciales
  const db = E.db; const c = cod;
  const v = db.visitas.find((x) => x.cont === c); if (v) return v.paso >= 7 ? T('Recibido en el terminal; en espera de embarque', 'Received at the terminal; awaiting loading') : v.paso >= 3 ? T('En proceso de ingreso por el gate', 'Being received at the gate') : T('Anunciado para ingreso por el gate', 'Announced for gate-in');
  const rt = db.retiros.find((x) => x.cont === c); if (rt) return rt.paso >= 5 ? T('Retirado del terminal', 'Picked up from the terminal') : T('En el terminal; disponible para retiro con cita', 'At the terminal; available for pickup with an appointment');
  for (const tb of db.tableros) for (const tm of tb.tomas) if (tm.cont?.cont === c) return T('En el terminal; contenedor refrigerado conectado', 'At the terminal; reefer container plugged in');
  if (db.inspecciones.some((i) => i.cont === c) || db.hechos.some((h) => h.cont === c)) return T('En el terminal', 'At the terminal');
  return null;
}
function filasCongestion() { return [[1, 6], [2, 9], [3, 7], [4, 13], [5, 11], [6, 24], [7, 8], [8, 5]].map(([n, m]) => ({ e: T(`Puesto ${n}`, `Lane ${n}`), v: m })); }
function franjasLibres(n = 8) { return E.db.franjas.filter((f) => f.ini >= 600).slice(0, n); }

R('/', {
  id: 'publico', t: ['Portal público', 'Public portal'], layout: 'publico', area: 'publica', bilingue: true, rf: ['RF-POR-01', 'RF-POR-07', 'RF-GAT-13', 'RF-INT-08'],
  vista: (p, q) => {
    if (q.lang === 'en' && IDIOMA !== 'en') fijarIdioma('en');
    const cong = filasCongestion(); const libres = franjasLibres(); const META = 15; const ESCALA = 30;
    const prom = Math.round(cong.reduce((s, d) => s + d.v, 0) / cong.length);
    const altos = cong.filter((d) => d.v > META); const peor = cong.reduce((a, b) => (b.v > a.v ? b : a));
    const pasosLlegada = [
      ['cita', 'cielo', T('Cita vigente', 'Valid appointment'), T('Para la franja en que llegas.', 'For the slot you arrive in.')],
      ['documentos', 'crema', T('Documentación validada', 'Validated documents'), T('Antes de salir a la ruta.', 'Before you leave.')],
      ['conductor', 'cielo', T('Conductor habilitado', 'Authorized driver'), T('Con su credencial al día.', 'With an up-to-date credential.')],
      ['epp', 'crema', T('Protección personal', 'Protective equipment'), T('Al bajar de la cabina.', 'When leaving the cab.')],
    ];
    const cq = q.c ? validarContenedor(q.c) : null;
    return `<section class="portada" aria-labelledby="titulo-pagina">${capaAgua()}<div class="interior-portada">
      <div class="lema"><h1 tabindex="-1" id="titulo-pagina" class="emblema"><span class="sr">ATOS, Terminal Portuario Aconcagua</span>${emblemaATOS()}</h1>
        <p class="bajada">${T('ATOS es el sistema con que opera el terminal. Aquí puedes consultar tu contenedor, revisar la espera en el gate y verificar un certificado de cadena de frío, sin crear una cuenta.', 'ATOS is the system the terminal runs on. Here you can look up your container, check the gate wait and verify a cold chain certificate, without an account.')}</p>
        <div class="grupo-botones">${btn(T('Ingresar a ATOS', 'Sign in to ATOS'), { href: '#/ingresar', tipo: 'clave', flecha: true })}${btn(T('Registrar mi organización', 'Register my organization'), { href: '#/registro', tipo: 'secundario' })}</div></div>
      <div class="lienzo">${escenaPuerto()}</div>
    </div></section>
    <div class="consulta-flotante"><form id="f-consulta" data-form="consulta" novalidate aria-labelledby="t-consulta">
      <div class="cabeza">${sello('contenedor', 'crema')}<div><h2 id="t-consulta">${T('Estado de un contenedor', 'Container status')}</h2><p class="detalle">${T('Por seguridad, la consulta pública no muestra la posición, el contenido, la ruta ni datos comerciales.', 'For security, the public lookup does not show position, contents, route or commercial data.')}</p></div></div>
      <div class="linea-consulta">${campo({ id: 'c-num', et: T('Número de contenedor', 'Container number'), ayuda: T('4 letras y 7 números, como aparece en el costado. Ejemplo: ATOU 482913 7.', '4 letters and 7 digits, as painted on the side. Example: ATOU 482913 7.'), val: 'iso', req: true, ph: 'ATOU 482913 7', valor: cq?.ok ? cq.codigo : '' })}
        ${btn(T('Consultar', 'Check'), { submit: true, ic: 'buscar', id: 'b-consultar' })}</div>
      <div id="c-res" aria-live="polite"></div></form></div>
    <section class="seccion-publica" aria-labelledby="t-gate">
      <div class="cabeza-seccion"><p class="antetitulo">${T('Se actualiza cada minuto', 'Updated every minute')}</p><h2 id="t-gate">${T('El gate <em>ahora</em>', 'The gate <em>now</em>')}</h2></div>
      <ul class="cifras">
        <li><span class="cifra">${prom}<small> min</small></span><span>${T(`espera promedio en los ${cong.length} puestos de entrada`, `average wait across the ${cong.length} entry lanes`)}</span></li>
        <li class="${altos.length ? 'alerta' : ''}"><span class="cifra">${altos.length}<small> ${T('de', 'of')} ${cong.length}</small></span><span>${altos.length ? T(`puestos con espera alta, sobre ${META} min: ${peor.e}, con ${peor.v} min`, `lanes with a long wait, above ${META} min: ${peor.e}, ${peor.v} min`) : T(`puestos con espera alta, sobre ${META} min`, `lanes with a long wait, above ${META} min`)}</span></li>
        <li><span class="cifra">3</span><span>${T('camiones en el carril de excepción, sin ocupar un puesto', 'trucks in the exception lane, without taking a lane')}</span></li>
      </ul>
      <div class="reticula r2">
        <div class="tarjeta"><h3 id="t-espera">${T('Espera por puesto de entrada', 'Wait per entry lane')}</h3><p class="detalle">${T(`Minutos de espera estimada. La línea punteada marca la espera alta, sobre ${META} min.`, `Estimated wait in minutes. The dotted line marks a long wait, above ${META} min.`)}</p>
          <ul class="barras-h" aria-labelledby="t-espera">${cong.map((d) => { const alta = d.v > META; return `<li class="${alta ? 'alta' : ''}"><span class="et">${d.e}</span><span class="riel" aria-hidden="true"><span class="valor-barra" style="width:${Math.min(100, (d.v / ESCALA) * 100).toFixed(1)}%"></span><span class="marca-meta" style="left:${((META / ESCALA) * 100).toFixed(1)}%"></span></span><span class="val">${d.v} min${alta ? ` ${insig(T('Alta', 'Long'), 'error', 'alerta')}` : ''}</span></li>`; }).join('')}</ul>
          ${btn(T('Ver el detalle y el acceso vial', 'See details and road access'), { href: '#/publico/congestion', tipo: 'terciario' })}</div>
        <div class="tarjeta"><h3 id="t-franjas">${T('Franjas de cita libres hoy', 'Appointment slots free today')}</h3><p class="detalle">${T('Las franjas sin cupo no se ofrecen. Las empresas de transporte reservan desde su portal.', 'Full slots are not offered. Transport companies book from their portal.')}</p>
          <ul class="franjas" aria-labelledby="t-franjas">${libres.map((f) => { const l = f.cap - f.res; const est = !l ? 'sin' : l < 8 ? 'pocos' : 'libre'; return `<li class="franja ${est}"><span class="hora">${hm(f.ini)}–${hm(f.fin)}</span><span class="cupos">${l} ${l === 1 ? T('cupo', 'slot') : T('cupos', 'slots')}</span><span class="estado">${est === 'sin' ? ic('cerrar') + T('Sin cupo', 'Full') : est === 'pocos' ? ic('exclama') + T('Pocos cupos', 'Few left') : ic('check') + T('Disponible', 'Available')}</span></li>`; }).join('')}</ul></div>
      </div>
    </section>
    <section class="seccion-publica" aria-labelledby="t-antes">
      <div class="cabeza-seccion"><p class="antetitulo">${T('Para entrar con un camión', 'To enter with a truck')}</p><h2 id="t-antes">${T('Antes de <em>salir a la ruta</em>', 'Before you <em>hit the road</em>')}</h2></div>
      <div class="ruta-llegada"><div class="ruta-extremo">${sello('transportista', 'coral')}<span class="txt">${T('Tu origen', 'Your origin')}</span></div>
        <ol aria-label="${T('Lo que necesitas para entrar', 'What you need to enter')}">${pasosLlegada.map(([icono, tono, t, d]) => `<li>${sello(icono, tono)}<h3>${t}</h3><p>${d}</p></li>`).join('')}</ol>
        <div class="ruta-extremo">${sello('barrera', 'coral')}<span class="txt">${T('Gate del terminal', 'Terminal gate')}</span></div></div>
      <div class="reticula r2">
        <div class="tarjeta"><h3>${T('Preguntas frecuentes', 'Frequently asked questions')}</h3>
        ${acordeon([
          { t: T('¿Qué pasa si falta un documento?', 'What happens if a document is missing?'), html: `<p>${T('El camión pasa al carril de excepción sin ocupar un puesto del gate. ATOS avisa a la agencia de aduana y, cuando sube el documento, el camión vuelve a la fila conservando su franja.', 'The truck moves to the exception lane without taking a gate lane. ATOS notifies the customs agency; once the document is uploaded the truck returns to the queue keeping its slot.')}</p>` },
          { t: T('¿Cómo verifico un certificado de cadena de frío?', 'How do I verify a cold chain certificate?'), html: `<p>${T('Con el código del certificado, en la página de verificación pública. No necesitas una cuenta.', 'With the certificate code, on the public verification page. No account needed.')}</p>${btn(T('Verificar un certificado', 'Verify a certificate'), { href: '#/verificar', tipo: 'secundario' })}` },
          { t: T('¿Cómo registro a mi organización?', 'How do I register my organization?'), html: `<p>${T('Con el registro en línea: eliges el tipo de organización, ingresas sus datos y los de su representante, y activas el segundo factor. Puedes guardar y seguir después.', 'With the online registration: choose the organization type, enter its details and those of its representative, and turn on the second factor. You can save and continue later.')}</p>${btn(T('Registrar mi organización', 'Register my organization'), { href: '#/registro', tipo: 'secundario' })}` },
        ])}</div>
        <div class="tarjeta crema"><h3>${T('Horarios y avisos', 'Hours and notices')}</h3>
        <ul class="lista-simple"><li><strong>${T('Gate', 'Gate')}</strong>: ${T('24 horas, todos los días.', '24 hours, every day.')}</li><li><strong>${T('Oficina de documentación', 'Documentation office')}</strong>: ${T('lunes a viernes, de 08:00 a 18:00.', 'Monday to Friday, 08:00 to 18:00.')}</li>
        <li>${insig(T('Aviso', 'Notice'), 'aviso')} ${T('Temporada de fruta: mayor demanda de franjas entre las 07:00 y las 10:00.', 'Fruit season: higher slot demand between 07:00 and 10:00.')}</li>
        <li>${insig(T('Aviso', 'Notice'), 'info')} ${T('Cierre de recepción de la nave Cóndor Austral: martes 7 de diciembre, 08:00.', 'Receiving cut-off for the vessel Cóndor Austral: Tuesday, December 7, 08:00.')}</li>
        <li>${insig(T('Aviso', 'Notice'), 'info')} ${T('Mantenimiento del puesto de entrada 7: miércoles 8, de 02:00 a 04:00.', 'Maintenance of entry lane 7: Wednesday 8, 02:00 to 04:00.')}</li></ul></div>
      </div>
    </section>`;
  },
  montar: (p, q) => { if (q.c) setTimeout(() => { const f = $('#f-consulta'); if (!f) return; f.scrollIntoView({ block: 'center' }); f.requestSubmit(); }, 80); },
});
FORM.consulta = async (f) => {
  const inp = $('#c-num', f); if (!validarCampo(inp, true)) { inp.focus(); return; }
  const v = validarContenedor(inp.value); const res = $('#c-res'); const b = $('#b-consultar'); b.setAttribute('aria-busy', 'true');
  res.innerHTML = esqueleto(1); await new Promise((r) => setTimeout(r, 450)); b.removeAttribute('aria-busy');
  const est = estadoPublico(v.codigo);
  res.innerHTML = est ? msj('ok', `${v.codigo}: ${est}`, T(`Última actualización: hoy, ${hm(642)}.`, `Last update: today, ${hm(642)}.`) + ' ' + T('Para ver posición, documentos y evidencia, ingresa con tu cuenta.', 'To see position, documents and evidence, sign in.'))
    : msj('info', T(`${v.codigo}: sin registro en el terminal`, `${v.codigo}: no record at the terminal`), T('El número es válido, pero ese contenedor no está en el terminal ni anunciado. Revisa el número con tu agencia o naviera.', 'The number is valid, but that container is neither at the terminal nor announced. Check with your agency or shipping line.'));
};

R('/publico/congestion', {
  id: 'congestion', t: ['Congestión del gate y del acceso vial', 'Gate and access road congestion'], layout: 'publico', area: 'publica', bilingue: true, rf: ['RF-GAT-13', 'RF-POR-01'],
  vista: () => {
    const tramos = [[T('Acceso sur, desde la autopista', 'South access, from the highway'), 6, T('Fluido', 'Free flow'), 'ok'], [T('Avenida portuaria', 'Port avenue'), 14, T('Moderado', 'Moderate'), 'aviso'], [T('Rotonda de acceso al gate', 'Gate access roundabout'), 4, T('Fluido', 'Free flow'), 'ok'], [T('Zona de espera de camiones', 'Truck waiting area'), 9, T('11 camiones', '11 trucks'), 'info']];
    return `<div class="seccion-publica">${migas([[T('Portal público', 'Public portal'), '#/'], [T('Congestión', 'Congestion'), '']])}${encabezado(T('Congestión del gate y del acceso vial', 'Gate and access road congestion'), T('Datos de los lectores del gate y de los sensores de la vía de acceso. Se actualizan cada minuto.', 'Data from gate readers and access road sensors. Updated every minute.'))}
      <div class="reticula r2"><div class="tarjeta">${gBarras({ titulo: T('Espera por puesto de entrada (minutos)', 'Wait per entry lane (minutes)'), datos: filasCongestion(), meta: 15, unidad: 'min', metaEt: T('Espera alta sobre', 'High wait above') })}</div>
      <div class="tarjeta"><h2>${T('Acceso vial', 'Access road')}</h2><ul class="lista-simple">${tramos.map(([n, m, e, t]) => `<li class="fila-flex entre"><span><strong>${n}</strong><br><span class="detalle">${T('Tiempo estimado', 'Estimated time')}: ${m} min</span></span>${insig(e, t)}</li>`).join('')}</ul></div></div></div>`;
  },
});

R('/verificar', { id: 'verificar', t: ['Verificar un certificado de cadena de frío', 'Verify a cold chain certificate'], layout: 'publico', area: 'publica', bilingue: true, rf: ['RF-REF-12'], vista: () => vistaVerificar() });
R('/verificar/:id', { id: 'verificar-id', t: ['Resultado de la verificación', 'Verification result'], layout: 'publico', area: 'publica', bilingue: true, rf: ['RF-REF-12'], padre: 'verificar', vista: (p) => vistaVerificar(p.id) });
function vistaVerificar(id) {
  const c = id && E.db.certificados.find((x) => x.id === id);
  return `<div class="seccion-publica" style="position:relative;overflow:hidden">${ondas('c')}<div style="position:relative;z-index:1;max-width:820px">${migas([[T('Portal público', 'Public portal'), '#/'], [T('Verificar certificado', 'Verify certificate'), '']])}
    ${encabezado(T('Verificar un certificado de cadena de frío', 'Verify a cold chain certificate'), T('Comprueba, sin cuenta y sin pedirle nada al terminal, que la serie de temperatura de un embarque no se alteró y cuándo se selló.', 'Check, without an account, that the temperature series of a shipment was not altered and when it was sealed.'))}
    <form class="tarjeta" data-form="verificar" novalidate>${campo({ id: 'v-cod', et: T('Código del certificado', 'Certificate code'), ayuda: T('Está impreso en el certificado, por ejemplo CF-AC-2027-0418.', 'Printed on the certificate, e.g. CF-AC-2027-0418.'), val: 'req', req: true, valor: id || '' })}${btn(T('Verificar', 'Verify'), { submit: true, ic: 'sello' })}</form>
    ${id ? (c ? `<div class="tarjeta" style="margin-top:16px">${msj('ok', T('Certificado íntegro', 'Certificate intact'), T('La huella de la serie coincide con la sellada y el sello de tiempo es válido.', 'The series fingerprint matches the sealed one and the timestamp is valid.'))}
      ${datos([[T('Certificado', 'Certificate'), c.id], [T('Embarque', 'Shipment'), c.embarque], [T('Contenedor', 'Container'), `<span class="codigo">${c.cont}</span>`], [T('Carga', 'Cargo'), c.carga], [T('Desde', 'From'), c.desde], [T('Hasta', 'To'), c.hasta], [T('Lecturas selladas', 'Sealed readings'), num(c.lecturas)], [T('Desviaciones registradas', 'Recorded deviations'), c.desvios], [T('Huella de la serie', 'Series fingerprint'), `<span class="codigo">${c.huella}</span>`]])}
      <p class="detalle" style="margin-top:12px">${T('El certificado no muestra la posición, la ruta ni datos comerciales. El dueño de la carga descarga la serie completa desde el portal.', 'The certificate does not show position, route or commercial data. The cargo owner downloads the full series from the portal.')}</p></div>`
      : `<div style="margin-top:16px">${msj('error', T('No encontramos un certificado con ese código', 'No certificate found with that code'), T('Revisa que esté escrito tal como aparece en el documento, con guiones. Si el problema sigue, pide al terminal una copia firmada.', 'Check it is written exactly as on the document, with dashes. If the problem persists, ask the terminal for a signed copy.'))}</div>`) : `<p class="detalle" style="margin-top:12px">${T('Prueba con', 'Try')} <a href="#/verificar/CF-AC-2027-0418">CF-AC-2027-0418</a>.</p>`}</div></div>`;
}
FORM.verificar = (f) => { const i = $('#v-cod', f); if (!validarCampo(i, true)) { i.focus(); return; } ir('#/verificar/' + encodeURIComponent(i.value.trim().toUpperCase())); };

/* ---------------------------------------------------------------- inicio de sesión unificado y segundo factor */
R('/ingresar', {
  id: 'ingresar', t: ['Ingresar a ATOS', 'Sign in to ATOS'], layout: 'auth', area: 'publica', bilingue: true, rf: ['RF-ACC-01', 'RF-POR-02'],
  vista: () => {
    const grupo = (ext) => Object.entries(PERFILES).filter(([, p]) => !!p.ext === ext).map(([k, p]) => `<label class="opcion tarjeta-op"><input type="radio" name="perfil" value="${k}" id="pf-${k}" ${E.ui.perfilLogin === k ? 'checked' : ''} data-cambio="login-perfil" ${k === 'transporte' ? `required data-msg="${T('Elige un perfil de demostración.', 'Choose a demo profile.')}"` : ''}>${selloIc(ICONO_PERFIL[k] || 'persona', ext ? 'crema' : '')}<span>${ES(p.n)}</span></label>`).join('');
    const pl = E.ui.perfilLogin; const correo = pl && PERSONAS[pl] ? PERSONAS[pl].correo : '';
    return `<div class="caja ancha"><h1 tabindex="-1" id="titulo-pagina">${T('Ingresar a ATOS', 'Sign in to ATOS')}</h1><p>${T('Ingresa con tu correo y tu contraseña, ya sea que trabajes en el terminal o en una empresa externa.', 'Sign in with your email and password, whether you work at the terminal or at an external company.')}</p>
      ${E.ui.msgLogin ? msj('info', E.ui.msgLogin) : ''}
      <form data-form="login" novalidate>
        <fieldset><legend>${T('Perfil de demostración', 'Demo profile')}</legend><p class="detalle">${T('Elige con qué perfil quieres recorrer el prototipo. Cada uno tiene su inicio, su menú y sus permisos.', 'Choose the profile you want to explore. Each has its own home, menu and permissions.')}</p>
          <h3>${T('Personal del terminal', 'Terminal staff')}</h3><div class="selector-perfil">${grupo(false)}</div>
          <h3 style="margin-top:16px">${T('Organizaciones y personas externas', 'External organizations and people')}</h3><div class="selector-perfil">${grupo(true)}</div><span class="msg-campo" id="perfil-msg" aria-live="polite"></span></fieldset>
        <div class="form-fila">${campo({ id: 'l-correo', et: T('Correo', 'Email'), tipo: 'email', val: 'correo', req: true, auto: 'username', valor: correo })}${campo({ id: 'l-clave', et: T('Contraseña', 'Password'), tipo: 'password', val: 'clave', req: true, auto: 'current-password', ayuda: T('Al menos 8 caracteres.', 'At least 8 characters.') })}</div>
        <label class="opcion" ${pl && PERFILES[pl]?.ext ? 'hidden' : ''} id="op-fuera"><input type="checkbox" id="l-fuera" ${E.ui.fueraRed ? 'checked' : ''}> ${T('Ingreso desde fuera de la red corporativa (pide el segundo factor)', 'Signing in from outside the corporate network (requires second factor)')}</label>
        <div class="grupo-botones" style="margin-top:16px">${btn(T('Ingresar', 'Sign in'), { submit: true, tipo: 'clave', id: 'b-ingresar' })}<a href="#/recuperar">${T('¿Olvidaste tu contraseña?', 'Forgot your password?')}</a><a href="#/registro">${T('Registrar mi organización', 'Register my organization')}</a></div>
        <p class="detalle" style="margin-top:16px">${ic('info')} ${T('Demostración: cualquier correo válido y una contraseña de 8 caracteres o más sirven; el segundo factor acepta cualquier código de 6 dígitos.', 'Demo: any valid email and a password of 8+ characters work; the second factor accepts any 6-digit code.')}</p></form></div>`;
  },
});
CAMBIO['login-perfil'] = (el) => { E.ui.perfilLogin = el.value; const c = $('#l-correo'); if (c && PERSONAS[el.value]?.correo) { c.value = PERSONAS[el.value].correo; validarCampo(c); } $('#op-fuera').hidden = !!PERFILES[el.value].ext; if (el.value === 'publico') aviso(T('La persona del público usa el portal sin sesión: al ingresar irás al portal público.', 'Members of the public use the portal without a session.')); };
FORM.login = (f) => {
  if (!validarForm(f)) return; const perfil = $('[name="perfil"]:checked', f).value; E.ui.msgLogin = null;
  if (perfil === 'publico') { entrar('publico'); return; }
  const fuera = PERFILES[perfil].ext || $('#l-fuera', f).checked; E.ui.fueraRed = $('#l-fuera', f).checked;
  if (fuera) { E.ui.pendiente = { perfil, fuera }; ir('#/segundo-factor'); return; }
  aviso(T('Ingreso desde la red corporativa: no se pide el segundo factor.', 'Signed in from the corporate network: no second factor needed.')); entrar(perfil);
};
R('/segundo-factor', {
  id: 'segundo-factor', t: ['Segundo factor de autenticación', 'Second authentication factor'], layout: 'auth', area: 'publica', bilingue: true, rf: ['RF-ACC-02'],
  vista: () => !E.ui.pendiente ? `<div class="caja"><h1 tabindex="-1" id="titulo-pagina">${T('Segundo factor', 'Second factor')}</h1>${msj('info', T('Primero ingresa tu correo y contraseña.', 'First enter your email and password.'))}${btn(T('Ir a ingresar', 'Go to sign in'), { href: '#/ingresar' })}</div>`
    : `<div class="caja"><h1 tabindex="-1" id="titulo-pagina">${T('Confirma que eres tú', 'Confirm it is you')}</h1><p>${T('Accedes desde fuera de la red corporativa. Escribe el código de 6 dígitos que muestra tu aplicación autenticadora.', 'You are signing in from outside the corporate network. Enter the 6-digit code from your authenticator app.')}</p>
      <form data-form="totp" novalidate>${campo({ id: 't-cod', et: T('Código de verificación', 'Verification code'), ayuda: T('El código cambia cada 30 segundos.', 'The code changes every 30 seconds.'), val: 'totp', req: true, modo: 'numeric', auto: 'one-time-code', clase: 'campo-codigo', attrs: 'maxlength="7"' })}
      <div class="grupo-botones">${btn(T('Verificar y entrar', 'Verify and continue'), { submit: true, tipo: 'clave' })}${btn(T('Usar un código de respaldo', 'Use a backup code'), { tipo: 'terciario', acc: 'totp-respaldo' })}${btn(T('Volver', 'Back'), { tipo: 'secundario', href: '#/ingresar' })}</div></form></div>`,
});
ACC['totp-respaldo'] = () => dialogo({ titulo: T('Código de respaldo', 'Backup code'), html: `<p>${T('Los códigos de respaldo se entregan al configurar el segundo factor. Cada uno sirve una sola vez. Si no los tienes, el administrador funcional de tu organización puede restablecer tu segundo factor.', 'Backup codes are issued when you set up the second factor. Each works once. If you do not have them, your organization administrator can reset your second factor.')}</p>` });
FORM.totp = (f) => { if (!validarForm(f)) return; const pe = E.ui.pendiente; E.ui.pendiente = null; aviso(T('Identidad verificada con el segundo factor.', 'Identity verified with the second factor.')); entrar(pe.perfil, { fuera: true }); };

R('/recuperar', {
  id: 'recuperar', t: ['Recuperar el acceso', 'Recover access'], layout: 'auth', area: 'publica', bilingue: true, rf: ['RF-ACC-01'],
  vista: () => {
    const p = E.ui.recup || 0; const lista = [T('Correo', 'Email'), T('Código', 'Code'), T('Contraseña nueva', 'New password'), T('Listo', 'Done')];
    const cuerpo = [
      `<form data-form="recup" novalidate>${campo({ id: 'r-correo', et: T('Correo con el que ingresas', 'Your sign-in email'), tipo: 'email', val: 'correo', req: true })}${btn(T('Enviar código', 'Send code'), { submit: true })}</form>`,
      `<form data-form="recup" novalidate>${msj('info', T('Te enviamos un código a tu correo.', 'We emailed you a code.'), T('Demostración: escribe cualquier código de 6 dígitos.', 'Demo: enter any 6-digit code.'))}${campo({ id: 'r-cod', et: T('Código recibido', 'Code received'), val: 'totp', req: true, modo: 'numeric', clase: 'campo-codigo' })}${btn(T('Continuar', 'Continue'), { submit: true })}</form>`,
      `<form data-form="recup" novalidate>${campo({ id: 'r-c1', et: T('Contraseña nueva', 'New password'), tipo: 'password', val: 'clave', req: true, auto: 'new-password', ayuda: T('Al menos 8 caracteres.', 'At least 8 characters.') })}${campo({ id: 'r-c2', et: T('Repite la contraseña', 'Repeat the password'), tipo: 'password', val: 'clave', req: true, auto: 'new-password' })}${btn(T('Guardar contraseña', 'Save password'), { submit: true, tipo: 'clave' })}</form>`,
      `${msj('ok', T('Tu contraseña quedó actualizada.', 'Your password was updated.'), T('Por seguridad, cerramos tus otras sesiones abiertas.', 'For security, we closed your other open sessions.'))}${btn(T('Ir a ingresar', 'Go to sign in'), { href: '#/ingresar', acc: 'recup-fin' })}`,
    ][p];
    return `<div class="caja"><h1 tabindex="-1" id="titulo-pagina">${T('Recuperar el acceso', 'Recover access')}</h1>${pasos(lista, p, { etq: T('Pasos para recuperar el acceso', 'Steps to recover access') })}${cuerpo}<p style="margin-top:16px"><a href="#/ingresar" data-acc="recup-fin">${T('Volver a ingresar', 'Back to sign in')}</a></p></div>`;
  },
});
FORM.recup = (f) => {
  if (!validarForm(f)) return;
  if (E.ui.recup === 2 && $('#r-c1').value !== $('#r-c2').value) { marcarCampo($('#r-c2'), { ok: false, msg: T('Las contraseñas no coinciden.', 'Passwords do not match.') }, true); $('#r-c2').focus(); return; }
  E.ui.recup = (E.ui.recup || 0) + 1; refrescar({ foco: 'titulo-pagina' }); $('#titulo-pagina').focus();
};
ACC['recup-fin'] = () => { E.ui.recup = 0; ir('#/ingresar'); };

/* ---------------------------------------------------------------- registro de una organización externa (RF-POR-02) */
const ICONO_PERFIL = { transporte: 'camion', conductor: 'credencial', gate: 'barrera', carga: 'contenedor', publico: 'globo', planificador: 'capas', supervisor: 'personas', operador_patio: 'grua', operador_grua: 'grua', jefatura: 'grafico', admin: 'ajustes', facturacion: 'documento', documentacion: 'sello', proteccion: 'escudo', trabajador: 'credencial', inspector: 'balanza', verificador: 'hoja', ronda: 'termometro', naviera_ni: 'nave' };
const DESC_ORG = { naviera: ['Líneas que recalan con sus naves.', 'Lines that call with their vessels.'], agencia: ['Tramita la documentación de la carga.', 'Handles the cargo documents.'], exportador: ['Dueño de la carga que entra o sale.', 'Owner of the cargo coming in or out.'], transportista: ['Camiones que llegan al gate.', 'Trucks that come to the gate.'], autoridad: ['Organismos que fiscalizan la carga.', 'Agencies that inspect the cargo.'], concedente: ['Entrega la concesión del terminal.', 'Grants the terminal concession.'], ferroviario: ['Trenes que operan en el terminal.', 'Trains operating at the terminal.'] };
const TIPOS_ORG = [['naviera', ['Naviera', 'Shipping line']], ['agencia', ['Agencia de aduana', 'Customs agency']], ['exportador', ['Exportador o importador', 'Exporter or importer']], ['transportista', ['Empresa de transporte', 'Transport company']], ['autoridad', ['Autoridad', 'Authority']], ['concedente', ['Concedente', 'Port authority (grantor)']], ['ferroviario', ['Operador ferroviario', 'Rail operator']]];
function borrador() { return (E.db.borradorRegistro ||= { paso: 0, d: {}, guardado: false, correoVerificado: false, codigoCorreo: null }); }
R('/registro', {
  id: 'registro', t: ['Registrar una organización', 'Register an organization'], layout: 'auth', area: 'publica', bilingue: true, rf: ['RF-POR-02', 'RF-ACC-02', 'RF-ADM-07'],
  vista: () => {
    const b = borrador(); const d = b.d; const nombres = [T('Tipo', 'Type'), T('Organización', 'Organization'), T('Representante', 'Representative'), T('Relación con la carga', 'Cargo relationship'), T('Términos', 'Terms'), T('Segundo factor', 'Second factor'), T('Resumen', 'Summary')];
    const paso = b.paso; let cuerpo = '';
    if (paso === 0) cuerpo = `<fieldset><legend>${T('¿Qué tipo de organización registras?', 'What type of organization are you registering?')}</legend><div class="selector-perfil mosaico-op">${TIPOS_ORG.map(([k, n], i) => `<label class="opcion tarjeta-op"><input type="radio" name="r-tipo" id="r-tipo-${k}" value="${k}" ${d.tipo === k ? 'checked' : ''} ${i === 0 ? `required data-msg="${T('Elige el tipo de organización.', 'Choose the organization type.')}"` : ''}>${sello(k, i % 2 ? 'crema' : '')}<span class="op-texto"><strong>${ES(n)}</strong><small>${ES(DESC_ORG[k])}</small></span></label>`).join('')}</div><span class="msg-campo" id="r-tipo-msg" aria-live="polite"></span></fieldset>`;
    if (paso === 1) cuerpo = `<div class="form-fila">${campo({ id: 'r-razon', et: T('Razón social', 'Legal name'), val: 'req', req: true, valor: d.razon })}${campo({ id: 'r-rut', et: T('RUT de la organización', 'Organization RUT'), val: 'rut', req: true, valor: d.rut, ayuda: T('Se valida su dígito verificador mientras escribes.', 'Its check digit is validated as you type.'), ph: '76.482.913-1' })}</div><div class="form-fila">${campo({ id: 'r-giro', et: T('Giro o actividad', 'Business activity'), val: 'req', req: true, valor: d.giro })}${campo({ id: 'r-dir', et: T('Dirección', 'Address'), val: 'req', req: true, valor: d.dir })}</div>`;
    if (paso === 2) cuerpo = `<div class="form-fila">${campo({ id: 'r-nom', et: T('Nombre de la persona representante', 'Representative name'), val: 'req', req: true, valor: d.nom, auto: 'name' })}${campo({ id: 'r-cargo', et: T('Cargo', 'Position'), val: 'req', req: true, valor: d.cargo })}</div>
      <div class="form-fila">${campo({ id: 'r-correo', et: T('Correo de contacto', 'Contact email'), tipo: 'email', val: 'correo', req: true, valor: d.correo, auto: 'email' })}${campo({ id: 'r-tel', et: T('Teléfono', 'Phone'), tipo: 'tel', valor: d.tel, auto: 'tel', ph: '+56 9 1234 5678' })}</div>
      <div class="tarjeta crema"><h3>${T('Verificación del correo', 'Email verification')}</h3>${b.correoVerificado ? msj('ok', T('Correo verificado.', 'Email verified.')) : `<p>${T('Te enviaremos un código para confirmar que el correo es tuyo.', 'We will send a code to confirm the email is yours.')}</p><div class="grupo-botones">${btn(T('Enviar código al correo', 'Email me a code'), { tipo: 'secundario', acc: 'reg-codigo', id: 'b-reg-cod' })}</div>${b.codigoCorreo ? campo({ id: 'r-vcod', et: T('Código recibido', 'Code received'), val: 'totp', req: true, modo: 'numeric', ayuda: T(`Demostración: el código enviado es ${b.codigoCorreo}.`, `Demo: the code sent is ${b.codigoCorreo}.`) }) + btn(T('Confirmar código', 'Confirm code'), { acc: 'reg-verificar', id: 'b-reg-ver' }) : ''}`}</div>`;
    if (paso === 3) cuerpo = `${campo({ id: 'r-rel', et: T('Relación con la carga', 'Relationship with the cargo'), tipo: 'select', req: true, valor: d.rel, opciones: [['', T('Elige una opción', 'Choose an option')], ['dueno', T('Dueño de la carga (exportador o importador)', 'Cargo owner (exporter or importer)')], ['representante', T('Representante aduanero del dueño', 'Customs representative of the owner')], ['transporte', T('Transporte terrestre contratado', 'Contracted road haulier')], ['naviera', T('Transportista marítimo', 'Ocean carrier')], ['autoridad', T('Fiscalización', 'Inspection authority')]] })}
      ${zonaCarga({ id: 'reg-docs', et: T('Documentos de respaldo', 'Supporting documents'), ayuda: T('Certificado de vigencia de la organización y poder de la persona representante. PDF de hasta 10 MB.', 'Certificate of good standing and power of attorney of the representative. PDF up to 10 MB.'), multiple: true, ejemplo: 'certificado_vigencia.pdf' })}<span class="msg-campo" id="reg-docs-msg" aria-live="polite"></span>`;
    if (paso === 4) cuerpo = `${acordeon([{ t: T('Resumen del tratamiento de datos personales', 'Summary of personal data processing'), abierto: true, html: `<p>${T('El Terminal Portuario Aconcagua trata los datos de las personas usuarias solo para operar el portal y cumplir obligaciones legales, conforme a la Ley N.º 21.719 sobre protección de datos personales. Puedes pedir acceso, rectificación, supresión y portabilidad desde Mis preferencias.', 'Terminal Portuario Aconcagua processes user data only to operate the portal and meet legal obligations, under Chilean Law 21,719 on personal data protection. You can request access, rectification, deletion and portability from My preferences.')}</p>` }])}
      <label class="opcion"><input type="checkbox" id="r-term" required ${d.term ? 'checked' : ''} data-msg="${T('Debes aceptar los términos de uso.', 'You must accept the terms of use.')}"> ${T('Acepto los términos de uso del portal.', 'I accept the portal terms of use.')}</label><span class="msg-campo" id="r-term-msg" aria-live="polite"></span>
      <label class="opcion"><input type="checkbox" id="r-datos" required ${d.datos ? 'checked' : ''} data-msg="${T('Debes aceptar el tratamiento de datos para continuar.', 'You must accept data processing to continue.')}"> ${T('Acepto el tratamiento de mis datos personales (Ley N.º 21.719).', 'I accept the processing of my personal data (Law 21,719).')}</label><span class="msg-campo" id="r-datos-msg" aria-live="polite"></span>
      <label class="opcion"><input type="checkbox" id="r-boletin" ${d.boletin ? 'checked' : ''}> ${T('Quiero recibir comunicaciones no operacionales (opcional; puedo darme de baja cuando quiera).', 'I want non-operational communications (optional; I can unsubscribe anytime).')}</label>`;
    if (paso === 5) cuerpo = `<div class="reticula r2"><div><p>${T('Escanea este código con tu aplicación autenticadora o escribe la clave manualmente.', 'Scan this code with your authenticator app or type the key manually.')}</p>${codigoQR()}<p class="detalle">${T('Clave manual', 'Manual key')}: <span class="codigo">JBSW Y3DP EHPK 3PXP</span></p></div><div>${campo({ id: 'r-totp', et: T('Código que muestra la aplicación', 'Code shown by the app'), val: 'totp', req: true, modo: 'numeric', clase: 'campo-codigo', ayuda: T('Demostración: cualquier código de 6 dígitos.', 'Demo: any 6-digit code.') })}</div></div>`;
    if (paso === 6) cuerpo = `${msj('info', T('Solicitud en validación por el terminal', 'Request under review by the terminal'), T('El área de documentación revisa los respaldos en un día hábil. Te avisaremos por correo cuando tu cuenta quede habilitada.', 'The documentation office reviews the documents within one business day. We will email you when your account is enabled.'))}
      ${datos([[T('Tipo', 'Type'), ES(TIPOS_ORG.find((x) => x[0] === d.tipo)?.[1] || ['—', '—'])], [T('Razón social', 'Legal name'), esc(d.razon)], ['RUT', esc(d.rut)], [T('Representante', 'Representative'), esc(d.nom)], [T('Correo', 'Email'), esc(d.correo)], [T('Relación con la carga', 'Cargo relationship'), esc(d.relTxt || d.rel)], [T('Documentos', 'Documents'), (ARCHIVOS['reg-docs'] || []).map((a) => esc(a.n)).join(', ')], [T('Segundo factor', 'Second factor'), T('Configurado', 'Set up')], [T('Estado', 'Status'), insig(T('En validación', 'Under review'), 'aviso')]])}`;
    const nav = paso < 6 ? `<div class="grupo-botones" style="margin-top:16px">${paso ? btn(T('Anterior', 'Previous'), { tipo: 'secundario', acc: 'reg-atras', id: 'b-reg-atras' }) : ''}${btn(paso === 5 ? T('Enviar solicitud', 'Submit request') : T('Siguiente', 'Next'), { submit: true, tipo: paso === 5 ? 'clave' : '', id: 'b-reg-sig' })}${btn(T('Guardar y continuar después', 'Save and continue later'), { tipo: 'terciario', acc: 'reg-guardar', id: 'b-reg-guardar' })}</div>` : btn(T('Ir al portal público', 'Go to the public portal'), { href: '#/', acc: 'reg-fin' });
    return `<div class="caja ancha registro"><aside class="registro-lado" aria-label="${T('Pasos del registro', 'Registration steps')}"><p class="antetitulo">${T('Registro de organización', 'Organization sign-up')}</p>
        <p class="lado-txt">${T('Siete pasos. Puedes guardar y seguir después; el terminal revisa tu solicitud en un día hábil.', 'Seven steps. You can save and continue later; the terminal reviews your request within one business day.')}</p>
        ${pasos(nombres, paso, { etq: T('Pasos del registro', 'Registration steps') })}${bauhausLado()}</aside>
      <div class="registro-cuerpo"><h1 tabindex="-1" id="titulo-pagina">${T('Registrar una organización', 'Register an organization')}</h1>
      ${b.guardado && paso < 6 ? msj('info', T('Retomaste tu registro donde lo dejaste.', 'You resumed your registration where you left off.')) : ''}
      ${progreso(paso, 6, T('Avance del registro', 'Registration progress'), { texto: `${T('Paso', 'Step')} ${Math.min(paso + 1, 7)} ${T('de', 'of')} 7` })}
      <form data-form="registro" novalidate style="margin-top:16px"><h2>${nombres[paso]}</h2>${cuerpo}${nav}</form></div></div>`;
  },
});
function bauhausLado() { return `<svg class="bauhaus-lado" viewBox="0 0 220 180" aria-hidden="true" focusable="false"><circle cx="150" cy="70" r="44" fill="#E07A7F"/><path d="M20 180a70 70 0 0 1 140 0z" fill="#BFD6EE" fill-opacity=".85"/><rect x="120" y="118" width="80" height="62" fill="#F5F0EA"/><polygon points="40,96 84,96 62,58" fill="#6573A6"/><g fill="#4A5788">${[0, 1, 2, 3, 4, 5, 6].map((k) => `<path d="M${k * 32} 180a16 16 0 0 1 32 0z"/>`).join('')}</g></svg>`; }
function codigoQR() { const r = azar(77); let c = ''; for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) { const fijo = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13); const v = fijo ? ((x % 20 === 0 || x % 20 === 6 || y % 20 === 0 || y % 20 === 6 || x === 14 || x === 20 || y === 14 || y === 20) || (x % 7 >= 2 && x % 7 <= 4 && y % 7 >= 2 && y % 7 <= 4)) : r() < 0.5; if (v) c += `<rect x="${x * 8}" y="${y * 8}" width="8" height="8"/>`; } return `<svg viewBox="-8 -8 184 184" width="184" role="img" aria-label="${T('Código para la aplicación autenticadora', 'Code for the authenticator app')}" style="background:#fff;border:1px solid #4A5788"><g fill="#1B1F3B">${c}</g></svg>`; }
function guardarPasoRegistro(f) {
  const b = borrador(); const d = b.d; const v = (id) => $('#' + id, f)?.value;
  if (b.paso === 0) d.tipo = $('[name="r-tipo"]:checked', f)?.value;
  if (b.paso === 1) Object.assign(d, { razon: v('r-razon'), rut: v('r-rut'), giro: v('r-giro'), dir: v('r-dir') });
  if (b.paso === 2) Object.assign(d, { nom: v('r-nom'), cargo: v('r-cargo'), correo: v('r-correo'), tel: v('r-tel') });
  if (b.paso === 3) { d.rel = v('r-rel'); d.relTxt = $('#r-rel', f)?.selectedOptions[0]?.textContent; }
  if (b.paso === 4) Object.assign(d, { term: $('#r-term', f).checked, datos: $('#r-datos', f).checked, boletin: $('#r-boletin', f).checked });
}
FORM.registro = (f) => {
  const b = borrador(); if (!validarForm(f)) return;
  if (b.paso === 2 && !b.correoVerificado) { aviso(T('Verifica el correo antes de continuar: envía el código y confírmalo.', 'Verify the email before continuing: send the code and confirm it.'), 'error'); $('#b-reg-cod')?.focus(); return; }
  if (b.paso === 3 && !(ARCHIVOS['reg-docs'] || []).length) { const m = $('#reg-docs-msg'); m.className = 'msg-campo error'; m.innerHTML = ic('error') + `<span>${T('Adjunta al menos un documento de respaldo.', 'Attach at least one supporting document.')}</span>`; $('#be-reg-docs').focus(); return; }
  guardarPasoRegistro(f); b.paso++; if (b.paso === 6) auditar('Solicitud de registro de organización', b.d.razon || '—', 'En validación'); refrescar(); $('#titulo-pagina').focus(); window.scrollTo(0, 0);
};
// al cargar un respaldo la vista se redibuja: se guarda antes lo ya elegido en el paso (por ejemplo, la relación con la carga)
CARGA['reg-docs'] = () => { const f = $('form[data-form="registro"]'); if (f) guardarPasoRegistro(f); };
ACC['reg-atras'] = () => { const b = borrador(); guardarPasoRegistro($('form[data-form="registro"]')); b.paso = Math.max(0, b.paso - 1); refrescar(); $('#titulo-pagina').focus(); };
ACC['reg-guardar'] = () => { const b = borrador(); guardarPasoRegistro($('form[data-form="registro"]')); b.guardado = true; E.ui.msgLogin = T('Tu registro quedó guardado. Vuelve a «Registrar mi organización» para continuar donde lo dejaste.', 'Your registration was saved. Go back to “Register my organization” to continue.'); ir('#/ingresar'); };
ACC['reg-codigo'] = () => { const b = borrador(); const c = $('#r-correo'); if (!validarCampo(c, true)) { c.focus(); return; } guardarPasoRegistro($('form[data-form="registro"]')); b.codigoCorreo = '418205'; aviso(T(`Enviamos un código a ${c.value}.`, `We sent a code to ${c.value}.`)); refrescar(); $('#r-vcod')?.focus(); };
ACC['reg-verificar'] = () => { const b = borrador(); const i = $('#r-vcod'); if (!validarCampo(i, true)) { i.focus(); return; } if (i.value.replace(/\D/g, '') !== b.codigoCorreo) { marcarCampo(i, { ok: false, msg: T('El código no coincide con el que enviamos. Revisa el correo o pide otro.', 'The code does not match the one we sent. Check your email or request another.') }, true); i.focus(); return; } guardarPasoRegistro($('form[data-form="registro"]')); b.correoVerificado = true; aviso(T('Correo verificado.', 'Email verified.')); refrescar(); $('#b-reg-sig')?.focus(); };
ACC['reg-fin'] = () => { E.db.borradorRegistro = null; delete ARCHIVOS['reg-docs']; ir('#/'); };

/* ---------------------------------------------------------------- sin acceso y ruta inexistente */
R('/sin-acceso', {
  id: 'sinacceso', t: ['Esta pantalla no está en tu perfil', 'This screen is not in your profile'], area: 'base', bilingue: true,
  vista: () => encabezado(T('Esta pantalla no está en tu perfil', 'This screen is not in your profile'), T(`Tu perfil (${ES(perfilActual().n)}) no tiene permiso para ver esta información. Cada organización y cada rol ven solo lo suyo.`, `Your profile (${ES(perfilActual().n)}) cannot see this information. Each organization and role sees only its own.`)) + vacio(T('Nada que mostrar aquí', 'Nothing to show here'), T('Si necesitas este acceso, pídelo al administrador funcional de ATOS de tu organización.', 'If you need this access, ask your ATOS functional administrator.'), btn(T('Volver a mi inicio', 'Back to my home'), { href: '#/inicio' })),
});
R('/no-encontrada', {
  id: 'noencontrada', t: ['Página no encontrada', 'Page not found'], layout: 'publico', area: 'publica', bilingue: true,
  vista: () => `<div class="seccion-publica">${encabezado(T('No encontramos esa página', 'We could not find that page'), T('El enlace puede estar incompleto o la página cambió de lugar.', 'The link may be incomplete or the page moved.'))}${vacio(T('Página no encontrada', 'Page not found'), T('Vuelve al inicio o usa la búsqueda global.', 'Go back home or use global search.'), btn(T('Ir al inicio', 'Go home'), { href: E.sesion ? '#/inicio' : '#/' }))}</div>`,
});
