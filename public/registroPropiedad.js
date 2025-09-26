document.addEventListener("DOMContentLoaded", () => {
  // ==========================
  //  VARIABLES GLOBALES
  // ==========================
  const form = document.getElementById("registroForm");
  if (!form) return;
// Ícono especial para edición
const iconEdicion = crearIcono("orangered", "fas fa-edit");


  // Crear mapa centrado en Bogotá
const map = L.map("map").setView([3.4516, -76.5320], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

let marker;


let markersLayer = L.layerGroup().addTo(map);

function crearPopup(datos) {
  // ✅ Valores seguros
  const img   = datos.imagen || "img/no-image.png";
  const titulo = datos.titulo || "Sin título";
  const precio = datos.precio ? `$${datos.precio.toLocaleString()}` : "Sin precio";
  const tipo    = datos.tipo || "Sin tipo";

  return `
    <div style="text-align:center; width:160px; font-family:sans-serif;">
      <img src="${img}" 
           style="width:100%; border-radius:6px; margin-bottom:4px;" 
           alt="${titulo}">
      <h4 style="margin:4px 0; font-size:14px; font-weight:600; color:#333;">
        ${titulo}
      </h4>
      <p style="margin:2px 0; font-size:13px; color:#2E8B57; font-weight:bold;">
        ${precio}
      </p>
       <p style="margin:2px 0; font-size:12px; color:#555;">
        Tipo: <strong>${tipo}</strong>
      </p>
    </div>
  `;
}



function setMarker(lat, lng, estilo = null) {
  markersLayer.clearLayers(); // 👈 limpia todos los anteriores

  const icono = estilo?.icono || new L.Icon.Default();

  marker = L.marker([lat, lng], { draggable: true, icon: icono }).addTo(markersLayer);

  marker.on("dragend", (e) => {
    const { lat, lng } = e.target.getLatLng();
    document.getElementById("lat").value = lat;
    document.getElementById("lng").value = lng;
  });

  document.getElementById("lat").value = lat;
  document.getElementById("lng").value = lng;
}






const adminLista = document.getElementById("adminLista");

  let modoEdicion = false; // Saber si estamos editando
  let propiedadId = null;  // ID de la propiedad que se edita

// ==========================
//  MAPA con LocationIQ
// ==========================
const direccionInput = document.getElementById("direccion");
const ciudadInput = document.getElementById("ciudad");
const latInput = document.getElementById("lat");
const lngInput = document.getElementById("lng");
const buscarBtn = document.getElementById("buscarDireccion");
const mapsBtn = document.getElementById("abrirGoogleMaps");

const API_KEY = "pk.f7ed5677f23f2635f588ea90513a13d0"; // tu key de LocationIQ

L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});





// ==========================
// 1. Dirección + Ciudad → Coordenadas (Geocodificación directa)
// ==========================
buscarBtn.addEventListener("click", async () => {
  const direccion = direccionInput.value.trim();
  const ciudad = ciudadInput.value.trim();

  if (!direccion || !ciudad) {
    return alert("Ingresa la dirección y la ciudad");
  }

  // Concatenamos dirección + ciudad + país
  const direccionCompleta = `${direccion}, ${ciudad}, Colombia`;

  try {
    const url = `https://us1.locationiq.com/v1/search.php?key=${API_KEY}&q=${encodeURIComponent(
      direccionCompleta
    )}&format=json`;

    const response = await fetch(url);
    const data = await response.json();

    if (data && data.length > 0) {
      const lat = data[0].lat;
      const lon = data[0].lon;

      console.log("Ubicación encontrada:", lat, lon);

      setMarker(lat, lon);
    } else {
      alert("No se encontró la dirección");
    }
  } catch (err) {
    console.error("Error en geocodificación directa:", err);
  }
});

// ==========================
// 2. Click en el mapa → Coordenadas → Dirección (opcional)
// ==========================

map.on("click", function (e) {
  // Siempre permite mover el pin, tanto en creación como en edición
  const tipo = document.getElementById("tipo").value.trim().toLowerCase();
  setMarker(e.latlng.lat, e.latlng.lng, tipo);
});


// ==========================
// 3. Abrir Google Maps con la dirección o coordenadas
// ==========================
mapsBtn.addEventListener("click", () => {
  let query = direccionInput.value;
  if (latInput.value && lngInput.value) {
    query = `${latInput.value},${lngInput.value}`;
  }
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
    "_blank"
  );
});

