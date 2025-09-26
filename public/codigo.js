let markersMap = {}; // Guarda referencias a marcadores {idPropiedad: marker}


async function generarCodigoAutomatico() {
  const ref = firebase.firestore().collection("config").doc("contador");

  return firebase.firestore().runTransaction(async (transaction) => {
    const doc = await transaction.get(ref);

    if (!doc.exists) {
      throw "El documento contador no existe!";
    }

    let ultimo = doc.data().ultimoCodigo || 0;
    let nuevo = ultimo + 1;

    // actualizar el contador
    transaction.update(ref, { ultimoCodigo: nuevo });

    // retornar el nuevo código en formato P0001
    return "P" + nuevo.toString().padStart(4, "0");
  });
}
function formatearPrecio(valor) {
  if (!valor) return "";
  return valor.toLocaleString("es-CO"); // 👉 2.500.000
}

async function asignarCodigosAutomaticos() {
  const db = firebase.firestore();

  try {
    // 1. Leer todas las propiedades
    const snapshot = await db.collection("propiedades").orderBy("fecha").get();

    if (snapshot.empty) {
      console.log("No hay propiedades registradas.");
      return;
    }

    let contador = 0;

    // 2. Recorrer cada propiedad
    const batch = db.batch(); // usamos batch para optimizar

    snapshot.forEach((doc) => {
      contador++;
      const codigoNuevo = "P" + String(contador).padStart(4, "0");

      batch.update(doc.ref, { codigo: codigoNuevo });
    });

    // 3. Ejecutar batch
    await batch.commit();

    // 4. Actualizar el contador global
    await db.collection("config").doc("contador").set(
      { ultimoCodigo: contador },
      { merge: true }
    );

    console.log("✅ Todos los códigos actualizados correctamente.");
    alert("Todos los códigos se asignaron sin repetir 🎉");
  } catch (err) {
    console.error("❌ Error al asignar códigos:", err);
    alert("Hubo un error al asignar códigos.");
  }
}

// -----------------------------
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

const iconCasa        = crearIcono("#FFBF00", "fas fa-home");
const iconApartamento = crearIcono("dodgerblue", "fas fa-building");
const iconLote        = crearIcono("darkorange", "fas fa-border-all");
const iconFinca       = crearIcono("#66FF00", "fas fa-tractor");
const iconApartaestudio = crearIcono("hotpink", "fas fa-door-open");
const iconBodega      = crearIcono("#666633", "fas fa-warehouse");
const iconCampestre   = crearIcono("darkgreen", "fas fa-tree");
const iconCondominio  = crearIcono("navy", "fas fa-city"); // 🔵 cambiado a azul más oscuro
const iconDuplex      = crearIcono("saddlebrown", "fas fa-building");
const iconEdificio    = crearIcono("black", "fas fa-building-circle-check");
const iconLocal       = crearIcono("red", "fas fa-store");
const iconHotel       = crearIcono("darkred", "fas fa-concierge-bell"); // igual que en leyenda
const iconOficina     = crearIcono("purple", "fas fa-briefcase");
const iconPenthouse   = crearIcono("goldenrod", "fas fa-crown");
// ===============================
// Mapeo tipo -> icono texto (FontAwesome) + color
// ===============================
const estilosPorTipo = {
  "casa":          { icono: '<i class="fas fa-home"></i>', color: "#FFBF00" },
  "apartamento":   { icono: '<i class="fas fa-building"></i>', color: "dodgerblue" },
  "lote":          { icono: '<i class="fas fa-vector-square"></i>', color: "darkorange" },
  "finca":         { icono: '<i class="fas fa-tractor"></i>', color: "#66FF00" },
  "apartaestudio": { icono: '<i class="fas fa-door-open"></i>', color: "hotpink" },
  "bodega":        { icono: '<i class="fas fa-warehouse"></i>', color: "#666633" },
  "campestre":     { icono: '<i class="fas fa-tree"></i>', color: "darkgreen" },
  "condominio":    { icono: '<i class="fas fa-city"></i>', color: "navy" },
  "duplex":        { icono: '<i class="fas fa-house-chimney"></i>', color: "saddlebrown" },
  "edificio":      { icono: '<i class="fas fa-building-circle-check"></i>', color: "black" },
  "local":         { icono: '<i class="fas fa-store"></i>', color: "red" },
  "hotel":         { icono: '<i class="fas fa-concierge-bell"></i>', color: "darkred" },
  "oficina":       { icono: '<i class="fas fa-briefcase"></i>', color: "purple" },
  "penthouse":     { icono: '<i class="fas fa-crown"></i>', color: "goldenrod" }
};






