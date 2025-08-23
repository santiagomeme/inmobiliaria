// ==========================
//  LISTADO DE PROPIEDADES + MAPA
// ==========================

// Contenedor HTML de las tarjetas
const lista = document.getElementById("propiedades");

// Inicializar mapa Leaflet centrado en Colombia
const map = L.map("map").setView([4.60971, -74.08175], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap"
}).addTo(map);

// ==========================
//  ICONOS POR TIPO DE PROPIEDAD
// ==========================
const iconCasa = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconApartamento = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconLote = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Función que devuelve el ícono según el tipo
function getIconByTipo(tipo) {
  if (!tipo) return iconCasa; // default
  const t = tipo.toLowerCase();
  if (t === "casa") return iconCasa;
  if (t === "apartamento") return iconApartamento;
  if (t === "lote" || t === "finca") return iconLote;
  return iconCasa; // fallback
}

// ==========================
//  CARGAR PROPIEDADES DE FIRESTORE
// ==========================
async function cargarPropiedades() {
  try {
    const snapshot = await db.collection("propiedades").get();

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Crear tarjeta en la lista
      const card = document.createElement("div");
      card.classList.add("prop-card");
      card.innerHTML = `
        <h3>${data.titulo}</h3>
        <p>${data.descripcion || "Sin descripción"}</p>
        <p><strong>Ciudad:</strong> ${data.ciudad || "N/A"}</p>
        <p><strong>Precio:</strong> $${data.precio || "0"}</p>
        <button onclick="verDetalle('${doc.id}')">Ver detalles</button>
      `;
      lista.appendChild(card);

      // Crear marcador en el mapa
      if (data.lat && data.lng) {
        const marker = L.marker([data.lat, data.lng], { icon: getIconByTipo(data.tipo) }).addTo(map);

        marker.bindPopup(`
          <b>${data.titulo}</b><br>
          ${data.ciudad || ""}<br>
          <button onclick="verDetalle('${doc.id}')">Ver detalles</button>
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
