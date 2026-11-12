/* ATOS · gráficos en SVG propio, sin bibliotecas. Cada gráfico lleva su tabla de datos equivalente,
   etiquetas directas y colores de la paleta con contraste de 3:1 o más frente al fondo. */
'use strict';

const SERIE = ['#4A5788', '#A63D46', '#7381B0', '#1B1F3B'];
const TRAZO = ['', '6 4', '2 3', '10 3 2 3'];
function tablaDatos(titulo, cab, filas) {
  return `<details class="datos-grafico"><summary>${T('Ver tabla de datos', 'View data table')}</summary><div class="desplaza" role="region" aria-label="${esc(T('Datos de', 'Data for') + ' ' + titulo)}" tabindex="0"><table class="compacta"><caption class="sr">${esc(titulo)}</caption><thead><tr>${cab.map((c, i) => `<th scope="col" class="${i ? 'n' : ''}">${c}</th>`).join('')}</tr></thead><tbody>${filas.map((f) => `<tr>${f.map((c, i) => (i ? `<td class="n">${c}</td>` : `<th scope="row">${c}</th>`)).join('')}</tr>`).join('')}</tbody></table></div></details>`;
}
function marco(titulo, resumen, svg, tabla, extra = '') {
  const id = uid('g');
  const rol = svg.cuerpo.includes('role="link"') ? 'group' : 'img'; // con barras navegables, el gráfico no puede ser una imagen opaca
  return `<figure class="grafico"><figcaption id="${id}">${titulo}</figcaption><svg role="${rol}" aria-labelledby="${id} ${id}d" ${svg.attrs}><desc id="${id}d">${esc(resumen)}</desc>${svg.cuerpo}</svg>${extra}${tabla}</figure>`;
}
const fmt = (v, d = 0) => num(v, d);

/* barras verticales u horizontales; las que superan la meta van en coral oscuro y con su valor escrito */
function gBarras({ titulo, datos, meta, unidad = '', dec = 0, alto = 220, peorSiMayor = true, acc, metaEt }) {
  const W = 640, H = alto, mi = 44, md = 12, ms = 16, mb = 46; const max = Math.max(...datos.map((d) => d.v), meta || 0) * 1.12;
  const bw = (W - mi - md) / datos.length; const y = (v) => H - mb - (v / max) * (H - mb - ms);
  let c = `<line class="svg-eje" x1="${mi}" y1="${H - mb}" x2="${W - md}" y2="${H - mb}"/>`;
  for (let k = 0; k <= 4; k++) { const v = (max / 4) * k; c += `<line class="svg-guia" x1="${mi}" x2="${W - md}" y1="${y(v)}" y2="${y(v)}"/><text class="svg-texto" x="${mi - 6}" y="${y(v) + 4}" text-anchor="end">${fmt(v, 0)}</text>`; }
  datos.forEach((d, i) => {
    const malo = meta != null && (peorSiMayor ? d.v > meta : d.v < meta); const x = mi + i * bw + bw * 0.18, w = bw * 0.64;
    c += `<rect x="${x}" y="${y(d.v)}" width="${w}" height="${H - mb - y(d.v)}" rx="4" fill="${malo ? '#A63D46' : '#4A5788'}" ${acc ? `class="punto-clic" data-acc="${acc}" data-arg="${esc(d.arg ?? d.e)}" tabindex="0" role="link" aria-label="${esc(d.e)}: ${fmt(d.v, dec)} ${unidad}. ${T('Ver el detalle', 'View detail')}"` : ''}><title>${esc(d.e)}: ${fmt(d.v, dec)} ${unidad}</title></rect>`;
    c += `<text class="svg-texto" x="${x + w / 2}" y="${y(d.v) - 5}" text-anchor="middle" font-weight="700">${malo ? '! ' : ''}${fmt(d.v, dec)}</text>`;
    c += `<text class="svg-texto" x="${x + w / 2}" y="${H - mb + 16}" text-anchor="middle">${esc(d.e)}</text>`;
  });
  if (meta != null) c += `<line class="svg-meta" x1="${mi}" x2="${W - md}" y1="${y(meta)}" y2="${y(meta)}"/><text class="svg-texto" x="${W - md}" y="${y(meta) - 6}" text-anchor="end" font-weight="700" fill="#A63D46">${metaEt || T('Meta', 'Target')} ${fmt(meta, dec)} ${unidad}</text>`;
  const malos = meta != null ? datos.filter((d) => (peorSiMayor ? d.v > meta : d.v < meta)).length : 0;
  const resumen = `${titulo}. ${datos.length} ${T('barras', 'bars')}${meta != null ? `; ${malos} ${T('fuera de la meta de', 'outside the target of')} ${fmt(meta, dec)} ${unidad}` : ''}. ${T('Máximo', 'Maximum')} ${fmt(Math.max(...datos.map((d) => d.v)), dec)} ${unidad}.`;
  return marco(titulo, resumen, { attrs: `viewBox="0 0 ${W} ${H}"`, cuerpo: c }, tablaDatos(titulo, [T('Categoría', 'Category'), `${T('Valor', 'Value')} (${unidad})`, ...(meta != null ? [T('Respecto de la meta', 'Against target')] : [])], datos.map((d) => [esc(d.e), fmt(d.v, dec), ...(meta != null ? [(peorSiMayor ? d.v > meta : d.v < meta) ? T('Fuera de la meta', 'Outside target') : T('Dentro de la meta', 'Within target')] : [])])),
    meta != null ? `<ul class="leyenda"><li><span class="muestra" style="background:#4A5788"></span>${T('Dentro de la meta', 'Within target')}</li><li><span class="muestra" style="background:#A63D46"></span>! ${T('Fuera de la meta', 'Outside target')}</li></ul>` : '');
}