// ===============================
// Función para calcular conteos
// ===============================
function calcularConteos(propiedades) {
  const conteos = {
    total: propiedades.length,
    activas: propiedades.filter(p => !!p.activa).length,
    inactivas: propiedades.filter(p => !p.activa).length,
    destacadas: propiedades.filter(p => !!p.destacada).length,
    porTipo: {}
  };

  propiedades.forEach(p => {
    const tipo = (p.tipo || "").toString().toLowerCase().trim();
    if (!tipo) return;
    conteos.porTipo[tipo] = (conteos.porTipo[tipo] || 0) + 1;
  });

  return conteos;
}

// ids resaltados actualmente (Set de strings)
let idsFiltradosActivos = new Set();

// extraer clase de icono (soportar '<i class="fas fa-home"></i>' o 'fas fa-home')
function getIconClassFromEstilo(estilo) {
  if (!estilo) return "fas fa-home";
  // si es string simple
  if (typeof estilo.icono === "string") {
    // si contiene HTML <i class="...">
    const m = estilo.icono.match(/class=["']([^"']+)["']/);
    if (m) return m[1];
    // si ya es "fas fa-home"
    if (!estilo.icono.includes("<")) return estilo.icono;
  }
  // si es un L.divIcon con options.html
  if (estilo.icono && estilo.icono.options && typeof estilo.icono.options.html === "string") {
    const m = estilo.icono.options.html.match(/class=["']([^"']+)["']/);
    if (m) return m[1];
  }
  return "fas fa-home";
}

// Crear markers desde un array de propiedades (limpia los anteriores)
// Crear markers desde un array de propiedades (limpia los anteriores)
function crearMarkersFromArray(propiedades = [], leafletMap) {
  if (!(leafletMap instanceof L.Map)) {
    console.error("❌ crearMarkersFromArray: leafletMap no es una instancia de L.Map");
    return;
  }

  // Si tienes un layerGroup global (markersLayer) úsalo para mostrar/ocultar más fácil.
  // Si no existe, caemos en fallback que añade/quita al mapa directamente.
  const hasMarkersLayer = (typeof markersLayer !== "undefined" && markersLayer && typeof markersLayer.clearLayers === "function");

  // limpiar markers previos del mapa o del markersLayer (sin destruir la referencia)
  if (hasMarkersLayer) {
    markersLayer.clearLayers();
  } else {
    for (const id in markersMap) {
      try { leafletMap.removeLayer(markersMap[id]); } catch (e) { /* ignore */ }
    }
  }
  markersMap = {};

  propiedades.forEach(prop => {
    const lat = parseFloat(prop.lat);
    const lng = parseFloat(prop.lng);
    const id = String(prop.id || prop.codigo || "");

    if (!lat || !lng || !id) return; // saltar si no hay coords o id

    const estilo = estilosPorTipo[(prop.tipo || "").toLowerCase()] || { color: "#555", icono: '<i class="fas fa-home"></i>' };
    const iconClass = getIconClassFromEstilo ? getIconClassFromEstilo(estilo) : (estilo.icono || 'fas fa-home');
    const icon = crearIcono(estilo.color || "#555", iconClass);

    const marker = L.marker([lat, lng], { icon });

    // Bind de popup opcional (si no quieres popup, quita bindPopup)
    // marker.bindPopup(`<strong>${escapeHtml(prop.titulo || "")}</strong><br>${escapeHtml(prop.ciudad || "")}`);

    // cuando el marker se agrega al mapa, aplicamos el highlight si corresponde
    marker.on('add', () => {
      const el = marker.getElement();
      if (!el) return;
      if (idsFiltradosActivos.has(String(id))) {
        el.classList.add('highlight'); // coincide con tu CSS
      } else {
        el.classList.remove('highlight');
      }
    });

    // Añadir al mapa o al markersLayer
    if (hasMarkersLayer) {
      markersLayer.addLayer(marker);
    } else {
      marker.addTo(leafletMap);
    }

    // guardar metadatos
    marker._id = id;
    marker._tipo = (prop.tipo || "").toLowerCase();

    markersMap[id] = marker;
  });

  // Si usamos markersLayer y aún no está en el mapa, lo añadimos
  if (hasMarkersLayer && !leafletMap.hasLayer(markersLayer)) {
    markersLayer.addTo(leafletMap);
  }

  console.log("✅ Markers creados:", Object.keys(markersMap).length);
}


