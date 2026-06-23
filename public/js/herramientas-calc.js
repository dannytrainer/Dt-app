// CALCULADORAS
// ═══════════════════════════════
let _calcTab='composicion';

function renderCalculadoras(c){
  var btnSt="flex:1;min-width:80px;color:var(--texto);border-radius:8px;padding:8px;font-size:11px;font-weight:700;cursor:pointer";
  var actSt="background:#e31e24;border:1px solid #e31e24;";
  var inaSt="background:var(--gris);border:1px solid #333;";
  var tabs=[["composicion","composicion","Composicion"],["rendimiento","rendimiento","Rendimiento"],["energia","energia","Energia"],["conversores","conversores","Conversores"]];
  var labels={"composicion":"Composición","rendimiento":"Rendimiento","energia":"Energía","conversores":"Conversores"};
  var emojis={"composicion":"💪","rendimiento":"🏃","energia":"🔥","conversores":"⚖️"};
  var html="<div style='display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap'>";
  tabs.forEach(function(t){
    var act=_calcTab===t[0];
    html+="<button id='calc-btn-"+t[0]+"' onclick='calcTab("+'"'+t[0]+'"'+")' style='"+btnSt+";"+(act?actSt:inaSt)+"'>"+emojis[t[0]]+" "+labels[t[0]]+"</button>";
  });
  html+="</div>";
  tabs.forEach(function(t){
    html+="<div id='calc-tab-"+t[0]+"' style='display:"+(_calcTab===t[0]?"block":"none")+"'></div>";
  });
  c.innerHTML=html;
  calcRenderComposicion(document.getElementById("calc-tab-composicion"));
  calcRenderRendimiento(document.getElementById("calc-tab-rendimiento"));
  calcRenderEnergia(document.getElementById("calc-tab-energia"));
  calcRenderConversores(document.getElementById("calc-tab-conversores"));
}

function calcTab(tab){
  _calcTab=tab;
  ["composicion","rendimiento","energia","conversores"].forEach(function(t){
    var panel=document.getElementById("calc-tab-"+t);
    var btn=document.getElementById("calc-btn-"+t);
    if(panel)panel.style.display=t===tab?"block":"none";
    if(btn){btn.style.background=t===tab?"#e31e24":"var(--gris)";btn.style.borderColor=t===tab?"#e31e24":"#333";}
  });
}

let _calcAbierto={};
function calcToggle(key){
  _calcAbierto[key]=!_calcAbierto[key];
  var b=document.getElementById('cb-'+key);
  var a=document.getElementById('ca-'+key);
  if(b){b.style.maxHeight=_calcAbierto[key]?'2000px':'0';b.style.padding=_calcAbierto[key]?'0 14px 14px':'0';}
  if(a)a.textContent=_calcAbierto[key]?'▲':'▼';
}
function calcCard(titulo,contenido){
  var key=titulo.replace(/[^a-z0-9]/gi,'');
  if(_calcAbierto[key]===undefined)_calcAbierto[key]=false;
  var ab=_calcAbierto[key];
  var h='<div style="background:var(--card);border:1px solid #1e1e1e;border-radius:12px;margin-bottom:10px;overflow:hidden">';
  h+='<div onclick="calcToggle(\'' +key+ '\')" style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;cursor:pointer">';
  h+='<div style="font-size:13px;font-weight:700;color:var(--acento)">'+titulo+'</div>';
  h+='<div id="ca-'+key+'" style="color:var(--texto-secundario)">'+(ab?'▲':'▼')+'</div></div>';
  h+='<div id="cb-'+key+'" style="max-height:'+(ab?'2000px':'0')+';overflow:hidden;transition:max-height 0.3s;padding:'+(ab?'0 14px 14px':'0')+'">'+contenido+'</div>';
  h+='</div>';
  return h;
}

function calcInput(label,id,val,tipo,min,max,step){
  return '<div style="margin-bottom:10px">'+
    '<div style="font-size:11px;color:var(--texto-secundario);margin-bottom:4px">'+label+'</div>'+
    '<input type="'+(tipo||'number')+'" id="'+id+'" value="'+(val||'')+'" '+(min!==undefined?'min="'+min+'"':'')+' '+(max!==undefined?'max="'+max+'"':'')+' '+(step?'step="'+step+'"':'')+
    ' style="width:100%;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:16px;font-family:monospace;text-align:center"></div>';
}

function calcSelect(label,id,opciones){
  return '<div style="margin-bottom:10px">'+
    '<div style="font-size:11px;color:var(--texto-secundario);margin-bottom:4px">'+label+'</div>'+
    '<select id="'+id+'" style="width:100%;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:10px;font-size:13px">'+
    opciones.map(o=>'<option value="'+o.v+'">'+o.l+'</option>').join('')+'</select></div>';
}

function calcBtn(label,fn){
  return '<button onclick="'+fn+'" style="width:100%;background:#e31e24;color:var(--texto);border:none;border-radius:8px;padding:12px;font-size:13px;font-weight:700;cursor:pointer;margin-top:4px">'+label+'</button>';
}