// ==========================
// FUNCION: agregarCaracteristica
// ==========================
// ==========================
// FUNCION: agregarCaracteristica
// ==========================
window.agregarCaracteristica = function (tipo, valor = "") {
  const container = document.getElementById(
    tipo === "interna"
      ? "caracteristicas-internas-container"
      : "caracteristicas-externas-container"
  );

  const div = document.createElement("div");
  div.classList.add("caracteristica-item");
  div.innerHTML = `
    <input type="text" 
           class="caracteristica-${tipo}" 
           placeholder="Escribe una característica"
           value="${valor}">
    <button type="button" class="btn-quitar">❌</button>
  `;

  // Evento para quitar característica
  div.querySelector(".btn-quitar").addEventListener("click", () => {
    div.remove();
  });

  container.appendChild(div);
};



// ==========================
//  SUBMIT FORMULARIO
// ==========================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo       = document.getElementById("titulo").value.trim();
  const descripcion  = document.getElementById("descripcion").value.trim();
  const ciudad       = document.getElementById("ciudad").value.trim();
  const direccion    = document.getElementById("direccion").value.trim();
  let tipo           = document.getElementById("tipo").value.trim().toLowerCase();
  tipo = tipo.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
  const modalidad    = document.getElementById("modalidad").value.trim();
  const habitaciones = parseInt(document.getElementById("habitaciones").value) || 0;
  const banos        = parseInt(document.getElementById("banos").value) || 0;

  // limpiar puntos y comas del precio
  const precioRaw = document.getElementById("precio").value.replace(/\./g, "").replace(/,/g, "");
  const precio = parseFloat(precioRaw) || 0;

  const garage = parseInt(document.getElementById("garage").value) || 0;
  const area = parseFloat(document.getElementById("area").value) || 0;
  const estado = document.getElementById("estado").value.trim();
  const propiedadNueva = document.getElementById("propiedadNueva").checked;

  // imágenes
  const imagenesInput = document.getElementById("imagenes").value.trim();
  const imagenes = imagenesInput.split(",")
    .map(img => img.trim())
    .filter(img => img !== "");

  const lat = parseFloat(document.getElementById("lat").value) || null;
  const lng = parseFloat(document.getElementById("lng").value) || null;
  const activa = document.getElementById("activa").checked; 
  const destacada = document.getElementById("destacada").checked;

  // 👇 NUEVOS CAMPOS
  const piso         = parseInt(document.getElementById("piso")?.value) || 0;
  const estrato      = parseInt(document.getElementById("estrato")?.value) || 0;
  const pais         = document.getElementById("pais")?.value.trim() || "";
  const departamento = document.getElementById("departamento")?.value.trim() || "";

  // 👇 Características internas/externas
  const internas = Array.from(document.querySelectorAll(".caracteristica-interna"))
    .map(input => input.value.trim())
    .filter(val => val !== "");
  const externas = Array.from(document.querySelectorAll(".caracteristica-externa"))
    .map(input => input.value.trim())
    .filter(val => val !== "");

  // Validación
  if (!titulo || !ciudad || !direccion || !tipo || !modalidad || !precio || imagenes.length === 0 || lat === null || lng === null) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  try {
    if (modoEdicion && propiedadId) {
      // === ACTUALIZAR ===
      const datos = {
        titulo, descripcion, ciudad, direccion, tipo, modalidad,
        habitaciones, banos, area, estado, propiedadNueva,
        garage, precio, imagenes, lat, lng, activa, destacada,
        piso, estrato, pais, departamento,
        internas, externas,
        fecha: firebase.firestore.FieldValue.serverTimestamp()
      };

      await firebase.firestore().collection("propiedades").doc(propiedadId).update(datos);
      alert("Propiedad actualizada ✅");
      modoEdicion = false;
      propiedadId = null;

    } else {
      // === CREAR ===
      // 👉 Usamos una transacción para generar el código único
      const db = firebase.firestore();
      const configRef = db.collection("config").doc("contador");

      const codigoGenerado = await db.runTransaction(async (transaction) => {
        const configDoc = await transaction.get(configRef);

        if (!configDoc.exists) {
          throw "El documento config/contador no existe ⚠️";
        }

        let ultimoCodigo = configDoc.data().ultimoCodigo || 0;
        ultimoCodigo += 1; // incrementar

        // actualizar en la BD
        transaction.update(configRef, { ultimoCodigo });

        // formatear como P0001
        return "P" + String(ultimoCodigo).padStart(4, "0");
      });

      const datos = {
        titulo, descripcion, ciudad, direccion, tipo, modalidad,
        habitaciones, banos, area, estado, propiedadNueva,
        garage, precio, imagenes, lat, lng, activa, destacada,
        piso, estrato, pais, departamento,
        internas, externas,
        codigo: codigoGenerado, // 👈 asignamos el código único
        fecha: firebase.firestore.FieldValue.serverTimestamp()
      };

      await db.collection("propiedades").add(datos);
      alert("Propiedad registrada ✅ con código: " + codigoGenerado);
    }

    // 👉 Refrescar mapa
    markersLayer.clearLayers();
    await cargarAdminPropiedades();

    if (lat && lng) {
      map.setView([lat, lng], 16);
    }

    form.reset();

  } catch (err) {
    console.error("Error guardando propiedad:", err);
    alert("No se pudo guardar la propiedad.");
  }
});