// Resalta (o restaura) marcadores según ids (array de ids). 
// Si ids es [] restaura todos.
function resaltarMarkersByIds(ids = []) {
  const idsSet = new Set((ids || []).map(String));

  for (const id in markersMap) {
    const marker = markersMap[id];
    if (!marker) continue;

    // obtener el elemento DOM del marker (compatible con variantes de Leaflet)
    const el = (typeof marker.getElement === "function") ? marker.getElement() : marker._icon;
    if (!el) continue;

    // si el div con clase custom-div-icon está dentro, lo tomamos; si no, usamos 'el' directamente
    const target = el.classList && el.classList.contains("custom-div-icon") 
                   ? el 
                   : (el.querySelector && el.querySelector(".custom-div-icon")) || el;

    // limpiar estado previo
    target.classList.remove("highlight");
    el.classList && el.classList.remove("highlight");
    try { marker.setZIndexOffset && marker.setZIndexOffset(0); } catch(e) {}

    if (idsSet.size === 0) {
      // restaurar estado: no resaltado
      try { marker.closePopup && marker.closePopup(); } catch(e) {}
      continue;
    }

    if (idsSet.has(String(id))) {
      // resaltado
      target.classList.add("highlight");
      el.classList && el.classList.add("highlight");
      try { marker.setZIndexOffset && marker.setZIndexOffset(1000); } catch(e) {}
      // opcional: abrir popup y centrar
      try { marker.openPopup && marker.openPopup(); } catch(e) {}
    } else {
      // no resaltado -> dejamos normal (si quieres atenuar, aplica otra clase aquí)
      try { marker.closePopup && marker.closePopup(); } catch(e) {}
    }
  }
}


function resaltarMarker(idPropiedad) {
  // 1. Resetear todos los íconos a su estado normal
  Object.values(markersMap).forEach(marker => {
    const estilo = getEstiloByTipo(marker.options.tipo); 
    marker.setIcon(crearIcono(estilo.color, estilo.icono));
  });

  // 2. Buscar el marker de la propiedad filtrada
  const marker = markersMap[idPropiedad];
  if (marker) {
    // Cambiar ícono resaltado (más grande o color distinto)
    marker.setIcon(crearIcono("red", "fas fa-star"));  

    // Centrar mapa en el marker
    map.setView(marker.getLatLng(), 15);
  }
}