function calcResultado(id){
  return '<div id="'+id+'" style="margin-top:10px;padding:12px;background:var(--fondo);border-radius:8px;font-size:14px;color:var(--texto);display:none;line-height:1.8"></div>';
}

function mostrarResultado(id,html){
  const el=document.getElementById(id);
  if(el){el.innerHTML=html;el.style.display='block';}
}

function calcRenderComposicion(c){
  c.innerHTML=
    calcCard('📏 IMC — Índice de Masa Corporal',
      calcInput('Peso (kg)','imc-peso',70,'number',10,300)+
      calcInput('Altura (cm)','imc-altura',170,'number',100,250)+
      calcBtn('Calcular IMC','calcIMC()')+
      calcResultado('imc-res'))+

    calcCard('💪 FFMI — Índice de Masa Libre de Grasa',
      calcInput('Peso (kg)','ffmi-peso',75,'number',30,200)+
      calcInput('Altura (cm)','ffmi-altura',175,'number',100,250)+
      calcInput('% Grasa corporal','ffmi-grasa',15,'number',3,60)+
      calcBtn('Calcular FFMI','calcFFMI()')+
      calcResultado('ffmi-res'))+

    calcCard('⚖️ Peso ideal',
      calcInput('Altura (cm)','pi-altura',170,'number',100,250)+
      calcSelect('Sexo','pi-sexo',[{v:'h',l:'Hombre'},{v:'m',l:'Mujer'}])+
      calcBtn('Calcular','calcPesoIdeal()')+
      calcResultado('pi-res'))+

    calcCard('📐 % Grasa — Jackson-Pollock 3 pliegues',
      calcSelect('Sexo','jp3-sexo',[{v:'h',l:'Hombre'},{v:'m',l:'Mujer'}])+
      calcInput('Edad (años)','jp3-edad',30,'number',10,100)+
      calcInput('Pliegue pectoral / tríceps (mm)','jp3-p1',15,'number',1,100)+
      calcInput('Pliegue abdominal / suprailíaco (mm)','jp3-p2',20,'number',1,100)+
      calcInput('Pliegue muslo (mm)','jp3-p3',18,'number',1,100)+
      calcBtn('Calcular % grasa','calcJP3()')+
      calcResultado('jp3-res'))+

    calcCard('📐 % Grasa — Jackson-Pollock 7 pliegues',
      calcSelect('Sexo','jp7-sexo',[{v:'h',l:'Hombre'},{v:'m',l:'Mujer'}])+
      calcInput('Edad (años)','jp7-edad',30,'number',10,100)+
      calcInput('Pectoral (mm)','jp7-p1',15,'number',1,100)+
      calcInput('Axilar medio (mm)','jp7-p2',12,'number',1,100)+
      calcInput('Tríceps (mm)','jp7-p3',14,'number',1,100)+
      calcInput('Subescapular (mm)','jp7-p4',16,'number',1,100)+
      calcInput('Abdominal (mm)','jp7-p5',22,'number',1,100)+
      calcInput('Suprailíaco (mm)','jp7-p6',18,'number',1,100)+
      calcInput('Muslo (mm)','jp7-p7',20,'number',1,100)+
      calcBtn('Calcular % grasa','calcJP7()')+
      calcResultado('jp7-res'))+

    calcCard('📐 % Grasa — Durnin-Womersley 4 pliegues',
      calcSelect('Sexo','dw-sexo',[{v:'h',l:'Hombre'},{v:'m',l:'Mujer'}])+
      calcInput('Edad (años)','dw-edad',30,'number',10,100)+
      calcInput('Abdominal (mm)','dw-p1',15,'number',1,100)+
      calcInput('Tríceps (mm)','dw-p2',14,'number',1,100)+
      calcInput('Subescapular (mm)','dw-p3',16,'number',1,100)+
      calcInput('Suprailíaco (mm)','dw-p4',18,'number',1,100)+
      calcBtn('Calcular % grasa','calcDW()')+
      calcResultado('dw-res'));
}

function calcIMC(){
  const p=parseFloat(document.getElementById('imc-peso').value);
  const h=parseFloat(document.getElementById('imc-altura').value)/100;
  if(!p||!h)return;
  const imc=(p/(h*h)).toFixed(1);
  let cat='',col='#fff';
  if(imc<18.5){cat='Bajo peso';col='#2196f3';}
  else if(imc<25){cat='Normal ✅';col='#4caf50';}
  else if(imc<30){cat='Sobrepeso';col='#ff9800';}
  else if(imc<35){cat='Obesidad I';col='#e31e24';}
  else if(imc<40){cat='Obesidad II';col='#e31e24';}
  else{cat='Obesidad III';col='#e31e24';}
  mostrarResultado('imc-res','IMC: <b style="color:'+col+';font-size:24px">'+imc+'</b><br>Categoría: <b style="color:'+col+'">'+cat+'</b>');
}