/* líneas: cada serie con su color, trazo y marcador propios, más etiqueta directa al final */
function gLineas({ titulo, x, series, meta, unidad = '', dec = 0, alto = 240, metaEt }) {
  const W = 640, H = alto, mi = 44, md = 110, ms = 16, mb = 34; const todos = series.flatMap((s) => s.v).concat(meta ?? []);
  const min = Math.min(...todos) * 0.9, max = Math.max(...todos) * 1.06; const X = (i) => mi + (i / (x.length - 1)) * (W - mi - md); const Y = (v) => H - mb - ((v - min) / (max - min)) * (H - mb - ms);
  let c = `<line class="svg-eje" x1="${mi}" y1="${H - mb}" x2="${W - md}" y2="${H - mb}"/>`;
  for (let k = 0; k <= 4; k++) { const v = min + ((max - min) / 4) * k; c += `<line class="svg-guia" x1="${mi}" x2="${W - md}" y1="${Y(v)}" y2="${Y(v)}"/><text class="svg-texto" x="${mi - 6}" y="${Y(v) + 4}" text-anchor="end">${fmt(v, dec)}</text>`; }
  x.forEach((e, i) => { if (x.length <= 12 || i % Math.ceil(x.length / 10) === 0) c += `<text class="svg-texto" x="${X(i)}" y="${H - mb + 16}" text-anchor="middle">${esc(e)}</text>`; });
  if (meta != null) c += `<line class="svg-meta" x1="${mi}" x2="${W - md}" y1="${Y(meta)}" y2="${Y(meta)}"/><text class="svg-texto" x="${W - md + 6}" y="${Y(meta) + 4}" font-weight="700" fill="#A63D46">${metaEt || T('Meta', 'Target')} ${fmt(meta, dec)}</text>`;
  series.forEach((s, si) => {
    const col = SERIE[si % 4]; c += `<polyline fill="none" stroke="${col}" stroke-width="2.5" stroke-dasharray="${TRAZO[si % 4]}" points="${s.v.map((v, i) => `${X(i)},${Y(v)}`).join(' ')}"/>`;
    s.v.forEach((v, i) => { c += si % 2 ? `<rect x="${X(i) - 4}" y="${Y(v) - 4}" width="8" height="8" fill="${col}" stroke="#fff"><title>${esc(s.n)}, ${esc(x[i])}: ${fmt(v, dec)} ${unidad}</title></rect>` : `<circle cx="${X(i)}" cy="${Y(v)}" r="4" fill="${col}" stroke="#fff"><title>${esc(s.n)}, ${esc(x[i])}: ${fmt(v, dec)} ${unidad}</title></circle>`; });
    const u = s.v[s.v.length - 1]; c += `<text class="svg-texto" x="${W - md + 6}" y="${Y(u) + 4 + si * 2}" font-weight="700" fill="${col}">${esc(s.n)} ${fmt(u, dec)}</text>`;
  });
  const resumen = `${titulo}. ${series.map((s) => `${s.n}: ${T('de', 'from')} ${fmt(s.v[0], dec)} ${T('a', 'to')} ${fmt(s.v[s.v.length - 1], dec)} ${unidad}`).join('; ')}.${meta != null ? ` ${T('Meta', 'Target')} ${fmt(meta, dec)} ${unidad}.` : ''}`;
  return marco(titulo, resumen, { attrs: `viewBox="0 0 ${W} ${H}"`, cuerpo: c }, tablaDatos(titulo, [T('Período', 'Period'), ...series.map((s) => `${esc(s.n)} (${unidad})`)], x.map((e, i) => [esc(e), ...series.map((s) => fmt(s.v[i], dec))])),
    `<ul class="leyenda">${series.map((s, si) => `<li><svg width="34" height="12" aria-hidden="true"><line x1="0" y1="6" x2="34" y2="6" stroke="${SERIE[si % 4]}" stroke-width="2.5" stroke-dasharray="${TRAZO[si % 4]}"/></svg>${esc(s.n)}</li>`).join('')}</ul>`);
}

