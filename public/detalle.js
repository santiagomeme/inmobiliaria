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

// Cargar detalle desde Firestore
firebase.firestore().collection("propiedades").doc(propiedadId).get()
  .then((doc) => {
    if (doc.exists) {
      const propiedad = doc.data();

      // Galería de imágenes (slider)
      const imagenesHTML = (propiedad.imagenes || [])
        .map((img, index) => `
          <div class="slide ${index === 0 ? "active" : ""}">
            <img src="${img}" alt="Imagen de la propiedad">
          </div>
        `)
        .join("");

      // Renderizar detalle
      detalleContainer.innerHTML = `
        <div class="detalle-card">
          <h2>${propiedad.titulo}</h2>
          <div class="detalle-galeria slider">
            ${imagenesHTML}
            ${propiedad.imagenes && propiedad.imagenes.length > 1 ? `
              <button class="prev">⬅</button>
              <button class="next">➡</button>
            ` : ""}
          </div>
          <div class="detalle-info">
            <p><strong>Precio:</strong> $${propiedad.precio || "N/A"}</p>
            <p><strong>Ciudad:</strong> ${propiedad.ciudad || "N/A"}</p>
            <p><strong>Dirección:</strong> ${propiedad.direccion || "No especificada"}</p>
            <p><strong>Tipo:</strong> ${propiedad.tipo || "N/A"}</p>
            <p><strong>Descripción:</strong> ${propiedad.descripcion || "Sin descripción"}</p>
            <p><strong>Habitaciones:</strong> ${propiedad.habitaciones || "-"}</p>
            <p><strong>Baños:</strong> ${propiedad.banos || "-"}</p>
          </div>
          <div id="map" class="detalle-mapa"></div>
          <button id="btnVolver">⬅ Volver</button>
        </div>
      `;

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