function calcFFMI(){
  const p=parseFloat(document.getElementById('ffmi-peso').value);
  const h=parseFloat(document.getElementById('ffmi-altura').value)/100;
  const g=parseFloat(document.getElementById('ffmi-grasa').value)/100;
  if(!p||!h||g===undefined)return;
  const mml=p*(1-g);
  const ffmi=(mml/(h*h)).toFixed(1);
  const ffmiN=(parseFloat(ffmi)+(6.1*(1.8-h))).toFixed(1);
  let cat='';
  if(ffmi<18)cat='Por debajo del promedio';
  else if(ffmi<20)cat='Promedio';
  else if(ffmi<22)cat='Por encima del promedio';
  else if(ffmi<24)cat='Excelente 💪';
  else if(ffmi<26)cat='Superior — posible límite natural';
  else cat='Excepcional — muy difícil natural';
  mostrarResultado('ffmi-res','Masa magra: <b>'+mml.toFixed(1)+' kg</b><br>FFMI: <b style="color:#e31e24;font-size:22px">'+ffmi+'</b><br>FFMI normalizado: <b>'+ffmiN+'</b><br>'+cat);
}

function calcPesoIdeal(){
  const h=parseFloat(document.getElementById('pi-altura').value);
  const s=document.getElementById('pi-sexo').value;
  if(!h)return;
  const hIn=(h-152.4)/2.54;
  const devine=s==='h'?50+2.3*hIn:45.5+2.3*hIn;
  const robinson=s==='h'?52+1.9*hIn:49+1.7*hIn;
  const miller=s==='h'?56.2+1.41*hIn:53.1+1.36*hIn;
  mostrarResultado('pi-res',
    'Fórmula Devine: <b>'+devine.toFixed(1)+' kg</b><br>'+
    'Fórmula Robinson: <b>'+robinson.toFixed(1)+' kg</b><br>'+
    'Fórmula Miller: <b>'+miller.toFixed(1)+' kg</b>');
}

function calcJP3(){
  const s=document.getElementById('jp3-sexo').value;
  const edad=parseFloat(document.getElementById('jp3-edad').value);
  const p1=parseFloat(document.getElementById('jp3-p1').value);
  const p2=parseFloat(document.getElementById('jp3-p2').value);
  const p3=parseFloat(document.getElementById('jp3-p3').value);
  if(!edad||!p1||!p2||!p3)return;
  const sum=p1+p2+p3;
  let dc;
  if(s==='h') dc=1.10938-(0.0008267*sum)+(0.0000016*sum*sum)-(0.0002574*edad);
  else dc=1.0994921-(0.0009929*sum)+(0.0000023*sum*sum)-(0.0001392*edad);
  const grasa=((4.95/dc)-4.50)*100;
  calcMostrarGrasa('jp3-res',grasa,parseFloat(document.getElementById('jp3-p1').closest('[id]')?0:0));
}

function calcJP7(){
  const s=document.getElementById('jp7-sexo').value;
  const edad=parseFloat(document.getElementById('jp7-edad').value);
  const sum=[1,2,3,4,5,6,7].reduce((a,i)=>a+parseFloat(document.getElementById('jp7-p'+i).value||0),0);
  if(!edad||!sum)return;
  let dc;
  if(s==='h') dc=1.112-(0.00043499*sum)+(0.00000055*sum*sum)-(0.00028826*edad);
  else dc=1.097-(0.00046971*sum)+(0.00000056*sum*sum)-(0.00012828*edad);
  const grasa=((4.95/dc)-4.50)*100;
  calcMostrarGrasa('jp7-res',grasa,0);
}

function calcDW(){
  const s=document.getElementById('dw-sexo').value;
  const edad=parseFloat(document.getElementById('dw-edad').value);
  const sum=[1,2,3,4].reduce((a,i)=>a+parseFloat(document.getElementById('dw-p'+i).value||0),0);
  if(!edad||!sum)return;
  const logSum=Math.log10(sum);
  let dc;
  if(s==='h'){
    if(edad<17) dc=1.1533-(0.0643*logSum);
    else if(edad<20) dc=1.1620-(0.0630*logSum);
    else if(edad<30) dc=1.1631-(0.0632*logSum);
    else if(edad<40) dc=1.1422-(0.0544*logSum);
    else if(edad<50) dc=1.1620-(0.0700*logSum);
    else dc=1.1715-(0.0779*logSum);
  } else {
    if(edad<17) dc=1.1369-(0.0598*logSum);
    else if(edad<20) dc=1.1549-(0.0678*logSum);
    else if(edad<30) dc=1.1599-(0.0717*logSum);
    else if(edad<40) dc=1.1423-(0.0632*logSum);
    else if(edad<50) dc=1.1333-(0.0612*logSum);
    else dc=1.1339-(0.0645*logSum);
  }
  const grasa=((4.95/dc)-4.50)*100;
  calcMostrarGrasa('dw-res',grasa,0);
}