/* anillo: segmentos separados por blanco, porcentaje escrito en la leyenda */
function gAnillo({ titulo, datos, unidad = '', centro }) {
  const tot = datos.reduce((s, d) => s + d.v, 0); const R = 90, r = 56, cx = 110, cy = 110; let a = -Math.PI / 2; let c = '';
  datos.forEach((d, i) => {
    const ang = (d.v / tot) * Math.PI * 2; const a2 = a + ang; const g = ang > Math.PI ? 1 : 0;
    const p = (rad, t) => `${cx + rad * Math.cos(t)},${cy + rad * Math.sin(t)}`;
    c += `<path d="M${p(R, a)} A${R},${R} 0 ${g} 1 ${p(R, a2)} L${p(r, a2)} A${r},${r} 0 ${g} 0 ${p(r, a)} Z" fill="${SERIE[i % 4]}" stroke="#fff" stroke-width="3"><title>${esc(d.e)}: ${fmt((d.v / tot) * 100, 0)} %</title></path>`; a = a2;
  });
  c += `<text class="svg-texto" x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="22" font-weight="700">${centro ?? fmt(tot)}</text><text class="svg-texto" x="${cx}" y="${cy + 16}" text-anchor="middle">${esc(unidad)}</text>`;
  const resumen = `${titulo}. ${datos.map((d) => `${d.e} ${fmt((d.v / tot) * 100, 0)} %`).join('; ')}.`;
  return marco(titulo, resumen, { attrs: 'viewBox="0 0 220 220" style="max-width:240px"', cuerpo: c }, tablaDatos(titulo, [T('Categoría', 'Category'), T('Cantidad', 'Count'), T('Porcentaje', 'Share')], datos.map((d) => [esc(d.e), fmt(d.v), fmt((d.v / tot) * 100, 1) + ' %'])),
    `<ul class="leyenda">${datos.map((d, i) => `<li><span class="muestra" style="background:${SERIE[i % 4]}"></span>${esc(d.e)}: <strong>${fmt((d.v / tot) * 100, 0)} %</strong></li>`).join('')}</ul>`);
}

