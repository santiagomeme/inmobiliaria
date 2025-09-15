document.addEventListener("DOMContentLoaded", () => {
  // ==========================
  //  VARIABLES GLOBALES
  // ==========================
  const form = document.getElementById("registroForm");
  if (!form) return;

function formatearPrecio(valor) {
  if (!valor) return "";
  return valor.toLocaleString("es-CO"); // 👉 2.500.000
}

  const adminLista = document.getElementById("adminPropiedadesList");

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


// Crear mapa centrado en Bogotá
const map = L.map("map").setView([3.4516, -76.5320], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

let marker;




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
// 👉 Si ya no quieres que se cambie la dirección, puedes comentar esta parte.
//    Así el pin solo se mueve con click y arrastre, pero sin sobreescribir la dirección.
map.on("click", (e) => {
  const { lat, lng } = e.latlng;
  setMarker(lat, lng);
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
//  SUBMIT FORMULARIO
// ==========================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo       = document.getElementById("titulo").value.trim();
  const descripcion  = document.getElementById("descripcion").value.trim();
  const ciudad       = document.getElementById("ciudad").value.trim();
  const direccion    = document.getElementById("direccion").value.trim();
  const tipo         = document.getElementById("tipo").value.trim();       // casa, apto, lote...
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
    fecha: firebase.firestore.FieldValue.serverTimestamp()
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

    form.reset();
    if (marker) {
      map.removeLayer(marker);
    }
    marker = L.marker([4.6097, -74.0817]).addTo(map); // reset marcador
    map.setView([4.6097, -74.0817], 13);

    cargarAdminPropiedades();
    cargarPropiedadesMapa();

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

      // seguridad: valores por defecto
      const area = prop.area || 0;
      const estado = prop.estado || "Sin estado";
      const propiedadNueva = prop.propiedadNueva === true ? "✅" : "❌";
      const titulo = prop.titulo || "Sin título";
      const precio = prop.precio ? `$${formatearPrecio(prop.precio)}` : "Sin precio";
      const modalidad = prop.modalidad ? `${prop.modalidad}` : "Sin modalidad";
      const ciudad = prop.ciudad || "Sin ciudad";
     let imagen = "imagenes/default.png";

if (prop.imagenes && Array.isArray(prop.imagenes)) {
  imagen = prop.imagenes.length > 0 ? prop.imagenes[0] : "imagenes/default.png";
}

      const banos = prop.banos || 0;
      const habitaciones = prop.habitaciones || 0;
      const garage = prop.garage || 0;
      const tipo = prop.tipo || "Otro";

      // color según tipo
      const estilo = estilosPorTipo[tipo.toLowerCase()] || { color: "#555" };
      const color = estilo.color;

      // card
      const card = document.createElement("div");
      card.classList.add("prop-card");

      card.innerHTML = `
  <div class="card-img-wrapper">
    <img src="${imagen}" alt="${titulo}" />
    ${propiedadNueva ? '<span class="badge-nueva">NUEVO</span>' : ''}
  </div>
        <h3>${titulo}</h3>
         <!-- tipo con color -->
        <span class="prop-tipo" style="background:${color};">${tipo}</span>


        <p>${ciudad}</p>

        <p><strong>Área:</strong> ${area} m²</p>
        <p><strong>Estado:</strong> ${estado}</p>
        <p><strong>modalidad:</strong> ${modalidad}</p>

        <p><strong>Baños:</strong> ${banos}</p>
        <p><strong>Habitaciones:</strong> ${habitaciones}</p>
        <p><i class="fas fa-car"></i> Garajes: ${garage}</p>

        <p class="precio-propiedad">
    ${formatearPrecio(precio)}</p>
        <button onclick="editarPropiedad('${doc.id}')">Editar</button>
        <button onclick="eliminarPropiedad('${doc.id}')">Eliminar</button>
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
cargarPropiedadesMapa();

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
    document.getElementById("area").value          = prop.area || 0;
    document.getElementById("estado").value        = prop.estado || "";
    document.getElementById("propiedadNueva").checked = prop.propiedadNueva === true;
    document.getElementById("titulo").value        = prop.titulo || "";
    document.getElementById("descripcion").value   = prop.descripcion || "";
    document.getElementById("ciudad").value        = prop.ciudad || "";
    document.getElementById("direccion").value     = prop.direccion || "";
    document.getElementById("garage").value        = prop.garage || 0;
    document.getElementById("tipo").value          = prop.tipo || "";
    document.getElementById("modalidad").value     = prop.modalidad || "";
    document.getElementById("habitaciones").value  = prop.habitaciones || 0;
    document.getElementById("banos").value         = prop.banos || 0;
    document.getElementById("precio").value = formatearPrecio(prop.precio) || "";
    document.getElementById("imagenes").value      = (prop.imagenes || []).join(", ");
    document.getElementById("lat").value           = prop.lat || "";
    document.getElementById("lng").value           = prop.lng || "";
    document.getElementById("activa").checked = prop.activa === true;
    document.getElementById("destacada").checked   = prop.destacada === true;

  // ==========================
//  Actualizar marcador en el mapa
// ==========================
setMarker(prop.lat || 4.6097, prop.lng || -74.0817, prop.tipo?.toLowerCase());

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
cargarPropiedadesMapa();



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

const iconCasa        = crearIcono("goldenrod", "fas fa-home");
const iconApartamento = crearIcono("dodgerblue", "fas fa-building");
const iconLote        = crearIcono("darkorange", "fas fa-border-all");
const iconFinca       = crearIcono("green", "fas fa-tractor");
const iconApartaestudio = crearIcono("hotpink", "fas fa-door-open");
const iconBodega      = crearIcono("grey", "fas fa-warehouse");
const iconCampestre   = crearIcono("darkgreen", "fas fa-tree");
const iconCondominio  = crearIcono("navy", "fas fa-city"); // 🔵 cambiado a azul más oscuro
const iconDuplex      = crearIcono("saddlebrown", "fas fa-building");
const iconEdificio    = crearIcono("black", "fas fa-building-circle-check");
const iconLocal       = crearIcono("red", "fas fa-store");
const iconHotel       = crearIcono("darkred", "fas fa-hotel");
const iconOficina     = crearIcono("purple", "fas fa-briefcase");
const iconPenthouse   = crearIcono("goldenrod", "fas fa-crown");


// Mapeo tipo -> icono + color (útil para badges también)
const estilosPorTipo = {
  "casa":        { icono: iconCasa,        color: "goldenrod" },
  "apartamento": { icono: iconApartamento, color: "dodgerblue" },
  "lote":        { icono: iconLote,        color: "darkorange" },
  "finca":       { icono: iconFinca,       color: "green" },
  "apartaestudio": { icono: iconApartaestudio, color: "hotpink" },
  "bodega":      { icono: iconBodega,      color: "grey" },
  "campestre":   { icono: iconCampestre,   color: "darkgreen" },
  "condominio":  { icono: iconCondominio,  color: "navy" },  // 🔵 diferente de apartamento
  "duplex":      { icono: iconDuplex,      color: "saddlebrown" },
  "edificio":    { icono: iconEdificio,    color: "black" },
  "local":       { icono: iconLocal,       color: "red" },
  "hotel":       { icono: iconHotel,       color: "darkred" },
  "oficina":     { icono: iconOficina,     color: "purple" },
  "penthouse":   { icono: iconPenthouse,   color: "goldenrod" }
};


function setMarker(lat, lon, tipo = null) {

  if (marker) map.removeLayer(marker);

  let icon;
  if (tipo === 'casa') icon = iconCasa;
  else if (tipo === 'finca') icon = iconFinca;
  else if (tipo === 'apartamento' || tipo === 'departamento') icon = iconApartamento;
  else if (tipo === 'lote') icon = iconLote;
  else if (tipo === 'apartaestudio') icon = iconApartaestudio;
  else if (tipo === 'bodega') icon = iconBodega;
  else if (tipo === 'campestre') icon = iconCampestre;
  else if (tipo === 'condominio') icon = iconCondominio;
  else if (tipo === 'duplex') icon = iconDuplex;
  else if (tipo === 'edificio') icon = iconEdificio;
  else if (tipo === 'local') icon = iconLocal;
  else if (tipo === 'hotel') icon = iconHotel;
  else if (tipo === 'oficina') icon = iconOficina;
  else if (tipo === 'penthouse') icon = iconPenthouse;
  else {
    // 👇 Ícono por defecto si no hay tipo o no coincide
    icon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }

  marker = L.marker([lat, lon], { draggable: true, icon }).addTo(map);
  map.setView([lat, lon], 15);

  latInput.value = lat;
  lngInput.value = lon;

  marker.on("dragend", function (e) {
    const newPos = e.target.getLatLng();
    latInput.value = newPos.lat;
    lngInput.value = newPos.lng;
    console.log("Pin ajustado manualmente:", newPos.lat, newPos.lng);
  });





}



// ==========================
// CAPA DE MARCADORES DEL LISTADO
// ==========================
const markersLayer = L.layerGroup().addTo(map);

function getEstiloByTipo(tipo) {
  return estilosPorTipo[tipo?.toLowerCase()] || { icono: L.Icon.Default, color: "#555" };
}

async function cargarPropiedadesMapa() {
  markersLayer.clearLayers();

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
          ${data.precio ? "$" + data.precio : ""}
        `);
      }
    });
  } catch (err) {
    console.error("Error cargando propiedades en mapa:", err);
  }
}

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