function calcMostrarGrasa(id,grasa,extra){
  const g=grasa.toFixed(1);
  let cat='',col='#fff';
  if(grasa<10){cat='Muy bajo (atleta extremo)';col='#2196f3';}
  else if(grasa<15){cat='Atlético 💪';col='#4caf50';}
  else if(grasa<20){cat='Buena forma';col='#4caf50';}
  else if(grasa<25){cat='Normal';col='#ff9800';}
  else if(grasa<30){cat='Sobrepeso';col='#ff9800';}
  else{cat='Obesidad';col='#e31e24';}
  mostrarResultado(id,'% Grasa: <b style="color:'+col+';font-size:24px">'+g+'%</b><br>Categoría: <b style="color:'+col+'">'+cat+'</b>');
}

function calcRenderRendimiento(c){
  c.innerHTML=
    calcCard('🏋️ RM — Repetición Máxima',
      calcInput('Peso levantado (kg)','rm-peso',80,'number',1,500)+
      calcInput('Repeticiones realizadas','rm-reps',8,'number',1,30)+
      calcBtn('Calcular RM','calcRM()')+
      calcResultado('rm-res'))+

    calcCard('❤️ Zonas de frecuencia cardíaca',
      calcInput('Edad (años)','fc-edad',30,'number',10,100)+
      calcInput('FC reposo (ppm) — opcional','fc-reposo',60,'number',30,100)+
      calcBtn('Calcular zonas','calcFC()')+
      calcResultado('fc-res'))+

    calcCard('🏃 Ritmo de carrera',
      calcInput('Velocidad (km/h)','pace-vel',10,'number',1,50,0.1)+
      calcBtn('Convertir a min/km','calcPace()')+
      calcResultado('pace-res'))+

    calcCard('🫁 VO2max estimado',
      calcInput('Distancia recorrida en 12 min (m)','vo2-dist',2400,'number',500,5000)+
      calcBtn('Calcular VO2max','calcVO2()')+
      calcResultado('vo2-res'))+

    calcCard('🏆 DOTS — Powerlifting',
      '<div style="font-size:11px;color:var(--texto-secundario);margin-bottom:10px">Compara fuerza relativa entre distintos pesos corporales (powerlifting)</div>'+
      calcSelect('Sexo','dots-sexo',[{v:'m',l:'Hombre'},{v:'f',l:'Mujer'}])+
      calcInput('Peso corporal (kg)','dots-bw',80,'number',40,200,0.1)+
      calcInput('Squat (kg)','dots-sq',100,'number',0,500,0.5)+
      calcInput('Bench Press (kg)','dots-bp',80,'number',0,500,0.5)+
      calcInput('Deadlift (kg)','dots-dl',140,'number',0,500,0.5)+
      calcBtn('Calcular DOTS','calcDOTS()')+
      calcResultado('dots-res'))+

    calcCard('⚖️ Wilks — Powerlifting',
      '<div style="font-size:11px;color:var(--texto-secundario);margin-bottom:10px">Fórmula clásica de comparación entre categorías de peso (powerlifting)</div>'+
      calcSelect('Sexo','wilks-sexo',[{v:'m',l:'Hombre'},{v:'f',l:'Mujer'}])+
      calcInput('Peso corporal (kg)','wilks-bw',80,'number',40,200,0.1)+
      calcInput('Squat (kg)','wilks-sq',100,'number',0,500,0.5)+
      calcInput('Bench Press (kg)','wilks-bp',80,'number',0,500,0.5)+
      calcInput('Deadlift (kg)','wilks-dl',140,'number',0,500,0.5)+
      calcBtn('Calcular Wilks','calcWilks()')+
      calcResultado('wilks-res'))+

    calcCard('🥇 IPF GL Points — Powerlifting',
      '<div style="font-size:11px;color:var(--texto-secundario);margin-bottom:10px">Fórmula oficial actual de la IPF (International Powerlifting Federation)</div>'+
      calcSelect('Sexo','ipf-sexo',[{v:'m',l:'Hombre'},{v:'f',l:'Mujer'}])+
      calcSelect('Modalidad','ipf-mod',[{v:'classic',l:'Clásico (sin equipamiento)'},{v:'equipped',l:'Equipado'}])+
      calcInput('Peso corporal (kg)','ipf-bw',80,'number',40,200,0.1)+
      calcInput('Squat (kg)','ipf-sq',100,'number',0,500,0.5)+
      calcInput('Bench Press (kg)','ipf-bp',80,'number',0,500,0.5)+
      calcInput('Deadlift (kg)','ipf-dl',140,'number',0,500,0.5)+
      calcBtn('Calcular IPF GL','calcIPFGL()')+
      calcResultado('ipf-res'))+

    calcCard('🏋️ Robi Points — Halterofilia',
      '<div style="font-size:11px;color:var(--texto-secundario);margin-bottom:10px">Sistema oficial IWF para comparar totales entre categorías de peso (halterofilia)</div>'+
      calcSelect('Sexo','robi-sexo',[{v:'m',l:'Hombre'},{v:'f',l:'Mujer'}])+
      calcSelect('Categoría (kg)','robi-cat',[
        {v:'m_55',l:'Hombre -55 kg (WR: 293 kg)'},{v:'m_61',l:'Hombre -61 kg (WR: 318 kg)'},
        {v:'m_67',l:'Hombre -67 kg (WR: 346 kg)'},{v:'m_73',l:'Hombre -73 kg (WR: 379 kg)'},
        {v:'m_81',l:'Hombre -81 kg (WR: 396 kg)'},{v:'m_89',l:'Hombre -89 kg (WR: 412 kg)'},
        {v:'m_96',l:'Hombre -96 kg (WR: 425 kg)'},{v:'m_102',l:'Hombre -102 kg (WR: 430 kg)'},
        {v:'m_109',l:'Hombre -109 kg (WR: 437 kg)'},{v:'m_109p',l:'Hombre +109 kg (WR: 477 kg)'},
        {v:'f_45',l:'Mujer -45 kg (WR: 194 kg)'},{v:'f_49',l:'Mujer -49 kg (WR: 213 kg)'},
        {v:'f_55',l:'Mujer -55 kg (WR: 232 kg)'},{v:'f_59',l:'Mujer -59 kg (WR: 242 kg)'},
        {v:'f_64',l:'Mujer -64 kg (WR: 253 kg)'},{v:'f_71',l:'Mujer -71 kg (WR: 263 kg)'},
        {v:'f_76',l:'Mujer -76 kg (WR: 270 kg)'},{v:'f_81',l:'Mujer -81 kg (WR: 276 kg)'},
        {v:'f_87',l:'Mujer -87 kg (WR: 283 kg)'},{v:'f_87p',l:'Mujer +87 kg (WR: 310 kg)'}
      ])+
      calcInput('Total (Arranque + Envión) kg','robi-total',200,'number',50,500,0.5)+
      calcBtn('Calcular Robi Points','calcRobi()')+
      calcResultado('robi-res'));
}

