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




function formatearPrecio(valor) {
  if (!valor) return "";
  return valor.toLocaleString("es-CO"); // 👉 2.500.000
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
  // Normalizamos el tipo: minúsculas y sin tildes
  let tipo = document.getElementById("tipo").value.trim().toLowerCase();
  tipo = tipo.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); 
  const modalidad    = document.getElementById("modalidad").value.trim();  // venta o alquiler
  const habitaciones = parseInt(document.getElementById("habitaciones").value) || 0;
  const banos        = parseInt(document.getElementById("banos").value) || 0;
  // limpiar puntos y comas, para que siempre se guarde como número
  const precioRaw = document.getElementById("precio").value.replace(/\./g, "").replace(/,/g, "");
  const precio = parseFloat(precioRaw) || 0;
  const garage = parseInt(document.getElementById("garage").value) || 0;
  const area = parseFloat(document.getElementById("area").value) || 0;
  const estado = document.getElementById("estado").value.trim();
  const propiedadNueva = document.getElementById("propiedadNueva").checked;

// true si está marcado, false si no

  // Obtener las imágenes desde el input
  const imagenesInput = document.getElementById("imagenes").value.trim();

  // Convertir en array separando por comas
  const imagenes = imagenesInput.split(",")
    .map(img => img.trim())
    .filter(img => img !== "");  // limpiar vacíos

  const lat = parseFloat(document.getElementById("lat").value) || null;
  const lng = parseFloat(document.getElementById("lng").value) || null;
  const activa = document.getElementById("activa").checked; 
  const destacada = document.getElementById("destacada").checked;

    // 👇 NUEVOS CAMPOS
  const codigo       = document.getElementById("codigo")?.value.trim() || "";
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

  const datos = {
    titulo,
    descripcion,
    ciudad,
    direccion,
    tipo,
    modalidad,
    habitaciones,
    banos,
    area,              // 👈 nuevo
    estado,            // 👈 nuevo
    propiedadNueva,    // 👈 nuevo (true/false)
    garage,   // 👈 nuevo campo
    precio,
    imagenes,   // 👈 ahora es un array
    lat,
    lng,
    activa,
    destacada,
    codigo,       // 👈 nuevo
    piso,         // 👈 nuevo
    estrato,      // 👈 nuevo
    pais,         // 👈 nuevo
    departamento, // 👈 nuevo
    internas,     // 👈 array
    externas,     // 👈 array
    fecha: firebase.firestore.FieldValue.serverTimestamp(),

  };

  try {
    if (modoEdicion && propiedadId) {
      // === ACTUALIZAR ===
      await firebase.firestore().collection("propiedades").doc(propiedadId).update(datos);
      alert("Propiedad actualizada ✅");
      modoEdicion = false;
      propiedadId = null;
    } else {
      // === CREAR ===
      await firebase.firestore().collection("propiedades").add(datos);
      alert("Propiedad registrada ✅");
    }

// 👉 Mostrar marcador con popup
// 👇 Limpia y vuelve a cargar todos los marcadores desde la BD
markersLayer.clearLayers();
await cargarAdminPropiedades();

 // 👉 Centrar el mapa en la propiedad editada/creada
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
  adminLista.innerHTML = "";

  try {
    const snapshot = await firebase.firestore().collection("propiedades").get();

    snapshot.forEach(doc => {
      const prop = doc.data();

      // valores por defecto
      const area = prop.area || 0;
      const estado = prop.estado || "Sin estado";
      const propiedadNueva = prop.propiedadNueva === true;
      const titulo = prop.titulo || "Sin título";
      const precio = prop.precio || 0;
      const modalidad = prop.modalidad || "Sin modalidad";
      const ciudad = prop.ciudad || "Sin ciudad";
      const banos = prop.banos || 0;
      const habitaciones = prop.habitaciones || 0;
      const garage = prop.garage || 0;
      const tipo = prop.tipo || "Otro";
      const destacada = prop.destacada === true;
      const activa = prop.activa === true;   // ✅ se agrega esta línea
      const codigo       = prop.codigo || "Sin código";
      const piso         = prop.piso || 0;
      const estrato      = prop.estrato || 0;
      const pais         = prop.pais || "Sin país";
      const departamento = prop.departamento || "Sin departamento";

      const internas     = prop.internas || [];
      const externas     = prop.externas || [];




      // imagen principal
let imagen = "imagenes/default.png";
if (prop.imagenes && Array.isArray(prop.imagenes)) {
  imagen = prop.imagenes.length > 0 ? prop.imagenes[0] : "imagenes/default.png";
}

// 👇 Asegurar que sea ruta absoluta en hosting
if (!imagen.startsWith("http")) {
  imagen = "/" + imagen;
}

      // estilo por tipo
      const estilo = estilosPorTipo[tipo.toLowerCase()] || { color: "#555" };
      const color = estilo.color;


      // ==========================
      // Card unificada (modelo mapa.js)
      // ==========================
      const card = document.createElement("div");
      card.classList.add("prop-card");

      card.innerHTML = `
        <div class="card-img-wrapper">
          <img src="${imagen}" alt="${titulo}">
          ${propiedadNueva ? '<span class="badge-nueva">NUEVO</span>' : ""}
        </div>

        <div class="card-body">
          <h3 class="card-title">${titulo}</h3>
         
        <div class="prop-badges">
          <span class="prop-tipo" style="background:${color};">${tipo}
          </span>
          <span class="prop-badge">${modalidad || ""}</span>
          <span class="prop-badge">${estado || ""}</span>
   <span class="prop-badge ${activa ? "badge-activa" : "badge-inactiva"}">
    ${activa ? "Activa" : "Inactiva"}
  </span>      
          </div>
          
          <p >${ciudad}</p>
          <p><i class="fas fa-car"></i>  ${garage}</p>
          <p><strong>Baños:</strong> <span class="prop-valor">${banos}</span></p>
          <p><strong>Área:</strong> <span class="prop-valor">${area} m²</span></p>
          <p><strong>Habitaciones:</strong> <span class="prop-valor">${habitaciones}</span></p>

        <div class="precio-container">
        ${destacada ? `<span class="badge-destacada"><i class="fas fa-star"></i> Destacada</span>` : ""}
        <p class="prop-precio">COP $${formatearPrecio(precio) || "$0"}
        </p>
          <div class="card-actions">
            <button class="btn-edit" onclick="editarPropiedad('${doc.id}')">
              ✏️ Editar
            </button>
            <button class="btn-delete" onclick="eliminarPropiedad('${doc.id}')">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      `;

      adminLista.appendChild(card);
    });

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
cargarAdminPropiedades();
//cargarPropiedadesMapa();



// ==========================
//  EDITAR PROPIEDAD
// ==========================
window.editarPropiedad = async function(id) {
  const docRef = firebase.firestore().collection("propiedades").doc(id);
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    const prop = docSnap.data();

    // ==========================
    //  Cargar valores al formulario
    // ==========================
    document.getElementById("area").value            = prop.area || 0;
    document.getElementById("estado").value          = prop.estado || "";
    document.getElementById("propiedadNueva").checked= prop.propiedadNueva === true;
    document.getElementById("titulo").value          = prop.titulo || "";
    document.getElementById("descripcion").value     = prop.descripcion || "";
    document.getElementById("ciudad").value          = prop.ciudad || "";
    document.getElementById("direccion").value       = prop.direccion || "";
    document.getElementById("garage").value          = prop.garage || 0;
    document.getElementById("tipo").value            = prop.tipo || "";
    document.getElementById("modalidad").value       = prop.modalidad || "";
    document.getElementById("habitaciones").value    = prop.habitaciones || 0;
    document.getElementById("banos").value           = prop.banos || 0;
    document.getElementById("codigo").value       = prop.codigo || "";
    document.getElementById("estrato").value      = prop.estrato || "";
    document.getElementById("piso").value         = prop.piso || "";
    document.getElementById("pais").value         = prop.pais || "";
    document.getElementById("departamento").value = prop.departamento || "";
    document.getElementById("precio").value = prop.precio != null ? prop.precio.toLocaleString("es-CO") : "";

    let imgs = [];
    if (prop.imagenes) {
      imgs = Array.isArray(prop.imagenes) ? prop.imagenes : [prop.imagenes];
    }
    document.getElementById("imagenes").value = imgs.join(", ");

    document.getElementById("lat").value = prop.lat || "";
    document.getElementById("lng").value = prop.lng || "";
    document.getElementById("activa").checked   = prop.activa === true;
    document.getElementById("destacada").checked= prop.destacada === true;

    // ==========================
    //  Características internas y externas
    // ==========================
    const internasContainer = document.getElementById("caracteristicas-internas-container");
    internasContainer.innerHTML = ""; // limpiar antes de insertar
    if (prop.internas && prop.internas.length > 0) {
      prop.internas.forEach(car => agregarCaracteristica("interna", car));
    } else {
      agregarCaracteristica("interna"); // siempre al menos un campo
    }

    const externasContainer = document.getElementById("caracteristicas-externas-container");
    externasContainer.innerHTML = "";
    if (prop.externas && prop.externas.length > 0) {
      prop.externas.forEach(car => agregarCaracteristica("externa", car));
    } else {
      agregarCaracteristica("externa");
    }

    // ==========================
    //  Actualizar marcador en el mapa SOLO UNO
    // ==========================
    const iconEdicion = crearIcono("orangered", "fas fa-edit"); // 🔥 Ícono especial para edición

    setMarker(
      prop.lat || 4.6097,
      prop.lng || -74.0817,
      prop.tipo?.toLowerCase(),
      prop,          // datos de la propiedad (para popup)
      true           // 👈 modo edición = ícono naranja
    );

    // ==========================
    //  Activar modo edición
    // ==========================
    modoEdicion = true;
    propiedadId = id;

    // ==========================
    //  Llevar scroll al formulario
    // ==========================
    document.getElementById("registroForm").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
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