// ✅ filtromapa.js mejorado
document.addEventListener("DOMContentLoaded", () => {
  if (!window.map) {
    console.warn("filtromapa.js: 'map' aún no existe en window. Verifica el orden de los scripts.");
  }
  if (!Array.isArray(window.propiedades)) {
    console.warn("filtromapa.js: 'propiedades' aún no existe o no es array.");
    window.propiedades = window.propiedades || [];
  }

  const LAT_INICIAL = 3.4516;
  const LNG_INICIAL = -76.5320;
  const ZOOM_INICIAL = 13;

  // 🔴 Icono por defecto
  const defaultIcon = L.icon({
    iconUrl: "img/default.png", // 👈 asegúrate de tener este archivo
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  // 🔴 Icono para propiedades destacadas
  const customIcon = L.divIcon({
    className: "custom-marker",
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
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });

  // Capa exclusiva para resaltados
  if (!window.highlightLayer) {
    window.highlightLayer = L.layerGroup().addTo(map);
  } else {
    window.highlightLayer.clearLayers();
  }

// Render de tarjetas 
function renderTarjetas(items = [], mostrarVacio = false) {
  const cont = document.getElementById("propiedades");
  if (!cont) return;

  // 🔐 forzar a array
  if (!Array.isArray(items)) {
    console.warn("renderTarjetas recibió algo que no es array:", items);
    items = [];
  }

  cont.innerHTML = "";

  if (!items.length && mostrarVacio) {
    cont.innerHTML = "<p>No se encontraron propiedades con esos filtros.</p>";
    return;
  }

  items.forEach((prop) => {
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
      <p><strong>Modalidad:</strong> ${prop.modalidad || "N/A"}</p>
      <p><strong>Habitaciones:</strong> ${prop.habitaciones ?? "N/A"}</p>
      <p><strong>Baños:</strong> ${prop.banos ?? "N/A"}</p>
      <p><strong>Estado:</strong> ${prop.activa ? "Activa ✅" : "Inactiva ❌"}</p>
      <button style="margin-top:6px;" onclick="verDetalle('${prop.id}')">Ver detalles</button>
    `;
    cont.appendChild(card);
  });
}

  // Dibujar marcadores de búsqueda
  function pintarDestacados(items) {
    if (!window.highlightLayer) return;
    if (!Array.isArray(items)) {
      console.warn("pintarDestacados recibió algo que no es array:", items);
      return;
    }

    window.highlightLayer.clearLayers();

    items.forEach((prop) => {
      if (typeof prop.lat !== "number" || typeof prop.lng !== "number") return;

      const marker = L.marker([prop.lat, prop.lng], { icon: customIcon || defaultIcon }).bindPopup(`
        <div style="text-align:center; width:180px;">
          <img src="${prop.imagen || "https://via.placeholder.com/160x110"}"
               alt="img"
               style="width:160px;height:110px;object-fit:cover;border-radius:8px;margin-bottom:6px;">
          <h4 style="margin:4px 0;font-size:14px;">${prop.titulo || "Propiedad"}</h4>
          <p style="margin:2px 0;font-size:13px;"><b>Precio:</b> $${prop.precio ? Number(prop.precio).toLocaleString() : "N/A"}</p>
          <p style="margin:2px 0;font-size:12px;"><b>Tipo:</b> ${prop.tipo || "N/A"}</p>
          <p style="margin:2px 0;font-size:12px;"><b>Estado:</b> ${prop.activa ? "Activa ✅" : "Inactiva ❌"}</p>
          <button style="margin-top:6px;" onclick="verDetalle('${prop.id}')">Ver detalles</button>
        </div>
      `);

      window.highlightLayer.addLayer(marker);
    });
  }

  // 🔎 Aplicar filtros
  function aplicarFiltros() {
    const tipoVal   = (document.getElementById("tipo")?.value || "").toLowerCase().trim();
    const precioMin = parseFloat(document.getElementById("precioMin")?.value) || 0;
    const precioMax = parseFloat(document.getElementById("precioMax")?.value) || Infinity;
    const ciudadVal = (document.getElementById("ciudad")?.value || "").toLowerCase().trim();
    const estadoVal = (document.getElementById("estado")?.value || "todas").toLowerCase();

    const filtradas = (Array.isArray(window.propiedades) ? window.propiedades : []).filter((prop) => {
      const pTipo   = (prop.tipo || "").toLowerCase();
      const pCiudad = (prop.ciudad || "").toLowerCase();
      const pPrecio = Number(prop.precio) || 0;
      const pEstado = prop.activa ? "activa" : "inactiva";

      const okTipo   = tipoVal ? pTipo === tipoVal : true;
      const okPrecio = pPrecio >= precioMin && pPrecio <= precioMax;
      const okCiudad = ciudadVal ? pCiudad.includes(ciudadVal) : true;
      const okEstado = estadoVal === "todas" ? true : pEstado === estadoVal;

      return okTipo && okPrecio && okCiudad && okEstado;
    });

    pintarDestacados(filtradas);
    renderTarjetas(filtradas, true);

    if (filtradas.length && typeof filtradas[0].lat === "number" && typeof filtradas[0].lng === "number") {
      map.setView([filtradas[0].lat, filtradas[0].lng], 14);
    }
  }

  // ♻️ Quitar filtros
  function quitarFiltros() {
    window.highlightLayer?.clearLayers();
    renderTarjetas(window.propiedades, false);

    const ids = ["tipo", "precioMin", "precioMax", "ciudad", "estado"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = id === "estado" ? "todas" : "";
    });

    if (window.map) {
      map.setView([LAT_INICIAL, LNG_INICIAL], ZOOM_INICIAL);
    }
  }

  // Eventos
  document.getElementById("buscarBtn")?.addEventListener("click", aplicarFiltros);
  document.getElementById("resetBtn")?.addEventListener("click", quitarFiltros);

  // Carga inicial
  renderTarjetas(window.propiedades, false);
});