var _rendStorage={};
function _rendSave(key,val){try{var d=JSON.parse(localStorage.getItem('dt_rendimiento')||'{}');d[key]=val;localStorage.setItem('dt_rendimiento',JSON.stringify(d));}catch(e){}}
function _rendLoad(){try{return JSON.parse(localStorage.getItem('dt_rendimiento')||'{}')||{};}catch(e){return{};}}
function _rendRestoreAll(){
  var d=_rendLoad();
  var ids=['dots-sexo','dots-bw','dots-sq','dots-bp','dots-dl',
           'wilks-sexo','wilks-bw','wilks-sq','wilks-bp','wilks-dl',
           'ipf-sexo','ipf-mod','ipf-bw','ipf-sq','ipf-bp','ipf-dl',
           'robi-sexo','robi-cat','robi-total'];
  ids.forEach(function(id){
    var el=document.getElementById(id);
    if(el&&d[id]!==undefined)el.value=d[id];
  });
}
setTimeout(function(){_rendRestoreAll();},300);

function calcDOTS(){
  var sexo=document.getElementById('dots-sexo').value;
  var bw=parseFloat(document.getElementById('dots-bw').value);
  var total=parseFloat(document.getElementById('dots-sq').value)+parseFloat(document.getElementById('dots-bp').value)+parseFloat(document.getElementById('dots-dl').value);
  _rendSave('dots-sexo',sexo);_rendSave('dots-bw',bw);
  _rendSave('dots-sq',document.getElementById('dots-sq').value);
  _rendSave('dots-bp',document.getElementById('dots-bp').value);
  _rendSave('dots-dl',document.getElementById('dots-dl').value);
  if(!bw||!total)return;
  var A,B,C,D,E;
  if(sexo==='m'){A=0.000001093;B=-0.0007391293;C=0.1918759221;D=-24.0900756;E=307.75076;}
  else{A=-0.0000010706;B=0.0005158568;C=-0.1126655495;D=13.6175032;E=-57.96288;}
  var denom=A*Math.pow(bw,4)+B*Math.pow(bw,3)+C*Math.pow(bw,2)+D*bw+E;
  var pts=(500/denom*total).toFixed(2);
  var nivel=parseFloat(pts)<150?'Principiante':parseFloat(pts)<200?'Intermedio':parseFloat(pts)<250?'Avanzado':parseFloat(pts)<300?'Elite':'Elite mundial 🌍';
  mostrarResultado('dots-res',
    'DOTS: <b style="color:#e31e24;font-size:28px">'+pts+'</b> pts<br>'+
    'Total: <b>'+total+' kg</b> | Nivel: <b>'+nivel+'</b><br>'+
    '<div style="font-size:10px;color:var(--texto-secundario);margin-top:6px">Fórmula IPF 2020 — neutral entre categorías de peso</div>');
}

