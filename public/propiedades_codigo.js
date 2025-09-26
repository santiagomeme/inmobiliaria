

async function generarCodigoAutomatico() {
  const ref = firebase.firestore().collection("config").doc("contador");

  return firebase.firestore().runTransaction(async (transaction) => {
    const doc = await transaction.get(ref);

    if (!doc.exists) {
      throw "El documento contador no existe!";
    }

    let ultimo = doc.data().ultimoCodigo || 0;
    let nuevo = ultimo + 1;

    // actualizar el contador
    transaction.update(ref, { ultimoCodigo: nuevo });

    // retornar el nuevo código en formato P0001
    return "P" + nuevo.toString().padStart(4, "0");
  });
}



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
// Función para calcular conteos (igual que en admin)
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
    destacadas: propiedades.filter(p => p.destacada).length,
  };
}
// ===============================
// Estilos SOLO para estadísticas (clientes)
// ===============================
const estilosPorTipoEstadisticas = {
  "casa":          { icono: '<i class="fas fa-home"></i>', color: "#FFBF00" },
  "apartamento":   { icono: '<i class="fas fa-building"></i>', color: "dodgerblue" },
  "lote":          { icono: '<i class="fas fa-vector-square"></i>', color: "darkorange" },
  "finca":         { icono: '<i class="fas fa-tractor"></i>', color: "#66FF00" },
  "apartaestudio": { icono: '<i class="fas fa-door-open"></i>', color: "hotpink" },
  "bodega":        { icono: '<i class="fas fa-warehouse"></i>', color: "#666633" },
  "campestre":     { icono: '<i class="fas fa-tree"></i>', color: "darkgreen" },
  "condominio":    { icono: '<i class="fas fa-city"></i>', color: "navy" },
  "duplex":        { icono: '<i class="fas fa-house-chimney"></i>', color: "saddlebrown" },
  "edificio":      { icono: '<i class="fas fa-building-circle-check"></i>', color: "black" },
  "local":         { icono: '<i class="fas fa-store"></i>', color: "red" },
  "hotel":         { icono: '<i class="fas fa-hotel"></i>', color: "darkred" },
  "oficina":       { icono: '<i class="fas fa-briefcase"></i>', color: "purple" },
  "penthouse":     { icono: '<i class="fas fa-crown"></i>', color: "goldenrod" }
};


// ===============================
// Render dinámico de estadísticas en clientes (como chips)
// ===============================
function renderEstadisticasClientes(propiedades) {
  const conteos = calcularConteos(propiedades);
  const contenedor = document.getElementById("estadisticas-clientes");
  if (!contenedor) return;

  let html = "";

  // 🔹 Chip "Todas"
  html += `
    <button type="button" class="estadistica-chip" data-filtro="reset">
      <span class="chip-icon">📊</span>
      <span class="chip-label">Todas</span>
      <span class="chip-count">${conteos.total || 0}</span>
    </button>
  `;

  // 🔹 Chip "Destacadas"
  html += `
    <button type="button" class="estadistica-chip" data-filtro="destacada" data-valor="true">
      <span class="chip-icon">⭐</span>
      <span class="chip-label">Destacadas</span>
      <span class="chip-count">${conteos.destacadas || 0}</span>
    </button>
  `;

  // 🔹 Chips por tipo (usando estilosPorTipoEstadisticas)
  for (let tipo in estilosPorTipoEstadisticas) {
    const estilo = estilosPorTipoEstadisticas[tipo];
    const keyPlural = tipo.toLowerCase() + "s";
    const cantidad = conteos[keyPlural] ?? conteos[tipo.toLowerCase()] ?? 0;

    if (cantidad > 0) {
      html += `
        <button type="button" class="estadistica-chip"
                data-filtro="tipo"
                data-valor="${tipo.toLowerCase()}">
          <span class="chip-icon" style="color:${estilo.color}">
            ${estilo.icono}
          </span>
          <span class="chip-label">${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
          <span class="chip-count">${cantidad}</span>
        </button>
      `;
    }
  }

  contenedor.innerHTML = html;

  // 👉 Listeners para filtros
  contenedor.querySelectorAll(".estadistica-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const filtro = chip.dataset.filtro;
      const valor = chip.dataset.valor;

      if (filtro === "reset") {
        document.getElementById("tipo").value = "";
        document.getElementById("destacada").checked = false;
      } 
      else if (filtro === "tipo") {
        document.getElementById("tipo").value = valor;
      } 
      else if (filtro === "destacada") {
        document.getElementById("destacada").checked = true;
      }

      // Simular el click en Buscar
      document.getElementById("buscarBtn").click();
    });
  });
}






function getEstiloByTipo(tipo) {
  const key = tipo.toLowerCase();
  return estilosPorTipo[key] || { icono: '<i class="fas fa-question"></i>', color: 'gray' };
}