/* área apilada: capas separadas por una línea blanca, con etiqueta directa en la última columna */
function gArea({ titulo, x, series, unidad = '' }) {
  const W = 640, H = 240, mi = 44, md = 120, ms = 14, mb = 34; const tot = x.map((_, i) => series.reduce((s, se) => s + se.v[i], 0)); const max = Math.max(...tot) * 1.08;
  const X = (i) => mi + (i / (x.length - 1)) * (W - mi - md); const Y = (v) => H - mb - (v / max) * (H - mb - ms);
  let c = '', base = x.map(() => 0);
  for (let k = 0; k <= 4; k++) { const v = (max / 4) * k; c += `<line class="svg-guia" x1="${mi}" x2="${W - md}" y1="${Y(v)}" y2="${Y(v)}"/><text class="svg-texto" x="${mi - 6}" y="${Y(v) + 4}" text-anchor="end">${fmt(v)}</text>`; }
  series.forEach((s, si) => {
    const sup = base.map((b, i) => b + s.v[i]);
    c += `<path d="M${sup.map((v, i) => `${X(i)},${Y(v)}`).join(' L')} L${base.map((v, i) => `${X(i)},${Y(v)}`).reverse().join(' L')} Z" fill="${SERIE[si % 4]}" stroke="#fff" stroke-width="1.5"/>`;
    const u = x.length - 1; c += `<text class="svg-texto" x="${W - md + 6}" y="${(Y(base[u]) + Y(sup[u])) / 2 + 4}" font-weight="700" fill="${SERIE[si % 4]}">${esc(s.n)}</text>`; base = sup;
  });
  c += `<line class="svg-eje" x1="${mi}" y1="${H - mb}" x2="${W - md}" y2="${H - mb}"/>`;
  x.forEach((e, i) => { if (i % 2 === 0) c += `<text class="svg-texto" x="${X(i)}" y="${H - mb + 16}" text-anchor="middle">${esc(e)}</text>`; });
  const resumen = `${titulo}. ${series.map((s) => `${s.n}: ${fmt(s.v.reduce((a, b) => a + b, 0))} ${unidad}`).join('; ')} ${T('en el período', 'in the period')}.`;
  return marco(titulo, resumen, { attrs: `viewBox="0 0 ${W} ${H}"`, cuerpo: c }, tablaDatos(titulo, [T('Hora', 'Hour'), ...series.map((s) => esc(s.n)), T('Total', 'Total')], x.map((e, i) => [esc(e), ...series.map((s) => fmt(s.v[i])), fmt(tot[i])])),
    `<ul class="leyenda">${series.map((s, si) => `<li><span class="muestra" style="background:${SERIE[si % 4]}"></span>${esc(s.n)}</li>`).join('')}</ul>`);
}

