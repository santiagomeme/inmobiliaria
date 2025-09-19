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
  <div class="card-img-wrapper">
    <img src="${
      (data.imagenes && data.imagenes.length > 0) 
        ? data.imagenes[0] 
        : (data.imagen || 'imagenes/default.png')
    }" alt="Imagen de la propiedad">

    ${data.propiedadNueva ? `<span class="badge-nueva">NUEVA</span>` : ""}
  </div>

  <h3>${data.titulo}</h3>

  <div class="prop-badges">
    <span class="prop-tipo" style="background:${color};">
      ${data.tipo || ""}
    </span>
    <span class="prop-badge">${data.modalidad || ""}</span>
    <span class="prop-badge">${data.estado || ""}</span>
    <span class="prop-badge" style="background:${data.activa ? '#2E8B57' : '#B22222'};color:#fff;">
            ${data.activa ? 'Activa' : 'Inactiva'}
          </span>
  
    </div>

  <p>${data.ciudad || ""}</p>
  <p><i class="fas fa-car"></i> <span class="prop-valor">${data.garage || 0}</span></p>
  <p><strong>Área:</strong> <span class="prop-valor">${data.area} m²</span></p>
  <p><strong>Baños:</strong> <span class="prop-valor">${data.banos}</span></p>
  <p><strong>Habitaciones:</strong> <span class="prop-valor">${data.habitaciones}</span></p>

  <div class="precio-container">
    ${data.destacada ? `<span class="badge-destacada"><i class="fas fa-star"></i> Destacada</span>` : ""}
    <p class="prop-precio">COP $${formatearPrecio(data.precio) || "0"}</p>
  </div>

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
          cursor:pointer;"onclick="verDetalle('${data.id}')">
          Ver detalles
        </button>
      </div>
    `);

    window.highlightLayer.addLayer(marker);
  });
}


  // 🔎 Aplica filtros
// 🔎 Aplica filtros
// 🔎 Aplica filtros
function aplicarFiltros() {
  const soloNuevas  = document.getElementById("filtroNueva")?.checked || false;
  const tipoVal     = (document.getElementById("tipo")?.value || "").toLowerCase().trim();
  const precioMin   = parseFloat(document.getElementById("precioMin")?.value) || 0;
  const precioMax   = parseFloat(document.getElementById("precioMax")?.value) || Infinity;
  const ciudadVal   = (document.getElementById("ciudad")?.value || "").toLowerCase().trim();
  const modalidadVal= (document.getElementById("filtroTipo")?.value || "").toLowerCase().trim();
  const banosVal    = parseInt(document.getElementById("banos")?.value) || 0;
  const habsVal     = parseInt(document.getElementById("habitaciones")?.value) || 0;
  const garajeVal   = parseInt(document.getElementById("garaje")?.value) || 0;
  const estadoVal   = (document.getElementById("estado")?.value || "").toLowerCase().trim();
  const destacada   = document.getElementById("destacada")?.checked || false;
  const activaVal   = (document.getElementById("filtroActiva")?.value || "todas").toLowerCase().trim();
  // 🔹 Nuevos filtros
  const estratoVal     = parseInt(document.getElementById("estrato")?.value) || 0;
  const codigoVal      = (document.getElementById("codigo")?.value || "").toLowerCase().trim();
  const pisoVal        = parseInt(document.getElementById("piso")?.value) || 0;
  const paisVal        = (document.getElementById("pais")?.value || "").toLowerCase().trim();
  const departamentoVal= (document.getElementById("departamento")?.value || "").toLowerCase().trim();

  const filtradas = (window.propiedades || []).filter((prop) => {
    const pTipo      = (prop.tipo || "").toLowerCase();
    const pCiudad    = (prop.ciudad || "").toLowerCase();
    const pPrecio    = Number(prop.precio) || 0;
    const pModalidad = (prop.modalidad || "").toLowerCase();
    const pBanos     = Number(prop.banos) || 0;
    const pHabs      = Number(prop.habitaciones) || 0;
    const pGarajes   = Number(prop.garaje) || 0;
    const pEstado    = (prop.estado || "").toLowerCase();
    const pDestacada = !!prop.destacada;
    const pNueva     = !!prop.propiedadNueva; // ✅ normalizamos a booleano
    const pActiva = String(prop.activa).toLowerCase() === "true";
  // 🔹 Nuevos valores de propiedades
    const pEstrato     = Number(prop.estrato) || 0;
    const pCodigo      = (prop.codigo || "").toLowerCase();
    const pPiso        = Number(prop.piso) || 0;
    const pPais        = (prop.pais || "").toLowerCase();
    const pDepartamento= (prop.departamento || "").toLowerCase();

    const okTipo = tipoVal ? pTipo.includes(tipoVal) : true;
    const okPrecio    = pPrecio >= precioMin && pPrecio <= precioMax;
    const okCiudad    = ciudadVal ? pCiudad.includes(ciudadVal) : true;
    const okModalidad = modalidadVal && modalidadVal !== "todos" ? pModalidad.includes(modalidadVal) : true;
    const okBanos     = banosVal ? pBanos >= banosVal : true;
    const okHabs      = habsVal ? pHabs >= habsVal : true;
    const okEstado = estadoVal && estadoVal !== "todos" ? pEstado.includes(estadoVal) : true;
    const okGaraje    = garajeVal ? pGarajes >= garajeVal : true;
    const okDestacada = destacada ? pDestacada === true : true;
    const okNueva     = soloNuevas ? pNueva === true : true; // ✅ Nuevo filtro
    // 🔹 Nuevos filtros
    const okEstrato     = estratoVal ? pEstrato === estratoVal : true;
    const okCodigo      = codigoVal ? pCodigo.includes(codigoVal) : true;
    const okPiso        = pisoVal ? pPiso === pisoVal : true;
    const okPais        = paisVal ? pPais.includes(paisVal) : true;
    const okDepartamento= departamentoVal ? pDepartamento.includes(departamentoVal) : true;

    // 🔎 Filtro nueva condición: activa/inactiva
    const okActiva = activaVal !== "todas"
      ? (activaVal === "true" ? pActiva === true : pActiva === false)
      : true;

    return (
      okTipo &&
      okPrecio &&
      okCiudad &&
      okModalidad &&
      okBanos &&
      okHabs &&
      okEstado &&
      okGaraje &&
      okDestacada &&
      okNueva &&// 👉 se agrega aquí
      okActiva &&// 👉 se agrega aquí
      okEstrato &&        // 👈 agregado
      okCodigo &&         // 👈 agregado
      okPiso &&           // 👈 agregado
      okPais &&           // 👈 agregado
      okDepartamento      // 👈 agregado
  
    );
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