function renderEstadisticas(propiedades) {
  const conteos = calcularConteos(propiedades);
  console.log("renderEstadisticas -> conteos:", conteos);

  const contenedor = document.getElementById("estadisticas");
  if (!contenedor) return;

  // 🔹 chips de estado global
  const estados = [
    { key: "reset", label: "Todas", icon: '<i class="fas fa-list"></i>', cantidad: conteos.total },
    { key: "activas", label: "Activas", icon: '<i class="fas fa-check"></i>', cantidad: conteos.activas },
    { key: "inactivas", label: "Inactivas", icon: '<i class="fas fa-times"></i>', cantidad: conteos.inactivas },
    { key: "destacadas", label: "Destacadas", icon: '<i class="fas fa-star"></i>', cantidad: conteos.destacadas }
  ];

  let html = "";

  estados.forEach(e => {
    if (e.cantidad > 0 || e.key === "reset") {
      html += `
        <button type="button" class="estadistica-chip" data-tipo="${e.key}">
          <span class="chip-icon">${e.icon}</span>
          <span class="chip-label">${e.label}</span>
          <span class="chip-count">${e.cantidad}</span>
        </button>
      `;
    }
  });

  // 🔹 chips por tipo (basados en conteos.porTipo)
  for (const tipo in conteos.porTipo) {
    const cantidad = conteos.porTipo[tipo];
    const estilo = (estilosPorTipo && estilosPorTipo[tipo]) || { icono: '<i class="fas fa-home"></i>', color: "#555" };

    // obtener HTML del icono (soporta string HTML o L.divIcon)
    let iconHTML = '<i class="fas fa-home"></i>';
    if (typeof estilo.icono === "string") {
      iconHTML = estilo.icono;
    } else if (estilo.icono && estilo.icono.options && estilo.icono.options.html) {
      iconHTML = estilo.icono.options.html;
    } else if (estilo.icono && estilo.icono.toString) {
      // fallback
      iconHTML = '<i class="fas fa-home"></i>';
    }

    html += `
      <button type="button" class="estadistica-chip" data-tipo="${tipo}">
        <span class="chip-icon" style="color:${estilo.color || '#555'}">${iconHTML}</span>
        <span class="chip-label">${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
        <span class="chip-count">${cantidad}</span>
      </button>
    `;
  }

  contenedor.innerHTML = html;

  // Quitar selección anterior
  function clearActiveChips() {
    contenedor.querySelectorAll(".estadistica-chip").forEach(b => b.classList.remove("active"));
  }

  // Listeners: filtrar y re-renderizar adminLista
// dentro de renderEstadisticas, en el punto donde manejas el click de los chips,
// sustituye la parte de listener por esto (si ya usas lógica similar, sólo asegúrate
// de llamar a resaltarMarkersByIds con los ids correctos):

contenedor.querySelectorAll(".estadistica-chip").forEach(btn => {
  btn.addEventListener("click", () => {
    clearActiveChips();
    btn.classList.add("active");

    const tipo = btn.dataset.tipo;
    let filtradas = [];

    if (tipo === "reset") {
      filtradas = propiedades;
    } else if (tipo === "activas") {
      filtradas = propiedades.filter(p => !!p.activa);
    } else if (tipo === "inactivas") {
      filtradas = propiedades.filter(p => !p.activa);
    } else if (tipo === "destacadas") {
      filtradas = propiedades.filter(p => !!p.destacada);
    } else {
      filtradas = propiedades.filter(p => (p.tipo || "").toLowerCase() === tipo.toLowerCase());
    }

    renderAdminListaFromArray(filtradas);

    // Resaltamos marcadores filtrados (pasamos ids)
    const idsFiltradas = filtradas.map(p => String(p.id || p.codigo)).filter(Boolean);
    if (idsFiltradas.length > 0) {
      console.log("🔎 idsFiltradas:", idsFiltradas);
      console.log("🔎 keys markersMap:", Object.keys(markersMap));
      resaltarMarkersByIds(idsFiltradas);
      // centrar en la primera si quieres
      const firstId = idsFiltradas[0];
      if (markersMap[firstId]) {
        try { map.setView(markersMap[firstId].getLatLng(), 13); } catch(e) {}
        try { markersMap[firstId].openPopup(); } catch(e) {}
      }
    } else {
      // restaurar todos
  resaltarMarkersByIds(Object.keys(markersMap));
    }
  });
});


  // por defecto mostrar todo en adminLista (si está vacío)
  if ((adminLista && adminLista.innerHTML.trim() === "") || true) {
    // para asegurar que siempre se vea al menos la lista
    renderAdminListaFromArray(propiedades);
  }
}
// acepta array de objetos {id: "..."} o array de ids (strings)
function resaltadoDeFiltros(propiedadesFiltradasOrIds = []) {
  // Normalizar a array de ids (strings)
  let ids = [];
  if (!Array.isArray(propiedadesFiltradasOrIds)) propiedadesFiltradasOrIds = [];
  if (propiedadesFiltradasOrIds.length === 0) {
    ids = [];
  } else {
    if (typeof propiedadesFiltradasOrIds[0] === 'string') {
      ids = propiedadesFiltradasOrIds.map(String);
    } else {
      ids = propiedadesFiltradasOrIds.map(p => String(p.id || p._id || p.codigo || "")).filter(Boolean);
    }
  }

  // Guardar estado global
  idsFiltradosActivos = new Set(ids);

  // Aplicar clase highlight sobre cada marker que tenga elemento en DOM
  for (const id in markersMap) {
    const marker = markersMap[id];
    if (!marker) continue;
    const el = marker.getElement();
    if (!el) continue; // si aún no está en mapa no podemos manipular DOM (se aplicará en 'add')
    if (idsFiltradosActivos.has(String(id))) {
      el.classList.add('highlight');
    } else {
      el.classList.remove('highlight');
    }
  }
}