/* mapa de calor: el valor va escrito en cada celda; el color solo lo refuerza */
function gCalor({ titulo, filas, columnas, valores, unidad = '%', acc }) {
  const cw = 46, ch = 30, mi = 52, ms = 26; const W = mi + columnas.length * cw + 4, H = ms + filas.length * ch + 4;
  const escala = ['#FFFFFF', '#DCE8F5', '#BFD6EE', '#4A5788', '#2B3A7A', '#1B1F3B']; const nivel = (v) => (v < 50 ? 0 : v < 65 ? 1 : v < 75 ? 2 : v < 85 ? 3 : v < 92 ? 4 : 5);
  let c = columnas.map((col, j) => `<text class="svg-texto" x="${mi + j * cw + cw / 2}" y="${ms - 8}" text-anchor="middle">${esc(col)}</text>`).join('');
  filas.forEach((f, i) => {
    c += `<text class="svg-texto" x="${mi - 8}" y="${ms + i * ch + ch / 2 + 4}" text-anchor="end" font-weight="700">${esc(f)}</text>`;
    columnas.forEach((_, j) => { const v = valores[i][j]; const n = nivel(v); c += `<rect x="${mi + j * cw}" y="${ms + i * ch}" width="${cw - 2}" height="${ch - 2}" fill="${escala[n]}" stroke="#4A5788" stroke-width=".6" ${acc ? `class="punto-clic" data-acc="${acc}" data-arg="${esc(f)}" tabindex="0" role="link" aria-label="${esc(f)}, ${esc(columnas[j])}: ${v} ${unidad}. ${T('Ver el detalle', 'View detail')}"` : ''}><title>${esc(f)}, ${esc(columnas[j])}: ${v} ${unidad}</title></rect><text class="svg-texto ${n >= 3 ? 'claro' : ''}" x="${mi + j * cw + cw / 2 - 1}" y="${ms + i * ch + ch / 2 + 3}" text-anchor="middle" font-size="11">${v}</text>`; });
  });
  const resumen = `${titulo}. ${filas.length} ${T('filas por', 'rows by')} ${columnas.length} ${T('columnas; el valor de cada celda está escrito en ella', 'columns; each cell shows its value')}.`;
  return marco(titulo, resumen, { attrs: `viewBox="0 0 ${W} ${H}"`, cuerpo: c }, tablaDatos(titulo, [T('Bloque', 'Block'), ...columnas.map(esc)], filas.map((f, i) => [esc(f), ...valores[i].map((v) => v + ' ' + unidad)])),
    `<ul class="leyenda">${[['#FFFFFF', '&lt; 50 %'], ['#DCE8F5', '50 a 65 %'], ['#BFD6EE', '65 a 75 %'], ['#4A5788', '75 a 85 %'], ['#2B3A7A', '85 a 92 %'], ['#1B1F3B', '≥ 92 %']].map(([c, t]) => `<li><span class="muestra" style="background:${c}"></span>${t}</li>`).join('')}</ul>`);
}

/* dispersión: puntos destacados con otra forma (cuadrado) y otro color */
function gDispersion({ titulo, puntos, ex, ey, ux = '', uy = '' }) {
  const W = 640, H = 260, mi = 50, md = 16, ms = 16, mb = 44; const mx = Math.max(...puntos.map((p) => p.x)) * 1.1, my = Math.max(...puntos.map((p) => p.y)) * 1.1, ny = Math.min(...puntos.map((p) => p.y)) * 0.85;
  const X = (v) => mi + (v / mx) * (W - mi - md), Y = (v) => H - mb - ((v - ny) / (my - ny)) * (H - mb - ms);
  let c = `<line class="svg-eje" x1="${mi}" y1="${H - mb}" x2="${W - md}" y2="${H - mb}"/><line class="svg-eje" x1="${mi}" y1="${ms}" x2="${mi}" y2="${H - mb}"/>`;
  for (let k = 0; k <= 4; k++) { const v = (mx / 4) * k, w = ny + ((my - ny) / 4) * k; c += `<text class="svg-texto" x="${X(v)}" y="${H - mb + 16}" text-anchor="middle">${fmt(v)}</text><text class="svg-texto" x="${mi - 6}" y="${Y(w) + 4}" text-anchor="end">${fmt(w, 1)}</text>`; }
  c += `<text class="svg-texto" x="${(W + mi) / 2}" y="${H - 6}" text-anchor="middle" font-weight="700">${esc(ex)} (${esc(ux)})</text><text class="svg-texto" transform="translate(12 ${(H - mb) / 2}) rotate(-90)" text-anchor="middle" font-weight="700">${esc(ey)} (${esc(uy)})</text>`;
  puntos.forEach((p) => { c += p.dest ? `<rect x="${X(p.x) - 5}" y="${Y(p.y) - 5}" width="10" height="10" fill="#A63D46" stroke="#fff"><title>${esc(p.e)}: ${fmt(p.x)} ${ux}, ${fmt(p.y, 1)} ${uy}</title></rect>` : `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="5" fill="#2B3A7A" stroke="#fff"><title>${esc(p.e)}: ${fmt(p.x)} ${ux}, ${fmt(p.y, 1)} ${uy}</title></circle>`; });
  const resumen = `${titulo}. ${puntos.length} ${T('puntos', 'points')}; ${puntos.filter((p) => p.dest).length} ${T('destacados', 'highlighted')}.`;
  return marco(titulo, resumen, { attrs: `viewBox="0 0 ${W} ${H}"`, cuerpo: c }, tablaDatos(titulo, [T('Punto', 'Point'), `${esc(ex)} (${esc(ux)})`, `${esc(ey)} (${esc(uy)})`], puntos.map((p) => [esc(p.e) + (p.dest ? ' (' + T('destacado', 'highlighted') + ')' : ''), fmt(p.x), fmt(p.y, 1)])),
    `<ul class="leyenda"><li><span class="muestra" style="background:#2B3A7A;border-radius:50%"></span>${T('Hora del turno', 'Shift hour')}</li><li><span class="muestra" style="background:#A63D46"></span>${T('Hora con detención por espera de equipo', 'Hour with stop waiting for equipment')}</li></ul>`);
}

