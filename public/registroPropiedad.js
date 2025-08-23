document.addEventListener("DOMContentLoaded", () => {
  // ==========================
  //  VARIABLES GLOBALES
  // ==========================
  const form = document.getElementById("registroForm");
  if (!form) return;


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

// Crear mapa centrado en Bogotá
const map = L.map("map").setView([4.6097, -74.0817], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

let marker;

// Función para poner marcador en el mapa (arrastrable)
function setMarker(lat, lon) {
  if (marker) map.removeLayer(marker);

  marker = L.marker([lat, lon], { draggable: true }).addTo(map);
  map.setView([lat, lon], 15);

  // Guardar coordenadas en inputs
  latInput.value = lat;
  lngInput.value = lon;

  // Escuchar cuando el usuario mueva el pin manualmente
  marker.on("dragend", function (e) {
    const newPos = e.target.getLatLng();
    latInput.value = newPos.lat;
    lngInput.value = newPos.lng;
    console.log("Pin ajustado manualmente:", newPos.lat, newPos.lng);
  });
}

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

    const titulo      = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const ciudad      = document.getElementById("ciudad").value.trim();
    const direccion   = document.getElementById("direccion").value.trim();
    const tipo        = document.getElementById("tipo").value.trim();
    const precio      = parseFloat(document.getElementById("precio").value);
    let imagenRuta    = document.getElementById("imagen").value.trim();
    const lat         = parseFloat(latInput.value) || null;
    const lng         = parseFloat(lngInput.value) || null;

    if (!titulo || !ciudad || !direccion || !tipo || !precio || !imagenRuta || lat === null || lng === null) {
      alert("Completa todos los campos correctamente.");
      return;
    }

    // Normalizar ruta de la imagen
    imagenRuta = imagenRuta.replace(/^\/+/, "");
    const imagenURL = "/" + imagenRuta;

    const datos = {
      titulo,
      descripcion,
      ciudad,
      direccion,
      tipo,
      precio,
      imagen: imagenURL,
      lat,
      lng,
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

    const snapshot = await firebase.firestore().collection("propiedades").get();
    snapshot.forEach(doc => {
      const prop = doc.data();
      const card = document.createElement("div");
      card.classList.add("prop-card");
      card.innerHTML = `
        <h3>${prop.titulo}</h3>
        <p>${prop.descripcion}</p>
        <p><strong>Precio:</strong> $${prop.precio}</p>
        <p><strong>Ciudad:</strong> ${prop.ciudad}</p>
        <button onclick="editarPropiedad('${doc.id}')">Editar</button>
        <button onclick="eliminarPropiedad('${doc.id}')">Eliminar</button>
      `;
      adminLista.appendChild(card);
    });
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

  // ==========================
  //  EDITAR PROPIEDAD
  // ==========================
  window.editarPropiedad = async function(id) {
    const docRef = firebase.firestore().collection("propiedades").doc(id);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const prop = docSnap.data();

      // Cargar valores al formulario
      document.getElementById("titulo").value = prop.titulo;
      document.getElementById("descripcion").value = prop.descripcion;
      document.getElementById("ciudad").value = prop.ciudad;
      document.getElementById("direccion").value = prop.direccion;
      document.getElementById("tipo").value = prop.tipo;
      document.getElementById("precio").value = prop.precio;
      document.getElementById("imagen").value = prop.imagen.replace(/^\//, "");
      document.getElementById("lat").value = prop.lat;
      document.getElementById("lng").value = prop.lng;

      // Actualizar marcador en el mapa
      if (!marker) {
        marker = L.marker([prop.lat, prop.lng]).addTo(map);
      } else {
        marker.setLatLng([prop.lat, prop.lng]);
      }
      map.setView([prop.lat, prop.lng], 15);

      // Activar modo edición
      modoEdicion = true;
      propiedadId = id;
    }
  };

  cargarAdminPropiedades();



//marcar iconos de color y forma  por tipo de propiedad

// Iconos con diferentes colores
const iconCasa = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconApartamento = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconLote = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


function setMarker(lat, lon, tipo) {
  if (marker) map.removeLayer(marker);

  let icon;
  if (tipo === 'casa') icon = iconCasa;
  else if (tipo === 'apartamento') icon = iconApartamento;
  else if (tipo === 'lote' || tipo === 'finca') icon = iconLote;
  else icon = L.icon({iconUrl: 'default.png'}); // ícono por defecto

  marker = L.marker([lat, lon], { draggable: true, icon: icon }).addTo(map);
  map.setView([lat, lon], 15);

  latInput.value = lat;
  lngInput.value = lon;

  marker.on("dragend", function(e) {
    const newPos = e.target.getLatLng();
    latInput.value = newPos.lat;
    lngInput.value = newPos.lng;
    console.log("Pin ajustado manualmente:", newPos.lat, newPos.lng);
  });
}
});