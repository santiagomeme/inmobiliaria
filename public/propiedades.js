// ==========================
//  LISTADO DE PROPIEDADES + MAPA
// ==========================

// Contenedor HTML de las tarjetas
const lista = document.getElementById("propiedades");

// Inicializar mapa Leaflet centrado en Colombia
const map = L.map("map").setView([3.4516, -76.5320], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap"
}).addTo(map);


// 👇 Grupo para manejar marcadores filtrados
var markersLayer = L.layerGroup().addTo(map);

// ==========================
//  ICONOS POR TIPO DE PROPIEDAD
// ==========================
// Casa// ==========================
// FUNCION GENERADORA DE ICONOS
// ==========================
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

// ==========================
// ICONOS POR TIPO
// ==========================
const iconCasa        = crearIcono("goldenrod", "fas fa-home");
const iconApartamento = crearIcono("dodgerblue", "fas fa-building");
const iconLote        = crearIcono("darkorange", "fas fa-border-all");
const iconFinca       = crearIcono("green", "fas fa-tractor");
const iconApartaestudio = crearIcono("hotpink", "fas fa-door-open");
const iconBodega      = crearIcono("grey", "fas fa-warehouse");
const iconCampestre   = crearIcono("darkgreen", "fas fa-tree");
const iconCondominio  = crearIcono("steelblue", "fas fa-city");
const iconDuplex      = crearIcono("saddlebrown", "fas fa-building");
const iconEdificio    = crearIcono("black", "fas fa-building-circle-check");
const iconLocal       = crearIcono("red", "fas fa-store");
const iconHotel       = crearIcono("darkred", "fas fa-hotel");
const iconOficina     = crearIcono("purple", "fas fa-briefcase");
const iconPenthouse   = crearIcono("goldenrod", "fas fa-crown");

// ==========================
// ÍCONO + COLOR POR TIPO DE PROPIEDAD (MAPA CENTRALIZADO)
// ==========================
// ==========================
// ÍCONO + COLOR POR TIPO DE PROPIEDAD (MAPA CENTRALIZADO)
// ==========================
const estilosPorTipo = {
  "casa":        { icono: iconCasa,        color: "goldenrod" },
  "apartamento": { icono: iconApartamento, color: "dodgerblue" },
  "lote":        { icono: iconLote,        color: "darkorange" },
  "finca":       { icono: iconFinca,       color: "green" },
  "apartaestudio": { icono: iconApartaestudio, color: "hotpink" },
  "bodega":      { icono: iconBodega,      color: "grey" },
  "campestre":   { icono: iconCampestre,   color: "darkgreen" },
  "condominio":  { icono: iconCondominio,  color: "steelblue" },
  "duplex":      { icono: iconDuplex,      color: "saddlebrown" }, // 🔥 sin tilde
  "edificio":    { icono: iconEdificio,    color: "black" },
  "local":       { icono: iconLocal,       color: "red" },
  "hotel":       { icono: iconHotel,       color: "darkred" },
  "oficina":     { icono: iconOficina,     color: "purple" },
  "penthouse":   { icono: iconPenthouse,   color: "goldenrod" }
};



//funcion para no ser sendible a tildes en la casa
function getEstiloByTipo(tipo) {
  if (!tipo) return { icono: iconCasa, color: "#999" };
  const clave = tipo
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes
    .trim();
  return estilosPorTipo[clave] || { icono: iconCasa, color: "#999" };
}

// ==========================
//  CARGAR PROPIEDADES DE FIRESTORE
// ==========================
async function cargarPropiedades() {
  try {
    const snapshot = await db.collection("propiedades").get();
    propiedades = []; // Reiniciar array antes de volver a llenarlo

    snapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      if (!data.activa) return; // solo activas

      propiedades.push(data);

      const card = document.createElement("div");
      card.classList.add("prop-card");

      // obtenemos estilo (icono + color)// obtenemos estilo (icono + color)
const { icono, color } = getEstiloByTipo(data.tipo);

card.innerHTML = `
  ${data.propiedadNueva ? `<div class="badge-nueva">NUEVA</div>` : ""}

  <img src="${
    (data.imagenes && data.imagenes.length > 0) 
      ? data.imagenes[0] 
      : (data.imagen || 'imagenes/default.png')
  }" alt="Imagen de la propiedad">

  <h3>${data.titulo}</h3>

  <div class="prop-badges">
    <span class="prop-tipo" style="background:${color};">
      ${data.tipo || ""}
    </span>
    <span class="prop-badge">${data.modalidad || ""}</span>
    <span class="prop-badge">${data.estado || ""}</span>
  </div>

  <p>${data.ciudad || ""}</p>
  <p><i class="fas fa-car"></i> <span class="prop-valor">${data.garage || 0}</span></p>
  <p><strong>Área:</strong> <span class="prop-valor">${data.area} m²</span></p>
  <p><strong>Baños:</strong> <span class="prop-valor">${data.banos}</span></p>
  <p><strong>Habitaciones:</strong> <span class="prop-valor">${data.habitaciones}</span></p>

  <p class="prop-precio">$${data.precio || "0"}</p>
  <button onclick="verDetalle('${doc.id}')">Ver detalles</button>
`;

lista.appendChild(card);

// Crear marcador en el mapa
if (data.lat && data.lng) {
  const marker = L.marker([data.lat, data.lng], { icon: icono }).addTo(markersLayer);

  // Popup
  marker.bindPopup(`
    <div style="text-align:center; width:160px; font-family:sans-serif;">
      <img src="${
        (data.imagenes && data.imagenes.length > 0) 
          ? data.imagenes[0] 
          : (data.imagen || "imagenes/default.png")
      }" style="width:100%;border-radius:6px;margin-bottom:4px;">
      <h4 style="margin:4px 0;font-size:14px;font-weight:600;color:#333;">${data.titulo}</h4>
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
        background:#fff; /* ✅ gris */
        color:#000000;
        font-size:12px;
        font-weight:bold;
        transition: background 0.2s ease;
        cursor:pointer;">
        Ver detalles
      </button>
    </div>
  `);
}

    });
  } catch (error) {
    console.error("Error al cargar propiedades:", error);
  }
}


// ==========================
//  NAVEGAR A DETALLE
// ==========================
window.verDetalle = function (id) {
  window.location.href = `detalle.html?id=${id}`;
};

// Ejecutar carga al abrir página
cargarPropiedades();
//====================================================
// Hacer que el mapa no bloquee el scroll de la página
//====================================================

const mapElement = document.getElementById("map");

mapElement.addEventListener("click", () => {
  mapElement.classList.add("active");
});

mapElement.addEventListener("mouseleave", () => {
  mapElement.classList.remove("active");
});
