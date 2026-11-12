/* ATOS · datos simulados. Todo nombre de persona, empresa, naviera o nave es ficticio.
   semilla() arma el estado inicial completo; «Reiniciar demostración» lo vuelve a llamar. */
'use strict';

const NAVIERAS = [ // participación en contenedores: la alianza (las tres primeras) suma el 34 %
  { id: 'AAS', n: 'Atlántico Austral Shipping', pref: 'ATOU', alianza: true, part: 13, canal: 'edifact', version: 'D.95B' },
  { id: 'NAP', n: 'Naviera Andina del Pacífico', pref: 'NAPU', alianza: true, part: 12, canal: 'edifact', version: 'D.00B' },
  { id: 'ACL', n: 'Austral Container Lines', pref: 'ACLU', alianza: true, part: 9, canal: 'edifact', version: 'D.95B' },
  { id: 'LHB', n: 'Línea Humboldt', pref: 'LHBU', alianza: false, part: 10, canal: 'edifact', version: 'D.95B' },
  { id: 'MCS', n: 'Mar de Chiloé Shipping', pref: 'MCSU', alianza: false, part: 8, canal: 'edifact', version: 'D.00B' },
  { id: 'CHN', n: 'Cabo de Hornos Navegación', pref: 'CHNU', alianza: false, part: 7, canal: 'edifact', version: 'D.95B' },
  { id: 'PML', n: 'Pacific Meridian Lines', pref: 'PMLU', alianza: false, part: 7, canal: 'edifact', version: 'D.00B' },
  { id: 'NVC', n: 'Naviera Valle Central', pref: 'NVCU', alianza: false, part: 6, canal: 'edifact', version: 'D.95B' },
  { id: 'TRS', n: 'Transoceánica Sur', pref: 'TRSU', alianza: false, part: 6, canal: 'edifact', version: 'D.95B' },
  { id: 'PRL', n: 'Polaris Reefer Lines', pref: 'PRLU', alianza: false, part: 6, canal: 'edifact', version: 'D.00B' },
  { id: 'OAN', n: 'Océano Azul Navegación', pref: 'OANU', alianza: false, part: 5, canal: 'edifact', version: 'D.95B' },
  { id: 'ECS', n: 'Estrecho Container Service', pref: 'ECSU', alianza: false, part: 4, canal: 'edifact', version: 'D.00B' },
  { id: 'IMC', n: 'Isla Mocha Container', pref: 'IMCU', alianza: false, part: 4, canal: 'puente', version: 'Planilla del canal puente v2' },
  { id: 'BML', n: 'Brisa Marina Lines', pref: 'BMLU', alianza: false, part: 3, canal: 'puente', version: 'Planilla del canal puente v2' },
];
const NAV = Object.fromEntries(NAVIERAS.map((n) => [n.id, n]));
const ALIANZA = 'Alianza Cruz del Sur';

const PERSONAS = {
  transporte: { n: 'Patricia Muñoz Soto', org: 'Transportes Cordillera Sur Ltda.', correo: 'pmunoz@cordillerasur.cl', cargo: 'Coordinadora de despacho' },
  conductor: { n: 'Marcelo Fuentes Riquelme', org: 'Transportes Cordillera Sur Ltda.', correo: 'mfuentes@cordillerasur.cl', cargo: 'Conductor', rut: 13482771 },
  gate: { n: 'Paula Contreras Leiva', org: 'Terminal Portuario Aconcagua', correo: 'pcontreras@aconcagua.cl', cargo: 'Funcionaria de gate' },
  carga: { n: 'Ignacio Herrera Vidal', org: 'Agencia de Aduana del Pacífico', correo: 'iherrera@aduanapacifico.cl', cargo: 'Despachador de aduana · representa a Exportadora Valle Alto S.A.' },
  publico: { n: '', org: '', correo: '', cargo: '' },
  planificador: { n: 'Carolina Méndez Araya', org: 'Terminal Portuario Aconcagua', correo: 'cmendez@aconcagua.cl', cargo: 'Planificadora de estiba y patio' },
  supervisor: { n: 'Jorge Saavedra Pino', org: 'Terminal Portuario Aconcagua', correo: 'jsaavedra@aconcagua.cl', cargo: 'Supervisor de turno y de patio' },
  operador_patio: { n: 'Rodrigo Peña Castro', org: 'Terminal Portuario Aconcagua', correo: 'rpena@aconcagua.cl', cargo: 'Operador de grúa de patio RTG-07' },
  operador_grua: { n: 'Sergio Valdés Rojas', org: 'Terminal Portuario Aconcagua', correo: 'svaldes@aconcagua.cl', cargo: 'Operador de grúa de muelle G2' },
  jefatura: { n: 'Andrés Vial Ossandón', org: 'Terminal Portuario Aconcagua', correo: 'avial@aconcagua.cl', cargo: 'Jefe de operaciones' },
  admin: { n: 'Rocío Tapia Morales', org: 'Terminal Portuario Aconcagua', correo: 'rtapia@aconcagua.cl', cargo: 'Administradora funcional de ATOS' },
  facturacion: { n: 'Felipe Araya Núñez', org: 'Terminal Portuario Aconcagua', correo: 'faraya@aconcagua.cl', cargo: 'Analista de facturación' },
  documentacion: { n: 'Constanza Pizarro Díaz', org: 'Terminal Portuario Aconcagua', correo: 'cpizarro@aconcagua.cl', cargo: 'Área de documentación' },
  proteccion: { n: 'Héctor Moraga Silva', org: 'Terminal Portuario Aconcagua', correo: 'hmoraga@aconcagua.cl', cargo: 'Protección portuaria y prevención de riesgos' },
  trabajador: { n: 'Luis Cárcamo Toledo', org: 'Trabajador portuario eventual', correo: 'lcarcamo@correo.cl', cargo: 'Trabajador eventual · nombrada del turno A', rut: 15904338 },
  inspector: { n: 'Verónica Lagos Ruiz', org: 'Aduana', correo: 'vlagos@aduana.example', cargo: 'Inspectora de Aduana' },
  verificador: { n: 'Tomás Ibáñez Correa', org: 'Verificadora Cerro Alegre SpA', correo: 'tibanez@cerroalegre.cl', cargo: 'Verificador externo de emisiones' },
  ronda: { n: 'Camila Rojas Espinoza', org: 'Terminal Portuario Aconcagua', correo: 'crojas@aconcagua.cl', cargo: 'Ronda reefer y mantenimiento' },
  naviera_ni: { n: 'Gonzalo Reyes Mella', org: 'Isla Mocha Container', correo: 'greyes@islamocha.example', cargo: 'Coordinador de operaciones · naviera no integrada' },
};

const BLOQUES = [ // patio de 18 hectáreas; capacidad 12.400 TEU
  { id: 'A', uso: 'Exportación seca', cap: 1180 }, { id: 'B', uso: 'Exportación seca', cap: 1180 }, { id: 'C', uso: 'Exportación seca', cap: 1180 },
  { id: 'D', uso: 'Exportación seca', cap: 1180 }, { id: 'E', uso: 'Importación', cap: 1240 }, { id: 'F', uso: 'Importación', cap: 1240 },
  { id: 'G', uso: 'Importación', cap: 1120 }, { id: 'H', uso: 'Vacíos', cap: 1300 }, { id: 'J', uso: 'Vacíos', cap: 900 },
  { id: 'K', uso: 'Carga peligrosa', cap: 380 }, { id: 'R1', uso: 'Refrigerado', cap: 560 }, { id: 'R2', uso: 'Refrigerado', cap: 520 }, { id: 'R3', uso: 'Refrigerado', cap: 420 },
];

