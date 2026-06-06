const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const path = require('path');

const entId = process.env.ENT_ID;
const telefono = process.env.ENT_TELEFONO || null;
const authFolder = path.join(__dirname, 'auth_' + entId);

let sock = null;
let conectado = false;
let pairingCode = null;

const enviar = (msg) => { if (process.send) process.send(msg); };

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
  if (msg.tipo === 'enviar') {
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
        jid = msg.telefono + '@s.whatsapp.net';
      }
      await sock.sendMessage(jid, { text: msg.mensaje });
      enviar({ tipo: 'resultado', id: msg.id, ok: true });
    } catch(e) {
      enviar({ tipo: 'resultado', id: msg.id, ok: false, error: e.message });
    }
  }

  if (msg.tipo === 'estado') {
    enviar({ tipo: 'estado', conectado, pairingCode });
  }
});

iniciar();
