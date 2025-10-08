// ===============================
// VARIABLES GLOBALES
// ===============================
let propiedadesOriginales = [];
let propiedadesFiltradas = [];

// ===============================
// Inicializar propiedades
// ===============================
function setPropiedades(datos) {
  // ✅ Ahora NO filtramos las inactivas, guardamos todas
  propiedadesOriginales = datos.map(p => ({
    ...p,
    activa: (typeof p.activa === "undefined") ? true : !!p.activa
  }));

  propiedadesFiltradas = [...propiedadesOriginales];

  renderEstadisticas(propiedadesOriginales);
  renderCardsEstadisticas(propiedadesOriginales);
}

// ===============================
// Crear ícono de marcador (para mapa)
// ===============================
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
// Estilos por tipo (GLOBAL)
// ===============================
const estilosPorTipo = {
  casa:          { icono: "fas fa-home", color: "#FFBF00" },
  apartamento:   { icono: "fas fa-building", color: "dodgerblue" },
  lote:          { icono: "fas fa-border-all", color: "darkorange" },
  finca:         { icono: "fas fa-tractor", color: "#66FF00" },
  apartaestudio: { icono: "fas fa-door-open", color: "hotpink" },
  bodega:        { icono: "fas fa-warehouse", color: "#666633" },
  campestre:     { icono: "fas fa-tree", color: "darkgreen" },
  condominio:    { icono: "fas fa-city", color: "lightseagreen" },
  duplex:        { icono: "fas fa-house-user", color: "saddlebrown" },
  edificio:      { icono: "fas fa-hotel", color: "black" },
  local:         { icono: "fas fa-store", color: "crimson" },
  hotel:         { icono: "fas fa-concierge-bell", color: "darkred" },
  oficina:       { icono: "fas fa-briefcase", color: "violet" },
  penthouse:     { icono: "fas fa-crown", color: "gold" }
};

// ===============================
// Helpers
// ===============================
function escapeHtml(text) {
  if (typeof text !== "string") return text;
  return text.replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
  }[m]));
}

function getColorPorTipo(tipo) {
  const clave = String(tipo || "").toLowerCase().trim();
  return estilosPorTipo[clave]?.color || "#ccc";
}

// ===============================
// Render Cards
// ===============================
function renderCardsEstadisticas(propiedades) {
  const contenedor = document.getElementById("propiedades");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (!Array.isArray(propiedades) || propiedades.length === 0) {
    contenedor.innerHTML = "<p>No se encontraron propiedades</p>";
    return;
  }


propiedades.forEach(data => {
  const id = escapeHtml(data.id || "");
  const titulo = escapeHtml(data.titulo || "Sin título");
  const tipo = escapeHtml(data.tipo || "");
  const modalidad = escapeHtml(data.modalidad || ""); // venta, arriendo, etc.
  const estado = escapeHtml(data.estado || ""); // nueva, usada, etc.
  const codigo = escapeHtml(data.codigo || "");
  const ciudad = escapeHtml(data.ciudad || "");
  const area = escapeHtml(data.area || "N/D");
  const banos = escapeHtml(data.banos || "N/D");
  const habitaciones = escapeHtml(data.habitaciones || "N/D");
  const garage = escapeHtml(data.garage || "N/D");
  const precio = formatearPrecio(data.precio || 0);
  const color = getColorPorTipo(data.tipo);
  const activa = !!data.activa;
  const propiedadNueva = data.propiedadNueva || false;

  // Imagen
  const imagen = (data.imagenes && data.imagenes.length)
    ? escapeHtml(data.imagenes[0])
    : escapeHtml(data.imagen || "imagenes/default.png");

  const card = document.createElement("div");
  card.className = "prop-card";
  card.innerHTML = `
    <div class="card-img-wrapper">
      <img src="${imagen}" alt="${titulo}">
      ${propiedadNueva ? '<span class="badge-nueva">NUEVO</span>' : ""}
    </div>
    <div class="card-body">
      <h3 class="card-title">${titulo}</h3>

      <div class="prop-badges">
        <span class="prop-tipo" style="background:${color};">${tipo}</span>
        ${modalidad ? `<span class="prop-badge">${modalidad}</span>` : ""}
        ${estado ? `<span class="prop-badge">${estado}</span>` : ""}
        <span class="prop-badge ${activa ? "badge-activa" : "badge-inactiva"}">
          ${activa ? "Activa" : "Inactiva"}
        </span>
      </div>

      <p><strong>Código:</strong> ${codigo}</p>
      
      <p> ${ciudad}</p>

      <div class="prop-icons">
        <span title="Garaje"><i class="fas fa-car"></i> ${garage}</span>
        <span title="Baños"><i class="fas fa-bath"></i> ${banos}</span>
        <span title="Habitaciones"><i class="fas fa-bed"></i> ${habitaciones}</span>
        <span title="Área"><i class="fas fa-ruler-combined"></i> ${area} m²</span>
      </div>

      <p class="prop-precio">COP ${precio}</p>

      <div class="card-actions">
        <button class="btn-detalle" onclick="verDetalle('${id}')">Ver detalles</button>
   <button class="btn-copiar" onclick="copiarCodigo('${codigo}', this)">
        Copiar código
      </button>
      </div>
    </div>
  `;
  contenedor.appendChild(card);
});

}

