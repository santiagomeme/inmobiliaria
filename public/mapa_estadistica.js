



// -----------------------------
function crearIcono(color, iconoFA) {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="
        background:${color};
        border-radius:50%;
        width:34px;
        margin:0 auto
        height:34px;
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 0 4px rgba(0,0,0,0.4);
      ">
        <i class="${iconoFA}" style="color:white; font-size:18px;"></i>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30]
  });
}


// ===============================
// Función para calcular conteos
// ===============================
function calcularConteos(propiedades) {
  return {
    total: propiedades.length,
    casa: propiedades.filter(p => p.tipo === "casa").length,
    apartamento: propiedades.filter(p => p.tipo === "apartamento").length,
    lote: propiedades.filter(p => p.tipo === "lote").length,
    finca: propiedades.filter(p => p.tipo === "finca").length,
    apartaestudio: propiedades.filter(p => p.tipo === "apartaestudio").length,
    bodega: propiedades.filter(p => p.tipo === "bodega").length,
    campestre: propiedades.filter(p => p.tipo === "campestre").length,
    condominio: propiedades.filter(p => p.tipo === "condominio").length,
    duplex: propiedades.filter(p => p.tipo === "duplex").length,
    edificio: propiedades.filter(p => p.tipo === "edificio").length,
    local: propiedades.filter(p => p.tipo === "local").length,
    hotel: propiedades.filter(p => p.tipo === "hotel").length,
    oficina: propiedades.filter(p => p.tipo === "oficina").length,
    penthouse: propiedades.filter(p => p.tipo === "penthouse").length,

    activa: propiedades.filter(p => p.activa).length,
    inactiva: propiedades.filter(p => !p.activa).length,
    destacada: propiedades.filter(p => p.destacada).length,
  };
}


// ===============================
// Render dinámico en el DOM (con tarjetas)
// ===============================
function renderEstadisticas(propiedades) {
  const conteos = calcularConteos(propiedades);
  console.log("Conteos calculados:", conteos);

  const contenedor = document.getElementById("estadisticas");
  if (!contenedor) return;

  // 🟢 Estados generales
let htmlEstados = `
  <button class="estadistica-chip" data-filtro="reset">
    <span class="chip-icon">📊</span>
    <span class="chip-label">Total</span>
    <span class="chip-count">${conteos.total || 0}</span>
  </button>

  <button class="estadistica-chip" data-filtro="filtroActiva" data-valor="true">
    <span class="chip-icon">✅</span>
    <span class="chip-label">Activas</span>
    <span class="chip-count">${conteos.activas || 0}</span>
  </button>

  <button class="estadistica-chip" data-filtro="filtroActiva" data-valor="false">
    <span class="chip-icon">❌</span>
    <span class="chip-label">Inactivas</span>
    <span class="chip-count">${conteos.inactivas || 0}</span>
  </button>

  <button class="estadistica-chip" data-filtro="destacada" data-valor="true">
    <span class="chip-icon">⭐</span>
    <span class="chip-label">Destacadas</span>
    <span class="chip-count">${conteos.destacadas || 0}</span>
  </button>
`;



// Tipos
let htmlTipos = "";
for (let tipo in estilosPorTipo) {
  const estilo = estilosPorTipo[tipo];
  const cantidad = conteos[tipo] ?? 0;  // 👈 directo, ya coinciden nombres

  if (cantidad > 0) {
    const iconClass = estilo.icono.options.html.match(/class="([^"]+)"/)[1];
    htmlTipos += `
      <button class="estadistica-chip" data-filtro="tipo" data-valor="${tipo}">
        <span class="chip-icon" style="color:${estilo.color}">
          <i class="${iconClass}"></i>
        </span>
        <span class="chip-label">${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
        <span class="chip-count">${cantidad}</span>
      </button>
    `;
  }
}


  contenedor.innerHTML = htmlEstados + htmlTipos;

  // 👉 Listeners
contenedor.querySelectorAll(".estadistica-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const filtro = chip.dataset.filtro;   // 👈 aquí debe ser chip
    const valor = chip.dataset.valor;     // 👈 aquí también chip

    if (filtro === "reset") {
      document.getElementById("tipo").value = "";
      document.getElementById("estado").value = "todos";
      document.getElementById("filtroActiva").value = "todas";
      document.getElementById("destacada").checked = false;
    } 
    else if (filtro === "tipo") {
      document.getElementById("tipo").value = valor;
    } 
    else if (filtro === "filtroActiva") {
      document.getElementById("filtroActiva").value = valor;
    } 
    else if (filtro === "destacada") {
      document.getElementById("destacada").checked = true;
    }

    // 🔎 Simular click en el botón Buscar
    document.getElementById("buscarBtn").click();
  });
});

}


function renderEstadisticasTexto(propiedades) {
  const conteos = calcularConteos(propiedades);
  const contenedor = document.getElementById("estadisticas");


  if (!contenedor) {
    console.warn("No se encontró el div de estadísticas");
    return;
  }

  contenedor.innerHTML = `
    <div class="estadisticas-box">
      <p>Total propiedades: <strong>${conteos.total}</strong></p>
      <p>Casas: <strong>${conteos.casas}</strong></p>
      <p>Apartamentos: <strong>${conteos.apartamentos}</strong></p>
      <p>Lotes: <strong>${conteos.lotes}</strong></p>
      <p>Fincas: <strong>${conteos.fincas}</strong></p>
      <p>Activas: <strong>${conteos.activas}</strong></p>
      <p>Inactivas: <strong>${conteos.inactivas}</strong></p>
      <p>Destacadas: <strong>${conteos.destacadas}</strong></p>
    </div>
  `;
}



// Normaliza nombres de clases en los chips para que el CSS funcione siempre
document.querySelectorAll('.estadistica-chip').forEach(chip => {
  // icono
  if (!chip.querySelector('.chip-icon')) {
    const icono = chip.querySelector('.icono') || chip.querySelector('.chip-icon');
    if (icono) icono.classList.add('chip-icon');
  }
  // count
  if (!chip.querySelector('.chip-count')) {
    const count = chip.querySelector('.cantidad') || chip.querySelector('.chip-count');
    if (count) count.classList.add('chip-count');
  }
  // label: el primer span que no sea icono ni count
  if (!chip.querySelector('.chip-label')) {
    const spans = Array.from(chip.children).filter(c => !c.classList.contains('chip-icon') && !c.classList.contains('chip-count'));
    if (spans.length) spans[0].classList.add('chip-label');
  }
});
