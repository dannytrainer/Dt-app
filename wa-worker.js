const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const path = require('path');

const entId = process.env.ENT_ID;
const telefono = process.env.ENT_TELEFONO || null;
const authFolder = path.join(__dirname, 'auth_' + entId);

let sock = null;
let conectado = false;
let pairingCode = null;

const enviar = (msg) => { try { if (process.send) process.send(msg); } catch(e) { console.log('IPC cerrado, ignorando:', e.message); } };

async function iniciar() {
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  sock = makeWASocket({ auth: state, printQRInTerminal: false });
  sock.ev.on('creds.update', saveCreds);

  if (!sock.authState.creds.registered && telefono) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(telefono.replace(/\D/g,''));
        pairingCode = code;
        enviar({ tipo: 'codigo', codigo: code });
        console.log('🔑 CÓDIGO WA ['+entId+']: ' + code);
      } catch(e) {
        console.log('Error pairingCode:', e.message);
      }
    }, 3000);
  }

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      conectado = false;
      enviar({ tipo: 'estado', conectado: false });
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log('🔄 Reconectando ['+entId+']...');
        setTimeout(iniciar, 3000);
      }
    }
    if (connection === 'open') {
      conectado = true;
      pairingCode = null;
      enviar({ tipo: 'estado', conectado: true });
      console.log('✅ WA conectado ['+entId+']');
    }
  });
}

process.on('message', async (msg) => {
  if (msg.tipo === 'enviar' || msg.tipo === 'enviarDoc') {
    if (!conectado || !sock) {
      enviar({ tipo: 'resultado', id: msg.id, ok: false, error: 'No conectado' });
      return;
    }
    try {
      let jid;
      if (String(msg.telefono).startsWith('grupo:')) {
        const codigo = msg.telefono.replace('grupo:','');
        const info = await sock.groupGetInviteInfo(codigo);
        jid = info.id;
      } else if (String(msg.telefono).endsWith('@g.us')) {
        jid = msg.telefono;
      } else {
        jid = msg.telefono.replace(/[^0-9]/g,'') + '@s.whatsapp.net';
      }
      if (msg.tipo === 'enviarDoc') {
        const buffer = Buffer.from(msg.buffer, 'base64');
        await sock.sendMessage(jid, {
          document: buffer,
          mimetype: msg.mimetype || 'text/html',
          fileName: msg.fileName || 'informe.html'
        });
      } else {
        await sock.sendMessage(jid, { text: msg.mensaje });
      }
      enviar({ tipo: 'resultado', id: msg.id, ok: true });
    } catch(e) {
      enviar({ tipo: 'resultado', id: msg.id, ok: false, error: e.message });
    }
  }

  if (msg.tipo === 'grupoInfo') {
    if (!conectado || !sock) {
      enviar({ tipo: 'resultado', id: msg.id, ok: null });
      return;
    }
    try {
      const info = await sock.groupGetInviteInfo(msg.codigo);
      enviar({ tipo: 'resultado', id: msg.id, ok: info });
    } catch(e) {
      enviar({ tipo: 'resultado', id: msg.id, ok: null });
    }
  }

  if (msg.tipo === 'estado') {
    enviar({ tipo: 'estado', conectado, pairingCode });
  }
});

iniciar();
