// ✅ mapaFiltro.js
document.addEventListener("DOMContentLoaded", () => {

  // ⚙️ Seguridad básica
  if (!window.map) {
    console.warn("mapaFiltro.js: el mapa aún no está disponible en window.map");
  }
  if (!Array.isArray(window.propiedades)) {
    console.warn("mapaFiltro.js: propiedades no está definido o no es array");
    window.propiedades = [];
  }

  // 🎨 Colores según tipo
  function getColorByTipo(tipo) {
    switch ((tipo || "").toLowerCase()) {
      case "casa": return "goldenrod";
      case "apartamento":
      case "departamento": return "dodgerblue";
      case "lote": return "darkorange";
      case "finca": return "green";
      case "apartaestudio": return "hotpink";
      case "bodega": return "gray";
      case "campestre": return "darkgreen";
      case "condominio": return "steelblue";
      case "duplex": return "saddlebrown";
      case "edificio": return "black";
      case "local": return "red";
      case "hotel": return "darkred";
      case "oficina": return "purple";
      case "penthouse": return "goldenrod";
      default: return "#555";
    }
  }

  // 📍 Coordenadas iniciales
  const LAT_INICIAL = 3.4516;
  const LNG_INICIAL = -76.5320;
  const ZOOM_INICIAL = 13;

  // ⭐ Capa para destacados
  if (!window.highlightLayer) {
    window.highlightLayer = L.layerGroup().addTo(map);
  } else {
    window.highlightLayer.clearLayers();
  }

  // 💳 Render de tarjetas
  function renderTarjetas(items = [], mostrarVacio = false) {
    const cont = document.getElementById("propiedades");
    if (!cont) return;

    cont.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {
      if (mostrarVacio) cont.innerHTML = "<p>No se encontraron propiedades.</p>";
      return;
    }

    items.forEach((data) => {
      const card = document.createElement("div");
      card.className = "prop-card";
      const color = getColorByTipo(data.tipo);

      card.innerHTML = `
        <div class="card-img-wrapper">
          <img src="${
            data.imagenes?.[0] || data.imagen || "imagenes/default.png"
          }" alt="Imagen de la propiedad">
          ${data.propiedadNueva ? `<span class="badge-nueva">NUEVA</span>` : ""}
        </div>

        <h3>${data.titulo || "Sin título"}</h3>

        <div class="prop-badges">
          <span class="prop-tipo" style="background:${color};">${data.tipo || ""}</span>
          ${data.modalidad ? `<span class="prop-badge">${data.modalidad}</span>` : ""}
          ${data.estado ? `<span class="prop-badge">${data.estado}</span>` : ""}
          <span class="prop-badge" style="background:${data.activa ? "#2E8B57" : "#B22222"};color:#fff;">
            ${data.activa ? "Activa" : "Inactiva"}
          </span>
        </div>

        <p>${data.ciudad || ""}</p>

        <div class="prop-icons">
          <span><i class="fas fa-car"></i> ${data.garage || 0}</span>
          <span><i class="fas fa-bath"></i> ${data.banos || 0}</span>
          <span><i class="fas fa-bed"></i> ${data.habitaciones || 0}</span>
          <span><i class="fas fa-ruler-combined"></i> ${data.area || 0} m²</span>
        </div>

        <div class="precio-container">
          ${data.destacada ? `<span class="badge-destacada"><i class="fas fa-star"></i> Destacada</span>` : ""}
          <p class="prop-precio">COP $${formatearPrecio(data.precio) || "0"}</p>
        </div>

        <button onclick="verDetalle('${data.id}')">Ver detalles</button>
      `;

      cont.appendChild(card);
    });
  }

  // 🗺️ Pintar marcadores destacados
 window.pintarDestacados = function(items) {
    if (!window.highlightLayer) return;
    window.highlightLayer.clearLayers();

    if (!Array.isArray(items) || items.length === 0) return;

    items.forEach((data) => {
      if (data.lat == null || data.lng == null) return;

     const estilo = getEstiloByTipo(data.tipo);

     // Si getEstiloByTipo devuelve el color y el icono, creamos el ícono real
     const iconoFinal = crearIcono(estilo.color, estilo.icono);

     // Creamos el marcador con el icono válido de Leaflet
     const marker = L.marker([data.lat, data.lng], { icon: iconoFinal });

      marker.on("add", () => {
        const el = marker.getElement();
        if (el) el.classList.add("highlight-marker");
      });

      window.highlightLayer.addLayer(marker);
    });

    const first = items[0];
    if (first?.lat != null && first?.lng != null) {
      map.setView([first.lat, first.lng], 14);
    }
  }

  // 🔍 Filtros
  function aplicarFiltros() {
    const getVal = (id, parse = false) => {
      const el = document.getElementById(id);
      if (!el) return parse ? 0 : "";
      return parse ? parseFloat(el.value) || 0 : el.value.trim().toLowerCase();
    };

    const soloNuevas = document.getElementById("filtroNueva")?.checked || false;
    const destacada = document.getElementById("destacada")?.checked || false;

    const tipoVal = getVal("tipo");
    const modalidadVal = getVal("filtroTipo");
    const estadoVal = getVal("estado");
    const ciudadVal = getVal("ciudad");
    const paisVal = getVal("pais");
    const departamentoVal = getVal("departamento");
    const codigoVal = getVal("codigo");
    const activaVal = getVal("filtroActiva") || "todas";

    const precioMin = getVal("precioMin", true);
    const precioMax = getVal("precioMax", true) || Infinity;
    const banosVal = getVal("banos", true);
    const habsVal = getVal("habitaciones", true);
    const garajeVal = getVal("garaje", true);
    const estratoVal = getVal("estrato", true);
    const pisoVal = getVal("piso", true);

    const filtradas = window.propiedades.filter((prop) => {
      const precioNum = parseFloat(String(prop.precio).replace(/[^\d.]/g, "")) || 0;

      const checks = [
        tipoVal ? prop.tipo?.toLowerCase().includes(tipoVal) : true,
        ciudadVal ? prop.ciudad?.toLowerCase().includes(ciudadVal) : true,
        paisVal ? prop.pais?.toLowerCase().includes(paisVal) : true,
        departamentoVal ? prop.departamento?.toLowerCase().includes(departamentoVal) : true,
        codigoVal ? prop.codigo?.toLowerCase().includes(codigoVal) : true,
        modalidadVal && modalidadVal !== "todos" ? prop.modalidad?.toLowerCase().includes(modalidadVal) : true,
        estadoVal && estadoVal !== "todos" ? prop.estado?.toLowerCase().includes(estadoVal) : true,
        prop.precio >= precioMin && prop.precio <= precioMax,
        !banosVal || (prop.banos >= banosVal),
        !habsVal || (prop.habitaciones >= habsVal),
        !garajeVal || (prop.garaje >= garajeVal),
        !estratoVal || (prop.estrato === estratoVal),
        !pisoVal || (prop.piso === pisoVal),
        !soloNuevas || !!prop.propiedadNueva,
        !destacada || !!prop.destacada,
        activaVal === "todas" ? true :
          (activaVal === "true" ? prop.activa === true : prop.activa === false)
      ];

      return checks.every(Boolean);
    });

    pintarDestacados(filtradas);
    renderTarjetas(filtradas, true);

    if (filtradas.length && filtradas[0].lat && filtradas[0].lng) {
      map.setView([filtradas[0].lat, filtradas[0].lng], 14);
    }
  }

  // ♻️ Reset
  function quitarFiltros() {
    document.querySelectorAll(".filtros input, .filtros select").forEach((el) => {
      if (el.type === "checkbox") el.checked = false;
      else el.value = "";
    });

    window.highlightLayer?.clearLayers();
    renderTarjetas(window.propiedades, false);
    map.setView([LAT_INICIAL, LNG_INICIAL], ZOOM_INICIAL);
  }

  // 🔘 Eventos
  document.getElementById("buscarBtn")?.addEventListener("click", aplicarFiltros);
  document.getElementById("resetBtn")?.addEventListener("click", quitarFiltros);

  // 🔹 Carga inicial
  renderTarjetas(window.propiedades, false);
});
