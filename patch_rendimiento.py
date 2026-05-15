import re

with open('/data/data/com.termux/files/home/Dt-app/public/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

old = """function calcRenderRendimiento(c){
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
      calcResultado('vo2-res'));
}"""

new = """function calcRenderRendimiento(c){
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
      '<div style="font-size:11px;color:#666;margin-bottom:10px">Compara fuerza relativa entre distintos pesos corporales (powerlifting)</div>'+
      calcSelect('Sexo','dots-sexo',[{v:'m',l:'Hombre'},{v:'f',l:'Mujer'}])+
      calcInput('Peso corporal (kg)','dots-bw',80,'number',40,200,0.1)+
      calcInput('Squat (kg)','dots-sq',100,'number',0,500,0.5)+
      calcInput('Bench Press (kg)','dots-bp',80,'number',0,500,0.5)+
      calcInput('Deadlift (kg)','dots-dl',140,'number',0,500,0.5)+
      calcBtn('Calcular DOTS','calcDOTS()')+
      calcResultado('dots-res'))+

    calcCard('⚖️ Wilks — Powerlifting',
      '<div style="font-size:11px;color:#666;margin-bottom:10px">Fórmula clásica de comparación entre categorías de peso (powerlifting)</div>'+
      calcSelect('Sexo','wilks-sexo',[{v:'m',l:'Hombre'},{v:'f',l:'Mujer'}])+
      calcInput('Peso corporal (kg)','wilks-bw',80,'number',40,200,0.1)+
      calcInput('Squat (kg)','wilks-sq',100,'number',0,500,0.5)+
      calcInput('Bench Press (kg)','wilks-bp',80,'number',0,500,0.5)+
      calcInput('Deadlift (kg)','wilks-dl',140,'number',0,500,0.5)+
      calcBtn('Calcular Wilks','calcWilks()')+
      calcResultado('wilks-res'))+

    calcCard('🥇 IPF GL Points — Powerlifting',
      '<div style="font-size:11px;color:#666;margin-bottom:10px">Fórmula oficial actual de la IPF (International Powerlifting Federation)</div>'+
      calcSelect('Sexo','ipf-sexo',[{v:'m',l:'Hombre'},{v:'f',l:'Mujer'}])+
      calcSelect('Modalidad','ipf-mod',[{v:'classic',l:'Clásico (sin equipamiento)'},{v:'equipped',l:'Equipado'}])+
      calcInput('Peso corporal (kg)','ipf-bw',80,'number',40,200,0.1)+
      calcInput('Squat (kg)','ipf-sq',100,'number',0,500,0.5)+
      calcInput('Bench Press (kg)','ipf-bp',80,'number',0,500,0.5)+
      calcInput('Deadlift (kg)','ipf-dl',140,'number',0,500,0.5)+
      calcBtn('Calcular IPF GL','calcIPFGL()')+
      calcResultado('ipf-res'))+

    calcCard('🏋️ Robi Points — Halterofilia',
      '<div style="font-size:11px;color:#666;margin-bottom:10px">Sistema oficial IWF para comparar totales entre categorías de peso (halterofilia)</div>'+
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
    '<div style="font-size:10px;color:#555;margin-top:6px">Fórmula IPF 2020 — neutral entre categorías de peso</div>');
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
    '<div style="font-size:10px;color:#555;margin-top:6px">Fórmula clásica — usada históricamente en competencias</div>');
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
    '<div style="font-size:10px;color:#555;margin-top:6px">Fórmula oficial IPF desde 2020 — '+( sexo==='m'?'Hombre':'Mujer')+' '+mod+'</div>');
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
    '<div style="font-size:10px;color:#555;margin-top:6px">Sistema oficial IWF — 1000 pts = récord mundial</div>');
}"""

if old in content:
    content = content.replace(old, new, 1)
    with open('/data/data/com.termux/files/home/Dt-app/public/index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("OK - Reemplazo exitoso")
else:
    print("ERROR - No encontré el bloque original")
