// =============================
// detalle.js
// =============================

// Obtener el ID de la propiedad desde la URL
const params = new URLSearchParams(window.location.search);
const propiedadId = params.get("id");

// Contenedor de detalle
const detalleContainer = document.getElementById("detalleContainer");

// Cargar detalle de la propiedad desde Firestore
firebase.firestore().collection("propiedades").doc(propiedadId).get()
  .then((doc) => {
    if (doc.exists) {
      const propiedad = doc.data();

      detalleContainer.innerHTML = `
        <div class="detalle-card">
          <h2>${propiedad.titulo}</h2>
          <img src="${propiedad.imagen}" alt="Imagen de la propiedad" class="detalle-imagen">
          <div class="detalle-info">
            <p><strong>Precio:</strong> $${propiedad.precio}</p>
            <p><strong>Ciudad:</strong> ${propiedad.ciudad || "N/A"}</p>
            <p><strong>Dirección:</strong> ${propiedad.direccion || "No especificada"}</p>
            <p><strong>Tipo:</strong> ${propiedad.tipo || "N/A"}</p>
            <p><strong>Descripción:</strong> ${propiedad.descripcion || "Sin descripción"}</p>
          </div>
          <div id="map" class="detalle-mapa"></div>
        </div>
      `;

      // Mostrar mapa con Leaflet si tiene coordenadas
      if (propiedad.lat && propiedad.lng) {
        const map = L.map("map").setView([propiedad.lat, propiedad.lng], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        L.marker([propiedad.lat, propiedad.lng]).addTo(map)
          .bindPopup(propiedad.titulo)
          .openPopup();
      }
    } else {
      detalleContainer.innerHTML = `<p>Propiedad no encontrada.</p>`;
    }
  })
  .catch((error) => {
    console.error("Error cargando la propiedad:", error);
    detalleContainer.innerHTML = `<p>Error al cargar la propiedad.</p>`;
  });
