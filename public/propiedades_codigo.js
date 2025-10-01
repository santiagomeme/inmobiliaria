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
    oficinas: propiedades.filter(p => p.tipo === "oficina").length,
    penthouse: propiedades.filter(p => p.tipo === "penthouse").length,
    hoteles: propiedades.filter(p => p.tipo === "hotel").length,

    activas: propiedades.filter(p => p.activa).length,
    inactivas: propiedades.filter(p => !p.activa).length,
    destacadas: propiedades.filter(p => p.destacada).length,
  };
}

// Extrae la clase FontAwesome desde el L.divIcon (si es posible).
function getIconClassFromEstilo(estilo) {
  try {
    if (!estilo) return "fas fa-circle";
    // Si estilo.icono es un L.divIcon con options.html
    if (estilo.icono && estilo.icono.options && typeof estilo.icono.options.html === "string") {
      const m = estilo.icono.options.html.match(/class=["']([^"']+)["']/);
      if (m && m[1]) return m[1];
    }
    // si estilo.icono ya es una clase (raro)
    if (typeof estilo.icono === "string" && estilo.icono.indexOf("fa") !== -1) return estilo.icono;
  } catch (e) { /* fallback */ }
  return "fas fa-circle";
}






// ===============================
// Render dinámico en el DOM (con chips)
// Diccionario de iconos por tipo


function renderEstadisticas(propiedades) {
  if (!Array.isArray(propiedades)) {
    console.error("renderEstadisticas -> propiedades no es un array:", propiedades);
    return;
  }

  const conteos = calcularConteos(propiedades);
  const contenedor = document.getElementById("estadisticas");
  if (!contenedor) {
    console.warn("No existe el contenedor #estadisticas en el HTML");
    return;
  }

  contenedor.innerHTML = "";

  // Estados (Total / Activas / Inactivas / Destacadas)
  const estadosHtml = `
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
      <span class="chip-icon"><i class="fas fa-star" style="color:gold;"></i></span>
      <span class="chip-label">Destacadas</span>
      <span class="chip-count">${conteos.destacadas || 0}</span>
    </button>
  `;
  contenedor.insertAdjacentHTML("beforeend", estadosHtml);

  // Tipos (usar estilosPorTipo para sacar color + icono)
  for (const tipo in estilosPorTipo) {
    const estilo = estilosPorTipo[tipo];
const cantidad = conteos[tipo + "s"] 
              ?? conteos[tipo + "es"]  // 👈 soporta plurales como hoteles
              ?? conteos[tipo] 
              ?? 0;
    if (!cantidad) continue;

    const iconClass = getIconClassFromEstilo(estilo); // e.g. "fas fa-home"
    // chip con pequeño círculo con fondo del color y el icono en blanco
    const chipHtml = `
      <button class="estadistica-chip" data-filtro="tipo" data-valor="${tipo}">
        <span class="chip-icon" style="
            display:inline-flex;
            align-items:center;
            justify-content:center;
            width:28px;
            height:28px;
            border-radius:50%;
            background:${estilo.color};
            flex:0 0 28px;
            ">
          <i class="${iconClass}" style="color:white; font-size:13px; line-height:1;"></i>
        </span>
        <span class="chip-label">${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
        <span class="chip-count">${cantidad}</span>
      </button>
    `;
    contenedor.insertAdjacentHTML("beforeend", chipHtml);
  }

  // Listeners (único manejador para todos los botones creados)
  contenedor.querySelectorAll(".estadistica-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const filtro = chip.dataset.filtro;
      const valor = chip.dataset.valor;

      if (filtro === "reset") {
        document.getElementById("tipo").value = "";
        document.getElementById("estado").value = "todos";
        document.getElementById("filtroActiva").value = "todas";
        document.getElementById("destacada").checked = false;
      } else if (filtro === "tipo") {
        document.getElementById("tipo").value = valor;
      } else if (filtro === "filtroActiva") {
        document.getElementById("filtroActiva").value = valor;
      } else if (filtro === "destacada") {
        document.getElementById("destacada").checked = true;
      }

      // marca visual active
      contenedor.querySelectorAll(".estadistica-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      // Ejecutar búsqueda (tu código ya espera que exista buscarBtn)
      const buscarBtn = document.getElementById("buscarBtn");
      if (buscarBtn) buscarBtn.click();
      else {
        // fallback: si no hay botón, dispara la función directamente si existe
        if (typeof aplicarFiltros === "function") aplicarFiltros();
      }
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
