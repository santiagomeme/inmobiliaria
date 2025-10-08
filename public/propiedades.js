

// 🔹 filtro activo (para no romper cuando aún no se ha seleccionado ninguno)

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
// Casa// ==========================
// FUNCION GENERADORA DE ICONOS
// ==========================
function crearIcono(color, iconoFA) {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="
        background:${color};
        border-radius:50%;
        width:34px;
        height:34px;
        display:flex;
        border-radius: 50%!important; 
        align-items:center;
        justify-content:center;
        box-shadow:0 0 4px rgba(0,0,0,0.4);
      ">
        <i class="${iconoFA}" style="color:white; font-size:18px;"></i>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30]
  });
}


// ==========================
//  FORMATEAR PRECIO
// ==========================
function formatearPrecio(valor) {
  if (!valor) return "";
  return valor.toLocaleString("es-CO"); // 👉 2.500.000
}



// ==========================
// ICONOS POR TIPO
// ==========================
// Iconos que coinciden con la leyenda
const iconCasa          = crearIcono("#FFBF00", "fas fa-home");
const iconApartamento   = crearIcono("dodgerblue", "fas fa-building");
const iconLote          = crearIcono("darkorange", "fas fa-border-all");
const iconFinca         = crearIcono("#66FF00", "fas fa-tractor");
const iconApartaestudio = crearIcono("hotpink", "fas fa-door-open");
const iconBodega        = crearIcono("#666633", "fas fa-warehouse");
const iconCampestre     = crearIcono("darkgreen", "fas fa-tree");
const iconCondominio    = crearIcono("lightseagreen", "fas fa-city"); // 👈 mismo que en la leyenda
const iconDuplex        = crearIcono("saddlebrown", "fas fa-house-user"); // 👈 igual al de la leyenda
const iconEdificio      = crearIcono("black", "fas fa-hotel"); // o usa fa-building si prefieres
const iconLocal         = crearIcono("crimson", "fas fa-store");
const iconHotel         = crearIcono("darkred", "fas fa-concierge-bell"); // igual que en leyenda
const iconOficina       = crearIcono("violet", "fas fa-briefcase");
const iconPenthouse     = crearIcono("gold", "fas fa-crown");

// ==========================
// ÍCONO + COLOR POR TIPO DE PROPIEDAD (MAPA CENTRALIZADO)
// ==========================
// ==========================
// ÍCONO + COLOR POR TIPO DE PROPIEDAD (MAPA CENTRALIZADO)
// ==========================


//funcion para no ser sendible a tildes en la casa
function getEstiloByTipo(tipo) {
  if (!tipo) return { icono: iconCasa, color: "#999" };
  const clave = tipo
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita tildes
    .trim();
  return estilosPorTipo[clave] || { icono: iconCasa, color: "#999" };
}

