  const slides = document.querySelectorAll('.slides img');
  let index = 0;
  function showSlide() {
    slides.forEach((img,i)=> img.style.opacity=0);
    slides[index].style.opacity=1;
    index = (index + 1) % slides.length;
  }
  showSlide();
  setInterval(showSlide, 4000);
  //======================
  //propiedades destacadas
  //======================

  async function cargarDestacadas() {
  try {
    const snapshot = await firebase.firestore()
      .collection("propiedades")
      .where("destacada", "==", true)
      .where("activa", "==", true)
      .limit(10) // 👈 opcional, solo mostrar 6
      .get();

    const contenedor = document.getElementById("destacadas-list");
    contenedor.innerHTML = "";

    if (snapshot.empty) {
      contenedor.innerHTML = "<p>No hay propiedades destacadas por ahora.</p>";
      return;
    }

    snapshot.forEach(doc => {
      const prop = doc.data();
      const card = document.createElement("div");
      card.classList.add("tarjeta");
      card.innerHTML = `
        <img src="${prop.imagen}" alt="${prop.titulo}">
        <h3>${prop.titulo}</h3>
        <p>${prop.ciudad} - ${prop.tipo} (${prop.modalidad})</p>
        <p>$${prop.precio.toLocaleString()}</p>
         <a href="detalle.html?id=${doc.id}" class="btn-detalle">Ver detalles</a>

      `;
      contenedor.appendChild(card);
    });
  } catch (err) {
    console.error("Error cargando destacadas:", err);
  }
}

// Ejecutar en el inicio
cargarDestacadas();