// ==========================
//  LISTADO ADMIN PROPIEDADES
// ==========================
async function cargarAdminPropiedades() {
  if (!adminLista) return;

  try {
    const snapshot = await firebase.firestore().collection("propiedades").get();
    const propiedades = [];

    snapshot.forEach(doc => {
      const prop = doc.data();
      prop.id = doc.id; // guardar el id para editar/eliminar
      propiedades.push(prop);
    });

    // estadísticas se encarga de todo: stats + render inicial
    renderEstadisticas(propiedades);
renderAdminListaFromArray(propiedades); // 👈 asegurar el primer render
inicializarFiltroCodigo(propiedades);

  } catch (err) {
    console.error("Error cargando propiedades:", err);
  }
}



  // ==========================
  //  ELIMINAR PROPIEDAD
  // ==========================
  window.eliminarPropiedad = async function(id) {
    if (confirm("¿Seguro que quieres eliminar esta propiedad?")) {
      await firebase.firestore().collection("propiedades").doc(id).delete();
      cargarAdminPropiedades();
    }
  };
//cargarAdminPropiedades();
//cargarPropiedadesMapa();



// ==========================
//  EDITAR PROPIEDAD
// ==========================
window.editarPropiedad = async function(id) {
  console.log("editarPropiedad llamado con id:", id);
  try {
    const docRef = firebase.firestore().collection("propiedades").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.warn("Propiedad no encontrada:", id);
      return;
    }

    const prop = docSnap.data();

    // helper seguro
    const safeSet = (elId, value) => {
      const el = document.getElementById(elId);
      if (!el) {
        //console.warn("No existe elemento:", elId);
        return;
      }
      if (el.type === "checkbox") el.checked = !!value;
      else el.value = value;
    };

    safeSet("area", prop.area ?? 0);
    safeSet("estado", prop.estado ?? "");
    safeSet("propiedadNueva", prop.propiedadNueva === true);
    safeSet("titulo", prop.titulo ?? "");
    safeSet("descripcion", prop.descripcion ?? "");
    safeSet("ciudad", prop.ciudad ?? "");
    safeSet("direccion", prop.direccion ?? "");
    safeSet("garage", prop.garage ?? 0);
    safeSet("tipo", prop.tipo ?? "");
    safeSet("modalidad", prop.modalidad ?? "");
    safeSet("habitaciones", prop.habitaciones ?? 0);
    safeSet("banos", prop.banos ?? 0);
    safeSet("codigo", prop.codigo ?? "");
    safeSet("estrato", prop.estrato ?? "");
    safeSet("piso", prop.piso ?? "");
    safeSet("pais", prop.pais ?? "");
    safeSet("departamento", prop.departamento ?? "");

    // precio seguro
    const precioNum = Number(prop.precio);
    safeSet("precio", !isNaN(precioNum) ? precioNum.toLocaleString("es-CO") : "");

    // imagenes
    let imgs = [];
    if (prop.imagenes) imgs = Array.isArray(prop.imagenes) ? prop.imagenes : [prop.imagenes];
    safeSet("imagenes", imgs.join(", "));

    safeSet("lat", prop.lat ?? "");
    safeSet("lng", prop.lng ?? "");
    safeSet("activa", prop.activa === true);
    safeSet("destacada", prop.destacada === true);

    // características — tolerante a strings/arrays
    const internasArr = Array.isArray(prop.internas) ? prop.internas : (prop.internas ? [prop.internas] : []);
    const externasArr = Array.isArray(prop.externas) ? prop.externas : (prop.externas ? [prop.externas] : []);

    const internasContainer = document.getElementById("caracteristicas-internas-container");
    if (internasContainer) {
      internasContainer.innerHTML = "";
      if (internasArr.length) internasArr.forEach(c => agregarCaracteristica("interna", c));
      else agregarCaracteristica("interna");
    }

    const externasContainer = document.getElementById("caracteristicas-externas-container");
    if (externasContainer) {
      externasContainer.innerHTML = "";
      if (externasArr.length) externasArr.forEach(c => agregarCaracteristica("externa", c));
      else agregarCaracteristica("externa");
    }

    // Marker: usa setMarker si existe, si no usa L.marker como fallback
    const lat = prop.lat ?? 4.6097;
    const lng = prop.lng ?? -74.0817;
    try {
      if (typeof setMarker === "function") {
        setMarker(lat, lng, (prop.tipo || "").toLowerCase(), prop, true);
      } else {
        // fallback simple
        const iconEdicion = crearIcono("orangered", "fas fa-edit");
        if (typeof marker !== "undefined" && marker) map.removeLayer(marker);
        marker = L.marker([lat, lng], { icon: iconEdicion, draggable: true }).addTo(map);
        marker.on("dragend", (e) => {
          const pos = e.target.getLatLng();
          const latEl = document.getElementById("lat");
          const lngEl = document.getElementById("lng");
          if (latEl) latEl.value = pos.lat;
          if (lngEl) lngEl.value = pos.lng;
        });
        map.setView([lat, lng], 15);
      }
    } catch (err) {
      console.warn("Error al colocar marker:", err);
    }

    modoEdicion = true;
    propiedadId = id;

    const formEl = document.getElementById("registroForm");
    if (formEl) formEl.scrollIntoView({ behavior: "smooth", block: "start" });

  } catch (err) {
    console.error("Error en editarPropiedad:", err);
    alert("Error cargando la propiedad para edición (ver consola).");
  }
};





  cargarAdminPropiedades();
