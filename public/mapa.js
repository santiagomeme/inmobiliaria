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
//  FORMATEAR PRECIO
// ==========================
function formatearPrecio(valor) {
  if (!valor) return "";
  return valor.toLocaleString("es-CO"); // 👉 2.500.000
}



// ==========================
// ICONOS POR TIPO
// ==========================
// Iconos que coinciden con la leyenda
const iconCasa          = crearIcono("goldenrod", "fas fa-home");
const iconApartamento   = crearIcono("dodgerblue", "fas fa-building");
const iconLote          = crearIcono("darkorange", "fas fa-border-all");
const iconFinca         = crearIcono("green", "fas fa-tractor");
const iconApartaestudio = crearIcono("hotpink", "fas fa-door-open");
const iconBodega        = crearIcono("gray", "fas fa-warehouse");
const iconCampestre     = crearIcono("darkgreen", "fas fa-tree");
const iconCondominio    = crearIcono("lightseagreen", "fas fa-city"); // 👈 mismo que en la leyenda
const iconDuplex        = crearIcono("saddlebrown", "fas fa-house-user"); // 👈 igual al de la leyenda
const iconEdificio      = crearIcono("black", "fas fa-hotel"); // o usa fa-building si prefieres
const iconLocal         = crearIcono("crimson", "fas fa-store");
const iconHotel         = crearIcono("darkred", "fas fa-concierge-bell"); // igual que en leyenda
const iconOficina       = crearIcono("violet", "fas fa-briefcase");
const iconPenthouse     = crearIcono("gold", "fas fa-crown");

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
    lista.innerHTML = ""; // Limpiar contenedor

    snapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      
      // Ya no filtramos por activa, mostramos todas
      propiedades.push(data);

      const card = document.createElement("div");
      card.classList.add("prop-card");

      // obtenemos estilo (icono + color)
      const { icono, color } = getEstiloByTipo(data.tipo);

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
        <span class="prop-badge ${data.activa ? "badge-activa" : "badge-inactiva"}">
        ${data.activa ? "Activa" : "Inactiva"}
        </span>

        </div>

        <p>${data.ciudad || ""}</p>
        <p><i class="fas fa-car"></i> <span class="prop-valor">${data.garage || 0}</span></p>
        <p><strong>Área:</strong> <span class="prop-valor">${data.area || 0} m²</span></p>
        <p><strong>Baños:</strong> <span class="prop-valor">${data.banos || 0}</span></p>
        <p><strong>Habitaciones:</strong> <span class="prop-valor">${data.habitaciones || 0}</span></p>

        <div class="precio-container">
          ${data.destacada ? `<span class="badge-destacada"><i class="fas fa-star"></i> Destacada</span>` : ""}
          <p class="prop-precio">COP $${formatearPrecio(data.precio) || "$0"}</p>
        </div>

        <button onclick="verDetalle('${doc.id}')">Ver detalles</button>
      `;

      lista.appendChild(card);

      // Crear marcador en el mapa
      if (data.lat && data.lng) {
        const marker = L.marker([data.lat, data.lng], { icon: icono }).addTo(markersLayer);
        marker.bindPopup(`
          <div style="text-align:center; width:160px; font-family:sans-serif;">
            <img src="${
              (data.imagenes && data.imagenes.length > 0) 
                ? data.imagenes[0] 
                : (data.imagen || "imagenes/default.png")
            }" style="width:100%;border-radius:6px;margin-bottom:4px;">
            <h4 style="margin:4px 0;font-size:14px;font-weight:600;color:#333;">${data.titulo}</h4>
            <p style="margin:2px 0;font-size:13px;color:#2E8B57;font-weight:bold;">${formatearPrecio(data.precio) || "$0"}</p>
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
            <span style="
              display:inline-block;
              margin-top:3px;
              padding:2px 6px;
              border-radius:6px;
              font-size:12px;
              background:${data.activa ? '#2E8B57' : '#B22222'};
              color:#fff;
              font-weight:bold;
              white-space:nowrap;">
              ${data.activa ? 'Activa' : 'Inactiva'}
            </span>
            <br>
            <button style="
              margin-top:6px;
              padding:4px 8px;
              border:none;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
              border-radius:6px;
              background:#fff;
              color:#000000;
              font-size:12px;
              font-weight:bold;
              transition: background 0.2s ease;
              cursor:pointer;" onclick="verDetalle('${doc.id}')">
              Ver detalles
            </button>
          </div>
        `);
      }
    });// ✅ Llamar a estadísticas ya con todas las propiedades cargadas
renderEstadisticas(propiedades);



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


const overlay = document.getElementById("mapOverlay");
const toggleBtn = document.getElementById("toggleMap");
let mapActivo = false;

function bloquearMapa() {
  overlay.style.display = "block";
  toggleBtn.textContent = "🔓 Activar mapa";
  mapActivo = false;
}

function activarMapa() {
  overlay.style.display = "none";
  toggleBtn.textContent = "🔒 Salir del mapa";
  mapActivo = true;
}

toggleBtn.addEventListener("click", () => {
  if (mapActivo) {
    bloquearMapa();
  } else {
    activarMapa();
  }
});

// Estado inicial bloqueado
bloquearMapa();