function aplicarResaltadoActivo() {
  // reaplica el resaltado guardado en idsFiltradosActivos
  for (const id in markersMap) {
    const marker = markersMap[id];
    if (!marker) continue;
    const el = marker.getElement();
    if (!el) continue;
    if (idsFiltradosActivos.has(String(id))) el.classList.add('highlight');
    else el.classList.remove('highlight');
  }
}



// fallback simple para pintar lista si no tienes renderPropiedades()
// Usa markup sencillo similar a tu estructura de tarjetas
function safeRenderLista(items = []) {
  const cont = document.getElementById("propiedades");
  if (!cont) return;
  cont.innerHTML = "";
  items.forEach(data => {
    const color = (typeof estilosPorTipoEstadisticas !== 'undefined' && estilosPorTipoEstadisticas[data.tipo]) 
                  ? estilosPorTipoEstadisticas[data.tipo].color 
                  : "#ccc";
    const img = (data.imagenes && data.imagenes.length) ? data.imagenes[0] : (data.imagen || "imagenes/default.png");
    const card = document.createElement("div");
    card.className = "prop-card";
    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${img}" alt="${escapeHtml(data.titulo||'Propiedad')}">
      </div>
      <h3>${escapeHtml(data.titulo||'')}</h3>
      <div class="prop-badges">
        <span class="prop-tipo" style="background:${color}">${escapeHtml(data.tipo||'')}</span>
      </div>
      <p>${escapeHtml(data.ciudad||'')}</p>
    `;
    cont.appendChild(card);
  });
}

// reutil
function escapeHtml(str) {
  return String(str||"").replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function aplicarFiltro(filtroFn) {
  firebase.firestore().collection("propiedades").get().then(snapshot => {
    const propiedades = [];
    snapshot.forEach(doc => propiedades.push(doc.data()));

    const filtradas = filtroFn ? propiedades.filter(filtroFn) : propiedades;

    // ✅ Volvemos a renderizar solo las filtradas
    const adminLista = document.getElementById("adminLista");
    adminLista.innerHTML = "";
    filtradas.forEach(p => {
      // aquí puedes reusar el código que ya tienes para dibujar cada tarjeta
      const card = document.createElement("div");
      card.className = "prop-card";
      card.innerHTML = `<h3>${p.titulo}</h3><p>${p.tipo}</p>`;
      adminLista.appendChild(card);
    });
  });
}


function aplicarFiltroCodigo(propiedades) {
  const input = document.getElementById("codigoInput");
  if (!input) return propiedades;

  const valor = input.value.trim().toLowerCase();
  if (valor === "") return propiedades;

  return propiedades.filter(p => (p.codigo || "").toLowerCase().includes(valor));
}

function inicializarFiltroCodigo(propiedades) {
  const input = document.getElementById("codigoInput");
  const btnBuscar = document.getElementById("btnBuscarCodigo");
  const btnLimpiar = document.getElementById("btnLimpiarCodigo");

  if (!input || !btnBuscar || !btnLimpiar) return;

  // Buscar
  btnBuscar.addEventListener("click", () => {
    const filtradas = aplicarFiltroCodigo(propiedades);
    renderEstadisticas(filtradas);
    renderAdminListaFromArray(filtradas);
  });

  // Enter dentro del input
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const filtradas = aplicarFiltroCodigo(propiedades);
      renderEstadisticas(filtradas);
      renderAdminListaFromArray(filtradas);
    }
  });

  // Limpiar
  btnLimpiar.addEventListener("click", () => {
    input.value = "";
    renderEstadisticas(propiedades);
    renderAdminListaFromArray(propiedades);
  });
}





function renderAdminListaFromArray(propiedades = []) {
  const adminListaEl = document.getElementById("adminLista");
  if (!adminListaEl) {
    console.warn("No se encontró #adminLista en el DOM");
    return;
  }

  adminListaEl.innerHTML = "";

  propiedades.forEach(prop => {
    const {
      area = 0, estado = "Sin estado", propiedadNueva = false,
      titulo = "Sin título", precio = 0, modalidad = "Sin modalidad",
      ciudad = "Sin ciudad", banos = 0, habitaciones = 0, garage = 0,
      tipo = "Otro", destacada = false, activa = true,
      codigo = "Sin código", piso = 0, estrato = 0,
      pais = "Sin país", departamento = "Sin departamento",
      internas = [], externas = [], imagenes = [], id = prop.id || ""
    } = prop;

    let imagen = imagenes && imagenes.length > 0 ? imagenes[0] : (prop.imagen || "imagenes/default.png");
    if (!imagen.startsWith("http")) imagen = "/" + imagen;

    const estilo = estilosPorTipo[(tipo || "").toLowerCase()] || { color: "#555", icono: '<i class="fas fa-home"></i>' };
    const color = estilo.color || "#555";

    const card = document.createElement("div");
    card.classList.add("prop-card");
    card.dataset.id = id;
    if (prop.lat) card.dataset.lat = prop.lat;
    if (prop.lng) card.dataset.lng = prop.lng;

    card.innerHTML = `
      <div class="card-img-wrapper">
        <img src="${escapeHtml(imagen)}" alt="${escapeHtml(titulo)}">
        ${propiedadNueva ? '<span class="badge-nueva">NUEVO</span>' : ""}
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(titulo)}</h3>
        <div class="prop-badges">
          <span class="prop-tipo" style="background:${color};">${escapeHtml(tipo)}</span>
          <span class="prop-badge">${escapeHtml(modalidad)}</span>
          <span class="prop-badge">${escapeHtml(estado)}</span>
          <span class="prop-badge ${activa ? "badge-activa" : "badge-inactiva"}">
            ${activa ? "Activa" : "Inactiva"}
          </span>
        </div>

        <p><strong>Código:</strong> ${escapeHtml(codigo)}</p>
        <p><strong>Ciudad:</strong> ${escapeHtml(ciudad)}</p>

        <p><i class="fas fa-car"></i> ${escapeHtml(garage)}</p>
        <p><strong>Baños:</strong> <span class="prop-valor">${escapeHtml(banos)}</span></p>
        <p><strong>Habitaciones:</strong> <span class="prop-valor">${escapeHtml(habitaciones)}</span></p>
        <p><strong>Área:</strong> <span class="prop-valor">${escapeHtml(area)} m²</span></p>

        <p class="prop-precio">COP ${formatearPrecio(precio)}</p>

        <div class="card-actions">
          <button class="btn-edit" data-id="${escapeHtml(id)}">✏️ Editar</button>
          <button class="btn-delete" data-id="${escapeHtml(id)}">🗑️ Eliminar</button>
        </div>
      </div>
    `;

    // Click en la card (no sobre botones) centra y abre popup del marcador
    card.addEventListener("click", (e) => {
      if (e.target.closest(".btn-edit") || e.target.closest(".btn-delete")) return;
      const idCard = card.dataset.id;
      if (idCard && markersMap && markersMap[idCard]) {
        const marker = markersMap[idCard];
        try { map.setView(marker.getLatLng(), 15); } catch (err) {}
        try { marker.openPopup(); } catch(e) {}
        resaltarMarkersByIds([idCard]);
      }
    });

    // Hover: resaltado temporal
    card.addEventListener("mouseenter", () => {
      if (card.dataset.id) resaltarMarkersByIds([card.dataset.id]);
    });
    card.addEventListener("mouseleave", () => {
      // restaurar todo (o podrías mantener el filtro actual)
      resaltarMarkersByIds([]);
    });

    adminListaEl.appendChild(card);
  });
}


document.addEventListener("DOMContentLoaded", () => {
  const adminListaEl = document.getElementById("adminLista");
  if (!adminListaEl) {
    console.warn("#adminLista no encontrado para delegación");
    return;
  }

  adminListaEl.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".btn-edit");
    if (editBtn) {
      const id = editBtn.dataset.id;
      console.log("Editar clic -> id:", id);
      if (id) window.editarPropiedad(id);
      return;
    }

    const delBtn = e.target.closest(".btn-delete");
    if (delBtn) {
      const id = delBtn.dataset.id;
      if (!id) return;
      if (confirm("¿Eliminar esta propiedad?")) {
        firebase.firestore().collection("propiedades").doc(id).delete()
          .then(() => cargarAdminPropiedades())
          .catch(err => console.error("Error eliminando:", err));
      }
      return;
    }
  });


});