function calcWilks(){
  var sexo=document.getElementById('wilks-sexo').value;
  var bw=parseFloat(document.getElementById('wilks-bw').value);
  var total=parseFloat(document.getElementById('wilks-sq').value)+parseFloat(document.getElementById('wilks-bp').value)+parseFloat(document.getElementById('wilks-dl').value);
  _rendSave('wilks-sexo',sexo);_rendSave('wilks-bw',bw);
  _rendSave('wilks-sq',document.getElementById('wilks-sq').value);
  _rendSave('wilks-bp',document.getElementById('wilks-bp').value);
  _rendSave('wilks-dl',document.getElementById('wilks-dl').value);
  if(!bw||!total)return;
  var a,b,cc,d,e,f;
  if(sexo==='m'){a=-0.00000001291;b=0.00000701863;cc=-0.00113732;d=-0.002388645;e=16.2606339;f=-216.0475144;}
  else{a=-0.0000009054;b=0.00004731582;cc=-0.00930733913;d=0.82112226871;e=-27.23842536447;f=594.31747775582;}
  var coef=500/(a*Math.pow(bw,5)+b*Math.pow(bw,4)+cc*Math.pow(bw,3)+d*Math.pow(bw,2)+e*bw+f);
  var pts=(coef*total).toFixed(2);
  var nivel=parseFloat(pts)<150?'Principiante':parseFloat(pts)<200?'Intermedio':parseFloat(pts)<250?'Avanzado':parseFloat(pts)<300?'Elite':'Elite mundial 🌍';
  mostrarResultado('wilks-res',
    'Wilks: <b style="color:#e31e24;font-size:28px">'+pts+'</b> pts<br>'+
    'Total: <b>'+total+' kg</b> | Nivel: <b>'+nivel+'</b><br>'+
    '<div style="font-size:10px;color:var(--texto-secundario);margin-top:6px">Fórmula clásica — usada históricamente en competencias</div>');
}

function calcIPFGL(){
  var sexo=document.getElementById('ipf-sexo').value;
  var mod=document.getElementById('ipf-mod').value;
  var bw=parseFloat(document.getElementById('ipf-bw').value);
  var total=parseFloat(document.getElementById('ipf-sq').value)+parseFloat(document.getElementById('ipf-bp').value)+parseFloat(document.getElementById('ipf-dl').value);
  _rendSave('ipf-sexo',sexo);_rendSave('ipf-mod',mod);_rendSave('ipf-bw',bw);
  _rendSave('ipf-sq',document.getElementById('ipf-sq').value);
  _rendSave('ipf-bp',document.getElementById('ipf-bp').value);
  _rendSave('ipf-dl',document.getElementById('ipf-dl').value);
  if(!bw||!total)return;
  var coefs={
    'm_classic':{A:310.67,B:857.785,C:53.216,D:147.0835},
    'm_equipped':{A:387.265,B:1121.28,C:80.6324,D:222.4896},
    'f_classic':{A:125.1435,B:228.03,C:34.5246,D:86.8301},
    'f_equipped':{A:176.58,B:373.315,C:48.4534,D:110.0103}
  };
  var key=sexo+'_'+mod;
  var co=coefs[key];
  if(!co)return;
  var pts=(100/co.D*(total-co.A*Math.log(co.C*bw)-co.B)*-1+100).toFixed(2);
  var gl=(100/co.D*(total-(co.A*Math.log(co.C*bw)+co.B))+100).toFixed(2);
  mostrarResultado('ipf-res',
    'IPF GL Points: <b style="color:#e31e24;font-size:28px">'+gl+'</b> pts<br>'+
    'Total: <b>'+total+' kg</b><br>'+
    '<div style="font-size:10px;color:var(--texto-secundario);margin-top:6px">Fórmula oficial IPF desde 2020 — '+( sexo==='m'?'Hombre':'Mujer')+' '+mod+'</div>');
}

function calcRobi(){
  var cat=document.getElementById('robi-cat').value;
  var total=parseFloat(document.getElementById('robi-total').value);
  _rendSave('robi-cat',cat);_rendSave('robi-total',total);
  if(!total)return;
  var wr={
    m_55:293,m_61:318,m_67:346,m_73:379,m_81:396,m_89:412,m_96:425,m_102:430,m_109:437,m_109p:477,
    f_45:194,f_49:213,f_55:232,f_59:242,f_64:253,f_71:263,f_76:270,f_81:276,f_87:283,f_87p:310
  };
  var wrVal=wr[cat];
  if(!wrVal)return;
  var pts=(1000*Math.pow(wrVal/total,0.85)).toFixed(2);
  var nivel=parseFloat(pts)<600?'Recreacional':parseFloat(pts)<750?'Competidor':parseFloat(pts)<900?'Nacional':parseFloat(pts)<1000?'Elite':'Récord mundial 🌍';
  mostrarResultado('robi-res',
    'Robi Points: <b style="color:#e31e24;font-size:28px">'+pts+'</b> pts<br>'+
    'WR categoría: <b>'+wrVal+' kg</b> | Nivel: <b>'+nivel+'</b><br>'+
    '<div style="font-size:10px;color:var(--texto-secundario);margin-top:6px">Sistema oficial IWF — 1000 pts = récord mundial</div>');
}