function semilla() {
  const r = azar(20271206);
  const db = { log: [] };

  /* -------------------------------------------- franjas de cita: 30 minutos, de 06:00 a 22:00, con capacidad declarada */
  db.franjas = [];
  for (let m = 360, i = 0; m < 1320; m += 30, i++) {
    const cap = m >= 420 && m < 600 ? 44 : m >= 1140 ? 30 : 40;
    let res = Math.min(cap, Math.round(cap * (0.55 + r() * 0.4)));
    if ([2, 3, 8].includes(i)) res = cap; // 07:00, 07:30 y 10:00: sin cupo
    if (i === 9) res = cap - 6;
    db.franjas.push({ i, ini: m, fin: m + 30, cap, res });
  }

  /* -------------------------------------------- visitas que guían los flujos */
  const conductor = (n, rut, lic = 'A5') => ({ n, rut, lic, habil: true, venceHabil: '31-03' });
  db.visitas = [
    { id: 'VIS-240871', tipo: 'exp', cont: 'ATOU 482913 7', iso: '45G1', desc: 'Contenedor de 40 pies, seco, alto', patente: 'KTRP-51', conductor: conductor('Marcelo Fuentes Riquelme', 13482771),
      transporte: 'Transportes Cordillera Sur Ltda.', agencia: 'Agencia de Aduana del Pacífico', cliente: 'Exportadora Valle Alto S.A.', naviera: 'AAS', recalada: 'REC-1184', carga: 'Uva de mesa en cajas (carga seca paletizada)',
      masaDecl: 24300, masaMed: 24180, docs: { guia: 'pendiente', aduana: 'pendiente', vgm: 'pendiente' }, faltante: null, franja: null, paso: 0, excepcion: null, eventos: [], carril: 2, rtg: 'RTG-07' },
    { id: 'VIS-240872', tipo: 'exp', cont: 'ATOU 517206 8', iso: '45G1', desc: 'Contenedor de 40 pies, seco, alto', patente: 'HXLW-28', conductor: conductor('Juan Carlos Ortega Paz', 12907315),
      transporte: 'Transportes Ruta Cinco SpA', agencia: 'Agencia de Aduana del Pacífico', cliente: 'Agrícola Los Aromos Ltda.', naviera: 'AAS', recalada: 'REC-1184', carga: 'Nueces con cáscara en sacos',
      masaDecl: 22850, masaMed: 22790, docs: { guia: 'ok', aduana: 'falta', vgm: 'ok' }, faltante: 'aduana', franja: 9, cita: 'CIT-51290', paso: 1, excepcion: null, eventos: [], carril: 4, rtg: 'RTG-03' },
    { id: 'VIS-240873', tipo: 'exp', cont: codigoISO('NAPU', '330518'), iso: '22G1', desc: 'Contenedor de 20 pies, seco', patente: 'GHSJ-74', conductor: conductor('Rubén Alarcón Vega', 11558023),
      transporte: 'Logística Quebrada Verde SpA', agencia: 'Agencia de Aduanas Puerto Claro', cliente: 'Frutícola Tres Cumbres S.A.', naviera: 'NAP', recalada: 'REC-1184', carga: 'Ciruelas deshidratadas en cajas',
      masaDecl: 21400, masaMed: 23050, docs: { guia: 'ok', aduana: 'ok', vgm: 'ok' }, faltante: null, franja: 8, cita: 'CIT-51291', paso: 3, excepcion: null, eventos: [], carril: 6, rtg: 'RTG-05' },
  ];
  db.visitas[1].eventos = [
    { hora: '09:45', t: 'Cita CIT-51290 confirmada para 10:30 – 11:00', fuente: 'Portal de clientes · Transportes Ruta Cinco SpA', paso: 0, clase: 'destacado', hecho: 'cita' },
    { hora: '10:10', t: 'Prevalidación con 1 documento pendiente: falta la autorización aduanera de exportación', fuente: 'ATOS · validación anticipada', paso: 1, hecho: 'prevalidacion' },
    { hora: '10:12', t: 'Aviso a Agencia de Aduana del Pacífico: falta la autorización aduanera', fuente: 'Notificaciones', paso: 1, hecho: 'aviso' },
  ];
  db.visitas[2].eventos = [
    { hora: '09:15', t: 'Cita CIT-51291 confirmada para 10:00 – 10:30', fuente: 'Portal de clientes · Logística Quebrada Verde SpA', paso: 0, clase: 'destacado', hecho: 'cita' },
    { hora: '09:40', t: 'Documentación validada: guía, autorización aduanera y masa bruta verificada', fuente: 'ATOS · validación anticipada', paso: 1, hecho: 'prevalidacion' },
    { hora: '10:04', t: 'Entrada al gate por el puesto 6, dentro de su franja: prioridad por cita cumplida', fuente: 'Lector de patente: GHSJ-74', paso: 2, clase: 'destacado', hecho: 'llegada' },
    { hora: '10:04', t: 'Lectura óptica: ' + db.visitas[2].cont + ', dígito verificador correcto (ISO 6346)', fuente: 'Lector óptico del puesto 6', paso: 2, hecho: 'llegada' },
  ];
  db.retiros = [
    { id: 'VIS-240880', tipo: 'imp', cont: codigoISO('LHBU', '771204'), iso: '42G1', desc: 'Contenedor de 40 pies, seco', patente: 'PRWZ-63', conductor: conductor('Marcelo Fuentes Riquelme', 13482771),
      transporte: 'Transportes Cordillera Sur Ltda.', agencia: 'Agencia de Aduana del Pacífico', cliente: 'Importadora Ferretera Austral S.A.', naviera: 'LHB', posicion: { b: 'E', bahia: 22, fila: 4, alt: 3 }, franja: 12, paso: 0, eventos: [], masaDecl: 18640, masaMed: 18610 },
  ];

  /* -------------------------------------------- citas del día (además de las de las visitas guiadas) */
  const TRANSP = ['Transportes Cordillera Sur Ltda.', 'Transportes Ruta Cinco SpA', 'Logística Quebrada Verde SpA', 'Fletes Costa Brava Ltda.'];
  const LETRAS = 'BCDFGHJKLPRSTVWXYZ';
  const patente = () => Array.from({ length: 4 }, () => LETRAS[r.ent(0, LETRAS.length - 1)]).join('') + '-' + String(r.ent(10, 99));
  const contAz = () => { const n = r.de(NAVIERAS); return { cont: codigoISO(n.pref, String(r.ent(100000, 999999))), naviera: n.id }; };
  db.citas = [];
  for (let k = 0; k < 64; k++) {
    const f = db.franjas[Math.min(db.franjas.length - 1, Math.floor(k / 2.2))];
    const c = contAz();
    const est = f.ini < 600 ? r.de(['Completada', 'Completada', 'Completada', 'Completada', 'Cancelada']) : f.ini < 660 ? r.de(['En gate', 'Confirmada']) : r.de(['Confirmada', 'Confirmada', 'Confirmada', 'Reprogramada']);
    db.citas.push({ id: 'CIT-' + (51200 + k), franja: f.i, transporte: r.de(TRANSP), patente: patente(), cont: c.cont, naviera: c.naviera, tipo: r() < 0.62 ? 'Entrega de exportación' : 'Retiro de importación', estado: est, tresBandas: r() < 0.35 });
  }
  db.citas.push({ id: 'CIT-51290', franja: 9, transporte: 'Transportes Ruta Cinco SpA', patente: 'HXLW-28', cont: 'ATOU 517206 8', naviera: 'AAS', tipo: 'Entrega de exportación', estado: 'Confirmada', tresBandas: false, visita: 'VIS-240872' });
  db.citas.push({ id: 'CIT-51291', franja: 8, transporte: 'Logística Quebrada Verde SpA', patente: 'GHSJ-74', cont: db.visitas[2].cont, naviera: 'NAP', tipo: 'Entrega de exportación', estado: 'En gate', tresBandas: false, visita: 'VIS-240873' });
  db.citas.push({ id: 'CIT-51292', franja: 12, transporte: 'Transportes Cordillera Sur Ltda.', patente: 'PRWZ-63', cont: db.retiros[0].cont, naviera: 'LHB', tipo: 'Retiro de importación', estado: 'Confirmada', tresBandas: false, visita: 'VIS-240880' });

  /* -------------------------------------------- visitas cerradas del día: estadía trazable por camión */
  db.estadias = [];
  for (let k = 0; k < 46; k++) {
    const c = contAz(); const ent = 362 + k * 5 + r.ent(0, 4);
    const est = Math.round(35 + r() * 22 + (r() < 0.12 ? 14 : 0));
    db.estadias.push({ id: 'VIS-' + (240790 + k), patente: patente(), cont: c.cont, naviera: c.naviera, transporte: r.de(TRANSP), entrada: ent, salida: ent + est, estadia: est, puesto: r.ent(1, 8), excepcion: r() < 0.09 ? 'Documentación' : '', tipo: r() < 0.6 ? 'Exportación' : 'Importación' });
  }

  /* -------------------------------------------- patio: ocupación por bloque y por hora (mapa de calor) */
  db.bloques = BLOQUES.map((b) => ({ ...b, ocup: Math.round(b.cap * (0.62 + r() * 0.3)), cerrado: false }));
  db.condiciones = [
    { id: 'CD-01', n: 'Bloque cerrado por mantenimiento', efecto: 'El bloque no recibe asignaciones mientras dure.', param: 'bloque' },
    { id: 'CD-02', n: 'Viento sobre el umbral de apilado', efecto: 'Limita la altura máxima de apilado a 3 en los bloques expuestos.', param: 'bloque' },
    { id: 'CD-03', n: 'Zona reservada para inspección', efecto: 'Reserva bahías para las remociones programadas de la autoridad.', param: 'bloque' },
    { id: 'CD-04', n: 'Grúa de patio fuera de servicio', efecto: 'El algoritmo evita las bahías que atiende ese equipo.', param: 'equipo' },
    { id: 'CD-05', n: 'Prioridad de embarque de una nave', efecto: 'Ordena la recepción para que los contenedores de esa nave salgan sin remociones.', param: 'nave' },
  ];
  db.condActivas = [{ id: 'CA-1', cond: 'CD-02', objetivo: 'Bloque H', desde: '06:40', hasta: '12:00', por: 'Carolina Méndez Araya' }];
  db.verificaciones = [
    { id: 'VF-0931', cont: codigoISO('MCSU', '208114'), motivo: 'La lectura óptica del RTG-04 no coincide con la posición registrada por telemetría', esperada: 'B-07-02-3', leida: 'B-07-03-3', estado: 'Pendiente', asignada: 'Jorge Saavedra Pino', hora: '09:52', prioridad: 'Alta' },
    { id: 'VF-0932', cont: codigoISO('PMLU', '640027'), motivo: 'Confianza baja: telemetría sin señal GNSS durante el depósito', esperada: 'D-11-05-2', leida: '—', estado: 'Pendiente', asignada: 'Jorge Saavedra Pino', hora: '10:05', prioridad: 'Media' },
    { id: 'VF-0927', cont: codigoISO('CHNU', '119053'), motivo: 'Barrido del bloque A: contenedor no esperado en la bahía 03', esperada: '—', leida: 'A-03-01-1', estado: 'Resuelta', asignada: 'Jorge Saavedra Pino', hora: '08:31', prioridad: 'Media' },
  ];
  db.remociones = [
    { id: 'RM-2210', cont: codigoISO('TRSU', '552310'), motivo: 'Inspección de Aduana INS-3307', desde: 'C-09-02-4', hacia: 'Zona de inspección Z1', hora: '11:30', estado: 'Programada', movs: 2 },
    { id: 'RM-2211', cont: codigoISO('OANU', '730118'), motivo: 'Embarque en REC-1183', desde: 'A-12-04-3', hacia: 'Muelle, sitio 1', hora: '10:50', estado: 'En ejecución', movs: 1 },
    { id: 'RM-2212', cont: codigoISO('ECSU', '415526'), motivo: 'Inspección fitosanitaria INS-3311', desde: 'R2-04-01-2', hacia: 'Zona de inspección Z2', hora: '12:15', estado: 'Programada', movs: 3 },
  ];
  db.barridos = [
    { bloque: 'A', estado: 'Conciliado', hora: '08:10 a 08:42', esperados: 914, leidos: 914, difer: 1, nota: 'Una diferencia resuelta por verificación VF-0927' },
    { bloque: 'B', estado: 'Programado', hora: '11:00', esperados: 1012, leidos: 0, difer: 0, nota: '' },
    { bloque: 'C', estado: 'Sin barrido hoy', hora: '—', esperados: 0, leidos: 0, difer: 0, nota: '' },
  ];

  /* -------------------------------------------- equipos, tractocamiones y movimientos (solo por telemetría) */
  db.tractos = Array.from({ length: 12 }, (_, k) => ({ id: 'TC-' + String(11 + k).padStart(2, '0'), estado: k === 6 ? 'Disponible' : k === 9 ? 'En mantenimiento' : 'Asignado', grua: ['G1', 'G2', 'G3'][k % 3], mov: k === 6 || k === 9 ? '' : 'Descarga de ' + contAz().cont, pos: ['Muelle, sitio 1', 'Vía principal', 'Bloque A', 'Bloque E', 'Bloque F'][k % 5], eta: 1 + (k % 4) }));
  db.movimientos = Array.from({ length: 24 }, (_, k) => { const c = contAz(); return { id: 'MV-' + (88120 + k), hora: hm(600 + k * 2), cont: c.cont, tipo: r.de(['Descarga', 'Embarque', 'Recepción en patio', 'Entrega a camión', 'Remoción']), equipo: r.de(['G1', 'G2', 'G3', 'RTG-03', 'RTG-05', 'RTG-07', 'RTG-11']), fuente: 'Telemetría del equipo', confianza: r() < 0.94 ? 'Alta' : 'Media' }; });
  db.detenciones = [{ grua: 'G2', desde: '09:41', min: 4, causa: 'Espera de tractocamión' }, { grua: 'G1', desde: '10:02', min: 3, causa: 'Espera de tractocamión' }, { grua: 'G3', desde: '08:55', min: 6, causa: 'Cambio de bodega' }];

  /* -------------------------------------------- patio refrigerado: 26 tableros y 2.400 tomas */
  db.tableros = [];
  let t = 0;
  for (let k = 1; k <= 26; k++) {
    const n = k <= 8 ? 93 : 92; const bloque = k <= 9 ? 'R1' : k <= 18 ? 'R2' : 'R3';
    const tomas = Array.from({ length: n }, (_, j) => ({ n: j + 1, est: r() < 0.71 ? 'ok' : 'libre', cont: null }));
    db.tableros.push({ id: 'TR-' + String(k).padStart(2, '0'), bloque, tomas, falla: false }); t += n;
  }
  db.totalTomas = t; // 2.400
  const CARGAS_FRIO = [['Cerezas', -0.5], ['Arándanos', 0.0], ['Uva de mesa', -0.5], ['Kiwis', -0.5], ['Salmón congelado', -18], ['Carne congelada', -20]];
  let sec = 400100;
  for (const tb of db.tableros) for (const tm of tb.tomas) if (tm.est === 'ok') { const nv = r.de(NAVIERAS.filter((n) => n.id !== 'BML')); const [carga, consigna] = r.de(CARGAS_FRIO); tm.cont = { cont: codigoISO(nv.pref, String(sec += r.ent(3, 40))), naviera: nv.id, carga, consigna, cliente: r.de(['Exportadora Valle Alto S.A.', 'Frutícola Tres Cumbres S.A.', 'Agrícola Los Aromos Ltda.', 'Pesquera Bahía Sur S.A.']), desde: dia(-r.ent(0, 4)) }; }
  const fijar = (tbId, n, est, extra = {}) => { const tm = db.tableros.find((x) => x.id === tbId).tomas[n - 1]; tm.est = est; tm.cont = { cont: extra.cont, naviera: extra.naviera || 'PRL', carga: extra.carga || 'Cerezas', consigna: extra.consigna ?? -0.5, cliente: extra.cliente || 'Exportadora Valle Alto S.A.', desde: dia(-1) }; return tm; };
  fijar('TR-07', 41, 'alarma', { cont: codigoISO('PRLU', '604418'), carga: 'Cerezas', consigna: -0.5 });
  fijar('TR-12', 18, 'desc', { cont: codigoISO('PRLU', '611930'), carga: 'Arándanos', consigna: 0, cliente: 'Frutícola Tres Cumbres S.A.' });
  fijar('TR-21', 7, 'sensor', { cont: codigoISO('MCSU', '402271'), naviera: 'MCS', carga: 'Salmón congelado', consigna: -18, cliente: 'Pesquera Bahía Sur S.A.' });
  db.alarmas = [
    { id: 'AL-7781', tipo: 'Desviación de temperatura', tablero: 'TR-07', toma: 41, cont: codigoISO('PRLU', '604418'), detalle: 'Temperatura de retorno 3,4 °C con consigna −0,5 °C, subiendo hace 11 minutos', evento: '10:21', aviso: '10:22', destinatarios: ['Camila Rojas Espinoza (ronda reefer)', 'Jorge Saavedra Pino (supervisor de turno)'], estado: 'Activa', escalada: false, confirmada: null, duenoAvisado: '10:22' },
    { id: 'AL-7782', tipo: 'Desconexión de toma', tablero: 'TR-12', toma: 18, cont: codigoISO('PRLU', '611930'), detalle: 'La toma dejó de entregar energía; el contenedor reporta funcionamiento con batería', evento: '10:09', aviso: '10:10', destinatarios: ['Camila Rojas Espinoza (ronda reefer)', 'Jorge Saavedra Pino (supervisor de turno)'], estado: 'Escalada', escalada: true, escaladaA: 'Andrés Vial Ossandón (jefatura de operaciones)', confirmada: null, duenoAvisado: '10:10' },
    { id: 'AL-7779', tipo: 'Sensor caído', tablero: 'TR-21', toma: 7, cont: codigoISO('MCSU', '402271'), detalle: 'Sin lecturas del sensor hace 9 minutos. No es condición estable: la serie estable conserva lecturas cada minuto', evento: '09:58', aviso: '09:59', destinatarios: ['Camila Rojas Espinoza (ronda reefer)', 'Jorge Saavedra Pino (supervisor de turno)'], estado: 'Activa', escalada: false, confirmada: null, duenoAvisado: null },
    { id: 'AL-7770', tipo: 'Desviación de temperatura', tablero: 'TR-03', toma: 12, cont: codigoISO('NAPU', '418802'), detalle: 'Desviación de 1,6 °C por apertura de puertas durante la inspección', evento: '08:14', aviso: '08:15', destinatarios: ['Camila Rojas Espinoza (ronda reefer)', 'Jorge Saavedra Pino (supervisor de turno)'], estado: 'Confirmada', escalada: false, confirmada: { por: 'Camila Rojas Espinoza', hora: '08:19', accion: 'Puertas cerradas; temperatura normal a las 08:34' }, duenoAvisado: '08:15' },
  ];
  db.rondas = [{ hora: '07:30', por: 'Camila Rojas Espinoza', tableros: 'TR-01 a TR-09', obs: 'Sin novedad', canal: 'App Móvil de Terreno' }];
  db.certificados = [
    { id: 'CF-AC-2028-0418', embarque: 'BL ATSU-77120', cont: codigoISO('PRLU', '598804'), cliente: 'Exportadora Valle Alto S.A.', carga: 'Cerezas', desde: 'jueves 2 de noviembre, 14:10', hasta: 'domingo 5 de noviembre, 21:46', lecturas: 4656, desvios: 0, huella: 'b41c 9e07 52aa 03d1 77fe 1c90 6b2e d815', estado: 'Emitido' },
    { id: 'CF-AC-2028-0419', embarque: 'BL NAPS-30981', cont: codigoISO('PRLU', '601127'), cliente: 'Frutícola Tres Cumbres S.A.', carga: 'Arándanos', desde: 'viernes 3 de noviembre, 09:02', hasta: 'lunes 6 de noviembre, 06:15', lecturas: 4153, desvios: 1, huella: '7d02 c3e9 a1b4 5f60 08ce 92d7 33ab 1e45', estado: 'Emitido con observación' },
  ];

  /* -------------------------------------------- naves y planificación */
  db.recaladas = [
    { id: 'REC-1183', nave: 'Andes Pacífico', naviera: 'NAP', sitio: 1, eta: 'lunes 6, 05:30', etd: 'lunes 6, 21:00', estado: 'En operación', gruas: ['G1', 'G2', 'G3'], movs: 1240, hechos: 702, ventana: 'Confirmada', anuncio: 'BAPLIE recibido 03-11', prod: 27.4 },
    { id: 'REC-1184', nave: 'Cóndor Austral', naviera: 'AAS', sitio: 2, eta: 'martes 7, 14:00', etd: 'miércoles 8, 06:00', estado: 'Recepción de exportación', gruas: ['G4', 'G5'], movs: 980, hechos: 0, ventana: 'Confirmada', anuncio: 'BAPLIE recibido 05-11', prod: null, cierre: 'martes 7, 08:00' },
    { id: 'REC-1185', nave: 'Humboldt Explorer', naviera: 'LHB', sitio: 3, eta: 'martes 7, 22:00', etd: 'miércoles 8, 18:00', estado: 'Anunciada', gruas: ['G6'], movs: 610, hechos: 0, ventana: 'Confirmada', anuncio: 'COPRAR recibido 04-11', prod: null },
    { id: 'REC-1186', nave: 'Polaris Frost', naviera: 'PRL', sitio: 1, eta: 'jueves 9, 12:00', etd: 'viernes 10, 04:00', estado: 'Anunciada', gruas: ['G1', 'G2'], movs: 720, hechos: 0, ventana: 'Por confirmar', anuncio: 'BAPLIE recibido 06-11', prod: null, plazo: 'hoy, 12:00 (72 horas antes del atraque)' },
    { id: 'REC-1187', nave: 'Mar de Chiloé', naviera: 'MCS', sitio: 3, eta: 'viernes 10, 08:00', etd: 'viernes 10, 23:00', estado: 'Anunciada', gruas: ['G6'], movs: 430, hechos: 0, ventana: 'Por confirmar', anuncio: 'COPRAR recibido 06-11', prod: null, plazo: 'martes 7, 08:00' },
    { id: 'REC-1188', nave: 'Brisa del Sur', naviera: 'BML', sitio: 2, eta: 'sábado 11, 10:00', etd: 'domingo 12, 02:00', estado: 'Anunciada', gruas: ['G4'], movs: 380, hechos: 0, ventana: 'Por confirmar', anuncio: 'Planilla recibida por el canal puente 06-11', prod: null, plazo: 'miércoles 8, 10:00' },
  ];
  db.planes = {
    'REC-1184': { estado: 'Propuesto', version: 3, propuestoA: '09:40', movs: 980, remocionesEst: 41, reglas: ['RP-03 v2', 'RP-07 v1', 'RP-11 v4'], correcciones: [], marcado: false },
    'REC-1183': { estado: 'Aprobado', version: 5, propuestoA: 'domingo 5, 18:20', movs: 1240, remocionesEst: 58, reglas: ['RP-03 v2', 'RP-07 v1'], correcciones: [{ por: 'Carolina Méndez Araya', motivo: 'Segregación de carga peligrosa', detalle: 'Bahía 34 cambia a cubierta' }], aprobado: 'Carolina Méndez Araya, domingo 5, 19:02', marcado: false },
  };
  db.reglas = [
    { id: 'RP-03', n: 'Contenedores de más de 26 toneladas bajo los más livianos de la misma bahía', version: 2, desde: '14-10', por: 'Carolina Méndez Araya', estado: 'Vigente', hist: [{ v: 1, desde: '02-08', cambio: 'Umbral de 28 toneladas' }, { v: 2, desde: '14-10', cambio: 'Umbral baja a 26 toneladas tras la validación en sombra' }] },
    { id: 'RP-07', n: 'Refrigerados de una misma nave en tomas de tableros distintos', version: 1, desde: '20-09', por: 'Carolina Méndez Araya', estado: 'Vigente', hist: [{ v: 1, desde: '20-09', cambio: 'Regla registrada desde la entrevista con el planificador' }] },
    { id: 'RP-11', n: 'Orden de recepción por puerto de destino: el último puerto, abajo', version: 4, desde: '04-10', por: 'Carolina Méndez Araya', estado: 'Vigente', hist: [{ v: 3, desde: '11-10', cambio: 'Excepción para transbordos' }, { v: 4, desde: '04-10', cambio: 'Excepción también para la alianza' }] },
    { id: 'RP-14', n: 'Carga peligrosa clase 3 separada al menos una bahía de la clase 5.1', version: 1, desde: '22-09', por: 'Carolina Méndez Araya', estado: 'Vigente', hist: [{ v: 1, desde: '22-09', cambio: 'Registrada' }] },
    { id: 'RP-15', n: 'Grúas de más de 20 años sin ciclos dobles de 40 pies', version: 1, desde: '30-10', por: 'Carolina Méndez Araya', estado: 'En validación en sombra', hist: [{ v: 1, desde: '30-10', cambio: 'Propuesta; se compara contra los planes aprobados de octubre' }] },
  ];
  db.productividad = [{ grua: 'G1', movh: 28.6, meta: 30, espera: 3 }, { grua: 'G2', movh: 25.9, meta: 30, espera: 7 }, { grua: 'G3', movh: 27.7, meta: 30, espera: 4 }];

  /* -------------------------------------------- inspecciones de autoridad */
  const AUT = [['Aduana', 'Aforo físico'], ['Autoridad fitosanitaria', 'Inspección fitosanitaria'], ['Autoridad sanitaria', 'Muestreo sanitario']];
  const EST_INS = ['Recibido', 'Cita propuesta', 'Cita confirmada', 'Remoción programada', 'En inspección', 'Acta firmada'];
  db.inspecciones = [];
  for (let k = 0; k < 27; k++) {
    const [aut, motivo] = AUT[k % 3]; const c = contAz(); const e = k < 3 ? k : r.ent(0, 5);
    const cita = e >= 1 ? { dia: r.ent(0, 2), hora: hm(r.de([540, 600, 660, 720, 840, 900])) } : null;
    db.inspecciones.push({ id: 'INS-' + (3300 + k), cont: c.cont, naviera: c.naviera, autoridad: aut, motivo, estado: EST_INS[e], cita, pos: `${r.de(['A', 'B', 'C', 'D', 'E', 'F', 'R1', 'R2'])}-${String(r.ent(1, 30)).padStart(2, '0')}-${String(r.ent(1, 6)).padStart(2, '0')}-${r.ent(1, 5)}`, remociones: r.ent(0, 3), recibido: hm(r.ent(380, 620)), riesgo: e < 3 && r() < 0.35, atraso: e === 5 && r() < 0.14 ? r.de(['Remoción tardía', 'Inspector llegó tarde', 'Contenedor no ubicado']) : '', historial: [] });
  }
  db.inspecciones[7] = { ...db.inspecciones[7], id: 'INS-3307', cont: codigoISO('TRSU', '552310'), naviera: 'TRS', autoridad: 'Aduana', motivo: 'Aforo físico', estado: 'Cita propuesta', cita: { dia: 0, hora: '11:30' }, pos: 'C-09-02-4', remociones: 2, riesgo: false, atraso: '' };
  db.inspecciones[0] = { ...db.inspecciones[0], id: 'INS-3300', cont: codigoISO('ACLU', '290417'), naviera: 'ACL', autoridad: 'Aduana', motivo: 'Aforo físico', estado: 'Recibido', cita: null, pos: 'B-15-03-2', remociones: 1, riesgo: true, atraso: '' };

  /* -------------------------------------------- evidencia comercial: hechos facturables (sin montos) */
  const TIPOS_HF = {
    ALM: { n: 'Días de almacenaje', u: 'días', regla: 'Días corridos desde el día siguiente al ingreso al patio (el ingreso es el día cero), con 3 días libres y corte a las 23:59' },
    MOV: { n: 'Movimiento adicional', u: 'movimientos', regla: 'Remoción pedida por el cliente o por la autoridad, registrada por telemetría' },
    PES: { n: 'Pesaje', u: 'pesajes', regla: 'Pesaje en la báscula del gate contra la masa bruta declarada' },
    INS: { n: 'Inspección', u: 'inspecciones', regla: 'Atención de la autoridad con acta firmada' },
    IMO: { n: 'Carga peligrosa', u: 'días', regla: 'Días en el bloque K con declaración de carga peligrosa' },
    REF: { n: 'Horas de conexión reefer', u: 'horas', regla: 'Horas conectadas según la telemetría de la toma' },
  };
  db.tiposHF = TIPOS_HF;
  db.hechos = [];
  const CLIENTES = ['Exportadora Valle Alto S.A.', 'Frutícola Tres Cumbres S.A.', 'Agrícola Los Aromos Ltda.', 'Importadora Ferretera Austral S.A.', 'Pesquera Bahía Sur S.A.'];
  for (let k = 0; k < 48; k++) {
    const tipo = r.de(Object.keys(TIPOS_HF)); const c = contAz();
    const cant = tipo === 'ALM' || tipo === 'IMO' ? r.ent(1, 9) : tipo === 'REF' ? r.ent(18, 140) : tipo === 'MOV' ? r.ent(1, 3) : 1;
    db.hechos.push({ id: 'HF-' + (608400 + k), tipo, cont: c.cont, naviera: c.naviera, cliente: r.de(CLIENTES), cant, dia: -r.ent(0, 6), hora: hm(r.ent(360, 1380)), estado: r() < 0.82 ? 'Entregado con acuse' : 'Registrado', sello: Array.from({ length: 4 }, () => r.ent(0x1000, 0xffff).toString(16)).join(' '), origen: tipo === 'REF' ? 'Telemetría de toma ' + r.de(db.tableros).id : tipo === 'PES' ? 'Báscula del gate, puesto ' + r.ent(1, 8) : 'Telemetría de ' + r.de(['RTG-03', 'RTG-05', 'RTG-07', 'G1', 'G2']) });
  }
  db.hechos[3] = { ...db.hechos[3], id: 'HF-608403', tipo: 'ALM', cont: codigoISO('ACLU', '118250'), naviera: 'ACL', cliente: 'Exportadora Valle Alto S.A.', cant: 3, estado: 'Objetado', origen: 'Entrada al gate el martes 31 de octubre, 16:42; salida al muelle el lunes 6 de noviembre, 09:15' };
  db.objeciones = [
    { id: 'OB-0311', hecho: 'HF-608403', cliente: 'Exportadora Valle Alto S.A.', motivo: 'El cliente indica 2 días facturables y no 3: cuenta el día de la salida como libre', presentada: 'lunes 6, 08:12', por: 'Ignacio Herrera Vidal', estado: 'En revisión', plazo: 'miércoles 8, 08:12', resolucion: null },
    { id: 'OB-0308', hecho: 'HF-608377', cliente: 'Frutícola Tres Cumbres S.A.', motivo: 'Horas de conexión reefer: el contenedor estuvo desconectado durante la inspección', presentada: 'viernes 3, 15:40', por: 'Agencia de Aduanas Puerto Claro', estado: 'Aceptada', plazo: '—', resolucion: 'Se descuentan 2 horas: la telemetría de la toma TR-03/12 confirma la desconexión de 08:14 a 10:20' },
    { id: 'OB-0305', hecho: 'HF-608351', cliente: 'Agrícola Los Aromos Ltda.', motivo: 'Movimiento adicional no solicitado', presentada: 'jueves 2, 11:05', por: 'Agencia de Aduana Cordillera', estado: 'Rechazada', plazo: '—', resolucion: 'La remoción RM-2177 la pidió la autoridad fitosanitaria (INS-3262, acta firmada)' },
  ];
  db.conciliacion = [
    { dia: -1, hechos: 3912, entregados: 3912, acuses: 3912, difer: 0, estado: 'Conciliado' },
    { dia: -2, hechos: 4106, entregados: 4106, acuses: 4104, difer: 2, estado: 'Conciliado con 2 acuses reenviados' },
    { dia: -3, hechos: 3877, entregados: 3877, acuses: 3877, difer: 0, estado: 'Conciliado' },
  ];

  /* -------------------------------------------- energía y emisiones */
  db.equipos = [
    { tipo: 'Grúas de muelle', n: 6, fuente: 'Eléctrica', consumo: 9084, unidad: 'kWh', emis: 2.8 },
    { tipo: 'Grúas de patio diésel', n: 16, fuente: 'Diésel', consumo: 1746, unidad: 'litros', emis: 4.7 },
    { tipo: 'Grúas de patio eléctricas', n: 2, fuente: 'Eléctrica', consumo: 844, unidad: 'kWh', emis: 0.3 },
    { tipo: 'Tractocamiones', n: 42, fuente: 'Diésel', consumo: 2134, unidad: 'litros', emis: 5.7 },
    { tipo: 'Equipos pesados', n: 14, fuente: 'Diésel', consumo: 631, unidad: 'litros', emis: 1.7 },
  ];
  db.intensidad = { base: 12.4, actual: 11.6, porRemociones: 4.6, unidad: 'kg CO₂e por contenedor' };

  /* -------------------------------------------- Hub de Integración */
  const TIPOS_MSG = ['BAPLIE', 'COPRAR', 'COARRI', 'CODECO'];
  db.mensajes = [];
  for (let k = 0; k < 36; k++) {
    const n = r.de(NAVIERAS.filter((x) => x.canal === 'edifact')); const tipo = r.de(TIPOS_MSG); const dir = tipo === 'BAPLIE' || tipo === 'COPRAR' ? 'Recibido' : r() < 0.8 ? 'Emitido' : 'Recibido';
    const rech = r() < 0.08;
    db.mensajes.push({ id: 'MSG-' + (770300 + k), tipo, dir, naviera: n.id, version: n.version, hora: hm(380 + k * 9), correl: 'COR-' + n.id + '-' + (4400 + Math.floor(k / 3)), estado: rech ? 'Rechazado' : 'Aceptado', motivo: rech ? r.de(['Segmento EQD con dígito verificador ISO 6346 erróneo', 'Firma de origen no corresponde a la contraparte', 'Versión del mensaje no acordada con la contraparte']) : '', segmentos: r.ent(40, 900) });
  }
  db.puente = [
    { id: 'PU-0091', naviera: 'IMC', archivo: 'IMC_carga_REC-1190.xlsx', tipo: 'Lista de carga', hora: 'viernes 3, 17:20', estado: 'Confirmado', filas: 212, errores: 0 },
    { id: 'PU-0094', naviera: 'BML', archivo: 'BML_BrisaDelSur_anuncio.xlsx', tipo: 'Anuncio de recalada', hora: 'lunes 6, 07:05', estado: 'Confirmado', filas: 1, errores: 0 },
  ];
  db.intercambios = [
    { contraparte: 'Aduana', canal: 'Servicio de intercambio de la autoridad', ultimo: '10:18', hoy: 342, rechazados: 0, estado: 'En línea' },
    { contraparte: 'Autoridad fitosanitaria', canal: 'Servicio de intercambio de la autoridad', ultimo: '10:11', hoy: 87, rechazados: 1, estado: 'En línea' },
    { contraparte: 'Autoridad sanitaria', canal: 'Correo estructurado con acuse', ultimo: '09:40', hoy: 12, rechazados: 0, estado: 'En línea' },
    { contraparte: 'Ferrocarril del Valle S.A. (operador ferroviario)', canal: 'Archivo de composición del tren', ultimo: '09:05', hoy: 4, rechazados: 0, estado: 'En línea' },
  ];

  /* -------------------------------------------- contrapartes externas */
  db.terceros = [
    ...NAVIERAS.map((n) => ({ id: n.id, n: n.n, tipo: 'Naviera', rut: null, canal: n.canal === 'edifact' ? 'Integrada por mensajería estándar' : 'Canal puente', alianza: n.alianza, estado: 'Activa', contacto: 'Mesa de operaciones', correo: 'operaciones@' + n.id.toLowerCase() + '.example' })),
    ...[['AGP', 'Agencia de Aduana del Pacífico', 'Agencia de aduana'], ['AGC', 'Agencia de Aduana Cordillera', 'Agencia de aduana'], ['APC', 'Agencia de Aduanas Puerto Claro', 'Agencia de aduana'], ['ALC', 'Agencia Litoral Central', 'Agencia de aduana'],
      ['TCS', 'Transportes Cordillera Sur Ltda.', 'Empresa de transporte'], ['TRC', 'Transportes Ruta Cinco SpA', 'Empresa de transporte'], ['LQV', 'Logística Quebrada Verde SpA', 'Empresa de transporte'], ['FCB', 'Fletes Costa Brava Ltda.', 'Empresa de transporte'],
      ['EVA', 'Exportadora Valle Alto S.A.', 'Exportador o importador'], ['ALA', 'Agrícola Los Aromos Ltda.', 'Exportador o importador'], ['FTC', 'Frutícola Tres Cumbres S.A.', 'Exportador o importador'], ['IFA', 'Importadora Ferretera Austral S.A.', 'Exportador o importador'], ['PBS', 'Pesquera Bahía Sur S.A.', 'Exportador o importador'],
      ['ADU', 'Aduana', 'Autoridad'], ['AFI', 'Autoridad fitosanitaria', 'Autoridad'], ['ASA', 'Autoridad sanitaria', 'Autoridad'], ['FDV', 'Ferrocarril del Valle S.A.', 'Operador ferroviario'],
      ['VCA', 'Verificadora Cerro Alegre SpA', 'Proveedor del terminal'], ['MGP', 'Mantención Grúas del Pacífico Ltda.', 'Proveedor del terminal'], ['EFI', 'Electro Frío Industrial SpA', 'Proveedor del terminal']]
      .map(([id, n, tipo], k) => ({ id, n, tipo, rut: tipo === 'Autoridad' ? null : 76100000 + k * 137911 + r.ent(0, 9999), canal: tipo === 'Autoridad' || tipo === 'Operador ferroviario' ? 'Intercambio con la autoridad o el operador' : 'Portal de clientes', alianza: false, estado: 'Activa', contacto: r.de(['Mesa de operaciones', 'Jefatura comercial', 'Coordinación']), correo: 'contacto@' + id.toLowerCase() + '.example' })),
  ];
  db.terceros.forEach((x, k) => { x.ind = { citas: 80 + r.ent(0, 18), docs: 70 + r.ent(0, 28), rech: r.ent(0, 6), obj: r.ent(0, 5) }; x.usuarios = r.ent(1, 9); x.desde = r.de(['marzo', 'abril', 'junio', 'agosto', 'septiembre']); x.id2 = k; });

  /* -------------------------------------------- personas usuarias, roles y permisos */
  const NOMBRES = ['Valeria Castillo', 'Pedro Gallardo', 'Josefina Lillo', 'Martín Barrera', 'Antonia Fuenzalida', 'Cristóbal Navarro', 'Fernanda Olivares', 'Ricardo Zúñiga', 'Paz Henríquez', 'Esteban Carrasco', 'Javiera Bustos', 'Mauricio Sepúlveda'];
  db.usuarios = Object.entries(PERSONAS).filter(([k]) => k !== 'publico').map(([k, p], i) => ({ id: 'U-' + (1100 + i), n: p.n, correo: p.correo, rol: k, unidad: p.org === 'Terminal Portuario Aconcagua' ? unidadDe(k) : 'Externo · ' + p.org, estado: 'Activa', ultimo: hm(400 + i * 17) }));
  NOMBRES.forEach((n, i) => db.usuarios.push({ id: 'U-' + (1200 + i), n, correo: normal(n).replace(' ', '.') + '@aconcagua.cl', rol: ['gate', 'supervisor', 'ronda', 'operador_patio', 'documentacion', 'gate'][i % 6], unidad: unidadDe(['gate', 'supervisor', 'ronda', 'operador_patio', 'documentacion', 'gate'][i % 6]), estado: i === 7 ? 'Suspendida' : 'Activa', ultimo: hm(300 + i * 31) }));
  db.permisos = ['Ver operación', 'Atender gate', 'Declarar condiciones de patio', 'Aprobar planes', 'Confirmar alarmas reefer', 'Resolver objeciones', 'Gestionar inspecciones', 'Ver auditoría', 'Administrar personas y roles', 'Cambiar parámetros', 'Aprobar transferencia de autoridad', 'Exportar informes'];
  db.roles = {
    gate: [0, 1], supervisor: [0, 1, 4, 6, 11], planificador: [0, 2, 3, 11], jefatura: [0, 3, 4, 7, 10, 11], admin: [0, 7, 8, 9, 11], facturacion: [0, 5, 11], documentacion: [0, 6, 11], proteccion: [0, 7], ronda: [0, 4], operador_patio: [0], operador_grua: [0],
  };
  db.parametros = [
    { id: 'P-GAT-01', n: 'Tolerancia de masa bruta', valor: 5, unidad: '% del peso declarado', min: 2, max: 10, paso: 0.5, modulo: 'Gate, patio y equipos', efecto: 'masa' },
    { id: 'P-GAT-02', n: 'Capacidad declarada por franja de 30 minutos (07:00 a 10:00)', valor: 44, unidad: 'camiones', min: 20, max: 60, paso: 1, modulo: 'Gate, patio y equipos', efecto: 'franja' },
    { id: 'P-GAT-03', n: 'Tolerancia de llegada para conservar la prioridad de la cita', valor: 15, unidad: 'minutos', min: 0, max: 30, paso: 5, modulo: 'Gate, patio y equipos', efecto: 'prioridad' },
    { id: 'P-REF-01', n: 'Desviación de temperatura que genera alarma', valor: 1.5, unidad: '°C sobre la consigna', min: 0.5, max: 4, paso: 0.5, modulo: 'Patio refrigerado', efecto: 'reefer' },
    { id: 'P-REF-02', n: 'Tiempo sin confirmación antes de escalar una alarma', valor: 3, unidad: 'minutos', min: 1, max: 10, paso: 1, modulo: 'Patio refrigerado', efecto: 'escala' },
    { id: 'P-INS-01', n: 'Anticipación mínima para proponer la cita de inspección', valor: 2, unidad: 'horas', min: 1, max: 12, paso: 1, modulo: 'Evidencia comercial y regulatoria', efecto: 'insp' },
    { id: 'P-ACC-01', n: 'Vigencia de la credencial temporal después del término de la nombrada', valor: 30, unidad: 'minutos', min: 0, max: 120, paso: 15, modulo: 'Identidad y acceso', efecto: 'cred' },
    { id: 'P-NAV-01', n: 'Anticipación de la confirmación de la ventana de atraque', valor: 72, unidad: 'horas', min: 48, max: 96, paso: 12, modulo: 'Nave y planificación', efecto: 'ventana' },
  ];
  db.flujos = [
    { id: 'FL-01', n: 'Objeción de un hecho facturable', pasos: ['Cliente presenta', 'Analista revisa la evidencia', 'Resolución', 'Aviso al cliente'], plazo: '48 horas' },
    { id: 'FL-02', n: 'Cita de inspección de autoridad', pasos: ['Documentación propone', 'Inspector confirma', 'Remoción programada', 'Atención', 'Acta firmada'], plazo: 'Según la cita' },
    { id: 'FL-03', n: 'Transferencia de autoridad de un dominio', pasos: ['Solicitud', 'Aprobación de otra persona', 'Cambio de fuente oficial', 'Conciliación del turno'], plazo: 'Antes del cierre del turno' },
  ];
  db.plantillasNotif = [
    { id: 'NT-REF-01', n: 'Alarma reefer al personal de ronda', canal: 'App Móvil de Terreno y mensaje de texto', version: 4, critica: true, cuerpo: 'Alarma {tipo} en {tablero}, toma {toma}: contenedor {contenedor}. Confirma en la app.' },
    { id: 'NT-REF-02', n: 'Aviso proactivo al dueño de la carga', canal: 'Correo y portal', version: 2, critica: true, cuerpo: 'Su contenedor {contenedor} ({carga}) registró {tipo} a las {hora}. El terminal ya está actuando: {accion}.' },
    { id: 'NT-GAT-01', n: 'Documento faltante a la agencia de aduana', canal: 'Portal y correo', version: 3, critica: true, cuerpo: 'El camión {patente} con el contenedor {contenedor} está en el carril de excepción: falta {documento}. Súbalo en el portal; el camión conserva su franja.' },
    { id: 'NT-POR-01', n: 'Boletín de novedades del portal', canal: 'Correo', version: 1, critica: false, cuerpo: 'Novedades del mes en el portal del Terminal Portuario Aconcagua.' },
  ];
  db.plantillasDoc = [
    { id: 'DT-01', n: 'Acta de inspección conjunta', version: 3, firma: true }, { id: 'DT-02', n: 'Conformidad de recepción de contenedor', version: 2, firma: true },
    { id: 'DT-03', n: 'Conformidad de entrega de contenedor', version: 2, firma: true }, { id: 'DT-04', n: 'Instrucción de embarque', version: 5, firma: true },
    { id: 'DT-05', n: 'Conformidad de los hechos facturables del período', version: 1, firma: true }, { id: 'DT-06', n: 'Certificado de integridad de cadena de frío', version: 2, firma: true },
  ];
  db.retencion = [
    { clase: 'Hechos facturables y su evidencia', plazo: '6 años', base: 'Respaldo tributario y contractual', eliminacion: 'Automática al vencer, con acta' },
    { clase: 'Registros de ingreso y salida por zona', plazo: '5 años', base: 'Protección portuaria y datos personales (Ley N.º 21.719)', eliminacion: 'Automática al vencer, con acta' },
    { clase: 'Series de temperatura reefer', plazo: '5 años', base: 'Evidencia de cadena de frío', eliminacion: 'Automática al vencer, con acta' },
    { clase: 'Auditoría de accesos y cambios', plazo: 'El de la clase auditada', base: 'Trazabilidad de la operación', eliminacion: 'Revisión humana antes de eliminar' },
    { clase: 'Credenciales temporales vencidas', plazo: '90 días', base: 'Datos personales mínimos (Ley N.º 21.719)', eliminacion: 'Automática' },
  ];

  /* -------------------------------------------- identidad y acceso */
  db.zonas = [
    { id: 'Z-MUE', n: 'Muelle', presentes: 96 }, { id: 'Z-PSE', n: 'Patio seco', presentes: 141 }, { id: 'Z-PRF', n: 'Patio refrigerado', presentes: 38 },
    { id: 'Z-GAT', n: 'Gate', presentes: 44 }, { id: 'Z-TAL', n: 'Talleres', presentes: 52 }, { id: 'Z-OFI', n: 'Oficinas', presentes: 71 },
  ];
  db.nombrada = { id: 'NOM-1206-A', turno: 'Turno A, 07:00 a 15:00', eventuales: 312, propios: 130, credenciales: 312 };
  db.accesos = Array.from({ length: 18 }, (_, k) => ({ hora: hm(412 + k * 13), persona: k === 3 ? 'Luis Cárcamo Toledo' : r.de(['Trabajador eventual', 'Trabajador propio', 'Contratista']) + ' ' + (2000 + k), zona: r.de(db.zonas).n, sentido: r() < 0.8 ? 'Ingreso' : 'Salida', medio: r.de(['Credencial temporal', 'Credencial permanente', 'Credencial temporal']) }));

  /* -------------------------------------------- documentos y firmas */
  db.documentos = [
    { id: 'DOC-55120', n: 'Instrucción de embarque IE-20871', tipo: 'Instrucción de embarque', version: 2, autor: 'Ignacio Herrera Vidal', fecha: 'lunes 6, 09:12', etiquetas: ['REC-1184', 'Exportadora Valle Alto S.A.'], acceso: 'Agencia, documentación y planificación', firma: 'Pendiente' },
    { id: 'DOC-55118', n: 'Acta de inspección INS-3291', tipo: 'Acta de inspección conjunta', version: 1, autor: 'ATOS (desde plantilla DT-01 v3)', fecha: 'lunes 6, 08:40', etiquetas: ['Aduana', codigoISO('NVCU', '508812')], acceso: 'Autoridad, documentación y cliente', firma: 'Firmada' },
    { id: 'DOC-55117', n: 'Conformidad de recepción VIS-240861', tipo: 'Conformidad de recepción', version: 1, autor: 'ATOS (desde plantilla DT-02 v2)', fecha: 'lunes 6, 08:05', etiquetas: ['Transportes Ruta Cinco SpA'], acceso: 'Transporte, gate y cliente', firma: 'Firmada' },
    { id: 'DOC-55101', n: 'Conformidad de hechos facturables de octubre', tipo: 'Conformidad de los hechos facturables', version: 3, autor: 'Felipe Araya Núñez', fecha: 'viernes 3, 18:30', etiquetas: ['Exportadora Valle Alto S.A.', 'octubre'], acceso: 'Facturación y cliente', firma: 'Pendiente' },
    { id: 'DOC-55090', n: 'Certificado de integridad CF-AC-2028-0418', tipo: 'Certificado de cadena de frío', version: 1, autor: 'ATOS (desde plantilla DT-06 v2)', fecha: 'lunes 6, 06:20', etiquetas: ['Cerezas', 'BL ATSU-77120'], acceso: 'Cliente y público con el código', firma: 'Firmada' },
    { id: 'DOC-55077', n: 'Guía de despacho 0048213', tipo: 'Guía de despacho', version: 1, autor: 'Transportes Ruta Cinco SpA', fecha: 'lunes 6, 07:48', etiquetas: ['HXLW-28'], acceso: 'Agencia, transporte y gate', firma: 'No aplica' },
  ];

  /* -------------------------------------------- convivencia con el TOS 2012 */
  db.dominios = [
    { id: 'gate', n: 'Gate', autoridad: 'ATOS', dual: true, divAT: 0, divTA: 0, umbral: 0, avance: 'Activo', ultima: 'Turno C, 06:58' },
    { id: 'patio', n: 'Patio y posición', autoridad: 'ATOS', dual: true, divAT: 3, divTA: 1, umbral: 5, avance: 'Activo', ultima: 'Turno C, 06:58' },
    { id: 'reefer', n: 'Patio refrigerado', autoridad: 'ATOS', dual: true, divAT: 0, divTA: 0, umbral: 2, avance: 'Activo', ultima: 'Turno C, 06:58' },
    { id: 'nave', n: 'Nave y planificación', autoridad: 'TOS 2012', dual: true, divAT: 2, divTA: 7, umbral: 5, avance: 'Detenido', ultima: 'Turno C, 06:58', detencion: 'Las 7 divergencias del TOS 2012 hacia ATOS superan el umbral de 5 del dominio' },
    { id: 'factura', n: 'Evidencia facturable', autoridad: 'ATOS', dual: true, divAT: 0, divTA: 0, umbral: 0, avance: 'Activo', ultima: 'Turno C, 06:58' },
    { id: 'zonaR3', n: 'Zona R3 del patio refrigerado', autoridad: 'TOS 2012', dual: true, divAT: 0, divTA: 0, umbral: 2, avance: 'Activo', ultima: 'Turno C, 06:58' },
  ];
  db.solicitudes = [{ id: 'SA-031', dominio: 'zonaR3', accion: 'Transferir a ATOS', motivo: 'Conciliación sin divergencias en los últimos 10 turnos y marcha blanca terminada', por: 'Jorge Saavedra Pino', perfilPor: 'supervisor', hora: '09:30', estado: 'Pendiente de aprobación' }];
  db.opsTos = [
    { hora: '09:12', op: 'Corrección manual de posición', objeto: codigoISO('LHBU', '660291'), dominio: 'Patio y posición', estado: 'Replicada en ATOS' },
    { hora: '09:47', op: 'Cambio de secuencia de embarque', objeto: 'REC-1183, bahía 22', dominio: 'Nave y planificación', estado: 'Divergente: ATOS conserva la secuencia aprobada' },
    { hora: '10:03', op: 'Liberación aduanera recibida', objeto: codigoISO('CHNU', '330981'), dominio: 'Gate', estado: 'Replicada en ATOS' },
  ];

  /* -------------------------------------------- bandeja de tareas y notificaciones */
  db.tareas = [
    { id: 'TA-1', perfiles: ['gate', 'supervisor'], t: 'Camión HXLW-28: falta la autorización aduanera de exportación; la agencia ya fue avisada', proceso: 'Gate', prioridad: 'Alta', vence: '10:55', href: '#/gate/visita/VIS-240872', heredada: null },
    { id: 'TA-2', perfiles: ['supervisor', 'ronda', 'jefatura'], t: 'Alarma AL-7781: desviación de temperatura en TR-07, toma 41', proceso: 'Patio refrigerado', prioridad: 'Crítica', vence: '10:24', href: '#/reefer/alarmas', heredada: null, alarma: 'AL-7781' },
    { id: 'TA-3', perfiles: ['supervisor', 'jefatura'], t: 'Alarma AL-7782 escalada: desconexión de toma en TR-12', proceso: 'Patio refrigerado', prioridad: 'Crítica', vence: 'Vencida', href: '#/reefer/alarmas', heredada: null, alarma: 'AL-7782' },
    { id: 'TA-4', perfiles: ['supervisor'], t: 'Verificación física VF-0931 en el bloque B', proceso: 'Patio y posición', prioridad: 'Alta', vence: '11:30', href: '#/patio/verificaciones', heredada: { turno: 'C', hace: '4 h 12 min' } },
    { id: 'TA-5', perfiles: ['planificador', 'jefatura'], t: 'Aprobar el plan de estiba de REC-1184 Cóndor Austral', proceso: 'Nave y planificación', prioridad: 'Alta', vence: '12:00', href: '#/nave/plan/REC-1184', heredada: null },
    { id: 'TA-6', perfiles: ['jefatura', 'planificador'], t: 'Confirmar la ventana de atraque de REC-1186 Polaris Frost', proceso: 'Nave y planificación', prioridad: 'Alta', vence: '12:00', href: '#/nave/programacion', heredada: null },
    { id: 'TA-7', perfiles: ['documentacion'], t: 'Proponer la cita de inspección INS-3300 (Aduana): riesgo de incumplimiento', proceso: 'Inspecciones', prioridad: 'Alta', vence: '11:00', href: '#/inspecciones/INS-3300', heredada: null },
    { id: 'TA-8', perfiles: ['documentacion', 'inspector'], t: 'Cita de inspección INS-3307 propuesta para hoy a las 11:30', proceso: 'Inspecciones', prioridad: 'Media', vence: '11:00', href: '#/inspecciones/INS-3307', heredada: null },
    { id: 'TA-9', perfiles: ['facturacion'], t: 'Resolver la objeción OB-0311 de Exportadora Valle Alto S.A.', proceso: 'Evidencia facturable', prioridad: 'Media', vence: 'miércoles 8, 08:12', href: '#/evidencia/objeciones', heredada: { turno: 'anterior', hace: '2 h 30 min' } },
    { id: 'TA-10', perfiles: ['facturacion'], t: 'Conciliación diaria del domingo 5: 3.912 hechos con acuse', proceso: 'Evidencia facturable', prioridad: 'Baja', vence: '18:00', href: '#/evidencia/conciliacion', heredada: null },
    { id: 'TA-11', perfiles: ['transporte'], t: 'Reservar la cita del contenedor ATOU 482913 7', proceso: 'Citas', prioridad: 'Alta', vence: '10:20', href: '#/gate/visita/VIS-240871', heredada: null },
    { id: 'TA-12', perfiles: ['carga'], t: 'Subir los documentos de ATOU 482913 7 para la prevalidación', proceso: 'Documentación', prioridad: 'Alta', vence: '10:20', href: '#/portal/documentos', heredada: null },
    { id: 'TA-13', perfiles: ['carga'], t: 'Corregir la instrucción de embarque IE-20871: 2 campos marcados', proceso: 'Instrucción de embarque', prioridad: 'Media', vence: 'martes 7, 08:00', href: '#/portal/instruccion', heredada: null },
    { id: 'TA-14', perfiles: ['inspector'], t: 'Firmar el acta de inspección INS-3291', proceso: 'Inspecciones', prioridad: 'Media', vence: '15:00', href: '#/firma', heredada: null },
    { id: 'TA-15', perfiles: ['verificador'], t: 'Revisar el reporte de emisiones de octubre', proceso: 'Energía y emisiones', prioridad: 'Media', vence: 'viernes 10', href: '#/emisiones/verificador', heredada: null },
    { id: 'TA-16', perfiles: ['naviera_ni'], t: 'Cargar la lista de carga de REC-1190 por el canal puente', proceso: 'Hub de Integración', prioridad: 'Alta', vence: 'martes 7, 12:00', href: '#/hub/puente', heredada: null },
    { id: 'TA-17', perfiles: ['admin'], t: 'Revisar el cambio de tolerancia de masa bruta pedido por la jefatura', proceso: 'Administración', prioridad: 'Media', vence: 'martes 7', href: '#/admin/parametros', heredada: null },
    { id: 'TA-18', perfiles: ['proteccion'], t: 'Simulacro de evacuación del muelle: preparar el conteo por zona', proceso: 'Identidad y acceso', prioridad: 'Media', vence: '14:00', href: '#/acceso/emergencia', heredada: null },
    { id: 'TA-19', perfiles: ['jefatura'], t: 'Aprobar la transferencia de autoridad de la zona R3 del patio refrigerado al ATOS (SA-031)', proceso: 'Convivencia con el TOS 2012', prioridad: 'Media', vence: '15:00', href: '#/convivencia', heredada: null },
    { id: 'TA-20', perfiles: ['trabajador'], t: 'Tu credencial temporal del turno A vence a las 15:30', proceso: 'Identidad y acceso', prioridad: 'Baja', vence: '15:30', href: '#/acceso/credencial', heredada: null },
    { id: 'TA-21', perfiles: ['conductor'], t: 'Tu cita de las 10:30 en el puesto de gate: lleva la guía de despacho', proceso: 'Citas', prioridad: 'Media', vence: '10:30', href: '#/terreno/conductor', heredada: null },
    { id: 'TA-22', perfiles: ['operador_patio'], t: 'Instrucción vigente: levantar ATOU 482913 7 del tractocamión', proceso: 'Patio', prioridad: 'Media', vence: '—', href: '#/cabina/patio', heredada: null },
    { id: 'TA-23', perfiles: ['operador_grua'], t: 'Plan vigente de REC-1183, versión 5', proceso: 'Nave', prioridad: 'Media', vence: '—', href: '#/cabina/grua', heredada: null },
  ];
  db.notifs = [
    { id: 'NO-1', perfiles: ['supervisor', 'ronda', 'jefatura'], t: 'Alarma reefer AL-7781 en TR-07, toma 41', hora: '10:22', leida: false, href: '#/reefer/alarmas', critica: true },
    { id: 'NO-2', perfiles: ['jefatura', 'supervisor'], t: 'AL-7782 se escaló a la jefatura: nadie confirmó en 3 minutos', hora: '10:13', leida: false, href: '#/reefer/alarmas', critica: true },
    { id: 'NO-3', perfiles: ['gate', 'supervisor'], t: 'Falta la autorización aduanera de HXLW-28: ATOS avisó a la agencia', hora: '10:12', leida: false, href: '#/gate/visita/VIS-240872', critica: false },
    { id: 'NO-4', perfiles: ['carga'], t: 'La instrucción de embarque IE-20871 tiene 2 campos por corregir', hora: '09:20', leida: false, href: '#/portal/instruccion', critica: false },
    { id: 'NO-5', perfiles: ['carga'], t: 'Aviso proactivo: AL-7781 afecta a su contenedor ' + codigoISO('PRLU', '604418'), hora: '10:22', leida: false, href: '#/portal/frio', critica: true },
    { id: 'NO-6', perfiles: ['facturacion'], t: 'Nueva objeción OB-0311 de Exportadora Valle Alto S.A.', hora: '08:12', leida: true, href: '#/evidencia/objeciones', critica: false },
    { id: 'NO-7', perfiles: ['documentacion', 'inspector'], t: 'Aduana seleccionó 3 contenedores para aforo físico', hora: '07:55', leida: false, href: '#/inspecciones', critica: false },
    { id: 'NO-8', perfiles: ['planificador', 'jefatura'], t: 'Plan de estiba de REC-1184 propuesto, versión 3', hora: '09:40', leida: false, href: '#/nave/plan/REC-1184', critica: false },
    { id: 'NO-9', perfiles: ['jefatura', 'supervisor', 'admin'], t: 'El dominio Nave y planificación detuvo su avance: 7 divergencias', hora: '07:02', leida: false, href: '#/convivencia', critica: false },
    { id: 'NO-10', perfiles: ['transporte', 'conductor'], t: 'Franjas disponibles para hoy desde las 10:30', hora: '09:58', leida: false, href: '#/portal/citas', critica: false },
    { id: 'NO-11', perfiles: ['naviera_ni'], t: 'Se confirmó la planilla PU-0094 del anuncio de Brisa del Sur', hora: '07:06', leida: true, href: '#/hub/puente', critica: false },
    { id: 'NO-12', perfiles: ['verificador'], t: 'El reporte de emisiones de octubre está listo para revisión', hora: '08:00', leida: false, href: '#/emisiones/verificador', critica: false },
    { id: 'NO-13', perfiles: ['admin'], t: 'Exportación de auditoría lista para descargar', hora: '08:31', leida: true, href: '#/admin/auditoria', critica: false },
    { id: 'NO-14', perfiles: ['proteccion'], t: '312 credenciales temporales activas para la nombrada NOM-1206-A', hora: '06:45', leida: false, href: '#/acceso', critica: false },
    { id: 'NO-15', perfiles: ['trabajador'], t: 'Tu credencial temporal del turno A está activa', hora: '06:41', leida: false, href: '#/acceso/credencial', critica: false },
    { id: 'NO-16', perfiles: ['operador_patio', 'operador_grua'], t: 'Instrucción nueva en la terminal de cabina', hora: '10:30', leida: false, href: '#/inicio', critica: false },
  ];

  /* -------------------------------------------- auditoría inicial */
  db.auditoria = [
    { id: 'AU-90011', hora: '06:41', quien: 'ATOS', accion: 'Emisión de 312 credenciales temporales', objeto: 'NOM-1206-A', modulo: 'Identidad y acceso', resultado: 'Correcto', ip: 'Red corporativa' },
    { id: 'AU-90014', hora: '07:02', quien: 'ATOS', accion: 'Detención automática del avance', objeto: 'Dominio Nave y planificación', modulo: 'Convivencia con el TOS 2012', resultado: 'Correcto', ip: 'Adaptador del TOS 2012' },
    { id: 'AU-90020', hora: '08:12', quien: 'Ignacio Herrera Vidal', accion: 'Objeción de un hecho facturable', objeto: 'HF-608403', modulo: 'Evidencia comercial y regulatoria', resultado: 'Correcto', ip: 'Fuera de la red corporativa · segundo factor' },
    { id: 'AU-90023', hora: '08:31', quien: 'Rocío Tapia Morales', accion: 'Exportación de la auditoría', objeto: 'Accesos de octubre (CSV)', modulo: 'Administración', resultado: 'Correcto', ip: 'Red corporativa' },
    { id: 'AU-90027', hora: '09:40', quien: 'ATOS', accion: 'Propuesta automática de plan de estiba', objeto: 'REC-1184, versión 3', modulo: 'Nave y planificación', resultado: 'Correcto', ip: 'ATOS' },
    { id: 'AU-90031', hora: '10:02', quien: 'Rodrigo Peña Castro', accion: 'Intento de alta manual de movimiento', objeto: codigoISO('PMLU', '640027'), modulo: 'Gate, patio y equipos', resultado: 'Rechazado: los movimientos solo se registran por telemetría', ip: 'Terminal de cabina RTG-07' },
  ];

  db.elc = { sinEnlace: false, acumulados: 0, entregando: false, desde: null };
  db.terreno = { sinCobertura: false, cola: [], bitacora: [], sinc: 'Sincronizado 10:20' };
  db.cabina = { enMovimiento: true, plan: 5, alertaGrua: false };
  db.exportaciones = [];
  db.borradorRegistro = null;
  db.ie = { id: 'IE-20871', estado: 'Con observaciones', campos: { nave: 'REC-1184 Cóndor Austral', puerto: 'Rotterdam', consignatario: '', bultos: '2.240', masa: '24.300', cont: 'ATOU 482913 7', imo: 'No', temp: 'No aplica', notificar: 'Valle Alto Europe B.V.' }, errores: { consignatario: 'Falta el consignatario: es obligatorio para emitir el conocimiento de embarque.', puerto: 'Rotterdam no está en la rotación de REC-1184 informada por la naviera; elige un puerto de la rotación.' } };
  return db;
}
function unidadDe(k) {
  return ({ gate: 'Operaciones · Gate', supervisor: 'Operaciones · Turnos', planificador: 'Operaciones · Planificación', operador_patio: 'Operaciones · Patio', operador_grua: 'Operaciones · Muelle', jefatura: 'Gerencia de operaciones', admin: 'Tecnología · Administración funcional', facturacion: 'Finanzas · Facturación', documentacion: 'Operaciones · Documentación', proteccion: 'Protección portuaria', ronda: 'Mantenimiento · Patio refrigerado' })[k] || 'Operaciones';
}