//cargarPropiedadesMapa();



// =========================
// ICONOS PERSONALIZADOS
// =========================
// -----------------------------
// ICONOS (reemplaza tu bloque actual)
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


// Mapeo tipo -> icono + color (útil para badges también)
const estilosPorTipo = {
  "casa":        { icono: iconCasa,        color: "#FFBF00" },
  "apartamento": { icono: iconApartamento, color: "dodgerblue" },
  "lote":        { icono: iconLote,        color: "darkorange" },
  "finca":       { icono: iconFinca,       color: "#66FF00" },
  "apartaestudio": { icono: iconApartaestudio, color: "hotpink" },
  "bodega":      { icono: iconBodega,      color: "#666633" },
  "campestre":   { icono: iconCampestre,   color: "darkgreen" },
  "condominio":  { icono: iconCondominio,  color: "navy" },  // 🔵 diferente de apartamento
  "duplex":      { icono: iconDuplex,      color: "saddlebrown" },
  "edificio":    { icono: iconEdificio,    color: "black" },
  "local":       { icono: iconLocal,       color: "red" },
  "hotel":       { icono: iconHotel,       color: "darkred" },
  "oficina":     { icono: iconOficina,     color: "purple" },
  "penthouse":   { icono: iconPenthouse,   color: "goldenrod" }
};