// -------------------------
// Versión limpia sin "activa/inactiva"
// -------------------------
// ===============================
// Cargar propiedades desde Firestore (solo activas)
// ===============================
// ==========================
// CARGAR PROPIEDADES (función completa — reemplaza la anterior)
// ==========================
async function cargarPropiedades() {
  try {
    const snapshot = await db.collection("propiedades").get();

    // 1) Construir array con todas las propiedades (normalizadas)
    const todas = [];
    snapshot.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };

      // Normalizaciones seguras
      data.destacada = !!data.destacada;
      // Considerar que si no viene 'activa' la consideramos activa por defecto
      data.activa = (typeof data.activa === "undefined") ? true : !!data.activa;

      if (data.lat != null) data.lat = Number(data.lat);
      if (data.lng != null) data.lng = Number(data.lng);

      todas.push(data);
    });

    // 2) Guardar global (puede usarse desde otros módulos)
    window.propiedades = todas;

    // 3) Determinar sólo activas (para estadísticas/cards por defecto)
    const activas = todas.filter(p => p.activa !== false);

    // 4) Notificar / inicializar la parte de estadísticas (si existe)
    if (typeof setPropiedades === "function") {
      try { setPropiedades(activas); } catch (e) { console.warn("setPropiedades falló:", e); }
    } else if (typeof renderEstadisticas === "function") {
      try { renderEstadisticas(activas); } catch (e) { console.warn("renderEstadisticas falló:", e); }
    }

    // 4.5) Asegurar variables globales que usa tu módulo de estadísticas
    // (evita redeclarar si ya existen en otro archivo)
    window.propiedadesOriginales = activas;
    window.propiedadesFiltradas = activas;

    // 5) Renderizar cards iniciales (si existe la función de renderizado)
    if (typeof renderCardsEstadisticas === "function") {
      try { renderCardsEstadisticas(activas); } catch (e) { console.warn("renderCardsEstadisticas falló:", e); }
    } else {
      // fallback simple si no existe la función
      const lista = document.getElementById("propiedades");
      if (lista) {
        lista.innerHTML = "";
        activas.forEach(d => {
          const imgSrc = (d.imagenes && d.imagenes.length) ? d.imagenes[0] : (d.imagen || "imagenes/default.png");
          const card = document.createElement("div");
          card.className = "prop-card";
          card.innerHTML = `
            <div class="card-img-wrapper"><img src="${imgSrc}" alt="${(d.titulo||'')}"></div>
            <h3>${d.titulo || ""}</h3>
            <p>${d.tipo || ""}</p>
          `;
          lista.appendChild(card);
        });
      }
    }

    // 6) Preparar layer de marcadores (persistente)
    if (!window.markersLayer || typeof window.markersLayer.clearLayers !== "function") {
      // crear si no existe
      window.markersLayer = L.layerGroup().addTo(window.map || map);
    } else {
      // limpiar contenido previo
      window.markersLayer.clearLayers();
    }

    // Mantener mapa de marcadores por id para poder resaltarlos/abrir popups
    window.markersMap = window.markersMap || {};
    window.markersMap = {}; // reiniciar

    // 7) Añadir marcadores para TODAS las propiedades activas
    activas.forEach(data => {
      if (data.lat == null || data.lng == null) return;

      const estilo = (typeof estilosPorTipo !== "undefined" && estilosPorTipo[(data.tipo || "").toLowerCase()]) 
                      || { color: "#999", icono: "fa-solid fa-house" };

      const iconoClass = estilo.icono || "fa-solid fa-house";
      const icon = crearIcono(estilo.color || "#999", iconoClass);

      const marker = L.marker([data.lat, data.lng], { icon: icon });

      const imgPopup = (data.imagenes && data.imagenes.length) ? data.imagenes[0] : (data.imagen || "imagenes/default.png");
      const safeTitulo = String(data.titulo || "").replace(/"/g, "&quot;");
      const safeTipo = String(data.tipo || "");
      const safePrecio = formatearPrecio(data.precio) || "0";

      const popupHtml = `
        <div style="text-align:center; width:180px;">
          <img src="${imgPopup}" style="width:100%;border-radius:6px;margin-bottom:6px;">
          <h4 style="margin:4px 0;font-size:14px;">${safeTitulo}</h4>
          <p style="font-weight:bold;color:#2E8B57;">COP $${safePrecio}</p>
          <span style="background:${estilo.color}; color:#fff; padding:4px 6px; border-radius:6px; font-size:12px;">${safeTipo}</span>
          <br><button style="margin-top:6px;padding:6px 8px;border-radius:6px;" onclick="verDetalle('${data.id}')">Ver detalles</button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // guardar referencia para futuras operaciones de resaltado
      marker._propId = data.id;
      window.markersMap[data.id] = marker;

      // añadir al layer (visible en el mapa)
      window.markersLayer.addLayer(marker);
    });

    // 8) Centrar / ajustar mapa para mostrar resultados (si hay)
    const coords = activas
      .filter(p => p.lat != null && p.lng != null)
      .map(p => [p.lat, p.lng]);

    if (coords.length) {
      try {
        if (coords.length === 1) {
          (window.map || map).setView(coords[0], 13);
        } else {
          (window.map || map).fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
        }
      } catch (e) { /* ignorar si map no está listo */ }
    }

    // 9) Emitir evento para que otros scripts puedan reaccionar
    window.dispatchEvent(new CustomEvent("propiedades:loaded", { detail: { todas, activas } }));

    // pequeña corrección visual (si hace falta) para Leaflet
    if (window.map && typeof window.map.invalidateSize === "function") {
      setTimeout(() => window.map.invalidateSize(), 150);
    }

  } catch (error) {
    console.error("Error al cargar propiedades:", error);
  }
}

// ==========================
//  aca termina cargarPropiedades
// ==========================




// ==========================
//  FUNCIONES PARA FILTROS
// ==========================
// 🔹 filtro activo (objeto global único, evita redeclaraciones)
window.filtroActivo = window.filtroActivo || {};

function aplicarFiltroTipo(tipo) {
  filtroActivo = { tipo: tipo.toLowerCase() };
  cargarPropiedades();
}

function aplicarFiltroDestacadas() {
  filtroActivo = { destacada: true };
  cargarPropiedades();
}

function resetFiltros() {
  filtroActivo = {};
  cargarPropiedades();
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

toggleBtn.addEventListener("click", () => {
  if (mapActivo) {
    bloquearMapa();
  } else {
    activarMapa();
  }
});

// Estado inicial bloqueado
bloquearMapa();
