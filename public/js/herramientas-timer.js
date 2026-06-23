// TEMPORIZADORES
// ═══════════════════════════════
let _timerTab='individual';
let _timerInd={h:0,m:0,s:0,total:0,resto:0,running:false,interval:null};
let _timerMulti=[];

function fmtTimer(seg){
  const h=Math.floor(seg/3600);
  const m=Math.floor((seg%3600)/60);
  const s=seg%60;
  return (h>0?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}

function renderTemporizadores(c){
  c.innerHTML=`
  <div style="display:flex;gap:8px;margin-bottom:14px">
    <button onclick="_timerTab='individual';renderTemporizadores(document.getElementById('herramienta-contenido'))" style="flex:1;background:${_timerTab==='individual'?'#e31e24':'#1a1a1a'};color:var(--texto);border:1px solid ${_timerTab==='individual'?'#e31e24':'#333'};border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer">Individual</button>
    <button onclick="_timerTab='multi';renderTemporizadores(document.getElementById('herramienta-contenido'))" style="flex:1;background:${_timerTab==='multi'?'#e31e24':'#1a1a1a'};color:var(--texto);border:1px solid ${_timerTab==='multi'?'#e31e24':'#333'};border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer">Múltiple</button>
  </div>
  <div id="timer-individual-panel" style="display:${_timerTab==='individual'?'block':'none'}"></div>
  <div id="timer-multi-panel" style="display:${_timerTab==='multi'?'block':'none'}"></div>`;
  if(_timerTab==='individual') renderTimerIndividual();
  else renderTimerMultiPanel();
}

function renderTimerIndividual(){
  const p=document.getElementById('timer-individual-panel');
  if(!p)return;
  const running=_timerInd.running;
  const resto=_timerInd.resto;
  const pct=_timerInd.total>0?Math.round((resto/_timerInd.total)*100):0;
  p.innerHTML=`
  <div style="text-align:center;padding:20px 0 10px">
    <div style="font-size:52px;font-weight:700;color:${resto===0&&_timerInd.total>0?'#e31e24':'#fff'};font-family:monospace;letter-spacing:2px;text-shadow:0 0 20px rgba(227,30,36,0.3)">${fmtTimer(resto)}</div>
    <div style="margin:12px auto;width:80%;height:6px;background:var(--gris2);border-radius:3px">
      <div style="width:${pct}%;height:100%;background:#e31e24;border-radius:3px;transition:width 1s linear"></div>
    </div>
    <div style="display:flex;justify-content:center;gap:10px;margin:16px 0">
      <div style="text-align:center">
        <div style="font-size:11px;color:var(--texto-secundario);margin-bottom:4px">HH</div>
        <input type="number" min="0" max="23" value="${_timerInd.h}" ${running?'disabled':''} onchange="_timerInd.h=Math.min(23,Math.max(0,parseInt(this.value)||0));_timerInd.resto=_timerInd.h*3600+_timerInd.m*60+_timerInd.s;_timerInd.total=_timerInd.resto;renderTimerIndividual()" style="width:56px;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:8px;font-size:20px;text-align:center;font-family:monospace">
      </div>
      <div style="font-size:28px;color:var(--texto-tenue);padding-top:20px">:</div>
      <div style="text-align:center">
        <div style="font-size:11px;color:var(--texto-secundario);margin-bottom:4px">MM</div>
        <input type="number" min="0" max="59" value="${_timerInd.m}" ${running?'disabled':''} onchange="_timerInd.m=Math.min(59,Math.max(0,parseInt(this.value)||0));_timerInd.resto=_timerInd.h*3600+_timerInd.m*60+_timerInd.s;_timerInd.total=_timerInd.resto;renderTimerIndividual()" style="width:56px;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:8px;font-size:20px;text-align:center;font-family:monospace">
      </div>
      <div style="font-size:28px;color:var(--texto-tenue);padding-top:20px">:</div>
      <div style="text-align:center">
        <div style="font-size:11px;color:var(--texto-secundario);margin-bottom:4px">SS</div>
        <input type="number" min="0" max="59" value="${_timerInd.s}" ${running?'disabled':''} onchange="_timerInd.s=Math.min(59,Math.max(0,parseInt(this.value)||0));_timerInd.resto=_timerInd.h*3600+_timerInd.m*60+_timerInd.s;_timerInd.total=_timerInd.resto;renderTimerIndividual()" style="width:56px;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:8px;padding:8px;font-size:20px;text-align:center;font-family:monospace">
      </div>
    </div>
    <div style="display:flex;justify-content:center;gap:12px;margin-top:8px">
      <button onclick="timerIndStart()" style="background:#e31e24;color:var(--texto);border:none;border-radius:50%;width:64px;height:64px;font-size:24px;cursor:pointer;box-shadow:0 0 15px rgba(227,30,36,0.4)">${running?'⏸️':'▶️'}</button>
      <button onclick="timerIndReset()" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:50%;width:64px;height:64px;font-size:24px;cursor:pointer">🔄</button>
    </div>
  </div>`;
}

function timerIndStart(){
  if(_timerInd.running){
    clearInterval(_timerInd.interval);
    _timerInd.running=false;
    renderTimerIndividual();
  } else {
    if(_timerInd.resto<=0){
      _timerInd.resto=_timerInd.h*3600+_timerInd.m*60+_timerInd.s;
      _timerInd.total=_timerInd.resto;
    }
    if(_timerInd.resto<=0)return;
    dtSonarEvento('timer','inicio');
    _timerInd.running=true;
    _timerInd.interval=setInterval(()=>{
      _timerInd.resto--;
      if(_timerInd.resto<=0){
        _timerInd.resto=0;
        clearInterval(_timerInd.interval);
        _timerInd.running=false;
        renderTimerIndividual();
        dtSonarEvento('timer','fin');
        dtNotificar('⏱️ Temporizador terminó','El tiempo se cumplió');
        setTimeout(()=>toast('⏱️ ¡Tiempo cumplido!'),200);
      } else {
        renderTimerIndividual();
      }
    },1000);
    renderTimerIndividual();
  }
}

function timerIndReset(){
  clearInterval(_timerInd.interval);
  _timerInd.running=false;
  _timerInd.resto=_timerInd.h*3600+_timerInd.m*60+_timerInd.s;
  _timerInd.total=_timerInd.resto;
  renderTimerIndividual();
}

function renderTimerMultiPanel(){
  const p=document.getElementById('timer-multi-panel');
  if(!p)return;
  const grid=_timerMulti.map((t,i)=>{
    const pct=t.total>0?Math.round((t.resto/t.total)*100):0;
    return `<div style="background:var(--card);border:1px solid ${t.running?'#e31e24':t.resto===0&&t.total>0?'#ff9800':'#222'};border-radius:10px;padding:12px;position:relative">
    <button onclick="timerMultiEliminar(${i})" style="position:absolute;top:8px;right:8px;background:none;border:none;color:var(--texto-tenue);font-size:16px;cursor:pointer">✖</button>
    <input value="${t.nombre}" onchange="_timerMulti[${i}].nombre=this.value" style="background:none;border:none;border-bottom:1px solid #333;color:#e31e24;font-size:11px;font-weight:700;text-transform:uppercase;width:80%;outline:none;margin-bottom:6px">
    <div style="font-size:26px;font-weight:700;color:${t.resto===0&&t.total>0?'#ff9800':'#fff'};font-family:monospace;text-align:center;margin:6px 0">${fmtTimer(t.resto)}</div>
    <div style="margin:4px 0 8px;height:4px;background:var(--gris2);border-radius:2px"><div style="width:${pct}%;height:100%;background:#e31e24;border-radius:2px"></div></div>
    <div style="display:flex;justify-content:center;gap:6px;margin-bottom:8px">
      <input type="number" min="0" max="23" value="${t.h}" ${t.running?'disabled':''} onchange="_timerMulti[${i}].h=Math.min(23,Math.max(0,parseInt(this.value)||0));_timerMulti[${i}].resto=_timerMulti[${i}].h*3600+_timerMulti[${i}].m*60+_timerMulti[${i}].s;_timerMulti[${i}].total=_timerMulti[${i}].resto;renderTimerMultiPanel()" style="width:44px;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:6px;padding:4px;font-size:14px;text-align:center;font-family:monospace">
      <span style="color:var(--texto-tenue);padding-top:4px">:</span>
      <input type="number" min="0" max="59" value="${t.m}" ${t.running?'disabled':''} onchange="_timerMulti[${i}].m=Math.min(59,Math.max(0,parseInt(this.value)||0));_timerMulti[${i}].resto=_timerMulti[${i}].h*3600+_timerMulti[${i}].m*60+_timerMulti[${i}].s;_timerMulti[${i}].total=_timerMulti[${i}].resto;renderTimerMultiPanel()" style="width:44px;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:6px;padding:4px;font-size:14px;text-align:center;font-family:monospace">
      <span style="color:var(--texto-tenue);padding-top:4px">:</span>
      <input type="number" min="0" max="59" value="${t.s}" ${t.running?'disabled':''} onchange="_timerMulti[${i}].s=Math.min(59,Math.max(0,parseInt(this.value)||0));_timerMulti[${i}].resto=_timerMulti[${i}].h*3600+_timerMulti[${i}].m*60+_timerMulti[${i}].s;_timerMulti[${i}].total=_timerMulti[${i}].resto;renderTimerMultiPanel()" style="width:44px;background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:6px;padding:4px;font-size:14px;text-align:center;font-family:monospace">
    </div>
    <div style="display:flex;justify-content:center;gap:8px">
      <button onclick="timerMultiToggle(${i})" style="background:${t.running?'#3a0000':'#1a1a1a'};color:${t.running?'#e31e24':'#fff'};border:1px solid ${t.running?'#e31e24':'#333'};border-radius:6px;padding:8px 14px;cursor:pointer;font-size:16px">${t.running?'⏸️':'▶️'}</button>
      <button onclick="timerMultiReset(${i})" style="background:var(--gris);color:var(--texto);border:1px solid #333;border-radius:6px;padding:8px 14px;cursor:pointer;font-size:16px">🔄</button>
    </div>
  </div>`;
  }).join('');
  p.innerHTML=`
  <div style="display:flex;gap:6px;margin-bottom:12px">
    <button onclick="timerMultiTodos('start')" style="flex:1;background:var(--gris);color:#4caf50;border:1px solid #4caf50;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer">▶️ Todos</button>
    <button onclick="timerMultiTodos('pause')" style="flex:1;background:var(--gris);color:#ff9800;border:1px solid #ff9800;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer">⏸️ Todos</button>
    <button onclick="timerMultiTodos('reset')" style="flex:1;background:var(--gris);color:var(--texto-secundario);border:1px solid #333;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer">🔄 Todos</button>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px" id="timer-multi-grid">${grid}</div>
  <button onclick="timerMultiAgregar()" style="width:100%;background:var(--gris);color:#e31e24;border:1px solid #e31e24;border-radius:8px;padding:12px;font-weight:700;font-size:13px;cursor:pointer;margin-top:12px">➕ Añadir temporizador</button>`;
}

function timerMultiAgregar(){
  _timerMulti.push({nombre:'Timer '+(_timerMulti.length+1),h:0,m:1,s:0,total:60,resto:60,running:false,interval:null});
  renderTimerMultiPanel();
}

function timerMultiEliminar(i){
  clearInterval(_timerMulti[i].interval);
  _timerMulti.splice(i,1);
  renderTimerMultiPanel();
}

function timerMultiToggle(i){
  const t=_timerMulti[i];
  if(t.running){
    clearInterval(t.interval);
    t.running=false;
    renderTimerMultiPanel();
  } else {
    if(t.resto<=0){t.resto=t.h*3600+t.m*60+t.s;t.total=t.resto;}
    if(t.resto<=0)return;
    dtSonarEvento('timer','inicio');
    t.running=true;
    t.interval=setInterval(()=>{
      t.resto--;
      if(t.resto<=0){
        t.resto=0;
        clearInterval(t.interval);
        t.running=false;
        dtSonarEvento('timer','fin');
      }
      renderTimerMultiPanel();
    },1000);
    renderTimerMultiPanel();
  }
}

function timerMultiTodos(accion){
  _timerMulti.forEach((t,i)=>{
    if(accion==='start'&&!t.running){
      if(t.resto<=0){t.resto=t.h*3600+t.m*60+t.s;t.total=t.resto;}
      if(t.resto<=0)return;
      t.running=true;
      t.interval=setInterval(()=>{
        t.resto--;
        if(t.resto<=0){
          t.resto=0;
          clearInterval(t.interval);
          t.running=false;
          dtSonarEvento('timer','fin');
          dtNotificar('⏱️ '+t.nombre+' terminó','El tiempo se cumplió');
          toast('⏱️ '+t.nombre+' terminó');
          toast('⏱️ '+t.nombre+' terminó');
        }
        renderTimerMultiPanel();
      },1000);
    } else if(accion==='pause'&&t.running){
      clearInterval(t.interval);
      t.running=false;
    } else if(accion==='reset'){
      clearInterval(t.interval);
      t.running=false;
      t.resto=t.h*3600+t.m*60+t.s;
      t.total=t.resto;
    }
  });
  if(accion==='start')dtSonarEvento('timer','inicio');
  renderTimerMultiPanel();
}

function timerMultiReset(i){
  const t=_timerMulti[i];
  clearInterval(t.interval);
  t.running=false;
  t.resto=t.h*3600+t.m*60+t.s;
  t.total=t.resto;
  renderTimerMultiPanel();
}



// ═══════════════════════════════