// ===============================
// Render Estadísticas (chips)
// ===============================
function renderEstadisticas(propiedades) {
  const chips = document.querySelectorAll(".estadistica-chip");
  if (!chips.length) return;

  const total = propiedades.length;
  const activas = propiedades.filter(p => p.activa).length;
  const inactivas = propiedades.filter(p => !p.activa).length;
  const destacadas = propiedades.filter(p => p.destacada).length;

  // Conteos por tipo
  const conteosPorTipo = {};
  propiedades.forEach(p => {
    const tipo = (p.tipo || "").toLowerCase();
    conteosPorTipo[tipo] = (conteosPorTipo[tipo] || 0) + 1;
  });

  // Actualizar chips
  chips.forEach(chip => {
    const filtro = chip.dataset.filtro;
    const valor = chip.dataset.valor;
    const countEl = chip.querySelector(".chip-count");
    const labelEl = chip.querySelector(".chip-label");
    const iconEl = chip.querySelector(".chip-icon i"); // ✅ el ícono ya existente

    if (!countEl || !labelEl) return;
    let conteo = 0;

    if (filtro === "reset") conteo = total;
    else if (filtro === "filtroActiva" && valor === "true") conteo = activas;
    else if (filtro === "filtroActiva" && valor === "false") conteo = inactivas;
    else if (filtro === "destacada" && valor === "true") conteo = destacadas;
    else if (filtro === "tipo") conteo = conteosPorTipo[valor] || 0;

    countEl.textContent = conteo;

    // aplicar color e ícono si es tipo
    if (filtro === "tipo") {
      const estilo = estilosPorTipo[valor];
      if (estilo) {
        // ✅ solo actualizamos el ícono ya existente
        if (iconEl) {
          iconEl.className = estilo.icono;
          iconEl.style.color = estilo.color;
        }

        // ✅ solo actualizamos el texto del label (sin ícono duplicado)
        labelEl.textContent = valor.charAt(0).toUpperCase() + valor.slice(1);

        // estilos base opcionales
        chip.style.backgroundColor = "#fff";
        chip.style.color = "#000";
      }
    }
  });

  // Inicializar eventos solo una vez
  if (!window.chipsInicializados) {
    window.chipsInicializados = true;
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        aplicarFiltroDesdeChip(chip.dataset.filtro, chip.dataset.valor);
      });
    });
  }

  renderCardsEstadisticas(propiedades);
}
// ===============================
// Aplicar filtro desde chip
// ===============================
function aplicarFiltroDesdeChip(filtro, valor) {
  // 📦 Filtrado de propiedades
  if (filtro === "reset") {
    propiedadesFiltradas = propiedadesOriginales;
  } else if (filtro === "tipo") {
    propiedadesFiltradas = propiedadesOriginales.filter(p => p.tipo === valor);
  } else if (filtro === "destacada") {
    propiedadesFiltradas = propiedadesOriginales.filter(p => p.destacada);
  } else if (filtro === "filtroActiva" && valor === "true") {
    propiedadesFiltradas = propiedadesOriginales.filter(p => p.activa);
  } else if (filtro === "filtroActiva" && valor === "false") {
    propiedadesFiltradas = propiedadesOriginales.filter(p => !p.activa);
  }

  // 🧩 Render de tarjetas
  renderCardsEstadisticas(propiedadesFiltradas);

  // 🗺️ Actualizar mapa (solo si existe la función y la capa)
  if (window.highlightLayer && typeof window.highlightLayer.clearLayers === "function") {
    window.highlightLayer.clearLayers();
  }

  if (typeof window.pintarDestacados === "function") {
    window.pintarDestacados(propiedadesFiltradas);
  } else {
    console.warn("⚠️ La función pintarDestacados no está definida o no es global.");
  }

  // 💡 Actualizar visual de chips activos
  document.querySelectorAll(".estadistica-chip").forEach(c => c.classList.remove("activo"));
  if (filtro !== "reset") {
    const chipActivo = document.querySelector(`.estadistica-chip[data-filtro="${filtro}"][data-valor="${valor}"]`);
    if (chipActivo) chipActivo.classList.add("activo");
  }
}


function copiarCodigo(codigo, boton) {
  navigator.clipboard.writeText(codigo).then(() => {
    boton.textContent = "Código copiado ✅";
    boton.style.backgroundColor = "#4CAF50"; // color verde temporal
    setTimeout(() => {
      boton.textContent = "Copiar código";
      boton.style.backgroundColor = ""; // vuelve al color original
    }, 2000); // vuelve al texto original en 2 segundos
  }).catch(err => {
    console.error("Error al copiar el código:", err);
  });
}



