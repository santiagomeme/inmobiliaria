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

        
          <!-- Galería -->
          <div class="detalle-galeria slider">
            ${imagenesHTML}
            ${propiedad.propiedadNueva ? `<span class="badge-nueva">NUEVA</span>` : ""}
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

     <p><strong>Código:</strong> <span class="prop-valor">${propiedad.codigo || "N/A"}</span></p>

          <!-- Datos clave -->
<div class="prop-icons">
            <p><i class="fas fa-ruler-combined"></i> <span class="prop-valor">${propiedad.metros || "-"} m²</span></p>
            <p><i class="fas fa-bed"></i> <span class="prop-valor">${propiedad.habitaciones || "-"}</span></p>
            <p><i class="fas fa-bath"></i> <span class="prop-valor">${propiedad.banos || "-"}</span></p>
            <p><i class="fas fa-car"></i> <span class="prop-valor">${propiedad.garajes || "-"}</span></p>
          </div>

  <!-- 🔹 Nuevos campos -->
  <p><strong>Piso:</strong> <span class="prop-valor">${propiedad.piso || "N/A"}</span></p>
  <p><strong>Estrato:</strong> <span class="prop-valor">${propiedad.estrato || "N/A"}</span></p>
  <p><strong>País:</strong> <span class="prop-valor">${propiedad.pais || "N/A"}</span></p>
  <p><strong>Departamento:</strong> <span class="prop-valor">${propiedad.departamento || "N/A"}</span></p>

  <!-- Ubicación -->
          <p><strong>Ciudad:</strong> ${propiedad.ciudad || "N/A"}</p>
          <p><strong>Dirección:</strong> ${propiedad.direccion || "No especificada"}</p>

          <!-- Descripción -->
          <p class="descripcion"><strong>Descripción:</strong><br> ${propiedad.descripcion || "Sin descripción"}</p>
 


<!-- 🔹 Características internas -->
${propiedad.internas && propiedad.internas.length > 0 ? `
  <div class="detalle-caracteristicas">
    <h3>Características internas</h3>
    <ul>
      ${propiedad.internas.map(c => `<li>${c}</li>`).join("")}
    </ul>
  </div>
` : ""}

<!-- 🔹 Características externas -->
${propiedad.externas && propiedad.externas.length > 0 ? `
  <div class="detalle-caracteristicas">
    <h3>Características externas</h3>
    <ul>
      ${propiedad.externas.map(c => `<li>${c}</li>`).join("")}
    </ul>
  </div>
` : ""}
  </div>
              <!-- Precio -->
       <div class="precio-container">
         ${propiedad.destacada ? `<span class="badge-destacada"><i class="fas fa-star"></i> Destacada</span>` : ""}
       <p class="prop-precio">COP $${propiedad.precio?.toLocaleString() || "N/A"}</p>
        </div>

         <div class="map-container">
  <div id="map" style="height: 400px; width: 100%;"></div>
  <div id="mapOverlay" class="overlay"></div>
  <button id="toggleMap">🔓 Activar mapa</button>
</div>
          <!-- Botón -->
          <button id="btnVolver">⬅ Volver</button>
        </div>
      `;



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
toggleBtn.addEventListener("click", (e) => {
  e.preventDefault(); // evita que dispare un submit
  if (mapActivo) {
    bloquearMapa();
  } else {
    activarMapa();
  }
});


// Estado inicial bloqueado
bloquearMapa();


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


