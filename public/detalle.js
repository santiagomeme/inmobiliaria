// =============================
// detalle.js completo con slider + mapa
// =============================

// Obtener el ID de la propiedad desde la URL
const params = new URLSearchParams(window.location.search);
const propiedadId = params.get("id");

// Contenedor de detalle
const detalleContainer = document.getElementById("detalleContainer");

// Mostrar loader inicial
detalleContainer.innerHTML = `<p class="loading">Cargando detalles...</p>`;
// Definir estilosPorTipo aquí también (o importarlo si usas módulos)
// =============================
// detalle.js completo con slider + mapa
// =============================

// Definir estilosPorTipo aquí también (o importarlo si usas módulos)
const estilosPorTipo = {
  "casa":        { color: "goldenrod" },
  "apartamento": { color: "dodgerblue" },
  "lote":        { color: "darkorange" },
  "finca":       { color: "green" },
  "apartaestudio": { color: "hotpink" },
  "bodega":      { color: "grey" },
  "campestre":   { color: "darkgreen" },
  "condominio":  { color: "steelblue" },
  "duplex":      { color: "saddlebrown" },
  "edificio":    { color: "black" },
  "local":       { color: "red" },
  "hotel":       { color: "darkred" },
  "oficina":     { color: "purple" },
  "penthouse":   { color: "goldenrod" }
};

// ...

firebase.firestore().collection("propiedades").doc(propiedadId).get()
  .then((doc) => {
    if (doc.exists) {
      const propiedad = doc.data();

      // Obtener color dinámico según el tipo
      const tipoKey = propiedad.tipo?.toLowerCase();
      const color = estilosPorTipo[tipoKey]?.color || "#003264";

      // Galería de imágenes (slider)
      const imagenesHTML = (propiedad.imagenes || [])
        .map((img, index) => `
          <div class="slide ${index === 0 ? "active" : ""}">
            <img src="${img}" alt="Imagen de la propiedad">
          </div>
        `)
        .join("");

      detalleContainer.innerHTML = `
        <div class="detalle-card">

          <!-- Banner NUEVA -->
          ${propiedad.propiedadNueva ? `<span class="badge-nueva">NUEVA</span>` : ""}

          <!-- Galería -->
          <div class="detalle-galeria slider">
            ${imagenesHTML}
            ${propiedad.imagenes && propiedad.imagenes.length > 1 ? `
              <button class="prev">⬅</button>
              <button class="next">➡</button>
            ` : ""}
          </div>

          <h2>${propiedad.titulo}</h2>

          <!-- Badges -->
          <div class="prop-badges">
            <span class="prop-tipo" style="background:${color}">
              ${propiedad.tipo || ""}
            </span>
            <span class="prop-badge">${propiedad.modalidad || "N/A"}</span>
            <span class="prop-badge">${propiedad.estado || "N/A"}</span>
          </div>

          <!-- Precio -->
          <p class="prop-precio">$${propiedad.precio?.toLocaleString() || "N/A"}</p>

          <!-- Datos clave -->
          <div class="detalle-datos">
            <p><strong>Área:</strong> <span class="prop-valor">${propiedad.metros || "-"} m²</span></p>
            <p><strong>Habitaciones:</strong> <span class="prop-valor">${propiedad.habitaciones || "-"}</span></p>
            <p><strong>Baños:</strong> <span class="prop-valor">${propiedad.banos || "-"}</span></p>
            <p><strong>Garajes:</strong> <span class="prop-valor">${propiedad.garajes || "-"}</span></p>
            <p><strong>Estrato:</strong> <span class="prop-valor">${propiedad.estrato || "-"}</span></p>
          </div>

          <!-- Ubicación -->
          <p><strong>Ciudad:</strong> ${propiedad.ciudad || "N/A"}</p>
          <p><strong>Dirección:</strong> ${propiedad.direccion || "No especificada"}</p>

          <!-- Descripción -->
          <p class="descripcion"><strong>Descripción:</strong><br> ${propiedad.descripcion || "Sin descripción"}</p>

          <!-- Mapa -->
          <div id="map" class="detalle-mapa"></div>

          <!-- Botón -->
          <button id="btnVolver">⬅ Volver</button>
        </div>
      `;

      // Resto del slider + mapa + volver (tu mismo código)...



      // --- Slider funcional ---
      if (propiedad.imagenes && propiedad.imagenes.length > 1) {
        const slides = document.querySelectorAll(".slide");
        let currentIndex = 0;

        function showSlide(index) {
          slides.forEach((s, i) => {
            s.classList.toggle("active", i === index);
          });
        }

        document.querySelector(".prev").addEventListener("click", () => {
          currentIndex = (currentIndex - 1 + slides.length) % slides.length;
          showSlide(currentIndex);
        });

        document.querySelector(".next").addEventListener("click", () => {
          currentIndex = (currentIndex + 1) % slides.length;
          showSlide(currentIndex);
        });
      }

      // --- Mapa con Leaflet ---
      if (propiedad.lat && propiedad.lng) {
        const map = L.map("map").setView([propiedad.lat, propiedad.lng], 15);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        L.marker([propiedad.lat, propiedad.lng]).addTo(map)
          .bindPopup(propiedad.titulo)
          .openPopup();

        // Ajustar tamaño del mapa cuando cargue
        setTimeout(() => {
          map.invalidateSize();
        }, 300);
      } else {
        document.getElementById("map").innerHTML = `<p class="no-map">📍 Ubicación no disponible</p>`;
      }

      // --- Botón volver ---
      document.getElementById("btnVolver").addEventListener("click", () => {
        window.history.back();
      });

    } else {
      detalleContainer.innerHTML = `<p>❌ Propiedad no encontrada.</p>`;
    }
  })
  .catch((error) => {
    console.error("Error cargando la propiedad:", error);
    detalleContainer.innerHTML = `<p>⚠ Error al cargar la propiedad.</p>`;
  });