/* indicador de aguja (semicírculo) */
function gAguja({ titulo, valor, min = 0, max = 100, meta, unidad = '%', dec = 1, mejorSiMayor = true }) {
  const cx = 120, cy = 112, R = 92; const ang = (v) => Math.PI + ((v - min) / (max - min)) * Math.PI; const p = (t, r = R) => `${cx + r * Math.cos(t)},${cy + r * Math.sin(t)}`;
  const ok = mejorSiMayor ? valor >= meta : valor <= meta;
  let c = `<path d="M${p(Math.PI)} A${R},${R} 0 0 1 ${p(2 * Math.PI)}" fill="none" stroke="#DCE8F5" stroke-width="20"/><path d="M${p(Math.PI)} A${R},${R} 0 0 1 ${p(2 * Math.PI)}" fill="none" stroke="#4A5788" stroke-width="1" transform="translate(0 0)"/>`;
  c += `<path d="M${p(Math.PI)} A${R},${R} 0 0 1 ${p(ang(valor))}" fill="none" stroke="${ok ? '#4A5788' : '#A63D46'}" stroke-width="20"/>`;
  if (meta != null) c += `<line x1="${p(ang(meta), R - 16).split(',')[0]}" y1="${p(ang(meta), R - 16).split(',')[1]}" x2="${p(ang(meta), R + 16).split(',')[0]}" y2="${p(ang(meta), R + 16).split(',')[1]}" stroke="#A63D46" stroke-width="3"/><text class="svg-texto" x="${p(ang(meta), R + 28).split(',')[0]}" y="${p(ang(meta), R + 28).split(',')[1]}" text-anchor="middle" font-weight="700" fill="#A63D46">${T('meta', 'target')} ${fmt(meta, dec)}</text>`;
  c += `<line x1="${cx}" y1="${cy}" x2="${p(ang(valor), R - 26).split(',')[0]}" y2="${p(ang(valor), R - 26).split(',')[1]}" stroke="#1B1F3B" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="6" fill="#1B1F3B"/>`;
  c += `<text class="svg-texto" x="${cx}" y="${cy + 30}" text-anchor="middle" font-size="24" font-weight="700">${fmt(valor, dec)} ${esc(unidad)}</text><text class="svg-texto" x="${cx - R}" y="${cy + 18}" text-anchor="middle">${fmt(min)}</text><text class="svg-texto" x="${cx + R}" y="${cy + 18}" text-anchor="middle">${fmt(max)}</text>`;
  const resumen = `${titulo}: ${fmt(valor, dec)} ${unidad}; ${T('meta', 'target')} ${fmt(meta, dec)} ${unidad}; ${ok ? T('cumple', 'met') : T('no cumple', 'not met')}.`;
  return marco(titulo, resumen, { attrs: 'viewBox="0 -20 240 170" style="max-width:300px"', cuerpo: c }, tablaDatos(titulo, [T('Medida', 'Measure'), T('Valor', 'Value')], [[T('Valor actual', 'Current value'), `${fmt(valor, dec)} ${unidad}`], [T('Meta', 'Target'), `${fmt(meta, dec)} ${unidad}`], [T('Estado', 'Status'), ok ? T('Cumple', 'Met') : T('No cumple', 'Not met')]]),
    `<p class="detalle">${ok ? insig(T('Cumple la meta', 'Target met'), 'ok') : insig(T('Bajo la meta', 'Below target'), 'aviso')}</p>`);
}