function calcRM(){
  const p=parseFloat(document.getElementById('rm-peso').value);
  const r=parseFloat(document.getElementById('rm-reps').value);
  if(!p||!r)return;
  const epley=p*(1+r/30);
  const brzycki=p*(36/(37-r));
  const lander=p*100/(101.3-2.67123*r);
  const prom=((epley+brzycki+lander)/3).toFixed(1);
  mostrarResultado('rm-res',
    'RM estimado: <b style="color:#e31e24;font-size:24px">'+prom+' kg</b><br>'+
    '<br>Por fórmula:<br>'+
    'Epley: <b>'+epley.toFixed(1)+' kg</b><br>'+
    'Brzycki: <b>'+brzycki.toFixed(1)+' kg</b><br>'+
    'Lander: <b>'+lander.toFixed(1)+' kg</b><br>'+
    '<br>Porcentajes del RM:<br>'+
    [100,95,90,85,80,75,70,65,60].map(p=>'<b>'+p+'%</b>: '+(parseFloat(prom)*p/100).toFixed(1)+' kg').join(' · '));
}

function calcFC(){
  const edad=parseFloat(document.getElementById('fc-edad').value);
  const reposo=parseFloat(document.getElementById('fc-reposo').value)||0;
  if(!edad)return;
  const max=220-edad;
  const res=reposo>0?'(Karvonen)':'(% FC máx)';
  const zonas=[
    {n:'Z1 Recuperación',min:50,max:60,c:'#2196f3'},
    {n:'Z2 Base aeróbica',min:60,max:70,c:'#4caf50'},
    {n:'Z3 Aeróbico',min:70,max:80,c:'#ff9800'},
    {n:'Z4 Umbral',min:80,max:90,c:'#ff5722'},
    {n:'Z5 Máximo',min:90,max:100,c:'#e31e24'}
  ];
  let html='FC máxima: <b style="color:#e31e24">'+max+' ppm</b><br><br>';
  zonas.forEach(z=>{
    let fmin,fmax;
    if(reposo>0){
      fmin=Math.round(reposo+(max-reposo)*z.min/100);
      fmax=Math.round(reposo+(max-reposo)*z.max/100);
    } else {
      fmin=Math.round(max*z.min/100);
      fmax=Math.round(max*z.max/100);
    }
    html+='<span style="color:'+z.c+'">■</span> <b>'+z.n+'</b>: '+fmin+'-'+fmax+' ppm<br>';
  });
  mostrarResultado('fc-res',html);
}

function calcPace(){
  const v=parseFloat(document.getElementById('pace-vel').value);
  if(!v)return;
  const minKm=60/v;
  const min=Math.floor(minKm);
  const seg=Math.round((minKm-min)*60);
  mostrarResultado('pace-res',
    'Ritmo: <b style="color:#e31e24;font-size:24px">'+min+"'"+String(seg).padStart(2,'0')+'" /km</b><br>'+
    'Velocidad: <b>'+v+' km/h</b>');
}

function calcVO2(){
  const d=parseFloat(document.getElementById('vo2-dist').value);
  if(!d)return;
  const vo2=((d-504.9)/44.73).toFixed(1);
  let cat='';
  if(vo2<35)cat='Muy bajo';
  else if(vo2<42)cat='Bajo';
  else if(vo2<46)cat='Regular';
  else if(vo2<52)cat='Bueno';
  else if(vo2<60)cat='Excelente';
  else cat='Superior 🏆';
  mostrarResultado('vo2-res','VO2max: <b style="color:#e31e24;font-size:24px">'+vo2+' ml/kg/min</b><br>Categoría: <b>'+cat+'</b>');
}

function calcRenderEnergia(c){
  c.innerHTML=
    calcCard('🔥 TMB y TDEE — Gasto calórico',
      calcSelect('Sexo','tmb-sexo',[{v:'h',l:'Hombre'},{v:'m',l:'Mujer'}])+
      calcInput('Edad (años)','tmb-edad',30,'number',10,100)+
      calcInput('Peso (kg)','tmb-peso',75,'number',20,300)+
      calcInput('Altura (cm)','tmb-altura',175,'number',100,250)+
      calcSelect('Nivel de actividad','tmb-act',[
        {v:'1.2',l:'Sedentario (sin ejercicio)'},
        {v:'1.375',l:'Ligero (1-3 días/semana)'},
        {v:'1.55',l:'Moderado (3-5 días/semana)'},
        {v:'1.725',l:'Activo (6-7 días/semana)'},
        {v:'1.9',l:'Muy activo (2x día / trabajo físico)'}
      ])+
      calcBtn('Calcular','calcTMB()')+
      calcResultado('tmb-res'))+

    calcCard('⚡ Calorías por ejercicio (MET)',
      calcInput('Peso (kg)','met-peso',75,'number',20,300)+
      calcInput('Duración (minutos)','met-min',45,'number',1,300)+
      calcSelect('Actividad','met-act',[
        {v:'3.5',l:'Caminar lento (3.5)'},
        {v:'4.3',l:'Caminar rápido (4.3)'},
        {v:'6',l:'Trotar suave (6.0)'},
        {v:'8',l:'Correr moderado (8.0)'},
        {v:'10',l:'Correr rápido (10.0)'},
        {v:'4',l:'Ciclismo suave (4.0)'},
        {v:'8',l:'Ciclismo moderado (8.0)'},
        {v:'5',l:'Natación recreativa (5.0)'},
        {v:'6',l:'Entrenamiento con pesas (6.0)'},
        {v:'8',l:'HIIT / Circuitos (8.0)'},
        {v:'10',l:'CrossFit (10.0)'},
        {v:'4.5',l:'Yoga / Pilates (4.5)'},
        {v:'7',l:'Fútbol (7.0)'},
        {v:'8',l:'Baloncesto (8.0)'}
      ])+
      calcBtn('Calcular calorías','calcMET()')+
      calcResultado('met-res'));
}

