// ✅ filtro.js
document.addEventListener("DOMContentLoaded", () => {
  // Chequeos suaves (no rompen la app si aún no cargó todo)
  if (!window.map) {
    console.warn("filtro.js: 'map' aún no existe en window. Verifica el orden de los scripts.");
  }
  if (!Array.isArray(window.propiedades)) {
    console.warn("filtro.js: 'propiedades' aún no existe o no es array. Se espera que propiedades.js lo inicialice.");
    window.propiedades = window.propiedades || []; // evita crash
  }
function getColorByTipo(tipo) {
  switch ((tipo || "").toLowerCase()) {
    case "casa": return "goldenrod";
    case "apartamento": 
    case "departamento": return "dodgerblue";
    case "lote": return "darkorange";
    case "finca": return "green";
    case "apartaestudio": return "hotpink";
    case "bodega": return "grey";
    case "campestre": return "darkgreen";
    case "condominio": return "steelblue";
    case "duplex": return "saddlebrown"; // 🔥 sin tilde
    case "edificio": return "black";
    case "local": return "red";
    case "hotel": return "darkred";
    case "oficina": return "purple";
    case "penthouse": return "goldenrod";
    default: return "#555"; // gris por defecto
  }
}


  // 📌 Coordenadas iniciales (tu vista por defecto: Cali)
  const LAT_INICIAL = 3.4516;
  const LNG_INICIAL = -76.5320;
  const ZOOM_INICIAL = 13;

// 🔴 Ejemplo con ícono cuadrado y texto "Búsqueda"
const customIcon = L.divIcon({
  className: "custom-marker",
  html: `
    <div style="
      width:48px;
      height:48px;
      background: radial-gradient(circle at center, #ff4d6d, #b10024);
      color:#fff;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:22px;
      font-weight:bold;
      box-shadow:0 0 12px rgba(255,0,70,0.8), 0 0 24px rgba(255,0,70,0.5);
    ">
      🔍
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48]
});



  // 🧱 Capa exclusiva para marcadores destacados (NO toca los normales)
  if (!window.highlightLayer) {
    window.highlightLayer = L.layerGroup().addTo(map);
  } else {
    window.highlightLayer.clearLayers();
  }

function renderTarjetas(items = [], mostrarVacio = false) {
  const cont = document.getElementById("propiedades");
  if (!cont) return;
  cont.innerHTML = "";

  const arr = Array.isArray(items) ? items : [];

  if (arr.length === 0) {
    if (mostrarVacio) {
      cont.innerHTML = "<p>No se encontraron propiedades con esos filtros.</p>";
    }
    return;
  }

  arr.forEach((data) => {
    const card = document.createElement("div");
    card.className = "prop-card";

    // color por tipo
    const color = getColorByTipo(data.tipo);

    card.innerHTML = `
      <img src="${
        (data.imagenes && data.imagenes.length > 0) 
          ? data.imagenes[0] 
          : (data.imagen || 'imagenes/default.png')
      }" alt="Imagen de la propiedad">

      <h3>${data.titulo || "Propiedad"}</h3>
      <span class="prop-tipo" style="background:${color};">
        ${data.tipo || ""}
      </span>
         <p>${data.ciudad || ""}</p>
      <p class="prop-precio">$${data.precio || "0"}</p>
  <p><strong>habitaciones:</strong> ${data.habitaciones}</p>
  <p><strong>Baños:</strong> ${data.banos}</p>
  <p><i class="fas fa-car"></i> Garajes: ${data.garage || 0}</p>   <!-- 👈 NUEVO -->
    <button onclick="verDetalle('${data.id}')">Ver detalles</button>
    `;

    cont.appendChild(card);
  });
}



  // 📍 Dibuja SOLO los destacados (deja intactos los marcadores normales de propiedades.js)
function pintarDestacados(items) {
  if (!window.highlightLayer) return;
  window.highlightLayer.clearLayers();

  const arr = Array.isArray(items) ? items : [];
  arr.forEach((data) => {
    if (data.lat == null || data.lng == null) return;

    const color = getColorByTipo(data.tipo);

const marker = L.marker([data.lat, data.lng], { icon: customIcon }).bindPopup(`
      <div style="text-align:center; width:160px; font-family:sans-serif;">
        <img src="${
          (data.imagenes && data.imagenes.length > 0) 
            ? data.imagenes[0] 
            : (data.imagen || "imagenes/default.png")
        }" style="width:100%;border-radius:6px;margin-bottom:4px;">
        <h4 style="margin:4px 0;font-size:14px;font-weight:600;color:#333;">
          ${data.titulo || "Propiedad"}
        </h4>
        <p style="margin:2px 0;font-size:13px;color:#2E8B57;font-weight:bold;">
          $${data.precio || ""}
        </p>
        <span style="
          display:inline-block;
          margin-top:3px;
          padding:2px 6px;
          border-radius:6px;
          font-size:12px;
          background:${color};
          color:#fff;
          font-weight:bold;
          white-space:nowrap;">
          ${data.tipo || ""}
        </span>
        <br>

        <button style="
          margin-top:6px;
          padding:4px 8px;
          border:none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
          border-radius:6px;
          background:#fff;
          color:#000;
          font-size:12px;
          font-weight:bold;
          transition: background 0.2s ease;
          cursor:pointer;">
          Ver detalles
        </button>
      </div>
    `);

    window.highlightLayer.addLayer(marker);
  });
}


  // 🔎 Aplica filtros
// 🔎 Aplica filtros
function aplicarFiltros() {
  const tipoVal     = (document.getElementById("tipo")?.value || "").toLowerCase().trim();
  const precioMin   = parseFloat(document.getElementById("precioMin")?.value) || 0;
  const precioMax   = parseFloat(document.getElementById("precioMax")?.value) || Infinity;
  const ciudadVal   = (document.getElementById("ciudad")?.value || "").toLowerCase().trim();
  const modalidadVal= (document.getElementById("filtroTipo")?.value || "").toLowerCase().trim();
  const banosVal    = parseInt(document.getElementById("banos")?.value) || 0;
  const habsVal     = parseInt(document.getElementById("habitaciones")?.value) || 0;
  const garajeVal   = parseInt(document.getElementById("garaje")?.value) || 0; // ✅ Nuevo
  const estadoVal   = (document.getElementById("estado")?.value || "").toLowerCase().trim();
  const destacada   = document.getElementById("destacada").checked; // ✅ Nuevo

  const filtradas = (window.propiedades || []).filter((prop) => {
    const pTipo      = (prop.tipo || "").toLowerCase();
    const pCiudad    = (prop.ciudad || "").toLowerCase();
    const pPrecio    = Number(prop.precio) || 0;
    const pModalidad = (prop.modalidad || "").toLowerCase();
    const pBanos     = Number(prop.banos) || 0;
    const pHabs      = Number(prop.habitaciones) || 0;
    const pActiva    = prop.activa ? "activa" : "inactiva";
    const pGarajes   = Number(prop.garaje) || 0;
    const pDestacada = !!prop.destacada; // lo normalizamos a booleano

    const okTipo      = tipoVal ? pTipo === tipoVal : true;
    const okPrecio    = pPrecio >= precioMin && pPrecio <= precioMax;
    const okCiudad    = ciudadVal ? pCiudad.includes(ciudadVal) : true;
    const okModalidad = modalidadVal && modalidadVal !== "todos" ? pModalidad === modalidadVal : true;
    const okBanos     = banosVal ? pBanos >= banosVal : true;
    const okHabs      = habsVal ? pHabs >= habsVal : true;
    const okEstado    = estadoVal && estadoVal !== "todos" ? pActiva === estadoVal : true;
    const okGaraje    = garajeVal ? pGarajes >= garajeVal : true;
    const okDestacada = destacada ? pDestacada === true : true; // ✅ Nuevo filtro

    return okTipo && okPrecio && okCiudad && okModalidad && okBanos && okHabs && okEstado && okGaraje && okDestacada;
  });

  // 1) Marcar en mapa
  pintarDestacados(filtradas);

  // 2) Mostrar tarjetas filtradas
  renderTarjetas(filtradas, true);

  // 3) Centrar mapa si hay resultados
  if (filtradas.length && filtradas[0].lat != null && filtradas[0].lng != null) {
    map.setView([filtradas[0].lat, filtradas[0].lng], 14);
  }
}


  // ♻️ Quitar filtros: borra chulos, muestra todas, y recentra
  function quitarFiltros() {
    window.highlightLayer?.clearLayers();
    renderTarjetas(window.propiedades, false);

    const ids = ["tipo", "precioMin", "precioMax", "ciudad"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    // Recentrar a la vista inicial
    if (window.map) {
      map.setView([LAT_INICIAL, LNG_INICIAL], ZOOM_INICIAL);
    }
  }

  // 🔘 Eventos
  document.getElementById("buscarBtn")?.addEventListener("click", aplicarFiltros);
  document.getElementById("resetBtn")?.addEventListener("click", quitarFiltros);

  // Carga inicial: mostrar todas SIN mensaje de vacío
  renderTarjetas(window.propiedades, false);
});
