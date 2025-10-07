// ===============================
// VARIABLES GLOBALES
// ===============================
let propiedadesOriginales = [];
let propiedadesFiltradas = [];

// ===============================
// Inicializar propiedades
// ===============================
function setPropiedades(datos) {
  // 🔹 Asegurar que se interprete bien el valor de 'activa'
  propiedadesOriginales = datos.filter(p => {
    const activa = String(p.activa).toLowerCase();
    return activa === "true" || activa === "1" || activa === "sí" || activa === "si";
  });

  propiedadesFiltradas = propiedadesOriginales;

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
// Render Cards (solo activas)
// ===============================
// helper seguro para textos
function escapeHtml(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// helper para color según tipo (usa estilosPorTipo si existe)
function getColorPorTipo(tipo) {
  const clave = String(tipo || "").toLowerCase().trim();
  if (typeof estilosPorTipo !== "undefined" && estilosPorTipo[clave] && estilosPorTipo[clave].color) {
    return estilosPorTipo[clave].color;
  }
  // fallback
  return "#cccccc";
}

// ===============================
// Render Cards (con las mismas clases CSS que usabas antes)
// ===============================
function renderCardsEstadisticas(propiedades) {
  const contenedor = document.getElementById("propiedades"); // <--- asegúrate de que tu HTML tiene id="propiedades"
  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (!Array.isArray(propiedades) || propiedades.length === 0) {
    contenedor.innerHTML = "<p>No se encontraron propiedades</p>";
    return;
  }

  propiedades.forEach(data => {
    const imagen = (data.imagenes && data.imagenes.length) ? data.imagenes[0] : (data.imagen || "imagenes/default.png");
    const titulo = escapeHtml(String(data.titulo || "Sin título"));
    const tipo = escapeHtml(String(data.tipo || ""));
    const modalidad = escapeHtml(String(data.modalidad || ""));
    const estado = escapeHtml(String(data.estado || ""));
    const ciudad = escapeHtml(String(data.ciudad || ""));
    const precio = data.precio || 0;
    const area = data.area || 0;
    const banos = data.banos || 0;
    const habitaciones = data.habitaciones || 0;
    const garage = data.garage || 0;
    const propiedadNueva = !!data.propiedadNueva;
    const id = escapeHtml(String(data.id || ""));
    const color = getColorPorTipo(data.tipo);

    const card = document.createElement("div");
    card.className = "prop-card";

    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${imagen}" alt="${titulo}">
        ${propiedadNueva ? '<span class="badge-nueva">NUEVO</span>' : ""}
      </div>
      <div class="card-body">
<h3 style="text-align:center; margin: 8px 0;" class="card-title">${titulo}</h3>
        <div class="prop-badges">
          <span class="prop-tipo" style="background:${color};">${tipo}</span>
          <span class="prop-badge">${modalidad}</span>
          <span class="prop-badge">${estado}</span>
      
        </div>

        <p><strong>Código:</strong> ${escapeHtml(data.codigo || "")}</p>
        <p> ${ciudad}</p>

      
      <div class="prop-icons">
        <span title="Garaje"class="prop-valor"><i class="fas fa-car"></i> ${garage}</span>
        <span title="Baños"class="prop-valor"><i class="fas fa-bath"></i> ${banos}</span>
        <span title="Habitaciones"class="prop-valor"><i class="fas fa-bed"></i> ${habitaciones}</span>
        <span title="Área"class="prop-valor"><i class="fas fa-ruler-combined"></i> ${area} m²</span>
      </div>
        <p class="prop-precio">COP ${formatearPrecio(precio)}</p>

      <div class="card-actions" style="text-align: center;">
  <button class="btn-detalle" onclick="verDetalle('${id}')">Ver detalles</button>
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
  // ✅ Solo activas
  const activas = propiedades.filter(p => p.activa);

  // Guardar globalmente
  propiedadesOriginales = activas;
  propiedadesFiltradas = activas;

  const chips = document.querySelectorAll(".estadistica-chip");
  if (!chips.length) return;

  const total = activas.length;
  const destacadas = activas.filter(p => p.destacada).length;

  // Conteos por tipo
  const conteosPorTipo = {};
  activas.forEach(p => {
    const tipo = (p.tipo || "").toLowerCase();
    conteosPorTipo[tipo] = (conteosPorTipo[tipo] || 0) + 1;
  });

  // Actualizar chips
  chips.forEach(chip => {
    const filtro = chip.dataset.filtro;
    const valor = chip.dataset.valor;
    const countEl = chip.querySelector(".chip-count");
    const labelEl = chip.querySelector(".chip-label");

    if (!countEl || !labelEl) return;

    let conteo = 0;

    if (filtro === "reset") conteo = total;
    else if (filtro === "destacada" && valor === "true") conteo = destacadas;
    else if (filtro === "tipo") conteo = conteosPorTipo[valor] || 0;

    countEl.textContent = conteo;

    // Aplicar color e ícono
if (filtro === "tipo") {
  const estilo = estilosPorTipo[valor];
  if (estilo) {
    labelEl.innerHTML = `<i class="${estilo.icono}" style="margin-right:6px; color:${estilo.color};"></i> ${valor}`;
    chip.style.backgroundColor = "#fff"; // 👈 chip blanco
    chip.style.color = "#000"; // texto negro (opcional)
  }
}

  });

  // Solo inicializar eventos una vez
  if (!window.chipsInicializados) {
    window.chipsInicializados = true;
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        const filtro = chip.dataset.filtro;
        const valor = chip.dataset.valor;
        aplicarFiltroDesdeChip(filtro, valor);
      });
    });
  }

  // Render inicial de cards con diseño original
  renderCardsEstadisticas(activas);
}