function calcTMB(){
  const s=document.getElementById('tmb-sexo').value;
  const edad=parseFloat(document.getElementById('tmb-edad').value);
  const p=parseFloat(document.getElementById('tmb-peso').value);
  const h=parseFloat(document.getElementById('tmb-altura').value);
  const act=parseFloat(document.getElementById('tmb-act').value);
  if(!edad||!p||!h)return;
  let hb,ms;
  if(s==='h'){hb=66.5+(13.75*p)+(5.003*h)-(6.75*edad);ms=10*p+6.25*h-5*edad+5;}
  else{hb=655.1+(9.563*p)+(1.850*h)-(4.676*edad);ms=10*p+6.25*h-5*edad-161;}
  mostrarResultado('tmb-res',
    '<b>Harris-Benedict:</b><br>TMB: <b>'+Math.round(hb)+' kcal/día</b><br>TDEE: <b style="color:#e31e24;font-size:20px">'+Math.round(hb*act)+' kcal/día</b><br><br>'+
    '<b>Mifflin-St Jeor:</b><br>TMB: <b>'+Math.round(ms)+' kcal/día</b><br>TDEE: <b style="color:#e31e24;font-size:20px">'+Math.round(ms*act)+' kcal/día</b><br><br>'+
    'Déficit (-500): <b>'+Math.round(ms*act-500)+' kcal</b><br>'+
    'Superávit (+500): <b>'+Math.round(ms*act+500)+' kcal</b>');
}

function calcMET(){
  const p=parseFloat(document.getElementById('met-peso').value);
  const min=parseFloat(document.getElementById('met-min').value);
  const met=parseFloat(document.getElementById('met-act').value);
  if(!p||!min||!met)return;
  const cal=(met*p*3.5/200)*min;
  mostrarResultado('met-res','Calorías quemadas: <b style="color:#e31e24;font-size:24px">'+Math.round(cal)+' kcal</b>');
}

function convConvert(fromId,toId,factor){
  var v=parseFloat(document.getElementById(fromId).value);
  document.getElementById(toId).value=isNaN(v)?'':(v*factor).toFixed(2);
}
function convConvertTemp(fromId,toId,inv){
  var v=parseFloat(document.getElementById(fromId).value);
  if(isNaN(v)){document.getElementById(toId).value='';return;}
  document.getElementById(toId).value=inv?((v-32)*5/9).toFixed(1):(v*9/5+32).toFixed(1);
}
function convRow(id1,label1,id2,label2,factor1,factor2,tipo){
  var st='width:100%;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:12px;font-size:22px;text-align:center;font-family:monospace';
  var fn1=tipo==='temp'?'convConvertTemp(\''+id1+'\',\''+id2+'\',false)':'convConvert(\''+id1+'\',\''+id2+'\','+factor1+')';
  var fn2=tipo==='temp'?'convConvertTemp(\''+id2+'\',\''+id1+'\',true)':'convConvert(\''+id2+'\',\''+id1+'\','+factor2+')';
  return '<div style="display:grid;grid-template-columns:1fr 30px 1fr;gap:8px;align-items:end;margin-bottom:4px">'
    +'<div><div style="font-size:11px;color:var(--texto-secundario);text-align:center;margin-bottom:4px">'+label1+'</div>'
    +'<input type="number" id="'+id1+'" placeholder="0" oninput="'+fn1+'" style="'+st+'"></div>'
    +'<div style="color:#e31e24;font-size:22px;font-weight:700;text-align:center;padding-bottom:8px">⇄</div>'
    +'<div><div style="font-size:11px;color:var(--texto-secundario);text-align:center;margin-bottom:4px">'+label2+'</div>'
    +'<input type="number" id="'+id2+'" placeholder="0" oninput="'+fn2+'" style="'+st+'"></div>'
    +'</div>';
}

function calcRenderConversores(c){
  c.innerHTML=
    calcCard('⚖️ Peso',
      convRow('conv-kg','kg','conv-lb','lb',2.20462,1/2.20462))+

    calcCard('📏 Altura',
      convRow('conv-cm','cm','conv-in','in',1/2.54,2.54)+
      '<div id="conv-ft" style="text-align:center;color:var(--texto-secundario);font-size:13px;margin-top:4px"></div>')+

    calcCard('🏃 Distancia',
      convRow('conv-km','km','conv-mi','mi',0.621371,1/0.621371))+

    calcCard('🌡️ Temperatura',
      convRow('conv-c','°C','conv-f','°F',null,null,'temp'));
}

// ═══════════════════════════════
