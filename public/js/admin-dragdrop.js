// ═══════════════════════════════
// DRAG & DROP RUTINAS
// ═══════════════════════════════
// DRAG & DROP TÁCTIL RUTINAS
// ═══════════════════════════════
let _touchDragEl=null;
let _touchDragIdx=null;
let _touchDragTipo=null;
let _touchClone=null;
let _touchOffsetX=0;
let _touchOffsetY=0;

function rutTouchStart(e,i,tipo){
  guardarEjsActuales();
  _touchDragIdx=i;
  _touchDragTipo=tipo;
  _touchDragEl=e.currentTarget;
  const rect=_touchDragEl.getBoundingClientRect();
  _touchOffsetX=e.touches[0].clientX-rect.left;
  _touchOffsetY=e.touches[0].clientY-rect.top;
  _touchClone=_touchDragEl.cloneNode(true);
  _touchClone.style.position='fixed';
  _touchClone.style.width=rect.width+'px';
  _touchClone.style.opacity='0.7';
  _touchClone.style.zIndex='9999';
  _touchClone.style.pointerEvents='none';
  _touchClone.style.left=(e.touches[0].clientX-_touchOffsetX)+'px';
  _touchClone.style.top=(e.touches[0].clientY-_touchOffsetY)+'px';
  document.body.appendChild(_touchClone);
  _touchDragEl.style.opacity='0.3';
  e.preventDefault();
}

function rutTouchMove(e){
  if(!_touchClone)return;
  _touchClone.style.left=(e.touches[0].clientX-_touchOffsetX)+'px';
  _touchClone.style.top=(e.touches[0].clientY-_touchOffsetY)+'px';
  e.preventDefault();
}

function rutTouchEnd(e){
  if(!_touchClone)return;
  const x=e.changedTouches[0].clientX;
  const y=e.changedTouches[0].clientY;
  _touchClone.remove();
  _touchClone=null;
  if(_touchDragEl)_touchDragEl.style.opacity='1';
  const selector='[id^="rut-drag-'+_touchDragTipo+'-"]';
  const els=document.querySelectorAll(selector);
  let targetIdx=null;
  els.forEach(el=>{
    const rect=el.getBoundingClientRect();
    if(x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom){
      const id=el.id;
      targetIdx=parseInt(id.split('-').pop());
    }
  });
  if(targetIdx!==null&&targetIdx!==_touchDragIdx){
    const dia=diaSeleccionado;
    if(_touchDragTipo==='ej'){
      const arr=rutinaActual[dia].ejercicios||[];
      const item=arr.splice(_touchDragIdx,1)[0];
      arr.splice(targetIdx,0,item);
      rutinaActual[dia].ejercicios=arr;
    } else {
      const arr=rutinaActual[dia].cardio||[];
      const item=arr.splice(_touchDragIdx,1)[0];
      arr.splice(targetIdx,0,item);
      rutinaActual[dia].cardio=arr;
    }
    renderRutinaForm();
  }
  _touchDragIdx=null;
  _touchDragTipo=null;
  _touchDragEl=null;
}
// ═══════════════════════════════
// DRAG & DROP RUTINAS
// ═══════════════════════════════
let _rutDragIdx=null;
let _rutDragTipo=null;

function rutDragStart(e,i,tipo){
  guardarEjsActuales();
  _rutDragIdx=i;
  _rutDragTipo=tipo;
  e.target.style.opacity='0.4';
}
function rutDragOver(e,i,tipo){
  e.preventDefault();
  if(tipo!==_rutDragTipo)return;
  document.querySelectorAll('[id^="rut-drag-"]').forEach(el=>el.style.borderTop='');
  var el=document.getElementById('rut-drag-'+tipo+'-'+i);
  if(el)el.style.borderTop='2px solid #e31e24';
}
function rutDrop(e,i,tipo){
  e.preventDefault();
  if(_rutDragIdx===null||_rutDragIdx===i||tipo!==_rutDragTipo)return;
  var dia=diaSeleccionado;
  if(tipo==='ej'){
    var arr=rutinaActual[dia].ejercicios||[];
    var item=arr.splice(_rutDragIdx,1)[0];
    arr.splice(i,0,item);
    rutinaActual[dia].ejercicios=arr;
  } else {
    var arr=rutinaActual[dia].cardio||[];
    var item=arr.splice(_rutDragIdx,1)[0];
    arr.splice(i,0,item);
    rutinaActual[dia].cardio=arr;
  }
  _rutDragIdx=null;
  renderRutinaForm();
}
function rutDragEnd(e){
  _rutDragIdx=null;
  e.target.style.opacity='1';
  document.querySelectorAll('[id^="rut-drag-"]').forEach(el=>el.style.borderTop='');
}
// ═══════════════════════════════
