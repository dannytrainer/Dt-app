window.UNIDADES = {
  sistema: localStorage.getItem('dt_unidades') || 'metric',

  toggle() {
    this.sistema = this.sistema === 'metric' ? 'imperial' : 'metric';
    localStorage.setItem('dt_unidades', this.sistema);
    this.actualizarBoton();
    const id = window.clienteMedidasId || window.clienteTestsId;
    const modalMedidas = document.getElementById('modal-medidas');
    const modalTests = document.getElementById('modal-tests');
    if (modalMedidas && modalMedidas.classList.contains('open') && id) {
      showMTabLoad(window._tabActiva || 'peso', id);
    }
    if (modalTests && modalTests.classList.contains('open') && id) {
      renderTests(id);
    }
  },

  esMetrico() { return this.sistema === 'metric'; },

  pesoLabel() { return this.esMetrico() ? 'kg' : 'lb'; },
  mostrarPeso(kg) {
    if (!kg && kg !== 0) return '-';
    return this.esMetrico() ? kg : Math.round(parseFloat(kg) * 2.2046 * 10) / 10;
  },
  inputAPeso(val) {
    if (!val && val !== 0) return null;
    return this.esMetrico() ? parseFloat(val) : Math.round(parseFloat(val) / 2.2046 * 10) / 10;
  },

  distCortaLabel() { return this.esMetrico() ? 'cm' : 'in'; },
  mostrarDistCorta(cm) {
    if (!cm && cm !== 0) return '-';
    return this.esMetrico() ? cm : Math.round(parseFloat(cm) * 0.3937 * 10) / 10;
  },
  inputADistCorta(val) {
    if (!val && val !== 0) return null;
    return this.esMetrico() ? parseFloat(val) : Math.round(parseFloat(val) / 0.3937 * 10) / 10;
  },

  distLargaLabel() { return this.esMetrico() ? 'm' : 'yd'; },
  mostrarDistLarga(m) {
    if (!m && m !== 0) return '-';
    return this.esMetrico() ? m : Math.round(parseFloat(m) * 1.0936 * 10) / 10;
  },
  inputADistLarga(val) {
    if (!val && val !== 0) return null;
    return this.esMetrico() ? parseFloat(val) : Math.round(parseFloat(val) / 1.0936 * 10) / 10;
  },

  alturaLabel() { return this.esMetrico() ? 'cm' : 'ft/in'; },
  mostrarAltura(cm) {
    if (!cm && cm !== 0) return '-';
    if (this.esMetrico()) return cm;
    const totalIn = parseFloat(cm) / 2.54;
    const ft = Math.floor(totalIn / 12);
    const inch = Math.round(totalIn % 12);
    return ft + "'" + inch + '"';
  },

  actualizarBoton() {
    const btns = document.querySelectorAll('.btn-unidades');
    btns.forEach(b => {
      b.textContent = this.esMetrico() ? '⚖️ KG / CM' : '🇺🇸 LB / IN';
    });
  },

  botonHTML(extraStyle = '') {
    const label = this.esMetrico() ? '⚖️ KG / CM' : '🇺🇸 LB / IN';
    return `<button class="btn bg btn-unidades" style="font-size:11px;padding:7px 10px;${extraStyle}" onclick="UNIDADES.toggle()">${label}</button>`;
  }
};

document.addEventListener('DOMContentLoaded', () => UNIDADES.actualizarBoton());
