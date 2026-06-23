function renderEnciclopedia(c) {
  c.innerHTML = '<div style="padding:10px"><div style="position:relative;margin-bottom:10px"><input id="enc-buscar" type="text" placeholder="Buscar ejercicio..." style="width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:10px;color:#fff;font-size:14px;outline:none" oninput="encFiltrar()"></div><div id="enc-contenido"></div></div>';
  window._encGrupos = [
    {id:"pecho",   icon:'<img src="/images/Enciclopediapecho.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Pecho",   count:0},
    {id:"espalda", icon:'<img src="/images/Enciclopediaespalda.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Espalda", count:0},
    {id:"piernas", icon:'<img src="/images/Enciclopediapierna.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Piernas", count:0},
    {id:"hombros", icon:'<img src="/images/Enciclopediahombro.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Hombros", count:0},
    {id:"brazos",  icon:'<img src="/images/Enciclopediabrazo.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Brazos",  count:0},
    {id:"gluteos", icon:'<img src="/images/Enciclopediagluteo.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Gluteos", count:0},
    {id:"core",    icon:'<img src="/images/Enciclopediaabdomen.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Core",    count:0},
    {id:"cardio",  icon:'<img src="/images/Enciclopediacardio.png" style="width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px">', nombre:"Cardio",  count:0},
  ];
  window._encFiltros = {grupo:null, equipamiento:null, nivel:null, texto:"", esPersonalizado:false};
  window._encEjercicios = [];
  encCargarEjercicios();
}

function encCargarEjercicios() {
  Promise.all([
    fetch("/api/enciclopedia").then(function(r){return r.json();}).catch(function(){return [];}),
    fetch("/api/glosario").then(function(r){return r.json();}).catch(function(){return [];})
  ]).then(function(res) {
    var oficiales = Array.isArray(res[0]) ? res[0] : [];
    window._encEjercicios = oficiales;
    var glosario = Array.isArray(res[1]) ? res[1] : [];
    window._encGlosarioCount = glosario.length;
    window._encGrupos.forEach(function(g) {
      g.count = window._encEjercicios.filter(function(e){return e.grupo===g.id;}).length;
    });
    encMostrarGrupos();
  });
}

function encAbrirAnatomia() {
  alert("Anatom\u00eda: proximamente disponible.");
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
    html += "</div>";
  // Fila: Estiramientos y Tus ejercicios
  html += "<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px\">";
  html += "<div onclick=\"encSeleccionarGrupo(&quot;estiramientos&quot;)\" style=\"background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:18px 14px;cursor:pointer;text-align:center\">";
  html += "<div style=\"margin-bottom:6px\"><img src=\"/images/Enciclopediaestiramiento.png\" style=\"width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px\"></div>";
  html += "<div style=\"font-size:14px;font-weight:700;color:#fff\">Estiramientos</div>";
  html += "<div style=\"font-size:11px;color:#666;margin-top:3px\">" + (window._encEjercicios||[]).filter(function(e){return e.grupo==="estiramientos";}).length + " ejercicios</div>";
  html += "</div>";
  if (localStorage.getItem("dt_rol") !== "cliente") {
  html += "<div onclick=\"encAgregarPersonalizado()\" style=\"background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:18px 14px;cursor:pointer;text-align:center\">";
  html += "<div style=\"margin-bottom:6px\"><img src=\"/images/Creardt.png\" style=\"width:56px;height:56px;object-fit:contain;border-radius:8px\"></div>";
  html += "<div style=\"font-size:14px;font-weight:700;color:#fff\">Mis ejercicios</div>";
  html += "<div style=\"font-size:11px;color:#666;margin-top:3px\" id=\"enc-custom-count\">0 / 10</div>";
  html += "</div>";
  }
  html += "</div>";

  // Fila: Glosario y Anatomia
  html += "<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px\">";
  html += "<div onclick=\"encAbrirGlosario()\" style=\"background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:18px 14px;cursor:pointer;text-align:center\">";
  html += "<div style=\"margin-bottom:6px\"><img src=\"/images/Glosariodt.png\" style=\"width:56px;height:56px;object-fit:contain;border-radius:8px\"></div>";
  html += "<div style=\"font-size:14px;font-weight:700;color:#fff\">Glosario</div>";
  html += "<div style=\"font-size:11px;color:#666;margin-top:3px\">" + (window._encGlosarioCount||0) + " términos</div>";
  html += "</div>";
  html += "<div onclick=\"encAbrirAnatomia()\" style=\"background:#111;border:1px solid #2a2a2a;border-radius:12px;padding:18px 14px;cursor:pointer;text-align:center\">";
  html += "<div style=\"margin-bottom:6px\"><img src=\"/images/Enciclopediaanatomia.png\" style=\"width:64px;height:56px;object-fit:cover;object-position:center 20%;border-radius:10px\"></div>";
  html += "<div style=\"font-size:14px;font-weight:700;color:#fff\">Anatom\u00eda</div>";
  html += "<div style=\"font-size:11px;color:#666;margin-top:3px\">Pr\u00f3ximamente</div>";
  html += "</div>";
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
      html += e.imagen ? "<div style=\"width:48px;height:48px;background:#1a1a1a;border-radius:8px;overflow:hidden;flex-shrink:0;border:1px solid #2a2a2a\"><img src=\"" + e.imagen + "\" style=\"width:100%;height:100%;object-fit:cover\"></div>" : "<div style=\"width:48px;height:48px;background:#1a1a1a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;border:1px solid #2a2a2a\">" + (gr?gr.icon:"&#128170;") + "</div>";
      html += "<div style=\"flex:1;min-width:0\">";
      html += "<div style=\"font-size:14px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\">" + e.nombre + "</div>";
      html += "<div style=\"display:flex;gap:6px;flex-wrap:wrap;margin-top:4px\">";
      if (e.nivel) html += "<span style=\"padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600;background:" + nb + ";color:" + nc + "\">" + e.nivel + "</span>";
      if (e.equipamiento) html += "<span style=\"padding:2px 7px;border-radius:4px;font-size:10px;background:#1e1e1e;color:var(--texto-medio);border:1px solid #333\">" + e.equipamiento + "</span>";
      if (e.es_personalizado) html += "<span style=\"padding:2px 7px;border-radius:4px;font-size:10px;background:rgba(255,171,64,0.15);color:#e65100\">&#11088; Personalizado</span>";
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

function encEditarFicha(id) {
  var e = (window._encEjercicios||[]).find(function(x){return x.id===id;});
  if (!e) return;
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  function escHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  var html = "<div style=\"padding:10px\">";
  html += "<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:16px\">";
  html += "<button onclick=\"encAbrirFicha(&quot;" + id + "&quot;)\" style=\"background:#1a1a1a;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:14px\">&#8592;</button>";
  html += "<span style=\"font-size:14px;font-weight:700;color:#e31e24\">&#9998; Editando ejercicio</span>";
  html += "</div>";

  html += "<div style=\"margin-bottom:12px\">";
  html += "<div style=\"font-size:11px;color:#666;margin-bottom:4px;text-transform:uppercase\">Nombre</div>";
  html += "<input id=\"enc-edit-nombre\" value=\"" + escHtml(e.nombre) + "\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none\">";
  html += "</div>";

  var grupos = ["pecho","espalda","hombros","brazos","piernas","gluteos","core","cardio"];
  html += "<div style=\"margin-bottom:12px\">";
  html += "<div style=\"font-size:11px;color:#666;margin-bottom:4px;text-transform:uppercase\">Grupo</div>";
  html += "<select id=\"enc-edit-grupo\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:13px;outline:none;box-sizing:border-box\">";
  grupos.forEach(function(g){ html += "<option value=\"" + g + "\"" + (e.grupo===g?" selected":"") + ">" + g.charAt(0).toUpperCase()+g.slice(1) + "</option>"; });
  html += "</select></div>";

  html += "<div style=\"margin-bottom:12px\">";
  html += "<div style=\"font-size:11px;color:#666;margin-bottom:4px;text-transform:uppercase\">M&uacute;sculos principales (separados por coma)</div>";
  html += "<input id=\"enc-edit-musculos-p\" value=\"" + escHtml((e.musculos_principales||[]).join(', ')) + "\" placeholder=\"Ej: cuádriceps, glúteos\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:13px;outline:none;box-sizing:border-box\">";
  html += "</div>";

  html += "<div style=\"margin-bottom:12px\">";
  html += "<div style=\"font-size:11px;color:#666;margin-bottom:4px;text-transform:uppercase\">M&uacute;sculos secundarios (separados por coma)</div>";
  html += "<input id=\"enc-edit-musculos-s\" value=\"" + escHtml((e.musculos_secundarios||[]).join(', ')) + "\" placeholder=\"Ej: core, lumbares\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:13px;outline:none;box-sizing:border-box\">";
  html += "</div>";

  html += "<div style=\"margin-bottom:12px\">";
  html += "<div style=\"font-size:11px;color:#666;margin-bottom:4px;text-transform:uppercase\">Pasos de ejecucion</div>";
  window._encEditPasosCount = (e.ejecucion||[]).length;
  (e.ejecucion||[]).forEach(function(paso, i) {
    html += "<div id=\"enc-edit-wrap-" + i + "\" style=\"display:flex;gap:6px;margin-bottom:6px;align-items:flex-start\">";
    html += "<div style=\"width:22px;height:22px;background:#e31e24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:6px\">" + (i+1) + "</div>";
    html += "<textarea id=\"enc-edit-paso-" + i + "\" rows=\"2\" style=\"flex:1;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:8px;color:#fff;font-size:13px;outline:none;resize:none\">" + paso + "</textarea>";
    html += "<button onclick=\"encEliminarPasoEdit(" + i + ")\" style=\"background:#3a0000;border:1px solid #e31e24;border-radius:8px;color:#e31e24;padding:6px 8px;cursor:pointer;font-size:12px;flex-shrink:0;margin-top:4px\">&#128465;</button>";
    html += "</div>";
  });
  html += "</div>";
  html += "<button onclick=\"encAgregarPasoEdit()\" style=\"background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;color:var(--texto-medio);padding:7px 14px;cursor:pointer;font-size:12px;margin-bottom:12px\">+ Agregar paso</button>";

  html += "<button onclick=\"encGuardarEdicionV2(&quot;" + id + "&quot;)\" style=\"width:100%;background:#e31e24;border:none;border-radius:10px;color:#fff;padding:12px;font-size:14px;font-weight:700;cursor:pointer\">&#10003; Guardar cambios</button>";
  html += "</div>";

  cont.innerHTML = html;
}


function encEliminarPasoEdit(i) {
  var wrap = document.getElementById("enc-edit-wrap-" + i);
  if (wrap) wrap.remove();
}

function encAgregarPasoEdit() {
  var i = window._encEditPasosCount || 0;
  var cont = document.getElementById("enc-contenido").querySelector("#enc-edit-wrap-" + (i-1));
  var div = document.createElement("div");
  div.id = "enc-edit-wrap-" + i;
  div.style.cssText = "display:flex;gap:6px;margin-bottom:6px;align-items:flex-start";
  div.innerHTML = "<div style=\"width:22px;height:22px;background:#e31e24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:6px\">" + (i+1) + "</div><textarea id=\"enc-edit-paso-" + i + "\" rows=\"2\" style=\"flex:1;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:8px;color:#fff;font-size:13px;outline:none;resize:none\"></textarea><button onclick=\"encEliminarPasoEdit(" + i + ")\" style=\"background:#3a0000;border:1px solid #e31e24;border-radius:8px;color:#e31e24;padding:6px 8px;cursor:pointer;font-size:12px;flex-shrink:0;margin-top:4px\">&#128465;</button>";
  if (cont) cont.parentNode.insertBefore(div, cont.nextSibling);
  else document.getElementById("enc-contenido").appendChild(div);
  window._encEditPasosCount = i + 1;
}

function encGuardarEdicionV2(id) {
  var e = (window._encEjercicios||[]).find(function(x){return x.id===id;});
  if (!e) return;
  e.nombre = document.getElementById("enc-edit-nombre").value;
  e.grupo = document.getElementById("enc-edit-grupo").value;
  var mp = document.getElementById("enc-edit-musculos-p").value;
  var ms = document.getElementById("enc-edit-musculos-s").value;
  e.musculos_principales = mp.split(",").map(function(m){return m.trim();}).filter(Boolean);
  e.musculos_secundarios = ms.split(",").map(function(m){return m.trim();}).filter(Boolean);
  var pasos = [];
  var i = 0;
  while (document.getElementById("enc-edit-paso-" + i)) {
    var el = document.getElementById("enc-edit-paso-" + i);
    if (el && el.value.trim()) pasos.push(el.value.trim());
    i++;
  }
  e.ejecucion = pasos;
  fetch("/api/enciclopedia/editar/" + id, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nombre: e.nombre, grupo: e.grupo, ejecucion: e.ejecucion, musculos_principales: e.musculos_principales, musculos_secundarios: e.musculos_secundarios})
  }).then(function(r){return r.json();}).then(function(){
    encAbrirFicha(id);
  });
}

function encGuardarEdicion(id, numPasos) {
  var e = (window._encEjercicios||[]).find(function(x){return x.id===id;});
  if (!e) return;

  e.nombre = document.getElementById("enc-edit-nombre").value;
  var pasos = [];
  for (var i = 0; i < numPasos; i++) {
    var el = document.getElementById("enc-edit-paso-" + i);
    if (el) pasos.push(el.value);
  }
  e.ejecucion = pasos;

  fetch("/api/enciclopedia/editar/" + id, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({nombre: e.nombre, ejecucion: e.ejecucion})
  }).then(function(r){return r.json();}).then(function(){
    encAbrirFicha(id);
  });
}


function encAgregarPersonalizado() {
  if(!entEsPremium()){mostrarCandadoPremium('Los ejercicios personalizados requieren Plan Premium.');return;}
  encGestionPersonalizados();
}

function encGestionPersonalizados() {
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  var personalizados = (window._encEjercicios||[]).filter(function(e){return e.es_personalizado;});
  var html = "<div style=\"padding:4px\">";
  html += "<div style=\"display:flex;align-items:center;justify-content:space-between;margin-bottom:16px\">";
  html += "<div style=\"display:flex;align-items:center;gap:8px\">";
  html += "<button onclick=\"encMostrarGrupos()\" style=\"background:#1a1a1a;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:14px\">&#8592;</button>";
  html += "<span style=\"font-size:15px;font-weight:700;color:#fff\">&#11088; Mis ejercicios</span>";
  html += "</div>";
  html += "<button onclick=\"encFormNuevoPersonalizado()\" style=\"background:#e31e24;border:none;border-radius:8px;color:#fff;padding:8px 14px;cursor:pointer;font-size:13px;font-weight:700\">+ Nuevo</button>";
  html += "</div>";
  if (personalizados.length === 0) {
    html += "<div style=\"text-align:center;padding:40px 20px;color:var(--texto-medio);font-size:13px\">No tienes ejercicios personalizados.<br>Toca <b style=\"color:#fff\">+ Nuevo</b> para crear uno.</div>";
  } else {
    personalizados.forEach(function(e) {
      var img = e.imagen_inicio || e.imagen_fin || "";
      html += "<div style=\"background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:10px\">";
      if (img) {
        html += "<img src=\"" + img + "\" style=\"width:48px;height:48px;border-radius:8px;object-fit:cover;background:#1a1a1a\">";
      } else {
        html += "<div style=\"width:48px;height:48px;background:#1a1a1a;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:22px\">&#128170;</div>";
      }
      html += "<div style=\"flex:1;min-width:0\">";
      html += "<div style=\"font-size:14px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\">" + e.nombre + "</div>";
      html += "<div style=\"font-size:11px;color:#666;margin-top:3px\">" + (e.grupo||"") + (e.equipamiento ? " &middot; " + e.equipamiento : "") + "</div>";
      html += "</div>";
      html += "<div style=\"display:flex;gap:6px\">";
      html += "<button onclick=\"encFormEditarPersonalizado(&quot;" + e.id + "&quot;)\" style=\"background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:13px\">&#9998;</button>";
      html += "<button onclick=\"encEliminarPersonalizado(&quot;" + e.id + "&quot;)\" style=\"background:#3a0000;border:1px solid #e31e24;border-radius:8px;color:#e31e24;padding:6px 10px;cursor:pointer;font-size:13px\">&#128465;</button>";
      html += "</div>";
      html += "</div>";
    });
  }
  html += "</div>";
  cont.innerHTML = html;
}

function encFormNuevoPersonalizado() {
  encFormPersonalizado(null);
}

function encFormEditarPersonalizado(id) {
  var e = (window._encEjercicios||[]).find(function(x){return x.id===id;});
  encFormPersonalizado(e);
}

function encFormPersonalizado(e) {
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  var esNuevo = !e;
  var grupos = ["pecho","espalda","hombros","brazos","piernas","gluteos","core","cardio"];
  var equipos = ["peso corporal","barra","mancuerna","maquina","cable","banda","kettlebell","otro"];
  var niveles = ["principiante","intermedio","avanzado"];
  var muscs = e && e.musculos_principales ? e.musculos_principales.join(", ") : "";
  var pasos = e && e.ejecucion && e.ejecucion.length > 0 ? e.ejecucion : ["","",""];
  window._encPasosCount = pasos.length;

  var html = "<div style=\"padding:4px\">";
  html += "<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:16px\">";
  html += "<button onclick=\"encGestionPersonalizados()\" style=\"background:#1a1a1a;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:14px\">&#8592;</button>";
  html += "<span style=\"font-size:15px;font-weight:700;color:#e31e24\">" + (esNuevo ? "&#43; Nuevo ejercicio" : "&#9998; Editar ejercicio") + "</span>";
  html += "</div>";

  html += "<div style=\"margin-bottom:12px\"><div style=\"font-size:10px;color:#666;margin-bottom:4px;text-transform:uppercase\">Nombre *</div>";
  html += "<input id=\"enc-p-nombre\" value=\"" + (e ? e.nombre : "") + "\" placeholder=\"Ej: Curl martillo inclinado\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none;box-sizing:border-box\"></div>";

  html += "<div style=\"margin-bottom:12px\"><div style=\"font-size:10px;color:#666;margin-bottom:4px;text-transform:uppercase\">Grupo muscular</div>";
  html += "<select id=\"enc-p-grupo\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none;box-sizing:border-box\">";
  grupos.forEach(function(g) {
    html += "<option value=\"" + g + "\"" + (e && e.grupo===g ? " selected" : "") + ">" + g.charAt(0).toUpperCase()+g.slice(1) + "</option>";
  });
  html += "</select></div>";

  html += "<div style=\"margin-bottom:12px\"><div style=\"font-size:10px;color:#666;margin-bottom:4px;text-transform:uppercase\">Equipamiento</div>";
  html += "<select id=\"enc-p-equipo\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none;box-sizing:border-box\">";
  equipos.forEach(function(eq) {
    html += "<option value=\"" + eq + "\"" + (e && e.equipamiento===eq ? " selected" : "") + ">" + eq.charAt(0).toUpperCase()+eq.slice(1) + "</option>";
  });
  html += "</select></div>";

  html += "<div style=\"margin-bottom:12px\"><div style=\"font-size:10px;color:#666;margin-bottom:4px;text-transform:uppercase\">Nivel</div>";
  html += "<select id=\"enc-p-nivel\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none;box-sizing:border-box\">";
  ["principiante","intermedio","avanzado"].forEach(function(n) {
    html += "<option value=\"" + n + "\"" + (e && e.nivel===n ? " selected" : "") + ">" + n.charAt(0).toUpperCase()+n.slice(1) + "</option>";
  });
  html += "</select></div>";

  html += "<div style=\"margin-bottom:12px\"><div style=\"font-size:10px;color:#666;margin-bottom:4px;text-transform:uppercase\">M&uacute;sculos principales (separados por coma)</div>";
  html += "<input id=\"enc-p-musculos\" value=\"" + muscs + "\" placeholder=\"Ej: b&iacute;ceps, braquial\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:#fff;font-size:14px;outline:none;box-sizing:border-box\"></div>";

  html += "<div style=\"margin-bottom:12px\"><div style=\"font-size:10px;color:#666;margin-bottom:6px;text-transform:uppercase\">Pasos de ejecuci&oacute;n</div>";
  html += "<div id=\"enc-p-pasos\">";
  pasos.forEach(function(paso, i) {
    html += "<div id=\"enc-paso-wrap-" + i + "\" style=\"display:flex;gap:6px;margin-bottom:6px;align-items:flex-start\">";
    html += "<div style=\"width:22px;height:22px;background:#e31e24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:6px;color:#fff\">" + (i+1) + "</div>";
    html += "<textarea id=\"enc-p-paso-" + i + "\" rows=\"2\" placeholder=\"Paso " + (i+1) + "...\" style=\"flex:1;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:8px;color:#fff;font-size:13px;outline:none;resize:none;box-sizing:border-box\">" + paso + "</textarea>";
    html += "<button onclick=\"encEliminarPaso(" + i + ")\" style=\"background:#3a0000;border:1px solid #e31e24;border-radius:8px;color:#e31e24;padding:6px 8px;cursor:pointer;font-size:12px;flex-shrink:0;margin-top:4px\">&#128465;</button>";
    html += "</div>";
  });
  html += "</div>";
  html += "<button onclick=\"encAgregarPaso()\" style=\"background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;color:var(--texto-medio);padding:7px 14px;cursor:pointer;font-size:12px;margin-top:4px\">+ Agregar paso</button></div>";

  html += "<div style=\"margin-bottom:12px\"><div style=\"font-size:10px;color:#666;margin-bottom:6px;text-transform:uppercase\">Foto posici&oacute;n inicial</div>";
  if (e && e.imagen_inicio) html += "<img src=\"" + e.imagen_inicio + "\" style=\"width:100%;max-height:140px;object-fit:contain;border-radius:10px;background:#1a1a1a;margin-bottom:8px\">";
  html += "<input type=\"file\" id=\"enc-p-foto-inicio\" accept=\"image/*\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:var(--texto-medio);font-size:13px;box-sizing:border-box\"></div>";

  html += "<div style=\"margin-bottom:16px\"><div style=\"font-size:10px;color:#666;margin-bottom:6px;text-transform:uppercase\">Foto posici&oacute;n final</div>";
  if (e && e.imagen_fin) html += "<img src=\"" + e.imagen_fin + "\" style=\"width:100%;max-height:140px;object-fit:contain;border-radius:10px;background:#1a1a1a;margin-bottom:8px\">";
  html += "<input type=\"file\" id=\"enc-p-foto-fin\" accept=\"image/*\" style=\"width:100%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:10px;color:var(--texto-medio);font-size:13px;box-sizing:border-box\"></div>";

  html += "<button onclick=\"encGuardarPersonalizado(" + (e ? "&quot;" + e.id + "&quot;" : "null") + ")\" style=\"width:100%;background:#e31e24;border:none;border-radius:10px;color:#fff;padding:14px;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:20px\">&#10003; Guardar ejercicio</button>";
  html += "</div>";
  cont.innerHTML = html;
}


function encEliminarPaso(i) {
  var wrap = document.getElementById("enc-paso-wrap-" + i);
  if (wrap) wrap.remove();
}

function encAgregarPaso() {
  var i = window._encPasosCount || 0;
  var cont = document.getElementById("enc-p-pasos");
  if (!cont) return;
  var div = document.createElement("div");
  div.style.cssText = "display:flex;gap:6px;margin-bottom:6px;align-items:flex-start";
  div.innerHTML = "<div style=\"width:22px;height:22px;background:#e31e24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:6px;color:#fff\">" + (i+1) + "</div><textarea id=\"enc-p-paso-" + i + "\" rows=\"2\" placeholder=\"Paso " + (i+1) + "...\" style=\"flex:1;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:8px;color:#fff;font-size:13px;outline:none;resize:none;box-sizing:border-box\"></textarea>";
  cont.appendChild(div);
  window._encPasosCount = i + 1;
}

function encGuardarPersonalizado(id) {
  var nombre = document.getElementById("enc-p-nombre").value.trim();
  if (!nombre) { toast('⚠️ El nombre es obligatorio',false); return; }
  var grupo = document.getElementById("enc-p-grupo").value;
  var equipo = document.getElementById("enc-p-equipo").value;
  var nivel = document.getElementById("enc-p-nivel").value;
  var muscsRaw = document.getElementById("enc-p-musculos").value;
  var musculos = muscsRaw.split(",").map(function(m){return m.trim();}).filter(Boolean);
  var pasos = [];
  var i = 0;
  while (document.getElementById("enc-p-paso-" + i)) {
    var v = document.getElementById("enc-p-paso-" + i).value.trim();
    if (v) pasos.push(v);
    i++;
  }
  var datos = {nombre: nombre, grupo: grupo, equipamiento: equipo, nivel: nivel, musculos_principales: musculos, ejecucion: pasos};
  var url = id ? "/api/enciclopedia/personalizados/" + id : "/api/enciclopedia/personalizados";
  var method = id ? "PUT" : "POST";
  fetch(url, {method: method, headers: {"Content-Type":"application/json"}, body: JSON.stringify(datos)})
  .then(function(r){return r.json();})
  .then(function(data) {
    var ejercicioId = id || data.id || (data.ejercicio && data.ejercicio.id);
    var fotoInicio = document.getElementById("enc-p-foto-inicio");
    var fotoFin = document.getElementById("enc-p-foto-fin");
    var promesas = [];
    if (fotoInicio && fotoInicio.files && fotoInicio.files[0] && ejercicioId) {
      var fd1 = new FormData();
      fd1.append("foto", fotoInicio.files[0]);
      promesas.push(fetch("/api/enciclopedia/personalizados/" + ejercicioId + "/foto/inicio", {method:"POST", body: fd1}));
    }
    if (fotoFin && fotoFin.files && fotoFin.files[0] && ejercicioId) {
      var fd2 = new FormData();
      fd2.append("foto", fotoFin.files[0]);
      promesas.push(fetch("/api/enciclopedia/personalizados/" + ejercicioId + "/foto/fin", {method:"POST", body: fd2}));
    }
    Promise.all(promesas).then(function() {
      encCargarEjercicios();
      setTimeout(encGestionPersonalizados, 600);
    });
  })
  .catch(function(){ toast('❌ Error al guardar',false); });
}

function encEliminarPersonalizado(id) {
  if (!confirm("¿Eliminar este ejercicio?")) return;
  fetch("/api/enciclopedia/personalizados/" + id, {method:"DELETE"})
  .then(function(r){return r.json();})
  .then(function() {
    encCargarEjercicios();
    setTimeout(encGestionPersonalizados, 600);
  });
}


function encAbrirGlosario() {
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  cont.innerHTML = "<div style=\"text-align:center;padding:20px;color:#666\">Cargando...</div>";
  fetch("/api/glosario").then(function(r){return r.json();}).then(function(data){
    window._glosario = data;
    encMostrarGlosario(null);
  });
}

function encMostrarGlosario(cat) {
  var cont = document.getElementById("enc-contenido");
  if (!cont) return;
  var cats = [
    {id:null,label:"Todos",col:"#fff"},
    {id:"metodos",label:"Metodos",col:"#e31e24"},
    {id:"terminologia",label:"Terminos",col:"#64b5f6"},
    {id:"agarres",label:"Agarres",col:"#ffab40"},
    {id:"posiciones",label:"Posiciones",col:"#aed581"},
    {id:"patrones",label:"Patrones",col:"#ce93d8"},
    {id:"biomecánica",label:"Biomecanica",col:"#80deea"},
    {id:"planificacion",label:"Planif.",col:"#f48fb1"},
    {id:"nutricion",label:"Nutricion",col:"#a5d6a7"},
    {id:"lesiones",label:"Lesiones",col:"#ff8a65"},
    {id:"tests",label:"Tests",col:"#ffe082"}
  ];
  var html = "<div style=\"display:flex;align-items:center;gap:8px;margin-bottom:10px\">";
  html += "<button onclick=\"encMostrarGrupos()\" style=\"background:#1a1a1a;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:14px\">&#8592;</button>";
  html += "<span style=\"font-size:15px;font-weight:700;color:#64b5f6\">&#128218; Glosario</span></div>";
  html += "<div style=\"display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none;margin-bottom:12px\">";
  cats.forEach(function(c) {
    var act = cat === c.id;
    html += "<div onclick=\"encMostrarGlosario(" + (c.id ? "'" + c.id + "'" : "null") + ")\" style=\"flex-shrink:0;padding:5px 12px;border-radius:20px;border:1px solid " + (act?c.col:"#2a2a2a") + ";background:#111;color:" + (act?c.col:"#888") + ";font-size:12px;font-weight:600;cursor:pointer\">" + c.label + "</div>";
  });
  html += "</div>";
  var lista = window._glosario || [];
  if (cat) lista = lista.filter(function(t){return t.categoria===cat;});
  lista.forEach(function(t) {
    var ci = cats.find(function(c){return c.id===t.categoria;});
    var col = ci ? ci.col : "#aaa";
    html += "<div style=\"background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:12px 14px;margin-bottom:8px;\">";
    html += "<div onclick=\"var d=document.getElementById('gd" + t.id + "');d.style.display=d.style.display==='none'?'block':'none'\" style=\"display:flex;justify-content:space-between;align-items:center;cursor:pointer\">";
    html += "<div style=\"font-size:14px;font-weight:700;color:#fff\">" + t.titulo + "</div>";
    html += "<span style=\"background:#1a1a1a;border:1px solid " + col + ";color:" + col + ";padding:2px 7px;border-radius:4px;font-size:10px;font-weight:600;flex-shrink:0;margin-left:8px\">" + (ci?ci.label:"") + "</span>";
    html += "</div>";
    html += "<div id=\"gd" + t.id + "\" style=\"display:none;font-size:13px;color:var(--texto-suave);line-height:1.6;margin-top:8px;border-top:1px solid #2a2a2a;padding-top:8px\">" + t.descripcion + (t.imagen ? "<br><img src=\"/images/glosario/" + t.imagen + "\" style=\"max-width:100%;border-radius:8px;margin-top:8px\" onerror=\"this.style.display='none'\">":"") + "</div>";
    html += "</div>";
  });
  cont.innerHTML = html;
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
  var volverFn = window._encDesdeRutina ? "window._encDesdeRutina=false;tcTab('rutina')" : "encMostrarLista()";
  html += "<button onclick=\"" + volverFn + "\" style=\"background:#1a1a1a;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:14px\">&#8592;</button>";
  html += "<span style=\"font-size:13px;color:#666;flex:1\">Ficha tecnica</span>"; var _sa=JSON.parse(localStorage.getItem("dt_sesion")||"{}"); if(_sa.email==="danielgaviriabotero@gmail.com"){html += "<button onclick='encEditarFicha(&quot;"+id+"&quot;)' style=\"background:#e31e24;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;font-size:12px\">✏️ Editar</button>";}
  
  html += "</div>";
  if (e.video_youtube) {
    html += "<div style=\"position:relative;width:100%;padding-bottom:56.25%;margin-bottom:12px;border-radius:10px;overflow:hidden\"><iframe src=\"" + e.video_youtube + "\" style=\"position:absolute;top:0;left:0;width:100%;height:100%;border:none\" allowfullscreen></iframe></div>";
  } else if (e.imagen_inicio || e.imagen_fin || e.imagen) {
    var img1 = e.imagen_inicio || e.imagen || "";
    var img2 = e.imagen_fin || e.imagen2 || e.imagen_inicio || e.imagen || "";
    var filtro = (e.invertir === false || e.grupo === "estiramientos") ? "none" : "invert(1)";
    html += "<div style=\"background:#1a1a1a;border-radius:10px;overflow:hidden;margin-bottom:12px;text-align:center;padding:16px;position:relative\">";
    html += "<img id=\"enc-anim-img\" src=\"" + img1 + "\" style=\"max-width:100%;height:350px;width:auto;object-fit:contain;object-position:center bottom;filter:" + filtro + "\" data-img1=\"" + img1 + "\" data-img2=\"" + img2 + "\">";
    html += "<div style=\"position:absolute;bottom:6px;right:8px;font-size:10px;color:#e31e24;font-weight:700;opacity:0.7\">DT-APP</div></div>";
    if (img1 !== img2) {
      setTimeout(function() {
        var img = document.getElementById("enc-anim-img");
        if (!img) return;
        var toggle = false;
        setInterval(function() {
          if (!document.getElementById("enc-anim-img")) return;
          toggle = !toggle;
          img.src = toggle ? img.dataset.img2 : img.dataset.img1;
        }, 1500);
      }, 100);
    }
  }
  html += "<div style=\"margin-bottom:14px\">";
  html += "<div style=\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px\">" + (gr?gr.icon+" ":"") + e.grupo + (e.subgrupo?" - "+e.subgrupo:"") + "</div>";
  html += "<div style=\"font-size:22px;font-weight:900;color:#fff;text-transform:uppercase;line-height:1.1;margin-bottom:8px\">" + e.nombre + "</div>";
  html += "<div style=\"display:flex;gap:6px;flex-wrap:wrap\">";
  if (e.nivel) html += "<span style=\"padding:3px 8px;border-radius:4px;font-size:11px;font-weight:600;background:" + nb + ";color:" + nc + "\">" + e.nivel + "</span>";
  if (e.equipamiento) html += "<span style=\"padding:3px 8px;border-radius:4px;font-size:11px;background:#1e1e1e;color:var(--texto-medio);border:1px solid #333\">" + e.equipamiento + "</span>";
  html += "</div></div>";
  if ((e.musculos_principales||[]).length > 0 || (e.musculos_secundarios||[]).length > 0) {
    html += "<div style=\"margin-bottom:16px\"><div style=\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px\">Musculos</div><div style=\"display:flex;flex-wrap:wrap;gap:6px\">";
    (e.musculos_principales||[]).forEach(function(m){html += "<span style=\"padding:4px 10px;border-radius:6px;font-size:12px;background:rgba(227,30,36,0.15);border:1px solid rgba(227,30,36,0.4);color:#ff6b6b\">&#11088; " + m + "</span>";});
    (e.musculos_secundarios||[]).forEach(function(m){html += "<span style=\"padding:4px 10px;border-radius:6px;font-size:12px;background:var(--gris);border:1px solid var(--borde);color:var(--texto-suave)\">" + m + "</span>";});
    html += "</div></div>";
  }
  if ((e.ejecucion||[]).length > 0) {
    html += "<div style=\"margin-bottom:16px\"><div style=\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px\">Ejecucion</div>";
    e.ejecucion.forEach(function(paso,i){
      html += "<div style=\"display:flex;gap:10px;margin-bottom:10px\"><div style=\"width:24px;height:24px;background:#e31e24;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px\">" + (i+1) + "</div><div style=\"font-size:13px;color:var(--texto-suave);line-height:1.5\">" + paso + "</div></div>";
    });
    html += "</div>";
  }
  if ((e.errores_comunes||[]).length > 0) {
    html += "<div style=\"margin-bottom:16px\"><div style=\"font-size:11px;color:#e31e24;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px\">Errores comunes</div>";
    e.errores_comunes.forEach(function(err){
      html += "<div style=\"display:flex;gap:8px;margin-bottom:8px\"><span style=\"color:#ffab40;font-size:14px;flex-shrink:0\">&#9888;</span><div style=\"font-size:13px;color:var(--texto-suave);line-height:1.5\">" + err + "</div></div>";
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
