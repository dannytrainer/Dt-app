
function renderEnciclopedia(c) {
  c.innerHTML = '<div style="padding:10px"><div style="position:relative;margin-bottom:10px"><input id="enc-buscar" type="text" placeholder="Buscar ejercicio..." style="width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:10px;color:#fff;font-size:14px;outline:none" oninput="encFiltrar()"></div><div id="enc-contenido"></div></div>';
  window._encGrupos = [
    {id:"pecho",   icon:"&#127947;", nombre:"Pecho",   count:0},
    {id:"espalda", icon:"&#128170;", nombre:"Espalda", count:0},
    {id:"piernas", icon:"&#129466;", nombre:"Piernas", count:0},
    {id:"hombros", icon:"&#128288;", nombre:"Hombros", count:0},
    {id:"brazos",  icon:"&#128170;", nombre:"Brazos",  count:0},
    {id:"gluteos", icon:"&#127825;", nombre:"Gluteos", count:0},
    {id:"core",    icon:"&#9881;",   nombre:"Core",    count:0},
    {id:"cardio",  icon:"&#127939;", nombre:"Cardio",  count:0}
  ];
  window._encFiltros = {grupo:null, equipamiento:null, nivel:null, texto:"", esPersonalizado:false};
  window._encEjercicios = [];
  encCargarEjercicios();
}

function encCargarEjercicios() {
  Promise.all([
    fetch("/api/enciclopedia").then(function(r){return r.json();}).catch(function(){return [];}),
    fetch("/api/enciclopedia/personalizados").then(function(r){return r.json();}).catch(function(){return [];})
  ]).then(function(res) {
    var oficiales = Array.isArray(res[0]) ? res[0] : [];
    var custom = Array.isArray(res[1]) ? res[1] : [];
    window._encEjercicios = oficiales.concat(custom);
    window._encGrupos.forEach(function(g) {
      g.count = window._encEjercicios.filter(function(e){return e.grupo===g.id;}).length;
    });
    encMostrarGrupos();
  });
}

function encMostrarGrupos() {
  window._encFiltros = {grupo:null, equipamiento:null, nivel:null, texto:"", esPersonalizado:false};
  var bi = document.getElementById("enc-buscar");
  if (bi) bi.value = "";
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  var html = "<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px\">";
  window._encGrupos.forEach(function(g) {
    html += "<div onclick=\"encSeleccionarGrupo(&quot;" + g.id + "&quot;)\" style=\"background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:18px 14px;cursor:pointer;text-align:center\">";
    html += "<div style=\"font-size:28px;margin-bottom:6px\">" + g.icon + "</div>";
    html += "<div style=\"font-size:14px;font-weight:700;color:#fff\">" + g.nombre + "</div>";
    html += "<div style=\"font-size:11px;color:#666;margin-top:3px\">" + g.count + " ejercicios</div>";
    html += "</div>";
  });
  html += "</div>";
  html += "<div onclick=\"encSeleccionarGrupo(&quot;personalizado&quot;)\" style=\"background:#111;border:1px solid #2a1a00;border-radius:12px;padding:14px;cursor:pointer;display:flex;align-items:center;gap:12px\">";
  html += "<span style=\"font-size:24px\">&#11088;</span>";
  html += "<div><div style=\"font-size:14px;font-weight:700;color:#ffab40\">Mis Personalizados</div>";
  html += "<div style=\"font-size:11px;color:#666;margin-top:2px\" id=\"enc-custom-count\">...</div></div>";
  html += "</div>";
  cont.innerHTML = html;
  var personalizados = (window._encEjercicios||[]).filter(function(e){return e.es_personalizado;});
  var el = document.getElementById("enc-custom-count");
  if (el) el.textContent = personalizados.length + " / 10";
}

function encSeleccionarGrupo(grupo) {
  window._encFiltros.grupo = grupo === "personalizado" ? null : grupo;
  window._encFiltros.esPersonalizado = grupo === "personalizado";
  encMostrarLista();
}

