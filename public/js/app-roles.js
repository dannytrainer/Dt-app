// ═══════════════════════════════
// SISTEMA DE ROL
// ═══════════════════════════════
// ── SISTEMA DE ROL ──────────────────────────────────────
const ROL_KEY = 'dt_rol';
const PASS_ENTRENADOR = 'DTapp';

function initRol() {
  if (checkGoogleLogin()) return;
  const rol = localStorage.getItem(ROL_KEY);
  if (rol === 'entrenador') {
    mostrarApp();
  } else if (rol === 'cliente') {
    const tel = localStorage.getItem('dt_cliente_tel');
    const id = localStorage.getItem('dt_cliente_id');
    if (tel && id) {
      if (!JSON.parse(localStorage.getItem('dt_sesion')||'{}').email) { localStorage.setItem('dt_sesion', JSON.stringify({email: tel.replace(/\D/g,'')+'@dtapp.com', rol:'cliente', id: id})); }
      setTimeout(() => { if(window.activarPushTrasLogin) window.activarPushTrasLogin(); }, 1000);
      mostrarTerminalCliente(tel);
    } else {
      mostrarPantalla('pantalla-rol');
    }
  } else {
    mostrarPantalla('pantalla-rol');
  }
}

function mostrarPantalla(id) {
  ['pantalla-rol','pantalla-login-entrenador','pantalla-login-cliente','pantalla-registro'].forEach(p => {
    const el = document.getElementById(p);
    el.style.display = 'none';
  });
  const target = document.getElementById(id);
  target.style.display = 'flex';
}

function seleccionarRol(rol) {
  if (rol === 'entrenador') mostrarPantalla('pantalla-login-entrenador');
  else mostrarPantalla('pantalla-login-cliente');
}

function loginEntrenador() {
  const pass = document.getElementById('input-pass-entrenador').value;
  fetch('/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({email: document.getElementById('input-email-entrenador') ? document.getElementById('input-email-entrenador').value : 'danielgaviriabotero@gmail.com', password: pass})
  }).then(r=>r.json()).then(data => {
    if (data.ok) {
      const emailUsado = document.getElementById('input-email-entrenador') ? document.getElementById('input-email-entrenador').value : 'danielgaviriabotero@gmail.com';
      data.email = data.email || emailUsado;
      data.roles = data.roles || [{rol:'entrenador',id:data.id},{rol:'cliente',id:null}];
      alert('login nativo dt_sesion:'+JSON.stringify({id:data.id,rol:data.rol,email:data.email}));
localStorage.setItem('dt_sesion', JSON.stringify(data));
      setTimeout(() => { if(window.activarPushTrasLogin) window.activarPushTrasLogin(); }, 1000);
      localStorage.setItem(ROL_KEY, data.rol || 'entrenador');
      mostrarSeleccionRol({nombre: data.nombre||data.email, email: data.email, roles: data.roles});
      setTimeout(() => { if(window.activarPushTrasLogin) window.activarPushTrasLogin(); }, 1000);
    } else {
      document.getElementById('error-pass').style.display = 'block';
    }
  }).catch((err) => {
    alert('catch error:'+err);
    if (pass === PASS_ENTRENADOR) {
      localStorage.setItem(ROL_KEY, 'entrenador');
      localStorage.setItem('dt_sesion', JSON.stringify({email:'danielgaviriabotero@gmail.com', rol:'entrenador'}));
      setTimeout(() => { if(window.activarPushTrasLogin) window.activarPushTrasLogin(); }, 1000);
      mostrarSeleccionRol({nombre:'Danny Trainer', email:'danielgaviriabotero@gmail.com', roles:[{rol:'entrenador',id:'ent_001'},{rol:'cliente',id:null}]});
    } else {
      document.getElementById('error-pass').style.display = 'block';
    }
  });
}

function loginCliente() {
  const tel = document.getElementById('input-tel-cliente').value.replace(/\s/g,'');
  const codeBox = document.getElementById('vinc-code-box');
  const errorTel = document.getElementById('error-tel');
  const errorVinc = document.getElementById('error-vinc');
  if(errorTel) errorTel.style.display = 'none';
  if(errorVinc) errorVinc.style.display = 'none';

  fetch('/api/usuarios?entrenador_id=' + (JSON.parse(localStorage.getItem('dt_sesion')||'{}').id||null)).then(r=>r.json()).then(usuarios => {
    const u = usuarios.find(u => u.telefono && u.telefono.replace(/\s/g,'') === tel && u.activo);
    if (u) {
      if(codeBox) codeBox.style.display = 'none';
      localStorage.setItem('dt_cliente_id', u.id);
      localStorage.setItem('dt_cliente_tel', tel);
      const emailCli = tel.replace(/\D/g,'')+'@dtapp.com';
      localStorage.setItem('dt_sesion', JSON.stringify({email: emailCli, rol:'cliente', id: u.id}));
      setTimeout(() => { if(window.activarPushTrasLogin) window.activarPushTrasLogin(); }, 1000);
      mostrarSeleccionRol({nombre: u.nombre||tel, email: emailCli, roles:[{rol:'entrenador',id:null},{rol:'cliente',id:u.id,usuario_id:u.id}]});
    } else {
      if(codeBox && codeBox.style.display === 'none') {
        codeBox.style.display = 'block';
        return;
      }
      const codigo = document.getElementById('input-codigo-vinc') ? document.getElementById('input-codigo-vinc').value.trim().toUpperCase() : '';
      if (!codigo) { if(errorVinc){ errorVinc.style.display='block'; errorVinc.textContent='Ingresa el código de tu entrenador'; } return; }
      fetch('/api/validar-vinculacion', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({telefono: tel, codigo})
      }).then(r=>r.json()).then(data => {
        if (data.ok) {
          localStorage.setItem('dt_cliente_id', data.id);
          localStorage.setItem('dt_cliente_tel', tel);
          const emailCli2 = tel.replace(/\D/g,'')+'@dtapp.com';
          localStorage.setItem('dt_sesion', JSON.stringify({email: emailCli2, rol:'cliente', id: data.id}));
          setTimeout(() => { if(window.activarPushTrasLogin) window.activarPushTrasLogin(); }, 1000);
          mostrarSeleccionRol({nombre: tel, email: emailCli2, roles:[{rol:'entrenador',id:null},{rol:'cliente',id:data.id,usuario_id:data.id}]});
        } else {
          if(errorVinc){ errorVinc.style.display='block'; errorVinc.textContent = data.error || 'Código inválido'; }
        }
      });
    }
  });
}

// ── PREMIUM ENTRENADOR ──