// ==========================
//  SETEAR MARCADOR EN EL MAPA
// ==========================
function setMarker(lat, lon, tipo = null, datos = null, modoEdicion = false) {
  // Si ya hay un marcador, lo quitamos antes de crear uno nuevo
  if (marker) map.removeLayer(marker);

  let icon;

  // 🎯 Si estamos editando, usamos un ícono especial naranja
  if (modoEdicion) {
    icon = crearIcono("#00172e", "fas fa-edit");
  } else {
    // Caso normal: asignamos icono según tipo
    if (tipo === "casa") icon = iconCasa;
    else if (tipo === "finca") icon = iconFinca;
    else if (tipo === "apartamento" || tipo === "departamento") icon = iconApartamento;
    else if (tipo === "lote") icon = iconLote;
    else if (tipo === "apartaestudio") icon = iconApartaestudio;
    else if (tipo === "bodega") icon = iconBodega;
    else if (tipo === "campestre") icon = iconCampestre;
    else if (tipo === "condominio") icon = iconCondominio;
    else if (tipo === "duplex") icon = iconDuplex;
    else if (tipo === "edificio") icon = iconEdificio;
    else if (tipo === "local") icon = iconLocal;
    else if (tipo === "hotel") icon = iconHotel;
    else if (tipo === "oficina") icon = iconOficina;
    else if (tipo === "penthouse") icon = iconPenthouse;
    else {
      // 👇 Ícono por defecto si no hay tipo o no coincide
      icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [30, 51],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        
      });
    }
  }

  // ✅ Creamos el marcador
  marker = L.marker([lat, lon], { draggable: true, icon }).addTo(map);
  map.setView([lat, lon], 15);

  // ✅ Si nos pasaron datos (propiedad existente), mostramos popup
 if (datos) {
  // Seguridad básica para evitar errores de null/undefined
  const safeTitulo = datos.titulo || "Sin título";
  const safePrecio = datos.precio ? "COP $" + formatearPrecio(datos.precio) : "";
  const safeTipo   = datos.tipo || "Propiedad";
  const imgSrcPopup = (datos.imagenes && datos.imagenes[0]) 
    ? datos.imagenes[0] 
    : "https://via.placeholder.com/160x100?text=Sin+Imagen"; // 👈 imagen por defecto
  const color = "#2E8B57"; // verde por ejemplo (puedes cambiarlo)

  marker
    .bindPopup(`
      <div style="
        width:180px;
        text-align:center;
        font-family:sans-serif;
        border-radius:10px;
        background:#fff;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        padding:8px;">
        
        <img src="${imgSrcPopup}" 
             alt="${safeTitulo}" 
             style="width:100%;border-radius:8px;margin-bottom:6px;">
        
        <h4 style="margin:4px 0;font-size:14px;font-weight:600;color:#333;">
          ${safeTitulo}
        </h4>
        
        <p style="margin:2px 0;font-size:13px;color:#2E8B57;font-weight:bold;">
          ${safePrecio}
        </p>
        
        <span style="
          display:inline-block;
          margin-top:3px;
          padding:2px 6px;
          border-radius:6px;
          font-size:12px;
          background:${color};
          color:#fff;
          font-weight:bold;
          white-space:nowrap;">
          ${safeTipo}
        </span>
       
      </div>
    `)
    .openPopup();
}

  

  // ✅ Guardamos coordenadas si el usuario arrastra el pin
  marker.on("dragend", function (e) {
    const newPos = e.target.getLatLng();
    latInput.value = newPos.lat;
    lngInput.value = newPos.lng;
    console.log("📍 Pin ajustado manualmente:", newPos.lat, newPos.lng);
  });

  // ✅ Guardar coordenadas iniciales
  latInput.value = lat;
  lngInput.value = lon;
}




// ==========================
// CAPA DE MARCADORES DEL LISTADO
// ==========================
markersLayer = L.layerGroup().addTo(map);

function getEstiloByTipo(tipo) {
  return estilosPorTipo[tipo?.toLowerCase()] || { icono: L.Icon.Default, color: "#555" };
}

async function cargarPropiedadesMapa() {
 // markersLayer.clearLayers();

  try {
    const snapshot = await firebase.firestore().collection("propiedades").get();

    snapshot.forEach(doc => {
      const data = doc.data();

      if (data.lat && data.lng) {
        const { icono } = getEstiloByTipo(data.tipo);

        const marker = L.marker([data.lat, data.lng], { icon: icono }).addTo(markersLayer);

        marker.bindPopup(`
          
          <strong>${data.titulo || "Sin título"}</strong><br>
          ${data.ciudad || ""}<br>
          ${data.tipo || ""}<br>
          ${data.precio ? "$" + data.precio : ""}
        `);
      }
    });
  } catch (err) {
    console.error("Error cargando propiedades en mapa:", err);
  }
}
//boton para ver todas las propiedades n el mapa
let mostrandoPropiedades = false; // Estado: cargadas o no

document.getElementById("btnVerPropiedades").addEventListener("click", () => {
  if (mostrandoPropiedades) {
    // 👉 Ocultar
    markersLayer.clearLayers(); // elimina todos los pines del mapa
    document.getElementById("btnVerPropiedades").textContent = "📍 Ver propiedades en el mapa";
    mostrandoPropiedades = false;
  } else {
    // 👉 Mostrar
    cargarPropiedadesMapa();
    document.getElementById("btnVerPropiedades").textContent = "❌ Ocultar propiedades";
    mostrandoPropiedades = true;
  }
});

//===============================================
//hacer q el mapa no se active solo tiene un oton
//===============================================


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





});