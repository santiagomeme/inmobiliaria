// -----------------------------
// Crear ícono para los marcadores
// -----------------------------
function crearIcono(color, iconoFA) {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="
        background:${color};
        border-radius:50%;
        width:34px;
        height:34px;
        margin:0 auto;
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
    casas: propiedades.filter(p => p.tipo === "casa").length,
    apartamentos: propiedades.filter(p => p.tipo === "apartamento").length,
    lotes: propiedades.filter(p => p.tipo === "lote").length,
    fincas: propiedades.filter(p => p.tipo === "finca").length,
    apartaestudios: propiedades.filter(p => p.tipo === "apartaestudio").length,
    bodegas: propiedades.filter(p => p.tipo === "bodega").length,
    campestres: propiedades.filter(p => p.tipo === "campestre").length,
    condominios: propiedades.filter(p => p.tipo === "condominio").length,
    duplex: propiedades.filter(p => p.tipo === "duplex").length,
    edificios: propiedades.filter(p => p.tipo === "edificio").length,
    locales: propiedades.filter(p => p.tipo === "local").length,
    hoteles: propiedades.filter(p => p.tipo === "hotel").length,
    oficinas: propiedades.filter(p => p.tipo === "oficina").length,
    penthouse: propiedades.filter(p => p.tipo === "penthouse").length,

    activas: propiedades.filter(p => p.activa).length,
    inactivas: propiedades.filter(p => !p.activa).length,
    destacadas: propiedades.filter(p => p.destacada).length,
  };
}

// ===============================
// Render dinámico en el DOM (con chips)
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

  // 🟢 Tipos dinámicos
  let htmlTipos = "";
  for (let tipo in estilosPorTipo) {
    const estilo = estilosPorTipo[tipo];
    const keyPlural = tipo.toLowerCase() + "s";
    const cantidad = conteos[keyPlural] ?? conteos[tipo.toLowerCase()] ?? 0;

    if (cantidad > 0) {
      htmlTipos += `
        <button class="estadistica-chip" data-filtro="tipo" data-valor="${tipo.toLowerCase()}">
          <span class="chip-icon" style="color:${estilo.color}">
            <i class="${estilo.icono.options.html.match(/class="([^"]+)"/)[1]}"></i>
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
      const filtro = chip.dataset.filtro;
      const valor = chip.dataset.valor;

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

// ===============================
// Render alternativo en texto (para depuración o fallback)
// ===============================
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
