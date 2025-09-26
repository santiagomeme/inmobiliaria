

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



// -----------------------------
function crearIcono(color, iconoFA) {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="
        background:${color};
        border-radius:50%;
        width:34px;
        margin:0 auto
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


// ===============================
// Función para calcular conteos
// ===============================
function calcularConteos(propiedades) {
  return {
    total: propiedades.length,
    casas: propiedades.filter(p => p.tipo === "casa").length,
    apartamentos: propiedades.filter(p => p.tipo === "apartamento").length,
    lotes: propiedades.filter(p => p.tipo === "lote").length,
    fincas: propiedades.filter(p => p.tipo === "finca").length,
    apartaestudios: propiedades.filter(p => p.tipo === "apartaestudio").length,
    bodegas: propiedades.filter(p => p.tipo === "bodega").length,
    campestres: propiedades.filter(p => p.tipo === "campestre").length,
    condominios: propiedades.filter(p => p.tipo === "condominio").length,
    duplex: propiedades.filter(p => p.tipo === "duplex").length,
    edificios: propiedades.filter(p => p.tipo === "edificio").length,
    locales: propiedades.filter(p => p.tipo === "local").length,
    hoteles: propiedades.filter(p => p.tipo === "hotel").length,
    oficinas: propiedades.filter(p => p.tipo === "oficina").length,
    penthouse: propiedades.filter(p => p.tipo === "penthouse").length,

    activas: propiedades.filter(p => p.activa).length,
    inactivas: propiedades.filter(p => !p.activa).length,
    destacadas: propiedades.filter(p => p.destacada).length,
  };
}

// ===============================
// Render dinámico en el DOM (con tarjetas)
// ===============================
function renderEstadisticas(propiedades) {
  const conteos = calcularConteos(propiedades);
  console.log("Conteos calculados:", conteos);

  const contenedor = document.getElementById("estadisticas");
  if (!contenedor) return;

  // 🟢 Estados generales
  let htmlEstados = `
    <div class="estadistica-card" style="border-top: 4px solid teal" data-filtro="reset">
      <div class="icono">📊</div>
      <h4>Total</h4>
      <p>${conteos.total || 0}</p>
    </div>
    <div class="estadistica-card" style="border-top: 4px solid green" data-filtro="filtroActiva" data-valor="true">
      <div class="icono">✅</div>
      <h4>Activas</h4>
      <p>${conteos.activas || 0}</p>
    </div>
    <div class="estadistica-card" style="border-top: 4px solid gray" data-filtro="filtroActiva" data-valor="false">
      <div class="icono">❌</div>
      <h4>Inactivas</h4>
      <p>${conteos.inactivas || 0}</p>
    </div>
    <div class="estadistica-card" style="border-top: 4px solid orange" data-filtro="destacada" data-valor="true">
      <div class="icono">⭐</div>
      <h4>Destacadas</h4>
      <p>${conteos.destacadas || 0}</p>
    </div>
  `;

  // 🟢 Tipos
  let htmlTipos = "";
  for (let tipo in estilosPorTipo) {
    const estilo = estilosPorTipo[tipo];
    const keyPlural = tipo.toLowerCase() + "s";
    const cantidad = conteos[keyPlural] ?? conteos[tipo.toLowerCase()] ?? 0;

    if (cantidad > 0) {
      htmlTipos += `
        <div class="estadistica-card" 
             style="border-top: 4px solid ${estilo.color}" 
             data-filtro="tipo" 
             data-valor="${tipo.toLowerCase()}">
          <div class="icono">
            <i class="${estilo.icono.options.html.match(/class="([^"]+)"/)[1]}" 
               style="color:${estilo.color};font-size:22px;"></i>
          </div>
          <h4>${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h4>
          <p>${cantidad}</p>
        </div>
      `;
    }
  }

  contenedor.innerHTML = htmlEstados + htmlTipos;

  // 👉 Listeners
  contenedor.querySelectorAll(".estadistica-card").forEach(card => {
    card.addEventListener("click", () => {
      const filtro = card.dataset.filtro;
      const valor = card.dataset.valor;

      if (filtro === "reset") {
        // ✅ Quitar filtros
        document.getElementById("tipo").value = "";
        document.getElementById("estado").value = "todos";
        document.getElementById("filtroActiva").value = "todas";
        document.getElementById("destacada").checked = false;
      } 
      else if (filtro === "tipo") {
        document.getElementById("tipo").value = valor;
      } 
      else if (filtro === "filtroActiva") {
        document.getElementById("filtroActiva").value = valor;
      } 
      else if (filtro === "destacada") {
        document.getElementById("destacada").checked = true;
      }

      // 🔎 Simular click en el botón Buscar
      document.getElementById("buscarBtn").click();
    });
  });
}


function renderEstadisticasTexto(propiedades) {
  const conteos = calcularConteos(propiedades);
  const contenedor = document.getElementById("estadisticas");


  if (!contenedor) {
    console.warn("No se encontró el div de estadísticas");
    return;
  }

  contenedor.innerHTML = `
    <div class="estadisticas-box">
      <p>Total propiedades: <strong>${conteos.total}</strong></p>
      <p>Casas: <strong>${conteos.casas}</strong></p>
      <p>Apartamentos: <strong>${conteos.apartamentos}</strong></p>
      <p>Lotes: <strong>${conteos.lotes}</strong></p>
      <p>Fincas: <strong>${conteos.fincas}</strong></p>
      <p>Activas: <strong>${conteos.activas}</strong></p>
      <p>Inactivas: <strong>${conteos.inactivas}</strong></p>
      <p>Destacadas: <strong>${conteos.destacadas}</strong></p>
    </div>
  `;
}