function encMostrarLista() {
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  var grupo = window._encGrupos.find(function(g){return g.id===window._encFiltros.grupo;});
  var titulo = window._encFiltros.esPersonalizado ? "&#11088; Mis Personalizados" : (grupo ? grupo.icon+" "+grupo.nombre : "Todos");
  var html = "<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:10px\">";
  html += "<button onclick=\"encMostrarGrupos()\" style=\"background:#1a1a1a;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:14px\">&#8592;</button>";
  html += "<span style=\"font-size:15px;font-weight:700;color:#fff\">" + titulo + "</span></div>";
  html += "<div style=\"display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none;margin-bottom:10px\">";
  var equipos = ["Todos","barra","mancuerna","maquina","peso corporal","cable"];
  var labels  = ["Todos","Barra","Mancuerna","Maquina","Peso corporal","Cable"];
  equipos.forEach(function(eq, i) {
    var val = eq === "Todos" ? "" : eq;
    var activo = (window._encFiltros.equipamiento||"") === val;
    var borde = activo ? "#e31e24" : "#2a2a2a";
    var bg = activo ? "#e31e24" : "#1a1a1a";
    var col = activo ? "#fff" : "#888";
    html += "<div onclick=\"encSetFiltro(&quot;equipamiento&quot;,&quot;" + val + "&quot;)\" style=\"flex-shrink:0;padding:5px 12px;border-radius:20px;border:1px solid " + borde + ";background:" + bg + ";color:" + col + ";font-size:12px;font-weight:600;cursor:pointer\">" + labels[i] + "</div>";
  });
  html += "</div>";
  var resultados = encBuscar();
  if (resultados.length === 0) {
    html += "<div style=\"text-align:center;color:#666;padding:30px;font-size:13px\">No se encontraron ejercicios</div>";
  } else {
    resultados.forEach(function(e) {
      var nc = e.nivel==="principiante"?"#64b5f6":e.nivel==="avanzado"?"#e31e24":"#4caf50";
      var nb = e.nivel==="principiante"?"#1a2a3a":e.nivel==="avanzado"?"#3a1a1a":"#1a3a1a";
      var gr = window._encGrupos.find(function(g){return g.id===e.grupo;});
      html += "<div onclick=\"encAbrirFicha(&quot;" + e.id + "&quot;)\" style=\"background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px;cursor:pointer\">";
      html += "<div style=\"width:48px;height:48px;background:#1a1a1a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;border:1px solid #2a2a2a\">" + (gr?gr.icon:"&#128170;") + "</div>";
      html += "<div style=\"flex:1;min-width:0\">";
      html += "<div style=\"font-size:14px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\">" + e.nombre + "</div>";
      html += "<div style=\"display:flex;gap:6px;flex-wrap:wrap;margin-top:4px\">";
      if (e.nivel) html += "<span style=\"padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600;background:" + nb + ";color:" + nc + "\">" + e.nivel + "</span>";
      if (e.equipamiento) html += "<span style=\"padding:2px 7px;border-radius:4px;font-size:10px;background:#1e1e1e;color:#aaa;border:1px solid #333\">" + e.equipamiento + "</span>";
      if (e.es_personalizado) html += "<span style=\"padding:2px 7px;border-radius:4px;font-size:10px;background:#2a1a00;color:#ffab40\">&#11088; Personalizado</span>";
      html += "</div></div><span style=\"color:#666;font-size:14px\">&#8250;</span></div>";
    });
  }
  cont.innerHTML = html;
}

function encBuscar() {
  var lista = window._encEjercicios || [];
  if (window._encFiltros.esPersonalizado) {
    lista = lista.filter(function(e){return e.es_personalizado;});
  } else if (window._encFiltros.grupo) {
    lista = lista.filter(function(e){return e.grupo===window._encFiltros.grupo;});
  }
  if (window._encFiltros.equipamiento) {
    lista = lista.filter(function(e){return e.equipamiento===window._encFiltros.equipamiento;});
  }
  if (window._encFiltros.texto && window._encFiltros.texto.trim()!=="") {
    var txt = window._encFiltros.texto.toLowerCase();
    lista = lista.filter(function(e){
      return e.nombre.toLowerCase().includes(txt) ||
        (e.musculos_principales||[]).some(function(m){return m.toLowerCase().includes(txt);}) ||
        (e.tags||[]).some(function(t){return t.toLowerCase().includes(txt);});
    });
  }
  return lista.sort(function(a,b){return a.nombre.localeCompare(b.nombre,"es");});
}

function encSetFiltro(tipo, valor) {
  window._encFiltros[tipo] = valor === "" ? null : valor;
  encMostrarLista();
}

function encFiltrar() {
  var txt = document.getElementById("enc-buscar");
  if (!txt) return;
  window._encFiltros.texto = txt.value;
  if (txt.value.trim()!=="") {
    window._encFiltros.grupo = null;
    window._encFiltros.esPersonalizado = false;
    encMostrarLista();
  } else if (!window._encFiltros.grupo && !window._encFiltros.esPersonalizado) {
    encMostrarGrupos();
  } else {
    encMostrarLista();
  }
}

