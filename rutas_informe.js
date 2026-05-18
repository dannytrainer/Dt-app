// ============================================================
// rutas_informe.js — Informe Premium DT
// ============================================================

const fs   = require('fs');
const path = require('path');

module.exports = function(app, fs) {

  const cargarJSON = (archivo, def=[]) => {
    const ruta = path.join(__dirname, 'data', archivo);
    try { return JSON.parse(fs.readFileSync(ruta, 'utf8')); } catch { return def; }
  };

  // ── GET /api/informe/:id ─────────────────────────────────
  // Devuelve todos los datos del cliente listos para el informe
  app.get('/api/informe/:id', (req, res) => {
    try {
      const id = req.params.id;

      const usuarios    = cargarJSON('usuarios.json');
      const rutinas     = cargarJSON('rutinas.json');
      const historial   = cargarJSON('historial.json');
      const tests       = cargarJSON('tests.json');
      const alimentacion = cargarJSON('alimentacion.json');

      const usuario = usuarios.find(u => u.id == id || u.telefono == id);
      if (!usuario) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });

      const rutina      = rutinas[id] || rutinas[usuario.telefono] || {};
      const testCliente = tests[id] || tests[usuario.telefono] || null;
      const alimCliente = alimentacion[id] || alimentacion[usuario.telefono] || null;

      // Historial de medidas del cliente
      const medidas = Array.isArray(historial)
        ? historial.filter(h => h.id == id || h.telefono == usuario.telefono)
        : (historial[id] || historial[usuario.telefono] || []);

      res.json({
        ok: true,
        cliente: {
          id:         usuario.id || id,
          nombre:     usuario.nombre || 'Sin nombre',
          telefono:   usuario.telefono || '',
          edad:       (usuario.perfil && usuario.perfil.edad) || usuario.edad || null,
          sexo:       (usuario.perfil && usuario.perfil.sexo) || usuario.sexo || null,
          altura:     (usuario.perfil && usuario.perfil.altura) || usuario.altura || null,
          objetivo:   (usuario.perfil && usuario.perfil.objetivo) || (usuario.perfil && usuario.perfil.etiqueta) || usuario.objetivo || null,
          entrenador: usuario.entrenador || 'Danny Trainer',
          lesion:     usuario.lesion || null,
          desde:      (usuario.perfil && usuario.perfil.fecha_inicio) || usuario.fecha_inicio || null,
          sesiones:   usuario.sesiones_total || usuario.sesiones || null,
          ciclo:      usuario.sesiones_ciclo || usuario.ciclo || null,
          foto:       usuario.foto || null,
        },
        rutina:      rutina || null,
        tests:       testCliente || null,
        medidas:     medidas || [],
        alimentacion: alimCliente || null,
      });

    } catch(e) {
      console.error('Error informe:', e.message);
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  // ── GET /api/informe/:id/html ────────────────────────────
  // Genera el HTML completo del informe con datos reales
  app.get('/api/informe/:id/html', async (req, res) => {
    try {
      const id = req.params.id;

      const usuarios     = cargarJSON('usuarios.json');
      const rutinas      = cargarJSON('rutinas.json');
      const historial    = cargarJSON('historial.json');
      const tests        = cargarJSON('tests.json');
      const alimentacion = cargarJSON('alimentacion.json');

      const usuario = usuarios.find(u => u.id == id || u.telefono == id);
      if (!usuario) return res.status(404).send('<h2>Cliente no encontrado</h2>');

      const rutina       = rutinas[id] || rutinas[usuario.telefono] || {};
      const testCliente  = tests[id] || tests[usuario.telefono] || {};
      // Transformar registros al formato del informe
      const registros = testCliente.registros || [];
      const regFuerza = registros.find(r => r.tipo === "fuerza") || {};
      const regResist = registros.find(r => r.tipo === "resist") || {};
      const testData = {
        fuerza: {
          "Pecho": regFuerza.pecho ? regFuerza.pecho.kg + "kg x " + regFuerza.pecho.reps + " reps" : null,
          "Espalda": regFuerza.espalda ? regFuerza.espalda.kg + "kg x " + regFuerza.espalda.reps + " reps" : null,
          "Cuadriceps": regFuerza.cuad ? regFuerza.cuad.kg + "kg x " + regFuerza.cuad.reps + " reps" : null,
        },
        resistencia: {
          "Sentadilla": regResist.sentadilla ? regResist.sentadilla + " reps" : null,
          "Peso corporal": regFuerza.peso ? regFuerza.peso + " kg" : null,
        },
        especificos: {},
        score: regFuerza.scoreTotal || regResist.scoreTotal || null,
      };
      // Filtrar nulls
      Object.keys(testData.fuerza).forEach(k => { if (!testData.fuerza[k]) delete testData.fuerza[k]; });
      Object.keys(testData.resistencia).forEach(k => { if (!testData.resistencia[k]) delete testData.resistencia[k]; });
      const alimCliente  = alimentacion[id] || alimentacion[usuario.telefono] || null;

      const historialCliente = historial[id] || historial[usuario.telefono] || {};
      const pesoArr  = historialCliente.peso || [];
      const medidasArr = historialCliente.medidas || [];

      // Ultimo peso registrado
      const ultimoPeso = pesoArr.length > 0 ? pesoArr[pesoArr.length - 1].valor : null;

      // Para compatibilidad con el resto del codigo
      const medidas = medidasArr;
      const ultima      = medidas[medidas.length - 1] || {};
      const penultima   = medidas[medidas.length - 2] || {};
      const primera     = medidas[0] || {};

      // Helpers
      const val  = (obj, key, def='—') => (obj && obj[key] != null) ? obj[key] : def;
      const delta = (a, b, key) => {
        const va = parseFloat(val(a, key, 0));
        const vb = parseFloat(val(b, key, 0));
        if (!va || !vb) return '—';
        const d = (va - vb).toFixed(1);
        return d > 0 ? `▲+${d}` : `▼${d}`;
      };

      // Fecha hoy
      const hoy = new Date().toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' }).toUpperCase();

      // Foto del cliente
      const fotoSrc = usuario.foto || null;

      // Generar días de rutina
      const diasSemana = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
      const diasHtml = diasSemana.map(dia => {
        const ejercicios = (rutina[dia] && rutina[dia].ejercicios) ? rutina[dia].ejercicios : [];
        const musculo    = (rutina[dia] && rutina[dia].recordatorio) ? rutina[dia].recordatorio : '';
        const notas      = (rutina[dia] && rutina[dia].rutina) ? rutina[dia].rutina : '';
        const esDescanso = ejercicios.length === 0;

        if (esDescanso) {
          return `
          <div class="rutina-dia-bloque">
            <div class="rutina-dia-header">
              <div class="rutina-dia-nombre" style="color:#666;">${dia.toUpperCase()}</div>
              <div class="rutina-dia-musculo" style="color:#555;">Descanso</div>
            </div>
            <div class="rutina-descanso">
              <div class="descanso-icon">😴</div>
              <div class="descanso-texto"><h4>DESCANSO</h4><p>Recuperación. Hidratación.</p></div>
            </div>
          </div>`;
        }

        const filasEj = ejercicios.map(ej => `
          <tr>
            <td><div class="ej-nombre">${ej.nombre || '—'}</div><div class="ej-grupo">${ej.grupo || ''}</div></td>
            <td class="ej-cell"><div class="ej-val">${ej.series || '—'}</div></td>
            <td class="ej-cell"><div class="ej-val">${ej.reps || '—'}</div></td>
            <td class="ej-cell"><span class="rir-badge">RIR ${ej.rir || '—'}</span></td>
            <td class="ej-cell"><span class="desc-badge">${ej.desc || '—'}</span></td>
            <td class="ej-cell" style="font-size:10px;color:var(--texto-secundario);">${ej.var || ''}</td>
            <td style="font-size:9px;color:#444;font-style:italic;text-align:center;">Próximamente</td>
            <td style="text-align:center"><a href="${ej.video || '#'}" class="btn-video"><span class="play-icon">▶</span> Ver video</a></td>
          </tr>`).join('');

        return `
          <div class="rutina-dia-bloque">
            <div class="rutina-dia-header">
              <div class="rutina-dia-nombre">${dia.toUpperCase()}</div>
              <div class="rutina-dia-musculo">💪 ${musculo}</div>
              <div class="rutina-dia-count">${ejercicios.length} ejercicios</div>
            </div>
            <table class="ejercicios-tabla">
              <thead><tr><th>Ejercicio</th><th>S</th><th>Reps</th><th>RIR</th><th>DESC</th><th>Var.</th><th>Notas</th><th>Video</th></tr></thead>
              <tbody>${filasEj}</tbody>
            </table>
            <div style="padding:10px 16px 14px;border-top:1px solid var(--gris-borde);background:var(--negro);">
              <div style="font-size:9px;text-transform:uppercase;letter-spacing:2px;color:var(--rojo);margin-bottom:6px;font-weight:700;">📝 Notas de la sesión</div>
              <div style="background:var(--gris-oscuro);border:1px dashed #3a3a3a;border-radius:4px;padding:8px 12px;min-height:36px;font-size:11px;color:${notas ? 'var(--blanco-suave)' : '#555'};font-style:${notas ? 'normal' : 'italic'};">
                ${notas || 'Sin notas registradas para esta sesión.'}
              </div>
            </div>
          </div>`;
      }).join('');

      // Generar sección de alimentación
      const alimHtml = alimCliente ? `
        <p style="font-size:12px;color:var(--blanco-suave);">Plan nutricional disponible — ${alimCliente.calorias || '—'} kcal/día</p>
      ` : `
        <div style="text-align:center;padding:30px;color:#444;font-style:italic;">
          <div style="font-size:28px;margin-bottom:8px;">🍽️</div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:2px;color:#555;">PLAN NUTRICIONAL PERSONALIZADO</div>
          <div style="font-size:11px;margin-top:6px;">Próximamente disponible · Se añadirá en la siguiente actualización del informe</div>
        </div>`;

      // Cargar calculos de composicion corporal
      let calculos = {};
      try {
        const http = require('http');
        calculos = await new Promise((resolve) => {
          const r = http.get('http://localhost:3000/api/calculos/' + id, (res2) => {
            let d = ''; res2.on('data', c => d+=c); res2.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
          }); r.on('error', () => resolve({}));
        });
      } catch(e) { calculos = {}; }

      // Fotos comparativas
      const fotoAntes   = path.join(__dirname, 'data/fotos', id, 'antes', 'foto.jpg');
      const fotoDespues = path.join(__dirname, 'data/fotos', id, 'despues', 'foto.jpg');
      let fotoAntesB64 = null, fotoDespuesB64 = null;
      try { if (fs.existsSync(fotoAntes))   fotoAntesB64   = fs.readFileSync(fotoAntes).toString('base64'); } catch{}
      try { if (fs.existsSync(fotoDespues)) fotoDespuesB64 = fs.readFileSync(fotoDespues).toString('base64'); } catch{}

      // Leer plantilla HTML base y reemplazar sección de rutina y alimentación
      // Por ahora generamos el HTML completo inline
      const html = generarHTMLCompleto({
        usuario, ultima, penultima, primera, medidas,
        testData, alimHtml, diasHtml, fotoSrc, hoy, ultimoPeso,
        calculos, fotoAntesB64, fotoDespuesB64, registros
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="informe-${usuario.nombre || id}.html"`);
      res.send(html);

    } catch(e) {
      console.error('Error generando informe HTML:', e.message);
      res.status(500).send(`<h2>Error generando informe: ${e.message}</h2>`);
    }
  });


// ============================================================
// Función generadora del HTML completo
// ============================================================
function generarHTMLCompleto({ usuario, ultima, penultima, primera, medidas, testData, alimHtml, diasHtml, fotoSrc, hoy, ultimoPeso, calculos, fotoAntesB64, fotoDespuesB64, registros }) {
  const perfil = usuario.perfil || {};
  const edad = perfil.edad || usuario.edad || null;
  const altura = perfil.altura || usuario.altura || null;
  const sexo = perfil.sexo || usuario.sexo || null;
  const fechaInicio = perfil.fecha_inicio || usuario.fecha_inicio || null;
  const _tmp_remove = 0; {

  const v = (obj, key, def='—') => (obj && obj[key] != null) ? obj[key] : def;

  let avatarHtml;
  try {
    if (fotoSrc && require('fs').existsSync(fotoSrc)) {
      const fotoData = require('fs').readFileSync(fotoSrc);
      const fotoB64 = fotoData.toString('base64');
      const ext = fotoSrc.endsWith('.png') ? 'png' : 'jpeg';
      avatarHtml = `<img src="data:image/${ext};base64,${fotoB64}" style="width:80px;height:80px;border-radius:50%;border:3px solid var(--rojo);object-fit:cover;">`;
    } else {
      avatarHtml = `<div class="avatar">${(usuario.nombre || 'C').charAt(0).toUpperCase()}</div>`;
    }
  } catch(e) {
    avatarHtml = `<div class="avatar">${(usuario.nombre || 'C').charAt(0).toUpperCase()}</div>`;
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Informe Premium — ${usuario.nombre || 'Cliente'}</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --rojo:#E63946; --negro:#0d0d0d; --gris-oscuro:#1a1a1a;
    --gris-medio:#2e2e2e; --gris-borde:#3a3a3a;
    --blanco:#fff; --blanco-suave:#f5f5f5; --texto-secundario:#aaa;
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'DM Sans',sans-serif;background:#1c1c1c;color:#fff;font-size:13px;}
  .pagina{width:900px;margin:0 auto;background:var(--negro);position:relative;overflow:visible;}
  .marca-agua{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:0;overflow:hidden;}
  .marca-agua::before{
    content:'DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__    DT-APP @danny_trainer__';
    position:absolute;top:-100px;left:-200px;width:250%;
    font-family:'DM Sans',sans-serif;font-size:22px;font-weight:900;
    color:rgba(255,255,255,0.10);letter-spacing:4px;line-height:80px;
    transform:rotate(-30deg);word-break:break-all;text-transform:uppercase;
  }
  .header{background:var(--negro);border-bottom:3px solid var(--rojo);padding:18px 24px;display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1;}
  .logo-cuadro{width:48px;height:48px;background:var(--rojo);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:22px;color:#fff;border-radius:4px;}
  .logo-texto h1{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;color:#fff;line-height:1;}
  .logo-texto p{font-size:10px;color:var(--texto-secundario);letter-spacing:1px;text-transform:uppercase;}
  .header-titulo h2{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:4px;color:#fff;}
  .header-titulo h2 span{color:var(--rojo);}
  .header-titulo p{font-size:10px;color:var(--texto-secundario);letter-spacing:2px;text-transform:uppercase;margin-top:2px;}
  .fecha-bloque{background:var(--gris-oscuro);border:1px solid var(--gris-borde);padding:8px 14px;border-radius:4px;text-align:right;}
  .fecha-bloque .label{font-size:9px;color:var(--rojo);text-transform:uppercase;letter-spacing:1px;}
  .fecha-bloque .valor{font-family:'Bebas Neue',sans-serif;font-size:18px;color:#fff;line-height:1.2;}
  .badge-premium{background:var(--rojo);color:#fff;font-size:9px;font-weight:700;padding:2px 8px;border-radius:2px;letter-spacing:2px;margin-top:4px;display:inline-block;}
  .seccion{border:1px solid var(--gris-borde);margin:0;border-top:none;position:relative;z-index:1;}
  .seccion-header{background:var(--gris-oscuro);padding:8px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--gris-borde);}
  .seccion-num{width:22px;height:22px;background:var(--rojo);border-radius:3px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:14px;color:#fff;flex-shrink:0;}
  .seccion-titulo{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:3px;color:#fff;}
  .seccion-body{padding:16px;}
  .avatar{width:80px;height:80px;border-radius:50%;border:3px solid var(--rojo);background:var(--gris-medio);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:28px;color:var(--rojo);margin:0 auto 6px;}
  .datos-lista{list-style:none;}
  .datos-lista li{display:flex;align-items:center;gap:6px;padding:3px 0;font-size:12px;color:var(--blanco-suave);border-bottom:1px solid rgba(255,255,255,0.05);}
  .datos-lista li:last-child{border-bottom:none;}
  .resumen-box{background:var(--gris-oscuro);border:1px solid var(--gris-borde);border-radius:4px;padding:12px;}
  .resumen-box h4{font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:2px;color:var(--rojo);margin-bottom:6px;}
  .resumen-box p{font-size:11.5px;color:var(--blanco-suave);line-height:1.6;margin-bottom:10px;}
  .metricas-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
  .metrica-card{background:var(--negro);border:1px solid var(--gris-borde);border-radius:3px;padding:8px;text-align:center;}
  .metrica-card .val{font-family:'Bebas Neue',sans-serif;font-size:22px;color:#fff;line-height:1;}
  .metrica-card .unidad{font-size:10px;color:var(--texto-secundario);}
  .metrica-card .delta{font-size:10px;margin-top:2px;}
  .delta-pos{color:#4caf50;} .delta-neg{color:var(--rojo);}
  .metrica-card .label-m{font-size:9px;color:var(--texto-secundario);text-transform:uppercase;letter-spacing:1px;margin-top:2px;}
  table.dt-table{width:100%;border-collapse:collapse;font-size:11px;}
  table.dt-table th{background:var(--gris-medio);color:var(--texto-secundario);padding:4px 6px;text-align:center;font-size:9px;text-transform:uppercase;letter-spacing:1px;}
  table.dt-table th:first-child{text-align:left;}
  table.dt-table td{padding:4px 6px;border-bottom:1px solid rgba(255,255,255,0.04);text-align:center;color:var(--blanco-suave);}
  table.dt-table td:first-child{text-align:left;color:var(--texto-secundario);}
  .td-actual{color:#fff!important;font-weight:600;} .td-pos{color:#4caf50!important;} .td-neg{color:var(--rojo)!important;}
  .rutina-dia-bloque{margin-bottom:18px;background:var(--gris-oscuro);border:1px solid var(--gris-borde);border-radius:6px;overflow:hidden;}
  .rutina-dia-header{background:var(--gris-medio);padding:9px 16px;display:flex;align-items:center;gap:12px;border-bottom:2px solid var(--gris-borde);}
  .rutina-dia-nombre{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:3px;color:#fff;min-width:60px;}
  .rutina-dia-musculo{font-size:11px;color:var(--rojo);font-weight:600;text-transform:uppercase;letter-spacing:1px;}
  .rutina-dia-count{margin-left:auto;background:rgba(230,57,70,0.15);border:1px solid rgba(230,57,70,0.3);color:var(--rojo);font-size:10px;padding:2px 10px;border-radius:20px;font-weight:600;}
  .ejercicios-tabla{width:100%;border-collapse:collapse;}
  .ejercicios-tabla thead tr{background:rgba(255,255,255,0.03);}
  .ejercicios-tabla thead th{padding:6px 10px;font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--texto-secundario);font-weight:600;text-align:center;border-bottom:1px solid var(--gris-borde);}
  .ejercicios-tabla thead th:first-child{text-align:left;}
  .ejercicios-tabla tbody tr{border-bottom:1px solid rgba(255,255,255,0.04);}
  .ejercicios-tabla tbody tr:last-child{border-bottom:none;}
  .ejercicios-tabla td{padding:7px 10px;font-size:11px;text-align:center;vertical-align:middle;}
  .ejercicios-tabla td:first-child{text-align:left;}
  .ej-nombre{color:var(--blanco-suave);font-size:12px;font-weight:500;line-height:1.3;}
  .ej-grupo{font-size:9px;color:var(--texto-secundario);margin-top:1px;text-transform:uppercase;letter-spacing:0.5px;}
  .ej-cell{position:relative;}
  .ej-cell::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:1px;background:var(--gris-borde);}
  .ej-val{font-family:'Bebas Neue',sans-serif;font-size:16px;color:#fff;line-height:1;}
  .rir-badge{background:rgba(33,150,243,0.15);border:1px solid rgba(33,150,243,0.3);color:#82b1ff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:3px;display:inline-block;}
  .desc-badge{background:rgba(255,193,7,0.1);border:1px solid rgba(255,193,7,0.25);color:#ffc107;font-size:10px;font-weight:600;padding:2px 7px;border-radius:3px;display:inline-block;}
  .btn-video{display:inline-flex;align-items:center;gap:4px;background:rgba(230,57,70,0.15);border:1px solid rgba(230,57,70,0.4);color:var(--rojo);font-size:10px;font-weight:700;padding:5px 9px;border-radius:4px;text-decoration:none;letter-spacing:0.5px;cursor:pointer;white-space:nowrap;}
  .rutina-descanso{padding:18px 16px;display:flex;align-items:center;gap:14px;}
  .descanso-icon{font-size:28px;}
  .descanso-texto h4{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:2px;color:var(--texto-secundario);}
  .descanso-texto p{font-size:11px;color:#555;margin-top:2px;}
  .nota-entrenador{background:rgba(230,57,70,0.08);border:1px solid rgba(230,57,70,0.3);border-left:3px solid var(--rojo);border-radius:3px;padding:8px 12px;margin-top:12px;font-size:11px;color:var(--blanco-suave);line-height:1.6;}
  .nota-entrenador strong{color:var(--rojo);}
</style>
</head>
<body>
<div class="marca-agua"></div>
<div class="pagina">

  <!-- HEADER -->
  <div class="header">
    <div style="display:flex;align-items:center;gap:12px;">
      <div class="logo-cuadro">DT</div>
      <div class="logo-texto">
        <h1>DANNY TRAINER</h1>
        <p>Asistente de Entrenamiento</p>
      </div>
    </div>
    <div class="header-titulo" style="text-align:center;">
      <h2>REPORTE DE <span>RENDIMIENTO</span></h2>
      <p>Informe Completo del Cliente · Confidencial</p>
    </div>
    <div class="fecha-bloque">
      <div class="label">📅 Fecha del Informe</div>
      <div class="valor">${hoy}</div>
      <div class="badge-premium">★ TIPO PREMIUM</div>
    </div>
  </div>

  <!-- CLIENTE -->
  <div class="seccion">
    <div class="seccion-header">
      <div class="seccion-num" style="background:none;color:var(--rojo);font-size:16px;">🔥</div>
      <div class="seccion-titulo">${({'perdida':'PÉRDIDA DE PESO','masa':'AUMENTO DE MASA','rehab':'REHABILITACIÓN','rendimiento':'RENDIMIENTO'}[usuario.objetivo] || usuario.objetivo || 'PERSONALIZADO') + ' · PERSONALIZADO'}</div>
    </div>
    <div class="seccion-body">
      <div style="display:grid;grid-template-columns:120px 1fr 1fr;gap:16px;align-items:start;">
        <div style="text-align:center;">
          ${avatarHtml}
          <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;color:#fff;line-height:1;">${v(usuario,'nombre')}</div>
          <div style="background:var(--rojo);color:#fff;font-size:9px;padding:2px 6px;border-radius:2px;display:inline-block;margin-top:4px;letter-spacing:1px;">${({'perdida':'Pérdida de peso','masa':'Aumento de masa','rehab':'Rehabilitación','rendimiento':'Rendimiento deportivo'})[(usuario.perfil&&usuario.perfil.etiqueta)||usuario.objetivo] || (usuario.perfil&&usuario.perfil.etiqueta) || usuario.objetivo || '—'}</div>
        </div>
        <div>
          <ul class="datos-lista">
            <li><span style="color:var(--rojo);">🎂</span> ${edad || '—'} años · ${sexo || '—'}</li>
            <li><span style="color:var(--rojo);">📏</span> ${altura || '—'} cm</li>
            <li><span style="color:var(--rojo);">📅</span> Desde: ${fechaInicio || '—'}</li>
            <li><span style="color:var(--rojo);">🏋️</span> ${usuario.sesiones_total || usuario.sesiones || '—'} sesiones · ciclo ${usuario.sesiones_ciclo || usuario.ciclo || '—'}</li>
            <li><span style="color:var(--rojo);">👨‍💼</span> ${v(usuario,'entrenador','Danny Trainer')}</li>
            ${usuario.lesion ? `<li><span style="color:var(--rojo);">⚠️</span> ${usuario.lesion}</li>` : ''}
          </ul>
        </div>
        <div class="resumen-box">
          <h4>📊 RESUMEN DEL PROGRESO</h4>
          <p>Progreso registrado desde el inicio. Revisa tus medidas, tests y rendimiento semanal.</p>
          <div class="metricas-grid">
            <div class="metrica-card">
              <div class="val">${ultimoPeso || v(ultima,'peso','—')}</div>
              <div class="unidad">kg</div>
              <div class="label-m">Peso</div>
            </div>
            <div class="metrica-card">
              <div class="val">${(ultima && ultima.analisis && ultima.analisis.pctGrasa != null ? ultima.analisis.pctGrasa : '—')}</div>
              <div class="unidad">% Grasa</div>
              <div class="label-m">% Grasa</div>
            </div>
            <div class="metrica-card">
              <div class="val">${(ultima && ultima.analisis && ultima.analisis.kgMusculo != null ? ultima.analisis.kgMusculo : '—')}</div>
              <div class="unidad">kg</div>
              <div class="label-m">Músculo</div>
            </div>
            <div class="metrica-card">
              <div class="val">${v(testData,'score','—')}</div>
              <div class="unidad">/ 100</div>
              <div class="label-m">Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 1 — MEDIDAS -->
  <div class="seccion">
    <div class="seccion-header">
      <div class="seccion-num">1</div>
      <div class="seccion-titulo">PROGRESO DE MEDIDAS</div>
    </div>
    <div class="seccion-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:var(--rojo);margin-bottom:8px;">📐 Perímetros (cm)</div>
          <table class="dt-table">
            <tr><th>Medida</th><th>Inicial</th><th>Ant.</th><th>Actual</th><th>Δ</th></tr>
            <tr><td>Hombros</td><td>${v(primera,'hombros')}</td><td>${v(penultima,'hombros')}</td><td class="td-actual">${v(ultima,'hombros')}</td><td class="${parseFloat(v(ultima,'hombros',0)) > parseFloat(v(primera,'hombros',0)) ? 'td-pos' : 'td-neg'}">—</td></tr>
            <tr><td>Pecho</td><td>${v(primera,'pecho')}</td><td>${v(penultima,'pecho')}</td><td class="td-actual">${v(ultima,'pecho')}</td><td>—</td></tr>
            <tr><td>Brazo</td><td>${v(primera,'brazo')}</td><td>${v(penultima,'brazo')}</td><td class="td-actual">${v(ultima,'brazo')}</td><td>—</td></tr>
            <tr><td>Cintura</td><td>${v(primera,'cintura')}</td><td>${v(penultima,'cintura')}</td><td class="td-actual">${v(ultima,'cintura')}</td><td>—</td></tr>
            <tr><td>Cadera</td><td>${v(primera,'cadera')}</td><td>${v(penultima,'cadera')}</td><td class="td-actual">${v(ultima,'cadera')}</td><td>—</td></tr>
            <tr><td>Pierna</td><td>${v(primera,'pierna')}</td><td>${v(penultima,'pierna')}</td><td class="td-actual">${v(ultima,'pierna')}</td><td>—</td></tr>
          </table>
        </div>
        <div>
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:var(--rojo);margin-bottom:8px;">📦 Pliegues (mm) · Composición</div>
          <table class="dt-table">
            <tr><th>Pliegue</th><th>Inicial</th><th>Ant.</th><th>Actual</th><th>Δ</th></tr>
            <tr><td>Tríceps</td><td>${v(primera,'triceps')}</td><td>${v(penultima,'triceps')}</td><td class="td-actual">${v(ultima,'triceps')}</td><td>—</td></tr>
            <tr><td>Subescapular</td><td>${v(primera,'subescapular')}</td><td>${v(penultima,'subescapular')}</td><td class="td-actual">${v(ultima,'subescapular')}</td><td>—</td></tr>
            <tr><td>Abdominal</td><td>${v(primera,'abdominal')}</td><td>${v(penultima,'abdominal')}</td><td class="td-actual">${v(ultima,'abdominal')}</td><td>—</td></tr>
            <tr><td>% Grasa</td><td>${(primera && primera.analisis ? primera.analisis.pctGrasa : '—')}</td><td>${(penultima && penultima.analisis ? penultima.analisis.pctGrasa : '—')}</td><td class="td-actual">${(ultima && ultima.analisis ? ultima.analisis.pctGrasa : '—')}</td><td>—</td></tr>
            <tr><td>Kg músculo</td><td>${(primera && primera.analisis ? primera.analisis.kgMusculo : '—')}</td><td>${(penultima && penultima.analisis ? penultima.analisis.kgMusculo : '—')}</td><td class="td-actual">${(ultima && ultima.analisis ? ultima.analisis.kgMusculo : '—')}</td><td>—</td></tr>
          </table>
        </div>
      </div>
    </div>
  </div>

  
  <!-- 2 — ANÁLISIS CORPORAL + FOTOS -->
  <div class="seccion">
    <div class="seccion-header">
      <div class="seccion-num">2</div>
      <div class="seccion-titulo">ANÁLISIS CORPORAL</div>
    </div>
    <div class="seccion-body">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <!-- Composición corporal -->
        <div>
          ${calculos && calculos.pctGrasa ? `
          <div style="font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:2px;color:var(--rojo);margin-bottom:8px;">📊 COMPOSICIÓN CORPORAL</div>
          <div style="background:var(--negro);border:1px solid var(--gris-borde);border-radius:4px;overflow:hidden;">
            <div style="display:flex;justify-content:space-between;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.04)"><span style="font-size:11px;color:#888">% Grasa</span><span style="font-size:12px;font-weight:700;color:#fff">${calculos.pctGrasa}%</span></div>
            <div style="display:flex;justify-content:space-between;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.04)"><span style="font-size:11px;color:#888">% Masa magra</span><span style="font-size:12px;font-weight:700;color:#fff">${calculos.pctMagra}%</span></div>
            <div style="display:flex;justify-content:space-between;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.04)"><span style="font-size:11px;color:#888">Kg de grasa</span><span style="font-size:12px;font-weight:700;color:#fff">${calculos.kgGrasa} kg</span></div>
            <div style="display:flex;justify-content:space-between;padding:6px 10px"><span style="font-size:11px;color:#888">Kg músculo</span><span style="font-size:12px;font-weight:700;color:#4caf50">${calculos.kgMusculo} kg</span></div>
          </div>
          ${calculos.proporciones ? `
          <div style="font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:2px;color:var(--rojo);margin:10px 0 8px;">📐 PROPORCIONES</div>
          <div style="background:var(--negro);border:1px solid var(--gris-borde);border-radius:4px;overflow:hidden;">
            ${Object.entries(calculos.proporciones).map(([k,v])=>{
              const labels={hombros_cintura:'Hombros/cintura',pecho_cintura:'Pecho/cintura',brazo_cintura:'Brazo/cintura'};
              const color=v.nivel==='ok'?'#4caf50':v.nivel==='warn'?'#ff9800':'#e31e24';
              return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.04)">
                <span style="font-size:11px;color:#888">${labels[k]||k}</span>
                <span style="font-size:11px;font-weight:700;color:${color}">${v.valor} · ${v.estado}</span>
              </div>`;
            }).join('')}
          </div>` : ''}
          ${calculos.salud ? `
          <div style="font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:2px;color:var(--rojo);margin:10px 0 8px;">❤️ SALUD METABÓLICA</div>
          <div style="background:var(--negro);border:1px solid var(--gris-borde);border-radius:4px;overflow:hidden;">
            ${Object.entries(calculos.salud).map(([k,v])=>{
              const labels={icc:'Índice cintura/cadera',ica:'Índice cintura/altura'};
              const color=v.nivel==='ok'?'#4caf50':v.nivel==='warn'?'#ff9800':'#e31e24';
              return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.04)">
                <span style="font-size:11px;color:#888">${labels[k]||k}</span>
                <span style="font-size:11px;font-weight:700;color:${color}">${v.valor} · ${v.estado}</span>
              </div>`;
            }).join('')}
          </div>` : ''}
          ` : '<div style="color:#555;font-size:11px;font-style:italic;padding:10px;">Sin datos de composición</div>'}
        </div>

        <!-- Fotos comparativas -->
        <div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:13px;letter-spacing:2px;color:var(--rojo);margin-bottom:8px;">📸 COMPARATIVA ANTES / DESPUÉS</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div style="text-align:center;">
              <div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Antes</div>
              ${fotoAntesB64 ? `<img src="data:image/jpeg;base64,${fotoAntesB64}" style="width:100%;border-radius:6px;border:1px solid var(--gris-borde);max-height:200px;object-fit:cover;">`
              : `<div style="background:#1a1a1a;border:1px dashed #333;border-radius:6px;height:160px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;"><span style="font-size:28px;">🏃</span><span style="font-size:10px;color:#555;">Sin foto</span></div>`}
            </div>
            <div style="text-align:center;">
              <div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Después</div>
              ${fotoDespuesB64 ? `<img src="data:image/jpeg;base64,${fotoDespuesB64}" style="width:100%;border-radius:6px;border:1px solid var(--rojo);max-height:200px;object-fit:cover;">`
              : `<div style="background:#1a1a1a;border:1px dashed var(--rojo);border-radius:6px;height:160px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;"><span style="font-size:28px;">💪</span><span style="font-size:10px;color:#555;">Sin foto</span></div>`}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 3 — TESTS -->
  <div class="seccion">
    <div class="seccion-header">
      <div class="seccion-num">3</div>
      <div class="seccion-titulo">TESTS FÍSICOS · RECORDS PERSONALES</div>
    </div>
    <div class="seccion-body">
    ${(() => {
      const regs = registros || [];
      const byTipo = (tipo) => regs.filter(r => r.tipo === tipo);
      const ultimo = (tipo) => { const a = byTipo(tipo); return a[a.length-1] || null; };
      const penult = (tipo) => { const a = byTipo(tipo); return a[a.length-2] || null; };
      const fuerza  = ultimo('fuerza');  const fuerzaP  = penult('fuerza');
      const resist  = ultimo('resist');  const resistP  = penult('resist');
      const especif = ultimo('especif'); const especifP = penult('especif');

      const flecha = (actual, anterior, invertir=false) => {
        if (actual==null || anterior==null) return '<span style="color:#555;font-size:10px;">—</span>';
        const d = parseFloat(actual) - parseFloat(anterior);
        if (d === 0) return '<span style="color:#555;font-size:10px;">—</span>';
        const mejor = invertir ? d < 0 : d > 0;
        return mejor
          ? `<span style="color:#4caf50;font-size:10px;">▲+${Math.abs(d).toFixed(1)}</span>`
          : `<span style="color:#e31e24;font-size:10px;">▼-${Math.abs(d).toFixed(1)}</span>`;
      };

      const fila = (nombre, valor, delta) =>
        `<div style="display:flex;align-items:baseline;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
          <span style="font-size:11px;color:#888;white-space:nowrap;">${nombre}</span>
          <span style="flex:1;border-bottom:1px dotted #2a2a2a;margin:0 5px;position:relative;top:-3px;"></span>
          <span style="font-size:12px;font-weight:700;color:#fff;white-space:nowrap;">${valor}</span>
          <span style="min-width:56px;text-align:right;">${delta}</span>
        </div>`;

      const radar = (datos, color) => {
        if (!datos.length) return '<div style="height:160px;display:flex;align-items:center;justify-content:center;color:#333;font-size:11px;">Sin datos</div>';
        const n=datos.length, cx=80, cy=80, r=58;
        const ang = i => Math.PI*2*i/n - Math.PI/2;
        const ptOuter = i => [cx+r*Math.cos(ang(i)), cy+r*Math.sin(ang(i))];
        let grid='';
        [25,50,75,100].forEach(pct=>{
          const pts=datos.map((_,i)=>{const a=ang(i),rv=r*pct/100;return `${cx+rv*Math.cos(a)},${cy+rv*Math.sin(a)}`;}).join(' ');
          grid+=`<polygon points="${pts}" fill="none" stroke="#2a2a2a" stroke-width="0.8"/>`;
        });
        const ejes=datos.map((_,i)=>{const[x,y]=ptOuter(i);return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#333" stroke-width="0.8"/>`;}).join('');
        const pts=datos.map((d,i)=>{const a=ang(i),rv=r*Math.min(d.score||0,100)/100;return `${cx+rv*Math.cos(a)},${cy+rv*Math.sin(a)}`;}).join(' ');
        const area=`<polygon points="${pts}" fill="${color}33" stroke="${color}" stroke-width="1.5"/>`;
        const labels=datos.map((d,i)=>{const[x,y]=ptOuter(i);const lx=cx+(x-cx)*1.3,ly=cy+(y-cy)*1.3;return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="7" fill="#999">${d.label}</text>`;}).join('');
        return `<svg viewBox="0 0 160 160" width="160" height="160">${grid}${ejes}${area}${labels}</svg>`;
      };

      const musculos={pecho:'Pecho',espalda:'Espalda',cuad:'Cuádriceps',femoral:'Femoral',biceps:'Bíceps',triceps:'Tríceps',gluteo:'Glúteo'};
      let hF='', rF=[];
      if(fuerza) Object.entries(musculos).forEach(([k,n])=>{ if(fuerza[k]){ const v=fuerza[k],vp=fuerzaP&&fuerzaP[k]; hF+=fila(n,`${v.kg}kg × ${v.reps} reps`,vp?flecha(v.kg,vp.kg):'<span style="color:#555;font-size:10px;">—</span>'); rF.push({label:n.substring(0,5),score:v.score||0}); }});

      const resistEjs={pushups:'Push ups',dominadas:'Dominadas',sentadilla:'Sentadilla',fondos:'Fondos',plancha:'Plancha (s)',burpees:'Burpees/min'};
      let hR='', rR=[];
      if(resist) Object.entries(resistEjs).forEach(([k,n])=>{ if(resist[k]){ const v=resist[k],vp=resistP&&resistP[k]; hR+=fila(n,v.valor+' reps',vp?flecha(v.valor,vp.valor):'<span style="color:#555;font-size:10px;">—</span>'); rR.push({label:n.substring(0,5),score:v.score||0}); }});

      const especifEjs={cooper:'Cooper (m)',leger:'Léger (niv)',sitreach:'Sit&Reach cm',hombro:'Flex hombro',saltoL:'Salto largo cm',saltoV:'Salto vertical cm',vel30:'Vel. 30m (s)'};
      let hE='', rE=[];
      if(especif) Object.entries(especifEjs).forEach(([k,n])=>{ if(especif[k]){ const v=especif[k],vp=especifP&&especifP[k]; hE+=fila(n,v.valor,vp?flecha(v.valor,vp.valor,k==='vel30'):'<span style="color:#555;font-size:10px;">—</span>'); rE.push({label:n.substring(0,4),score:v.score||0}); }});

      const sin='<div style="color:#555;font-size:11px;font-style:italic;padding:6px 0;">Sin datos</div>';
      return `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:16px;">
          <div><div style="font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:2px;color:var(--rojo);margin-bottom:8px;border-bottom:1px solid var(--gris-borde);padding-bottom:4px;">🏆 PRs · FUERZA</div>${hF||sin}</div>
          <div><div style="font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:2px;color:var(--rojo);margin-bottom:8px;border-bottom:1px solid var(--gris-borde);padding-bottom:4px;">💪 RESISTENCIA</div>${hR||sin}</div>
          <div><div style="font-family:'Bebas Neue',sans-serif;font-size:12px;letter-spacing:2px;color:var(--rojo);margin-bottom:8px;border-bottom:1px solid var(--gris-borde);padding-bottom:4px;">⚡ ESPECÍFICOS</div>${hE||sin}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;border-top:1px solid var(--gris-borde);padding-top:14px;">
          <div style="display:flex;flex-direction:column;align-items:center;"><div style="font-size:9px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Radar Fuerza</div><div style="height:160px;display:flex;align-items:center;justify-content:center;">${radar(rF,'#e31e24')}</div></div>
          <div style="display:flex;flex-direction:column;align-items:center;"><div style="font-size:9px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Radar Resistencia</div><div style="height:160px;display:flex;align-items:center;justify-content:center;">${radar(rR,'#2196f3')}</div></div>
          <div style="display:flex;flex-direction:column;align-items:center;"><div style="font-size:9px;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Radar Específicos</div><div style="height:160px;display:flex;align-items:center;justify-content:center;">${radar(rE,'#4caf50')}</div></div>
        </div>`;
    })()}
    </div>
  </div>

  <!-- 4 — ALIMENTACIÓN -->
  <div class="seccion">
    <div class="seccion-header">
      <div class="seccion-num">4</div>
      <div class="seccion-titulo">PLAN DE ALIMENTACIÓN</div>
    </div>
    <div class="seccion-body">${alimHtml}</div>
  </div>

  <!-- 5 — RUTINA -->
  <div class="seccion">
    <div class="seccion-header">
      <div class="seccion-num">5</div>
      <div class="seccion-titulo">RUTINA DE ENTRENAMIENTO SEMANAL</div>
    </div>
    <div class="seccion-body">
      <div style="display:flex;align-items:center;gap:20px;margin-bottom:14px;padding:8px 12px;background:var(--gris-oscuro);border:1px solid var(--gris-borde);border-radius:4px;font-size:10px;color:var(--texto-secundario);">
        <span>📋 <strong style="color:#fff">S</strong> = Series</span>
        <span>🔄 <strong style="color:#fff">Reps</strong> = Repeticiones</span>
        <span>🎯 <strong style="color:#fff">RIR</strong> = Reps en Reserva</span>
        <span>⏱️ <strong style="color:#fff">DESC</strong> = Descanso</span>
        <span>▶ <strong style="color:#fff">VIDEO</strong> = Ver ejercicio</span>
      </div>
      ${diasHtml}
    </div>
  </div>

  <!-- FOOTER -->
  <div style="background:var(--gris-oscuro);border-top:2px solid var(--gris-borde);padding:0;position:relative;z-index:1;">
    <div style="background:#111;border-bottom:1px solid var(--gris-borde);padding:8px 24px;display:flex;align-items:center;justify-content:center;gap:8px;">
      <span style="font-size:10px;color:#555;letter-spacing:1px;text-transform:uppercase;">Informe generado en colaboración</span>
    </div>
    <div style="padding:14px 24px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:20px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:40px;height:40px;background:var(--rojo);border-radius:6px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:18px;color:#fff;flex-shrink:0;">DT</div>
        <div>
          <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:2px;color:#fff;line-height:1;">DT-APP</div>
          <div style="font-size:10px;color:var(--texto-secundario);margin-top:1px;">Plataforma de entrenamiento personal</div>
          <div style="font-size:10px;color:var(--rojo);margin-top:2px;font-weight:600;">dt-app.com</div>
        </div>
      </div>
      <div style="text-align:center;">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:28px;color:#333;line-height:1;">×</div>
        <div style="font-size:9px;color:#444;text-transform:uppercase;letter-spacing:2px;margin-top:2px;">Colaboración</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;justify-content:flex-end;">
        <div style="text-align:right;">
          <div style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:2px;color:#fff;line-height:1;">${v(usuario,'entrenador','DANNY TRAINER').toUpperCase()}</div>
          <div style="font-size:10px;color:var(--texto-secundario);margin-top:1px;">Entrenador Personal Certificado</div>
          <a href="https://www.instagram.com/danny_trainer__" style="font-size:10px;color:var(--rojo);font-weight:600;text-decoration:none;margin-top:2px;display:inline-block;">📸 @danny_trainer__</a>
        </div>
        <div style="width:40px;height:40px;background:var(--gris-medio);border:2px solid var(--rojo);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:14px;color:var(--rojo);flex-shrink:0;">DT</div>
      </div>
    </div>
    <div style="background:#0a0a0a;border-top:1px solid #222;padding:6px 24px;display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:9px;color:#444;">Informe confidencial · Uso exclusivo del cliente</span>
      <span style="font-size:9px;color:#444;">© 2026 DT-App · Todos los derechos reservados</span>
    </div>
  </div>

</div>
</body>
</html>`;


  // ── POST /api/informe/:id/enviar ─────────────────────────────
  app.post('/api/informe/:id/enviar', async (req, res) => {
    try {
      const id = req.params.id;
      const usuarios = cargarJSON('usuarios.json');
      const usuario = usuarios.find(u => u.id == id || u.telefono == id);

      const { getSock } = require('./index');
      const sock = getSock();
      const telefono = usuario.telefono;
      const jid = telefono.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      const nombre = usuario.nombre || 'Cliente';

      // Llamar directamente a la ruta HTML para obtener el contenido
      const htmlContent = await new Promise((resolve, reject) => {
        const options = { hostname: 'localhost', port: 3000, path: '/api/informe/' + id + '/html', method: 'GET' };
        const http = require('http');
        const req2 = http.request(options, (res2) => {
          let data = '';
          res2.on('data', chunk => data += chunk);
          res2.on('end', () => resolve(data));
        });
        req2.on('error', reject);
        req2.end();
      });

      const buffer = Buffer.from(htmlContent, 'utf-8');
      await sock.sendMessage(jid, {
        document: buffer,
        mimetype: 'text/html',
        fileName: 'Informe-Premium-' + nombre.replace(/ /g, '-') + '.html'
      });
      res.json({ ok: true, mensaje: 'Informe enviado a ' + nombre });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

}
}
}
