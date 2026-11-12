/* ATOS · núcleo: utilidades, idioma, estado en memoria, validaciones e íconos.
   Sin servicios de fondo: todo vive en memoria y vuelve al estado inicial al recargar o con «Reiniciar demostración». */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LS = {
  get(k, d) { try { const v = localStorage.getItem('atos.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('atos.' + k, JSON.stringify(v)); } catch { /* sin almacenamiento: la preferencia dura la sesión */ } },
};

/* ---------------------------------------------------------------- idioma (RF-POR-07, RNF-IDI-01) */
let IDIOMA = LS.get('idioma', 'es');
const T = (es, en) => (IDIOMA === 'en' && en != null ? en : es);
const ES = (t) => (Array.isArray(t) ? T(t[0], t[1]) : t);
function fijarIdioma(i) { IDIOMA = i === 'en' ? 'en' : 'es'; LS.set('idioma', IDIOMA); document.documentElement.lang = IDIOMA; }

/* ---------------------------------------------------------------- números, fechas y horas */
const LOC = () => (IDIOMA === 'en' ? 'en-US' : 'es-CL');
const num = (n, d = 0) => Number(n).toLocaleString(LOC(), { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n, d = 1) => num(n, d) + ' %';
const hm = (min) => { const m = ((Math.round(min) % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const aMin = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + m; };
const DIAS = { es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };
const MESES = { es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'], en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] };
const HOY = new Date(2028, 10, 6); // lunes 6 de noviembre de 2028, mes 22 del contrato (S1: mes 1 = febrero de 2027): la Etapa 2 en producción desde H12 (fin del mes 21) y el Adaptador del TOS 2012 en su mes de retiro (A30): día de operación simulado (antes del congelamiento del 15 de diciembre)
const dia = (offset = 0) => { const d = new Date(HOY); d.setDate(d.getDate() + offset); return d; };
const fFecha = (d, conDia = true) => {
  const l = IDIOMA === 'en' ? 'en' : 'es';
  return l === 'en' ? `${conDia ? DIAS.en[d.getDay()] + ', ' : ''}${MESES.en[d.getMonth()]} ${d.getDate()}` : `${conDia ? DIAS.es[d.getDay()] + ' ' : ''}${d.getDate()} de ${MESES.es[d.getMonth()]}`;
};
const fCorta = (d) => `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const ISOfecha = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* ---------------------------------------------------------------- azar determinista: la misma semilla da los mismos datos */
function azar(semilla) {
  let s = semilla >>> 0;
  const f = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  f.ent = (a, b) => a + Math.floor(f() * (b - a + 1));
  f.de = (lista) => lista[Math.floor(f() * lista.length)];
  return f;
}

/* ---------------------------------------------------------------- ISO 6346: código de contenedor con dígito verificador */
const ISO_VAL = (() => { const v = {}; let n = 10; for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') { if (n % 11 === 0) n++; v[c] = n++; } return v; })();
function digitoISO(c10) { let s = 0; for (let i = 0; i < 10; i++) { const c = c10[i]; s += (/[A-Z]/.test(c) ? ISO_VAL[c] : Number(c)) * 2 ** i; } return (s % 11) % 10; }
function codigoISO(prefijo, serie) { const s = String(serie).padStart(6, '0'); return `${prefijo} ${s} ${digitoISO(prefijo + s)}`; }
function validarContenedor(texto) {
  const c = String(texto).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!c) return { ok: false, vacio: true, msg: T('Escribe un número de contenedor.', 'Enter a container number.') };
  if (c.length < 11) return { ok: false, msg: T(`Faltan ${11 - c.length} caracteres: son 4 letras y 7 números.`, `${11 - c.length} characters missing: 4 letters and 7 digits.`) };
  if (!/^[A-Z]{3}[UJZ][0-9]{7}$/.test(c)) return { ok: false, msg: T('Usa 4 letras (la cuarta es U, J o Z) y 7 números, por ejemplo ATOU 482913 7.', 'Use 4 letters (the fourth is U, J or Z) and 7 digits, e.g. ATOU 482913 7.') };
  const d = digitoISO(c);
  if (d !== Number(c[10])) return { ok: false, msg: T(`El dígito verificador no coincide con la norma ISO 6346: con estos 10 caracteres debería ser ${d}. Revisa el último número.`, `The ISO 6346 check digit does not match: with these 10 characters it should be ${d}. Check the last digit.`) };
  return { ok: true, codigo: `${c.slice(0, 4)} ${c.slice(4, 10)} ${c[10]}`, msg: T('Número válido (ISO 6346).', 'Valid number (ISO 6346).') };
}

/* ---------------------------------------------------------------- RUT chileno con dígito verificador (módulo 11) */
function dvRut(n) { let s = 0, m = 2; for (const d of String(n).split('').reverse()) { s += Number(d) * m; m = m === 7 ? 2 : m + 1; } const r = 11 - (s % 11); return r === 11 ? '0' : r === 10 ? 'K' : String(r); }
const fRut = (n) => `${Number(n).toLocaleString('es-CL')}-${dvRut(n)}`;
function validarRut(texto) {
  const c = String(texto).toUpperCase().replace(/[^0-9K]/g, '');
  if (!c) return { ok: false, vacio: true, msg: T('Escribe el RUT.', 'Enter the RUT (Chilean tax ID).') };
  if (c.length < 8 || !/^\d+[0-9K]$/.test(c)) return { ok: false, msg: T('El RUT tiene entre 7 y 8 números más el dígito verificador, por ejemplo 76.482.913-1.', 'The RUT has 7 or 8 digits plus a check digit, e.g. 76.482.913-1.') };
  const cuerpo = c.slice(0, -1), dv = c.slice(-1);
  if (dvRut(cuerpo) !== dv) return { ok: false, msg: T(`El dígito verificador no corresponde: para ${Number(cuerpo).toLocaleString('es-CL')} es ${dvRut(cuerpo)}.`, `The check digit does not match: for ${Number(cuerpo).toLocaleString('es-CL')} it is ${dvRut(cuerpo)}.`) };
  return { ok: true, codigo: fRut(cuerpo), msg: T('RUT válido.', 'Valid RUT.') };
}
/* Patente chilena de formato vigente: cuatro letras (sin vocales ni M, N, Ñ, Q) y dos números */
const RX_PATENTE = /^[BCDFGHJKLPRSTVWXYZ]{4}-?\d{2}$/;
function validarPatente(t) {
  const c = String(t).toUpperCase().replace(/[\s·.]/g, '');
  if (!c) return { ok: false, vacio: true, msg: T('Escribe la patente.', 'Enter the license plate.') };
  if (!RX_PATENTE.test(c)) return { ok: false, msg: T('La patente tiene cuatro letras y dos números, por ejemplo KTRP-51.', 'The plate has four letters and two digits, e.g. KTRP-51.') };
  return { ok: true, codigo: c.slice(0, 4) + '-' + c.slice(-2), msg: T('Patente válida.', 'Valid plate.') };
}
function validarCorreo(t) {
  const c = String(t).trim();
  if (!c) return { ok: false, vacio: true, msg: T('Escribe un correo.', 'Enter an email.') };
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(c)) return { ok: false, msg: T('Escribe un correo válido, por ejemplo nombre@empresa.cl.', 'Enter a valid email, e.g. name@company.com.') };
  return { ok: true, codigo: c, msg: '' };
}
function validarClave(t) {
  if (!t) return { ok: false, vacio: true, msg: T('Escribe la contraseña.', 'Enter the password.') };
  if (t.length < 8) return { ok: false, msg: T(`La contraseña tiene al menos 8 caracteres; faltan ${8 - t.length}.`, `The password has at least 8 characters; ${8 - t.length} missing.`) };
  return { ok: true, msg: '' };
}
function validarTotp(t) {
  const c = String(t).replace(/\D/g, '');
  if (!c) return { ok: false, vacio: true, msg: T('Escribe el código de 6 dígitos.', 'Enter the 6-digit code.') };
  if (c.length !== 6) return { ok: false, msg: T(`El código tiene 6 dígitos; escribiste ${c.length}.`, `The code has 6 digits; you entered ${c.length}.`) };
  return { ok: true, codigo: c, msg: '' };
}
function validarRequerido(t) { return String(t).trim() ? { ok: true, msg: '' } : { ok: false, vacio: true, msg: T('Este campo es obligatorio.', 'This field is required.') }; }
const VALIDADORES = { iso: validarContenedor, rut: validarRut, patente: validarPatente, correo: validarCorreo, clave: validarClave, totp: validarTotp, req: validarRequerido };

/* ---------------------------------------------------------------- distancia de edición para la búsqueda tolerante (RF-ADM-12) */
function distancia(a, b) {
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
const normal = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
function parecido(q, texto) { // 0 = no calza; mayor = mejor
  const a = normal(q), b = normal(texto); if (!a) return 0;
  const az = a.replace(/ /g, ''), bz = b.replace(/ /g, '');
  if (bz.includes(az)) return 100 - Math.min(40, bz.indexOf(az));
  const tol = az.length <= 4 ? 1 : az.length <= 8 ? 2 : 3;
  let mejor = 0;
  for (const w of b.split(' ').concat([bz])) { const d = distancia(az, w.slice(0, az.length + 1)); if (d <= tol) mejor = Math.max(mejor, 60 - d * 10); }
  return mejor;
}

/* ---------------------------------------------------------------- íconos: una sola familia de trazo fino y uniforme */
const ICONOS = {
  inicio: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  camion: '<path d="M2 6h11v10H2zM13 9h4l4 4v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  contenedor: '<rect x="3" y="6" width="18" height="12" rx="1"/><path d="M7.5 6v12M12 6v12M16.5 6v12"/>',
  patio: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  grua: '<path d="M4 21h16M7 21V4h12M7 4L4 8M16 4v6M14 10h4v4h-4zM10 4l-3 4"/>',
  frio: '<path d="M12 2v20M3.5 7l17 10M3.5 17l17-10M9 3.5l3 2 3-2M9 20.5l3-2 3 2"/>',
  nave: '<path d="M3 14l2 5h14l2-5zM6 14V9h12v5M10 9V5h4v4"/><path d="M2 21.5c2.5 0 2.5-1 5-1s2.5 1 5 1 2.5-1 5-1 2.5 1 5 1"/>',
  documento: '<path d="M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h6"/>',
  escudo: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  persona: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  personas: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><circle cx="17" cy="7" r="2.5"/><path d="M17 12.5c3 0 5 1.5 5 4.5"/>',
  ajustes: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  campana: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  alerta: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
  error: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
  exclama: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.01"/>',
  cerrar: '<path d="M6 6l12 12M18 6L6 18"/>',
  der: '<path d="M9 5l7 7-7 7"/>', izq: '<path d="M15 5l-7 7 7 7"/>', abajo: '<path d="M5 9l7 7 7-7"/>', arriba: '<path d="M5 15l7-7 7 7"/>',
  flecha: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  subir: '<path d="M12 16V4M7 9l5-5 5 5M4 16v4h16v-4"/>',
  bajar: '<path d="M12 4v12M7 11l5 5 5-5M4 16v4h16v-4"/>',
  calendario: '<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  ubicacion: '<path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  enlace: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  senal: '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5v.01"/>',
  sinsenal: '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5v.01M3 3l18 18"/>',
  termometro: '<path d="M14 14V5a2 2 0 0 0-4 0v9a4 4 0 1 0 4 0zM12 9v7"/>',
  rayo: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  hoja: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15M5 19l7-7"/>',
  grafico: '<path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8"/>',
  filtro: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  ordenar: '<path d="M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4"/>',
  editar: '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
  candado: '<rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  llave: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
  ojo: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  movil: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  firma: '<path d="M3 21c3 0 4-3 6-3s2 2 4 2 3-2 5-2M15 4l5 5-8 8H7v-5z"/>',
  bandeja: '<path d="M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5"/>',
  actualizar: '<path d="M20 11a8 8 0 0 0-14-5L4 8M4 4v4h4M4 13a8 8 0 0 0 14 5l2-2M20 20v-4h-4"/>',
  globo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  ayuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 16.5v.01"/>',
  teclado: '<rect x="2" y="6" width="20" height="12" rx="1"/><path d="M6 10v.01M10 10v.01M14 10v.01M18 10v.01M7 14h10"/>',
  capas: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5"/>',
  paleta: '<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-1.5-1.5-1.5-1.5-3s1-2 2.5-2H18a3 3 0 0 0 3-3c0-4.5-4-8.5-9-8.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="11" cy="7" r="1"/><circle cx="16" cy="8" r="1"/>',
  bandera: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
  balanza: '<path d="M12 4v16M7 20h10M4 7h16M7 7l-3 6h6zM17 7l-3 6h6z"/>',
  barrera: '<path d="M5 20V7M3 20h4M5 9h15v4H5M9 9l-2 4M13 9l-2 4M17 9l-2 4"/>',
  ruta: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8"/>',
  edificio: '<path d="M4 21V5l8-2v18M12 9h8v12M3 21h18M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2"/>',
  correo: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 6 9-6"/>',
  historial: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"/>',
  papelera: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
  opciones: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  herramienta: '<path d="M14.5 6.5a4 4 0 0 0 4.9 4.9L11 19.8a2 2 0 0 1-2.8-2.8l8.4-8.4"/><path d="M14.5 6.5L17 4l3 3-2.5 2.5"/>',
  antena: '<circle cx="12" cy="12" r="2"/><path d="M8 8a6 6 0 0 0 0 8M16 8a6 6 0 0 1 0 8M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14"/>',
  servidor: '<rect x="3" y="4" width="18" height="7" rx="1"/><rect x="3" y="13" width="18" height="7" rx="1"/><path d="M7 7.5v.01M7 16.5v.01"/>',
  datos: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  salir: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>',
  agarre: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  sirena: '<path d="M6 18v-6a6 6 0 0 1 12 0v6M4 18h16v3H4zM12 2v2M4 7l1.5 1M20 7l-1.5 1"/>',
  credencial: '<rect x="3" y="5" width="18" height="14" rx="1"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.5-1.5 1.7-2 3-2s2.5.5 3 2M14 10h4M14 14h3"/>',
  intercambio: '<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
  demo: '<path d="M4 20l9-9M15 3v3M19 5l-2 2M21 9h-3M13 11l2 2"/>',
  objetivo: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  tren: '<rect x="5" y="3" width="14" height="13" rx="2"/><path d="M5 10h14M8 19l-2 2M16 19l2 2M9 13v.01M15 13v.01"/>',
  pausa: '<path d="M8 5v14M16 5v14"/>',
  reproducir: '<path d="M7 4l12 8-12 8z"/>',
  ampliar: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  sello: '<circle cx="12" cy="9" r="6"/><path d="M9 14l-2 7 5-3 5 3-2-7"/>',
  gemelo: '<rect x="2" y="4" width="9" height="9" rx="1"/><rect x="13" y="11" width="9" height="9" rx="1"/><path d="M11 8h4v3M13 16H9v-3"/>',
};
function ic(nombre, clase = '') { return `<svg class="ic ${clase}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONOS[nombre] || ICONOS.info}</svg>`; }

/* ---------------------------------------------------------------- recursos decorativos (estáticos y ocultos a lectores de pantalla) */
let _ondaId = 0;
function ondas(clase = 'a') {
  const i = ++_ondaId;
  return `<svg class="ondas ${clase}" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
    <defs><radialGradient id="og${i}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".14" stop-color="#E07A7F" stop-opacity=".22"/><stop offset=".32" stop-color="#FFFFFF" stop-opacity=".55"/><stop offset=".52" stop-color="#DCE8F5" stop-opacity=".5"/><stop offset=".74" stop-color="#FFFFFF" stop-opacity=".3"/><stop offset="1" stop-color="#DCE8F5" stop-opacity="0"/></radialGradient>
    <filter id="of${i}"><feGaussianBlur stdDeviation="3"/></filter></defs>
    <circle cx="200" cy="200" r="200" fill="url(#og${i})"/>
    <g fill="none" stroke="#FFFFFF" filter="url(#of${i})"><circle cx="200" cy="200" r="70" stroke-width="5" stroke-opacity=".8"/><circle cx="200" cy="200" r="118" stroke-width="4" stroke-opacity=".6"/><circle cx="200" cy="200" r="160" stroke-width="3" stroke-opacity=".45"/><circle cx="200" cy="200" r="192" stroke-width="2" stroke-opacity=".3"/></g></svg>`;
}
function olas(ancho = 220) {
  return `<svg class="olas" width="${ancho}" viewBox="0 0 220 90" aria-hidden="true" focusable="false"><g fill="none" stroke-width="2" stroke-linecap="round">
    <ellipse cx="110" cy="22" rx="96" ry="9" stroke="#7381B0"/><ellipse cx="110" cy="40" rx="78" ry="8" stroke="#BFD6EE"/><ellipse cx="110" cy="56" rx="58" ry="7" stroke="#7381B0"/><ellipse cx="110" cy="70" rx="38" ry="6" stroke="#BFD6EE"/><ellipse cx="110" cy="82" rx="18" ry="4" stroke="#7381B0"/></g>
    <circle cx="110" cy="22" r="6" fill="#E07A7F"/></svg>`;
}
/* Logotipo: la bahía al amanecer, con una grúa de muelle sobre el horizonte. */
const LOGO = `<svg class="logo" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="19" fill="#DCE8F5"/><circle cx="28" cy="19.5" r="4.2" fill="#E07A7F"/><path d="M1.5 24h37" stroke="#4A5788" stroke-width="1.4"/><g fill="none" stroke="#2B3A7A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 24V12.5M16 24V12.5M8.5 12.5h10M5 15.5h17M11 19h5M11 12.5l2.5-4 2.5 4"/></g><path d="M8 28.5c2-1.3 4-1.3 6 0s4 1.3 6 0 4-1.3 6 0 4 1.3 6 0" fill="none" stroke="#7381B0" stroke-width="1.3" stroke-linecap="round"/><circle cx="20" cy="20" r="19" fill="none" stroke="#7381B0" stroke-width="1"/></svg>`;
/* Pictogramas en sello: dúo de trazo índigo, relleno blanco (.r) y un acento coral (.a). Decorativos: el texto los nombra. */
const PICTOS = {
  naviera: '<path class="r" d="M2.8 14h18.4l-2 4.3a1.6 1.6 0 0 1-1.5 1H6.3a1.6 1.6 0 0 1-1.5-1z"/><rect class="a" x="5.5" y="9.5" width="4.5" height="4.5" rx=".6"/><rect class="r" x="10" y="9.5" width="4.5" height="4.5" rx=".6"/><rect class="r" x="7.75" y="5.5" width="4.5" height="4" rx=".6"/><path class="r" d="M16.5 14V7.5h2.8V14"/><path d="M2.5 22c1.1 0 1.1-.7 2.2-.7s1.1.7 2.2.7 1.1-.7 2.2-.7 1.1.7 2.2.7 1.1-.7 2.2-.7 1.1.7 2.2.7 1.1-.7 2.2-.7 1.1.7 2.2.7"/>',
  agencia: '<path class="r" d="M9.3 3.5h5.4v5.2l1.3 2.3H8l1.3-2.3z"/><rect class="a" x="4.5" y="11" width="15" height="4.5" rx="1"/><path class="r" d="M6 15.5h12v2.3H6z"/><path d="M4 20.5h16"/>',
  exportador: '<rect class="r" x="2.8" y="7.5" width="12.4" height="10" rx="1"/><path d="M6 7.5v10M9 7.5v10M12 7.5v10"/><path class="ta" d="M17.2 9.6h4.3m-1.7-1.7 1.7 1.7-1.7 1.7"/><path d="M21.5 15.4h-4.3m1.7-1.7-1.7 1.7 1.7 1.7"/>',
  transportista: '<rect class="a" x="2.5" y="6.5" width="12" height="8.5" rx=".8"/><path class="r" d="M14.5 9.5h3.7l3.3 3.6v3.9h-7z"/><path d="M16.3 9.5v3.6h5.2M2.5 15h12"/><circle class="r" cx="6.5" cy="17.5" r="1.9"/><circle class="r" cx="17.5" cy="17.5" r="1.9"/>',
  autoridad: '<path class="a" d="M2.8 9.2 12 3.8l9.2 5.4z"/><rect class="r" x="4.5" y="9.2" width="15" height="9"/><path d="M7.5 11.2v5M10.5 11.2v5M13.5 11.2v5M16.5 11.2v5M3 20.5h18M4 18.2h16"/>',
  concedente: '<circle class="a" cx="7.5" cy="12" r="4.3"/><circle class="r" cx="7.5" cy="12" r="1.5"/><path d="M11.8 12h9.4M18.2 12v3.2M21.2 12v2.4"/>',
  ferroviario: '<rect class="r" x="5.5" y="3" width="13" height="13.5" rx="3"/><rect class="a" x="7.6" y="5.5" width="8.8" height="4.5" rx="1"/><circle class="f" cx="9" cy="13.2" r="1"/><circle class="f" cx="15" cy="13.2" r="1"/><path d="M8.6 16.5 6.4 20.8M15.4 16.5l2.2 4.3M5.3 20.8h13.4M7.5 18.6h9"/>',
  cita: '<rect class="r" x="3.5" y="5" width="17" height="15.5" rx="2"/><path class="a" d="M3.5 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v2.8h-17z"/><path d="M8 3v4M16 3v4M8.8 14.6l2.2 2.2 4.3-4.4"/>',
  documentos: '<path class="r" d="M5 2.8h8.5l4.5 4.5v13.9H5z"/><path d="M13.5 2.8v4.5H18M7.8 11h7M7.8 14h4.5"/><circle class="a" cx="16.6" cy="17.8" r="3.4"/><path d="M15.2 17.8l1 1 1.8-1.9"/>',
  conductor: '<rect class="r" x="2.8" y="6" width="18.4" height="13" rx="2"/><circle class="a" cx="8.3" cy="11.3" r="2.4"/><path d="M5 16.6c.7-1.6 1.9-2.4 3.3-2.4s2.6.8 3.3 2.4M14 10.5h4.5M14 13.5h3M9.8 6V4h4.4v2"/>',
  epp: '<path class="a" d="M4.3 15.5a7.7 7.7 0 0 1 15.4 0z"/><path d="M10.2 8.1v4.4M13.8 8.1v4.4"/><rect class="r" x="2.5" y="15.5" width="19" height="2.6" rx="1.3"/>',
  barrera: '<rect class="r" x="3.5" y="8" width="3.4" height="12.5" rx=".6"/><rect class="a" x="6.9" y="9.3" width="14.6" height="3" rx="1.5"/><path class="tb" d="M10.5 9.3l-1.2 3M14.3 9.3l-1.2 3M18.1 9.3l-1.2 3"/><path d="M2.5 20.5h19"/>',
  contenedor: '<rect class="a" x="3" y="6.5" width="18" height="11" rx="1"/><path d="M6.5 6.5v11M10 6.5v11M14 6.5v11M17.5 6.5v11"/><path class="r" d="M3 17.5h18v2H3z"/>',
};
function sello(nombre, tono = '', clase = '') { return `<span class="sello-ic ${tono} ${clase}" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">${PICTOS[nombre] || PICTOS.contenedor}</svg></span>`; }
function selloIc(nombre, tono = '') { return `<span class="sello-ic chico ${tono}" aria-hidden="true">${ic(nombre)}</span>`; }

/* Emblema cinético: ATOS al centro, letra por letra, y el nombre del terminal girando en un anillo. */
function emblemaATOS() {
  const anillo = 'TERMINAL PORTUARIO ACONCAGUA · TERMINAL PORTUARIO ACONCAGUA · ';
  return `<svg class="anillo" viewBox="0 0 300 300" aria-hidden="true" focusable="false">
    <defs><path id="anillo-txt" d="M150 150m-126 0a126 126 0 1 1 252 0a126 126 0 1 1-252 0"/></defs>
    <circle cx="150" cy="150" r="148" fill="none" stroke="#F5F0EA" stroke-opacity=".22"/>
    <circle cx="150" cy="150" r="102" fill="#FFFFFF" fill-opacity=".04" stroke="#F5F0EA" stroke-opacity=".38"/>
    <g class="giro"><text class="txt-anillo"><textPath href="#anillo-txt" textLength="788" lengthAdjust="spacing">${anillo}</textPath></text><circle cx="150" cy="4" r="5" fill="#E07A7F"/></g>
  </svg><span class="letras" aria-hidden="true">${'ATOS'.split('').map((l, k) => `<span style="--i:${k}">${l}</span>`).join('')}</span>`;
}

/* Escena Bauhaus de la portada: una nave llega al muelle y la grúa descarga un contenedor. Decorativa (aria-hidden),
   se detiene con «Pausar las animaciones» y queda quieta en su estado final si la persona prefiere menos movimiento. */
function escenaPuerto() {
  const tonos = ['#6573A6', '#BFD6EE', '#F5F0EA', '#FFFFFF', '#4A5788', '#E07A7F'];
  const cols = [195, 233, 271, 309, 347, 385]; const alturas = [2, 1, 2, 2, 2, 1];
  let carga = '';
  cols.forEach((x, i) => { for (let f = 0; f < alturas[i]; f++) { const y = 275 - f * 22; const sube = i === 4 && f === 1; carga += `<rect ${sube ? 'class="carga-barco"' : ''} x="${x}" y="${y}" width="36" height="20" fill="${sube ? '#E07A7F' : tonos[(i * 2 + f) % tonos.length]}" stroke="#1B1F3B" stroke-width="1.5"/>`; } });
  const fila = (y, color, desfase, clase) => `<g class="olas-fila ${clase}" fill="${color}">${Array.from({ length: 20 }, (_, k) => `<path d="M${-28 + desfase + k * 28} ${y}a14 14 0 0 1 28 0z"/>`).join('')}</g>`;
  return `<svg class="escena-puerto" viewBox="0 0 640 440" aria-hidden="true" focusable="false">
    <defs><clipPath id="ep-mar"><rect x="0" y="300" width="452" height="140"/></clipPath></defs>
    <circle class="sol" cx="586" cy="78" r="44" fill="#E07A7F"/>
    <path d="M30 330a124 124 0 0 1 248 0z" fill="#BFD6EE" fill-opacity=".55"/>
    <rect x="0" y="330" width="452" height="110" fill="#4A5788"/>
    <path d="M0 330H452" stroke="#F5F0EA" stroke-width="2"/>
    <g class="barco"><g class="balanceo">
      <path d="M112 296H446L428 338H134Z" fill="#2B3A7A"/><path d="M120 306H442" stroke="#F5F0EA" stroke-width="3"/><path d="M126 326H434L428 338H134Z" fill="#E07A7F"/>
      <rect x="122" y="226" width="64" height="8" fill="#2B3A7A"/><rect x="128" y="234" width="52" height="62" fill="#F5F0EA" stroke="#1B1F3B" stroke-width="1.5"/>
      <circle cx="141" cy="248" r="4" fill="#4A5788"/><circle cx="154" cy="248" r="4" fill="#4A5788"/><circle cx="167" cy="248" r="4" fill="#4A5788"/><rect x="128" y="262" width="52" height="6" fill="#BFD6EE"/>
      <rect x="140" y="200" width="18" height="26" fill="#E07A7F" stroke="#1B1F3B" stroke-width="1.5"/><path d="M140 200a9 9 0 0 1 18 0z" fill="#1B1F3B"/>
      ${carga}<path d="M432 296V262" stroke="#1B1F3B" stroke-width="2"/><circle cx="432" cy="258" r="4" fill="#E07A7F"/>
    </g></g>
    <g clip-path="url(#ep-mar)">${fila(334, '#BFD6EE', 0, '')}${fila(364, '#6573A6', 14, 'lenta')}${fila(394, '#BFD6EE', 0, '')}${fila(424, '#6573A6', 14, 'lenta')}</g>
    <rect x="452" y="318" width="188" height="122" fill="#F5F0EA"/><rect x="452" y="318" width="188" height="6" fill="#4A5788"/>
    <rect x="590" y="298" width="36" height="20" fill="#BFD6EE" stroke="#1B1F3B" stroke-width="1.5"/><rect x="590" y="276" width="36" height="20" fill="#6573A6" stroke="#1B1F3B" stroke-width="1.5"/>
    <g>
      <rect x="466" y="150" width="12" height="168" fill="#2B3A7A"/><rect x="556" y="150" width="12" height="168" fill="#2B3A7A"/><rect x="458" y="226" width="118" height="10" fill="#4A5788"/>
      <polygon points="472,150 562,150 517,92" fill="#E07A7F" stroke="#1B1F3B" stroke-width="1.5"/>
      <rect x="244" y="138" width="384" height="12" fill="#4A5788"/><path d="M517 92 252 138M517 92 620 138" stroke="#1B1F3B" stroke-width="2"/>
      <rect x="570" y="112" width="44" height="26" fill="#F5F0EA" stroke="#1B1F3B" stroke-width="1.5"/><circle cx="472" cy="318" r="5" fill="#1B1F3B"/><circle cx="562" cy="318" r="5" fill="#1B1F3B"/>
    </g>
    <g class="carro">
      <rect x="498" y="150" width="34" height="10" fill="#F5F0EA" stroke="#1B1F3B" stroke-width="1.5"/><rect class="cable" x="514" y="160" width="2" height="30" fill="#1B1F3B"/>
      <g class="gancho"><rect x="495" y="190" width="40" height="6" fill="#1B1F3B"/><rect class="carga-grua" x="497" y="196" width="36" height="20" fill="#E07A7F" stroke="#1B1F3B" stroke-width="1.5"/></g>
    </g>
  </svg>`;
}

/* Agua en movimiento (liquid morph): manchas de la paleta que cambian de forma y se desplazan, difuminadas. Se apaga
   desde el panel de demostración y se detiene con «Pausar las animaciones». */
function capaAgua() { return `<div class="agua" aria-hidden="true"><span class="gota g1"></span><span class="gota g2"></span><span class="gota g3"></span><span class="gota g4"></span><span class="gota g5"></span><span class="caustica"></span></div>`; }
