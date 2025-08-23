document.addEventListener("DOMContentLoaded", () => {
  // Inicializar mapa (Bogotá por defecto)
  const map = L.map("map").setView([4.60971, -74.08175], 13);

  // Cargar tiles de OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  // Cargar propiedades desde Firestore
  async function cargarPropiedades() {
    try {
      const querySnapshot = await db.collection("propiedades").get();

      querySnapshot.forEach((doc) => {
        const prop = doc.data();

        if (prop.lat && prop.lng) {
          const marker = L.marker([prop.lat, prop.lng]).addTo(map);

          marker.bindPopup(`
            <b>${prop.titulo || "Sin título"}</b><br>
            ${prop.descripcion || "Sin descripción"}<br>
            <b>Precio:</b> $${prop.precio || "N/A"}
          `);
        }
      });
    } catch (error) {
      console.error("Error cargando propiedades:", error);
    }
  }

  cargarPropiedades();
});
