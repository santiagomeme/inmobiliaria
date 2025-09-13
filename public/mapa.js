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
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
const iconFinca = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconApartaestudio = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-pink.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconBodega = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconCampestre = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-darkgreen.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconCondominio = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-lightblue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconDuplex = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-brown.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconEdificio = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconLocal = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconHotel = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-darkred.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconOficina = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconPenthouse = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Función que devuelve el ícono según el tipo
function getIconByTipo(tipo) {
  if (!tipo) return iconCasa;
  const t = tipo.toLowerCase();
  if (t === "casa") return iconCasa;
  if (t === "apartamento" || t === "departamento") return iconApartamento;
  if (t === "lote") return iconLote;
  if (t === "finca") return iconFinca;
  if (t === "apartaestudio") return iconApartaestudio;
  if (t === "bodega") return iconBodega;
  if (t === "campestre") return iconCampestre;
  if (t === "duplex") return iconDuplex;
  if (t === "edificio") return iconEdificio;
  if (t === "local") return iconLocal;
  if (t === "oficina") return iconOficina;
  if (t === "hotel") return iconHotel;
  if (t === "penthouse") return iconPenthouse;

}

const iconoActivo = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconoInactivo = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});



// ==========================
//  CARGAR PROPIEDADES DE FIRESTORE
// ==========================
async function cargarPropiedades() {
  try {
    const snapshot = await db.collection("propiedades").get();
    propiedades = []; // Reiniciar array antes de volver a llenarlo

    snapshot.forEach((doc) => {
  const data = { id: doc.id, ...doc.data() }; // guardar id también
       
  
  propiedades.push(data); // 👈 guardar en el array

      // Crear tarjeta en la lista
      const card = document.createElement("div");
      card.classList.add("prop-card");
      card.innerHTML = `
       <img src="${data.imagen || "https://via.placeholder.com/160x110"}"
          alt="img"style="width:160px;height:110px;object-fit:cover;border-radius:8px;margin:0 auto;bottom:10px">
        <h3>${data.titulo}</h3>
        <p>${data.descripcion || "Sin descripción"}</p>
        <p><strong>Ciudad:</strong> ${data.ciudad || "N/A"}</p>
        <p><strong>Precio:</strong> $${data.precio || "0"}</p>
        <p style="margin:2px 0;font-size:12px;"><b>Tipo:</b> ${data.tipo || "N/A"}</p>
        <button onclick="verDetalle('${doc.id}')">Ver detalles</button>
      `;
      lista.appendChild(card);

      // Crear marcador en el mapa con icono por tipo
      if (data.lat && data.lng) {
        const marker = L.marker([data.lat, data.lng], { icon: getIconByTipo(data.tipo) }).addTo(map);

        // Popup personalizado (imagen, título, precio, tipo)
        marker.bindPopup(`
          <div style="text-align:center; width:150px;">
            <img src="${data.imagen || "https://via.placeholder.com/100"}" alt="img" style="width:100px;height:80px;object-fit:cover;border-radius:6px;margin-bottom:5px;">
            <h4 style="margin:4px 0;font-size:14px;">${data.titulo}</h4>
            <p style="margin:2px 0;font-size:13px;"><b>Precio:</b> $${data.precio || "N/A"}</p>
            <p style="margin:2px 0;font-size:12px;"><b>Tipo:</b> ${data.tipo || "N/A"}</p>
            <button style="margin-top:5px;" onclick="verDetalle('${doc.id}')">Ver detalles</button>
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