// ====================// ===============================
// Aplicar filtro desde chip
// ===============================
function aplicarFiltroDesdeChip(filtro, valor) {
  // 1️⃣ Aplicar el filtro según el chip seleccionado
  if (filtro === "reset") {
    propiedadesFiltradas = propiedadesOriginales;
  } else if (filtro === "tipo") {
    propiedadesFiltradas = propiedadesOriginales.filter(p => p.tipo === valor);
  } else if (filtro === "destacada") {
    propiedadesFiltradas = propiedadesOriginales.filter(p => p.destacada);
  }

  // 2️⃣ Mostrar las tarjetas filtradas
  renderCardsEstadisticas(propiedadesFiltradas);

  // 3️⃣ Quitar cualquier resaltado previo en los marcadores
  if (window.markersLayer && typeof window.markersLayer.eachLayer === "function") {
    window.markersLayer.eachLayer(m => {
      const el = m.getElement?.() || m._icon;
      if (el) {
        el.style.filter = "none";
        el.style.boxShadow = "none";
        el.style.zIndex = "";
      }
    });
  }

  // 4️⃣ Resaltar los marcadores que coinciden con las propiedades filtradas
  if (propiedadesFiltradas.length && window.markersLayer && typeof window.markersLayer.eachLayer === "function") {
    window.markersLayer.eachLayer(m => {
      const prop = propiedadesFiltradas.find(p =>
        Number(p.lat).toFixed(6) === Number(m.getLatLng().lat).toFixed(6) &&
        Number(p.lng).toFixed(6) === Number(m.getLatLng().lng).toFixed(6)
      );

      if (prop) {
        const el = m.getElement?.() || m._icon;
        if (el) {
          el.style.transition = "filter 0.3s ease, box-shadow 0.3s ease";
          el.style.filter = "drop-shadow(0 0 8px rgba(255,0,0,0.9))";
          el.style.boxShadow = "0 0 15px 4px rgba(255,0,0,0.6)";
          el.style.zIndex = "1000";
        }
      }
    });

    // ✅ Forzar actualización visual del mapa (corrige bug del desplazamiento)
    if (window.map && typeof window.map.invalidateSize === "function") {
      setTimeout(() => window.map.invalidateSize(false), 100);
    }
  }

  // 5️⃣ Marcar el chip activo visualmente
  document.querySelectorAll(".estadistica-chip").forEach(c => c.classList.remove("activo"));
  if (filtro !== "reset") {
    const chipActivo = document.querySelector(`.estadistica-chip[data-filtro="${filtro}"][data-valor="${valor}"]`);
    if (chipActivo) chipActivo.classList.add("activo");
  }
}
