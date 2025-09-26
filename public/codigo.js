




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
  "hotel":         { icono: '<i class="fas fa-hotel"></i>', color: "darkred" },
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
  contenedor.querySelectorAll(".estadistica-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      clearActiveChips();
      btn.classList.add("active");

      const tipo = btn.dataset.tipo;

      if (tipo === "reset") {
        // mostrar todas
        renderAdminListaFromArray(propiedades);
        return;
      }

      if (tipo === "activas") {
        renderAdminListaFromArray(propiedades.filter(p => !!p.activa));
        return;
      }

      if (tipo === "inactivas") {
        renderAdminListaFromArray(propiedades.filter(p => !p.activa));
        return;
      }

      if (tipo === "destacadas") {
        renderAdminListaFromArray(propiedades.filter(p => !!p.destacada));
        return;
      }

      // filtro por tipo de propiedad
      renderAdminListaFromArray(propiedades.filter(p => (p.tipo || "").toLowerCase() === tipo.toLowerCase()));
    });
  });

  // por defecto mostrar todo en adminLista (si está vacío)
  if ((adminLista && adminLista.innerHTML.trim() === "") || true) {
    // para asegurar que siempre se vea al menos la lista
    renderAdminListaFromArray(propiedades);
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
        <p><strong>Baños:</strong> ${escapeHtml(banos)}</p>
        <p><strong>Habitaciones:</strong> ${escapeHtml(habitaciones)}</p>

        <p class="prop-precio">COP ${formatearPrecio(precio)}</p>

        <div class="card-actions">
          <button class="btn-edit" data-id="${escapeHtml(id)}">✏️ Editar</button>
          <button class="btn-delete" data-id="${escapeHtml(id)}">🗑️ Eliminar</button>
        </div>
      </div>
    `;

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
