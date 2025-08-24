document.addEventListener("DOMContentLoaded", () => { 
  // Inicializar mapa (Bogotá por defecto)
  const map = L.map("map").setView([3.4516, -76.5320], 13);

  // Cargar tiles de OpenStreetMap
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(map);

  // ==========================
  // ICONOS PERSONALIZADOS
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

  // ==========================
  // FUNCIÓN PARA ELEGIR ÍCONO
  // ==========================
  function getIconByTipo(tipo) {
    if (!tipo) return iconCasa;
    const t = tipo.toLowerCase();
    if (t === "casa") return iconCasa;
    if (t === "apartamento" || t === "departamento") return iconApartamento;
    if (t === "lote") return iconLote;
    if (t === "finca") return iconFinca;
    return iconCasa;
  }

  // ==========================
  // FILTRO DE BUSQUEDA
  // ==========================
  document.getElementById("buscarBtn").addEventListener("click", () => {
    const tipo = document.getElementById("tipo").value.toLowerCase();
    const precioMin = parseInt(document.getElementById("precioMin").value) || 0;
    const precioMax = parseInt(document.getElementById("precioMax").value) || Infinity;
    const ciudad = document.getElementById("ciudad").value.toLowerCase();

    // Filtrar propiedades
    const filtradas = propiedades.filter(prop => {
      const cumpleTipo = tipo ? prop.tipo.toLowerCase() === tipo : true;
      const cumplePrecio = prop.precio >= precioMin && prop.precio <= precioMax;
      const cumpleCiudad = ciudad ? prop.ciudad.toLowerCase().includes(ciudad) : true;

      return cumpleTipo && cumplePrecio && cumpleCiudad;
    });

    mostrarPropiedades(filtradas); // 👈 Mostrar solo las filtradas
  });

  // ==========================
  // CARGAR PROPIEDADES FIRESTORE
  // ==========================
  async function cargarPropiedades() {
    try {
      const querySnapshot = await db.collection("propiedades").get();

      querySnapshot.forEach((doc) => {
        const prop = doc.data();

        if (prop.lat && prop.lng) {
          // 🔹 MARCADORES CON SU ICONO SEGÚN EL TIPO
          const marker = L.marker([prop.lat, prop.lng], { icon: getIconByTipo(prop.tipo) }).addTo(map);

          // 🔹 POPUP BLANCO (solo el ícono lleva color)
          marker.bindPopup(`
            <div style="text-align:center; width:180px;">
              <img src="${prop.imagen || "https://via.placeholder.com/100"}" 
                   alt="img" 
                   style="width:100px;height:80px;object-fit:cover;border-radius:6px;margin-bottom:5px;">
              <h4 style="margin:4px 0;font-size:14px;">${prop.titulo || "Sin título"}</h4>
              <p><b>Tipo:</b> ${prop.tipo || "N/A"}</p>
              <p><b>Precio:</b> $${prop.precio || "N/A"}</p>
              <button style="margin-top:5px;" onclick="verDetalle('${doc.id}')">Ver detalles</button>

            </div>
          `);
        }
      });
    } catch (error) {
      console.error("Error cargando propiedades:", error);
    }
  }

  // ==========================
//  NAVEGAR A DETALLE
// ==========================
window.verDetalle = function (id) {
  window.location.href = `detalle.html?id=${id}`;
};
  cargarPropiedades();

});
