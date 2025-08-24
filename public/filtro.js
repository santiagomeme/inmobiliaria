// ✅ filtro.js
document.addEventListener("DOMContentLoaded", () => {
  // Chequeos suaves (no rompen la app si aún no cargó todo)
  if (!window.map) {
    console.warn("filtro.js: 'map' aún no existe en window. Verifica el orden de los scripts.");
  }
  if (!Array.isArray(window.propiedades)) {
    console.warn("filtro.js: 'propiedades' aún no existe o no es array. Se espera que propiedades.js lo inicialice.");
    window.propiedades = window.propiedades || []; // evita crash
  }

  // 📌 Coordenadas iniciales (tu vista por defecto: Cali)
  const LAT_INICIAL = 3.4516;
  const LNG_INICIAL = -76.5320;
  const ZOOM_INICIAL = 13;

// 🔴 Ejemplo con ícono cuadrado y texto "Búsqueda"
const customIcon = L.divIcon({
  className: "custom-marker", // clase para estilos CSS
  html: `
    <div style="
      background:#e63946;
      color:white;
      padding:4px 6px;
      border-radius:6px;
      font-size:12px;
      text-align:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    ">
      🔍<br><small>Búsqueda</small>
    </div>
  `,
  iconSize: [40, 40],  // tamaño del contenedor
  iconAnchor: [20, 40], // anclaje (punta abajo)
  popupAnchor: [0, -40] // posición del popup
});


  // 🧱 Capa exclusiva para marcadores destacados (NO toca los normales)
  if (!window.highlightLayer) {
    window.highlightLayer = L.layerGroup().addTo(map);
  } else {
    window.highlightLayer.clearLayers();
  }

  // 🖼️ Render de tarjetas en el listado
  //  items = arreglo de propiedades
  //  mostrarVacio = si true y no hay items, muestra el mensaje "no se encontraron..."
  function renderTarjetas(items = [], mostrarVacio = false) {
    const cont = document.getElementById("propiedades");
    if (!cont) return;
    cont.innerHTML = "";

    const arr = Array.isArray(items) ? items : [];

    if (arr.length === 0) {
      if (mostrarVacio) {
        cont.innerHTML = "<p>No se encontraron propiedades con esos filtros.</p>";
      }
      return;
    }

    arr.forEach((prop) => {
      const card = document.createElement("div");
      card.className = "prop-card";
      card.innerHTML = `
        <img src="${prop.imagen || "https://via.placeholder.com/300x200"}"
             alt="img"
             style="width:100%;height:auto;object-fit:cover;border-radius:8px;">
        <h3>${prop.titulo || "Propiedad"}</h3>
        <p><strong>Ciudad:</strong> ${prop.ciudad || "N/A"}</p>
        <p><strong>Precio:</strong> $${prop.precio ? Number(prop.precio).toLocaleString() : "N/A"}</p>
        <p><strong>Tipo:</strong> ${prop.tipo || "N/A"}</p>
        <button style="margin-top:6px;" onclick="verDetalle('${prop.id}')">Ver detalles</button>
      `;
      cont.appendChild(card);
    });
  }

  // 📍 Dibuja SOLO los destacados (deja intactos los marcadores normales de propiedades.js)
  function pintarDestacados(items) {
    if (!window.highlightLayer) return;
    window.highlightLayer.clearLayers();

    const arr = Array.isArray(items) ? items : [];
    arr.forEach((prop) => {
      if (prop.lat == null || prop.lng == null) return;

const marker = L.marker([prop.lat, prop.lng], { icon: customIcon }).bindPopup(`
        <div style="text-align:center; width:180px;">
          <img src="${prop.imagen || "https://via.placeholder.com/160x110"}"
               alt="img"
               style="width:160px;height:110px;object-fit:cover;border-radius:8px;margin-bottom:6px;">
          <h4 style="margin:4px 0;font-size:14px;">${prop.titulo || "Propiedad"}</h4>
          <p style="margin:2px 0;font-size:13px;"><b>Precio:</b> $${prop.precio ? Number(prop.precio).toLocaleString() : "N/A"}</p>
          <p style="margin:2px 0;font-size:12px;"><b>Tipo:</b> ${prop.tipo || "N/A"}</p>
          <button style="margin-top:6px;" onclick="verDetalle('${prop.id}')">Ver detalles</button>
        </div>
      `);

      window.highlightLayer.addLayer(marker);
    });
  }

  // 🔎 Aplica filtros
  function aplicarFiltros() {
    const tipoVal   = (document.getElementById("tipo")?.value || "").toLowerCase().trim();
    const precioMin = parseFloat(document.getElementById("precioMin")?.value) || 0;
    const precioMax = parseFloat(document.getElementById("precioMax")?.value) || Infinity;
    const ciudadVal = (document.getElementById("ciudad")?.value || "").toLowerCase().trim();

    const filtradas = (window.propiedades || []).filter((prop) => {
      const pTipo   = (prop.tipo || "").toLowerCase();
      const pCiudad = (prop.ciudad || "").toLowerCase();
      const pPrecio = Number(prop.precio) || 0;

      const okTipo   = tipoVal ? pTipo === tipoVal : true;
      const okPrecio = pPrecio >= precioMin && pPrecio <= precioMax;
      const okCiudad = ciudadVal ? pCiudad.includes(ciudadVal) : true;

      return okTipo && okPrecio && okCiudad;
    });

    // 1) Solo “chulos” en coincidencias (no tocamos los marcadores normales)
    pintarDestacados(filtradas);

    // 2) En el listado mostramos SOLO las filtradas (si no hay, mostramos mensaje)
    renderTarjetas(filtradas, true);

    // 3) (Opcional) Centrar el mapa en la primera coincidencia
    if (filtradas.length && filtradas[0].lat != null && filtradas[0].lng != null) {
      map.setView([filtradas[0].lat, filtradas[0].lng], 14);
    }
  }

  // ♻️ Quitar filtros: borra chulos, muestra todas, y recentra
  function quitarFiltros() {
    window.highlightLayer?.clearLayers();
    renderTarjetas(window.propiedades, false);

    const ids = ["tipo", "precioMin", "precioMax", "ciudad"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    // Recentrar a la vista inicial
    if (window.map) {
      map.setView([LAT_INICIAL, LNG_INICIAL], ZOOM_INICIAL);
    }
  }

  // 🔘 Eventos
  document.getElementById("buscarBtn")?.addEventListener("click", aplicarFiltros);
  document.getElementById("resetBtn")?.addEventListener("click", quitarFiltros);

  // Carga inicial: mostrar todas SIN mensaje de vacío
  renderTarjetas(window.propiedades, false);
});