/* línea de tiempo por carriles (programación de sitios, eventos del turno) */
function gCarriles({ titulo, carriles, desde, hasta, marcas = [], ahora }) {
  const W = 760, fila = 42, mi = 86, md = 10, ms = 26; const H = ms + carriles.length * fila + 10; const X = (m) => mi + ((m - desde) / (hasta - desde)) * (W - mi - md);
  let c = '';
  for (let m = desde; m <= hasta; m += 360) c += `<line class="svg-guia" x1="${X(m)}" x2="${X(m)}" y1="${ms - 6}" y2="${H - 6}"/><text class="svg-texto" x="${X(m)}" y="${ms - 10}" text-anchor="middle">${esc(marcas.find((x) => x.m === m)?.t || hm(m))}</text>`;
  carriles.forEach((ca, i) => {
    const y = ms + i * fila; c += `<text class="svg-texto" x="${mi - 8}" y="${y + fila / 2 + 4}" text-anchor="end" font-weight="700">${esc(ca.n)}</text><line class="svg-guia" x1="${mi}" x2="${W - md}" y1="${y + fila}" y2="${y + fila}"/>`;
    ca.items.forEach((it) => { const x1 = X(Math.max(desde, it.d)), x2 = X(Math.min(hasta, it.h)); const col = it.alerta ? '#A63D46' : it.tenue ? '#4A5788' : '#2B3A7A'; c += `<rect x="${x1}" y="${y + 6}" width="${Math.max(4, x2 - x1)}" height="${fila - 12}" rx="4" fill="${col}"><title>${esc(it.t)}</title></rect>${x2 - x1 > 70 ? `<text class="svg-texto claro" x="${x1 + 6}" y="${y + fila / 2 + 4}" font-weight="700">${esc(it.corto || it.t)}</text>` : ''}`; });
  });
  if (ahora != null) c += `<line x1="${X(ahora)}" x2="${X(ahora)}" y1="${ms - 4}" y2="${H - 4}" stroke="#A63D46" stroke-width="2"/><text class="svg-texto" x="${X(ahora) + 4}" y="${H - 2}" fill="#A63D46" font-weight="700">${T('ahora', 'now')}</text>`;
  const filas = carriles.flatMap((ca) => ca.items.map((it) => [esc(ca.n), esc(it.t), esc(it.rango || `${hm(it.d)} – ${hm(it.h)}`)]));
  return marco(titulo, `${titulo}. ${filas.length} ${T('elementos en', 'items in')} ${carriles.length} ${T('carriles', 'lanes')}.`, { attrs: `viewBox="0 0 ${W} ${H}"`, cuerpo: c }, tablaDatos(titulo, [T('Carril', 'Lane'), T('Elemento', 'Item'), T('Horario', 'Time')], filas));
}