function encAbrirFicha(id) {
  var e = (window._encEjercicios||[]).find(function(x){return x.id===id;});
  if (!e) return;
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  var gr = window._encGrupos.find(function(g){return g.id===e.grupo;});
  var nc = e.nivel==="principiante"?"#64b5f6":e.nivel==="avanzado"?"#e31e24":"#4caf50";
  var nb = e.nivel==="principiante"?"#1a2a3a":e.nivel==="avanzado"?"#3a1a1a":"#1a3a1a";
  var html = "<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:12px\">";
  html += "<button onclick=\"encMostrarLista()\" style=\"background:#1a1a1a;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:14px\">&#8592;</button>";
  html += "<span style=\"font-size:13px;color:#666\">Ficha tecnica</span></div>";
  if (e.video_youtube) {
    html += "<div style=\"position:relative;width:100%;padding-bottom:56.25%;margin-bottom:12px;border-radius:10px;overflow:hidden\"><iframe src=\"" + e.video_youtube + "\" style=\"position:absolute;top:0;left:0;width:100%;height:100%;border:none\" allowfullscreen></iframe></div>";
  } else if (e.imagen) {
    html += "<div style=\"background:#1a1a1a;border-radius:10px;overflow:hidden;margin-bottom:12px;text-align:center;padding:16px;position:relative\"><img src=\"" + e.imagen + "\" style=\"max-width:100%;max-height:200px;filter:invert(1)\"><div style=\"position:absolute;bottom:6px;right:8px;font-size:10px;color:#e31e24;font-weight:700;opacity:0.7\">DT-APP</div></div>";
  }
  html += "<div style=\"margin-bottom:14px\">";
  html += "<div style=\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px\">" + (gr?gr.icon+" ":"") + e.grupo + (e.subgrupo?" - "+e.subgrupo:"") + "</div>";
  html += "<div style=\"font-size:22px;font-weight:900;color:#fff;text-transform:uppercase;line-height:1.1;margin-bottom:8px\">" + e.nombre + "</div>";
  html += "<div style=\"display:flex;gap:6px;flex-wrap:wrap\">";
  if (e.nivel) html += "<span style=\"padding:3px 8px;border-radius:4px;font-size:11px;font-weight:600;background:" + nb + ";color:" + nc + "\">" + e.nivel + "</span>";
  if (e.equipamiento) html += "<span style=\"padding:3px 8px;border-radius:4px;font-size:11px;background:#1e1e1e;color:#aaa;border:1px solid #333\">" + e.equipamiento + "</span>";
  html += "</div></div>";
  if ((e.musculos_principales||[]).length > 0 || (e.musculos_secundarios||[]).length > 0) {
    html += "<div style=\"margin-bottom:16px\"><div style=\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px\">Musculos</div><div style=\"display:flex;flex-wrap:wrap;gap:6px\">";
    (e.musculos_principales||[]).forEach(function(m){html += "<span style=\"padding:4px 10px;border-radius:6px;font-size:12px;background:rgba(227,30,36,0.15);border:1px solid rgba(227,30,36,0.4);color:#ff6b6b\">&#11088; " + m + "</span>";});
    (e.musculos_secundarios||[]).forEach(function(m){html += "<span style=\"padding:4px 10px;border-radius:6px;font-size:12px;background:#1a1a1a;border:1px solid #2a2a2a;color:#ccc\">" + m + "</span>";});
    html += "</div></div>";
  }
  if ((e.ejecucion||[]).length > 0) {
    html += "<div style=\"margin-bottom:16px\"><div style=\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px\">Ejecucion</div>";
    e.ejecucion.forEach(function(paso,i){
      html += "<div style=\"display:flex;gap:10px;margin-bottom:10px\"><div style=\"width:24px;height:24px;background:#e31e24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px\">" + (i+1) + "</div><div style=\"font-size:13px;color:#ccc;line-height:1.5\">" + paso + "</div></div>";
    });
    html += "</div>";
  }
  if ((e.errores_comunes||[]).length > 0) {
    html += "<div style=\"margin-bottom:16px\"><div style=\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px\">Errores comunes</div>";
    e.errores_comunes.forEach(function(err){
      html += "<div style=\"display:flex;gap:8px;margin-bottom:8px\"><span style=\"color:#ffab40;font-size:14px;flex-shrink:0\">&#9888;</span><div style=\"font-size:13px;color:#ccc;line-height:1.5\">" + err + "</div></div>";
    });
    html += "</div>";
  }
  if ((e.variantes||[]).length > 0) {
    html += "<div style=\"margin-bottom:16px\"><div style=\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px\">Variantes</div><div style=\"display:flex;gap:8px;flex-wrap:wrap\">";
    e.variantes.forEach(function(v){
      var ve = (window._encEjercicios||[]).find(function(x){return x.id===v;});
      html += "<div onclick=\"encAbrirFicha(&quot;" + v + "&quot;)\" style=\"padding:6px 12px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;font-size:12px;color:#fff;cursor:pointer\">" + (ve?ve.nombre:v) + "</div>";
    });
    html += "</div></div>";
  }
  cont.innerHTML = html;
}
