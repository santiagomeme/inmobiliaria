// filtro.js — versión robusta y autónoma (reemplaza el archivo actual)

(function () {
  // ---------- Helpers ----------
  function isArrayLike(a) { return Array.isArray(a); }

  function safeNum(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function safeStr(v) { return (v === null || typeof v === "undefined") ? "" : String(v); }

  function debounce(fn, wait = 180) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  function getSourceProperties() {
    // Prioriza window.propiedades (todas), sino propiedadesOriginales (compatibilidad).
    if (isArrayLike(window.propiedades) && window.propiedades.length) return window.propiedades;
    if (isArrayLike(window.propiedadesOriginales) && window.propiedadesOriginales.length) return window.propiedadesOriginales;
    // Si no hay aún datos, devuelve array vacío (pero escuchamos evento más abajo).
    return Array.isArray(window.propiedades) ? window.propiedades : [];
  }

  // Fallback formateo (si no existe global formatearPrecio)
  function safeFormatearPrecio(v) {
    if (typeof formatearPrecio === "function") return formatearPrecio(v);
    try { return Number(v).toLocaleString("es-CO"); } catch (e) { return String(v); }
  }

  // Obtener estilo por tipo (fallback a estilosPorTipo)
  function safeGetEstilo(tipo) {
    try {
      if (typeof getEstiloByTipo === "function") return getEstiloByTipo(tipo) || {};
    } catch (e) {}
    if (typeof estilosPorTipo === "object" && estilosPorTipo) return estilosPorTipo[(tipo || "").toLowerCase()] || {};
    return {};
  }

  // Fallback renderTarjetas si no existe (usa estructura similar a la que ya tienes)
  if (typeof renderTarjetas !== "function") {
    window.renderTarjetas = function (items = [], mostrarVacio = false) {
      const cont = document.getElementById("propiedades");
      if (!cont) return;
      cont.innerHTML = "";

      const arr = Array.isArray(items) ? items : [];
      if (arr.length === 0) {
        if (mostrarVacio) cont.innerHTML = "<p>No se encontraron propiedades con esos filtros.</p>";
        return;
      }

      arr.forEach(data => {
        const imagen = (data.imagenes && data.imagenes.length) ? data.imagenes[0] : (data.imagen || 'imagenes/default.png');
        const titulo = safeStr(data.titulo);
        const tipo = safeStr(data.tipo);
        const modalidad = safeStr(data.modalidad);
        const estado = safeStr(data.estado);
        const ciudad = safeStr(data.ciudad);
        const garage = data.garage || 0;
        const banos = data.banos || 0;
        const habitaciones = data.habitaciones || 0;
        const area = data.area || 0;
        const precio = safeFormatearPrecio(data.precio || 0);
        const propiedadNueva = !!data.propiedadNueva;
        const activa = !!data.activa;
        const codigo = safeStr(data.codigo);

        const estilo = safeGetEstilo(tipo);
        const color = estilo.color || "#cccccc";

        const card = document.createElement("div");
        card.className = "prop-card";
        card.innerHTML = `
          <div class="card-img-wrapper">
            <img src="${imagen}" alt="${titulo}">
            ${propiedadNueva ? '<span class="badge-nueva">NUEVA</span>' : ""}
          </div>
          <div class="card-body">
            <h3 class="card-title">${titulo}</h3>
            <div class="prop-badges">
              <span class="prop-tipo" style="background:${color};">${tipo}</span>
              ${modalidad ? `<span class="prop-badge">${modalidad}</span>` : ""}
              ${estado ? `<span class="prop-badge">${estado}</span>` : ""}
              <span class="prop-badge ${activa ? "badge-activa" : "badge-inactiva"}">${activa ? "Activa" : "Inactiva"}</span>
            </div>

            <p><strong>Código:</strong> ${codigo}</p>
            <p>${ciudad}</p>

            <div class="prop-icons">
              <span title="Garaje"><i class="fas fa-car"></i> ${garage}</span>
              <span title="Baños"><i class="fas fa-bath"></i> ${banos}</span>
              <span title="Habitaciones"><i class="fas fa-bed"></i> ${habitaciones}</span>
              <span title="Área"><i class="fas fa-ruler-combined"></i> ${area} m²</span>
            </div>

            <p class="prop-precio">COP ${precio}</p>

            <div class="card-actions">
              <button class="btn-detalle" onclick="verDetalle('${data.id}')">Ver detalles</button>
            </div>
          </div>
        `;
        // click en tarjeta centra marcador si existe
        card.addEventListener("click", (e) => {
          if (e.target.closest(".btn-detalle")) return;
          if (window.markersMap && window.markersMap[data.id]) {
            try { map.setView(window.markersMap[data.id].getLatLng(), 15); } catch (e) {}
            try { window.markersMap[data.id].openPopup(); } catch(e) {}
            if (typeof resaltarMarkersByIds === "function") resaltarMarkersByIds([data.id]);
          }
        });

        cont.appendChild(card);
      });
    };
  }

  // Fallback pintarDestacados si no existe (usa highlightLayer)
  if (typeof pintarDestacados !== "function") {
    window.pintarDestacados = function (items = []) {
      if (!window.highlightLayer) window.highlightLayer = L.layerGroup().addTo(map);
      window.highlightLayer.clearLayers();
      const arr = Array.isArray(items) ? items : [];
      if (!arr.length) return;
      arr.forEach(data => {
        if (data.lat == null || data.lng == null) return;
        const estilo = safeGetEstilo(data.tipo) || {};
        const iconoClass = estilo.icono || "fas fa-home";
        const color = estilo.color || "#666";
        // intenta usar crearIcono global si existe
        let icon;
        try {
          if (typeof crearIcono === "function") icon = crearIcono(color, iconoClass);
        } catch (e) { icon = null; }
        if (!icon) {
          icon = L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background:${color};border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;color:white;"><i class="${iconoClass}"></i></div>`,
            iconSize: [34,34], iconAnchor: [17,34], popupAnchor: [0,-30]
          });
        }

        const popup = `<div style="text-align:center;"><strong>${safeStr(data.titulo)}</strong><br/>COP ${safeFormatearPrecio(data.precio || 0)}</div>`;
        const marker = L.marker([data.lat, data.lng], { icon }).bindPopup(popup);
        marker.on("add", () => {
          const el = marker.getElement?.() || marker._icon;
          if (el) el.classList.add("highlight-marker");
        });
        window.highlightLayer.addLayer(marker);
      });
    };
  }

  // ---------- Función de filtros ----------
  function aplicarFiltros() {
    const base = getSourceProperties();
    // si no hay propiedades aún, mostramos vacío y salimos (se reintentará con evento propiedades:loaded)
    if (!Array.isArray(base)) return renderTarjetas([], true);

    const soloNuevas  = document.getElementById("filtroNueva")?.checked || false;
    const tipoVal     = (document.getElementById("tipo")?.value || "").toLowerCase().trim();
    const precioMin   = safeNum(document.getElementById("precioMin")?.value, 0);
    const precioMax   = (() => { const v = document.getElementById("precioMax")?.value; return v ? safeNum(v, Infinity) : Infinity; })();
    const ciudadVal   = (document.getElementById("ciudad")?.value || "").toLowerCase().trim();
    const modalidadVal= (document.getElementById("filtroTipo")?.value || "").toLowerCase().trim();
    const banosVal    = parseInt(document.getElementById("banos")?.value) || 0;
    const habsVal     = parseInt(document.getElementById("habitaciones")?.value) || 0;
    const garajeVal   = parseInt(document.getElementById("garaje")?.value) || 0;
    const estadoVal   = (document.getElementById("estado")?.value || "").toLowerCase().trim();
    const destacada   = document.getElementById("destacada")?.checked || false;
    const activaVal   = (document.getElementById("filtroActiva")?.value || "todas").toLowerCase().trim();

    const estratoVal     = parseInt(document.getElementById("estrato")?.value) || 0;
    const codigoVal      = (document.getElementById("codigo")?.value || "").toLowerCase().trim();
    const pisoVal        = parseInt(document.getElementById("piso")?.value) || 0;
    const paisVal        = (document.getElementById("pais")?.value || "").toLowerCase().trim();
    const departamentoVal= (document.getElementById("departamento")?.value || "").toLowerCase().trim();

    const filtradas = base.filter(prop => {
      const pTipo      = (prop.tipo || "").toLowerCase();
      const pCiudad    = (prop.ciudad || "").toLowerCase();
      const pPrecio    = Number(prop.precio) || 0;
      const pModalidad = (prop.modalidad || "").toLowerCase();
      const pBanos     = Number(prop.banos) || 0;
      const pHabs      = Number(prop.habitaciones) || 0;
      const pGarajes   = Number(prop.garaje) || 0;
      const pEstado    = (prop.estado || "").toLowerCase();
      const pDestacada = !!prop.destacada;
      const pNueva     = !!prop.propiedadNueva;
      const pActiva    = (typeof prop.activa === "boolean") ? prop.activa : (String(prop.activa || "").toLowerCase() === "true");
      const pEstrato     = Number(prop.estrato) || 0;
      const pCodigo      = (prop.codigo || "").toLowerCase();
      const pPiso        = Number(prop.piso) || 0;
      const pPais        = (prop.pais || "").toLowerCase();
      const pDepartamento= (prop.departamento || "").toLowerCase();

      const okTipo = tipoVal ? pTipo.includes(tipoVal) : true;
      const okPrecio    = pPrecio >= precioMin && pPrecio <= precioMax;
      const okCiudad    = ciudadVal ? pCiudad.includes(ciudadVal) : true;
      const okModalidad = modalidadVal && modalidadVal !== "todos" ? pModalidad.includes(modalidadVal) : true;
      const okBanos     = banosVal ? pBanos >= banosVal : true;
      const okHabs      = habsVal ? pHabs >= habsVal : true;
      const okEstado = estadoVal && estadoVal !== "todos" ? pEstado.includes(estadoVal) : true;
      const okGaraje    = garajeVal ? pGarajes >= garajeVal : true;
      const okDestacada = destacada ? pDestacada === true : true;
      const okNueva     = soloNuevas ? pNueva === true : true;
      const okActiva = (activaVal !== "todas")
        ? (activaVal === "true" ? pActiva === true : pActiva === false)
        : true;
      const okEstrato     = estratoVal ? pEstrato === estratoVal : true;
      const okCodigo      = codigoVal ? pCodigo.includes(codigoVal) : true;
      const okPiso        = pisoVal ? pPiso === pisoVal : true;
      const okPais        = paisVal ? pPais.includes(paisVal) : true;
      const okDepartamento= departamentoVal ? pDepartamento.includes(departamentoVal) : true;

      return okTipo && okPrecio && okCiudad && okModalidad && okBanos &&
             okHabs && okEstado && okGaraje && okDestacada && okNueva &&
             okActiva && okEstrato && okCodigo && okPiso && okPais && okDepartamento;
    });

    // pintar en mapa y en tarjetas
    try { pintarDestacados(filtradas); } catch (e) {}
    try { renderTarjetas(filtradas, true); } catch (e) {}

    // centrar en primer resultado si existe
    if (filtradas.length && filtradas[0].lat != null && filtradas[0].lng != null) {
      try { map.setView([filtradas[0].lat, filtradas[0].lng], 14); } catch(e) {}
    }
  }

  // ---------- Quitar filtros ----------
  function quitarFiltros() {
    if (window.highlightLayer) window.highlightLayer.clearLayers();
    renderTarjetas(getSourceProperties(), false);

    const ids = ["tipo", "precioMin", "precioMax", "ciudad", "filtroTipo",
                 "banos", "habitaciones", "garaje",
                 "estado", "destacada", "filtroActiva",
                 "filtroNueva", "estrato", "codigo", "piso", "pais", "departamento"];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.type === "checkbox") el.checked = false;
      else el.value = "";
    });

    // recentrar mapa a tu vista predeterminada (si quieres personalizar cambia coordenadas)
    if (window.map) {
      try { map.setView([3.4516, -76.5320], 13); } catch (e) {}
    }
  }

  // ---------- Bind de eventos (seguro) ----------
  function bindEvents() {
    const buscarBtn = document.getElementById("buscarBtn");
    const resetBtn = document.getElementById("resetBtn");

    if (buscarBtn) {
      // si el botón está dentro de un <form>, evita submit real
      const form = buscarBtn.closest("form");
      if (form) {
        form.addEventListener("submit", function (ev) {
          ev.preventDefault();
          aplicarFiltros();
        });
      }
      buscarBtn.addEventListener("click", function (ev) {
        ev.preventDefault && ev.preventDefault();
        aplicarFiltros();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function (ev) {
        ev.preventDefault && ev.preventDefault();
        quitarFiltros();
      });
    }

    // opcional: aplicar filtros al cambiar algunos campos (con debounce)
    const autoApplySelectors = ["#tipo","#filtroTipo","#ciudad","#estado","#filtroActiva","#destacada","#filtroNueva","#precioMin","#precioMax"];
    autoApplySelectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.addEventListener("change", debounce(aplicarFiltros, 220));
    });
  }

  // ---------- Escuchar llegada de datos ----------
  window.addEventListener("propiedades:loaded", (e) => {
    if (e?.detail?.todas) window.propiedades = e.detail.todas;
    // re-render con la fuente nueva
    try { renderTarjetas(getSourceProperties(), false); } catch(e) {}
  });

  // ---------- Inicial -->
  document.addEventListener("DOMContentLoaded", () => {
    // Si no existen datos aún, renderTarjetas() manejará vacío; cuando lleguen datos se re-renderiza por evento.
    bindEvents();
    // Render inicial (si ya hay cosas)
    renderTarjetas(getSourceProperties(), false);
  });

})(); // fin IIFE
