// ═══════════════════════════════
// AUTH
// ═══════════════════════════════
// 🔐 AUTH
// ═══════════════════════════════
let _sesion = JSON.parse(localStorage.getItem('dt_sesion') || 'null');

function loginTab(tab) {
  document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('form-registro').style.display = tab === 'registro' ? 'block' : 'none';
  document.getElementById('tab-login').style.background = tab === 'login' ? '#e63946' : 'transparent';
  document.getElementById('tab-login').style.color = tab === 'login' ? 'white' : '#888';
  document.getElementById('tab-registro').style.background = tab === 'registro' ? '#e63946' : 'transparent';
  document.getElementById('tab-registro').style.color = tab === 'registro' ? 'white' : '#888';
}

function regRol(rol) {
  document.getElementById('reg-tab-ent').style.background = rol === 'entrenador' ? '#e63946' : 'transparent';
  document.getElementById('reg-tab-ent').style.color = rol === 'entrenador' ? 'white' : '#888';
  document.getElementById('reg-tab-cli').style.background = rol === 'cliente' ? '#e63946' : 'transparent';
  document.getElementById('reg-tab-cli').style.color = rol === 'cliente' ? 'white' : '#888';
  document.getElementById('reg-codigo-div').style.display = rol === 'cliente' ? 'block' : 'none';
  document.getElementById('reg-tab-ent').dataset.rol = rol;
}

async function hacerLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-pass').value.trim();
  if (!email || !password) return mostrarErrorLogin('Completa todos los campos');
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({email, password})
    });
    const data = await res.json();
    if (data.ok) {
      localStorage.setItem('dt_sesion', JSON.stringify(data));
      setTimeout(() => { if(window.activarPushTrasLogin) window.activarPushTrasLogin(); }, 1000);
      _sesion = data;
      document.getElementById('pantalla-login').style.display = 'none';
      if (data.roles && data.roles.length > 1) {
        localStorage.setItem('dt_google_data', JSON.stringify({nombre: data.nombre, email: data.email || email, roles: data.roles}));
        mostrarSeleccionRol({nombre: data.nombre, email: data.email || email, roles: data.roles});
      } else {
        iniciarApp();
      }
    } else {
      mostrarErrorLogin(data.error || 'Error al iniciar sesión');
    }
  } catch(e) {
    mostrarErrorLogin('Error de conexión');
  }
}

function mostrarErrorLogin(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
  el.style.display = 'block';
}

function mostrarErrorReg(msg) {
  const el = document.getElementById('reg-error');
  el.textContent = msg;
  el.style.display = 'block';
}



function iniciarApp() {
  if (!_sesion) {
    document.getElementById('pantalla-login').style.display = 'flex';
    return;
  }
  document.getElementById('pantalla-login').style.display = 'none';
  if (_sesion.rol === 'entrenador') {
    if (typeof init === 'function') init();
  } else if (_sesion.rol === 'cliente') {
    if (typeof tcInit === 'function') tcInit();
  }
}

// Al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  if (_sesion) {
    document.getElementById('pantalla-login').style.display = 'none';
    iniciarApp();
  } else {
    document.getElementById('pantalla-login').style.display = 'flex';
  }
});

// ── GOOGLE AUTH FLOW ─────────────────────────────────────────
