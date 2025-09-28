// ✅ Asegúrate de que solo declares estas variables una vez
const postsRef = db.collection("posts");

// referencia a elementos del DOM
const blogForm = document.getElementById("blog-form");
const postsContainer = document.getElementById("blog-posts");

blogForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // <- esto evita la recarga

  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const titulo = document.getElementById("titulo").value.trim();
  const contenido = document.getElementById("contenido").value.trim();

  if (!nombre || !correo || !titulo || !contenido) return;

try {
  await postsRef.add({
    nombre,
    correo, // se guarda pero no se muestra
    titulo,
    contenido,
    fecha: firebase.firestore.FieldValue.serverTimestamp()
  });

  blogForm.reset(); // limpiar formulario

  // ✅ Notificación visual bonita
  mostrarMensaje("✅ Tu post se guardó correctamente.", "exito");
} catch (error) {
  console.error("Error al guardar el post:", error);
  mostrarMensaje("❌ Hubo un error al guardar tu post.", "error");
}

});

// mostrar posts en tiempo real
postsRef.orderBy("fecha", "desc").onSnapshot((snapshot) => {
  postsContainer.innerHTML = "";
  snapshot.forEach((doc) => {
    const post = doc.data();
    const fecha = post.fecha
      ? post.fecha.toDate().toLocaleString()
      : "Recientemente publicado";

    postsContainer.innerHTML += `
      <div class="post">
        <h3>${post.titulo}</h3>
        <p>${post.contenido}</p>
        <small><b>Publicado por:</b> ${post.nombre} - ${fecha}</small>
      </div>
    `;
  });
});



//ver el mensaje de enviado
//=============================

function mostrarMensaje(texto, tipo = "exito") {
  const mensajeDiv = document.getElementById("mensaje");
  mensajeDiv.textContent = texto;
  mensajeDiv.className = `mensaje ${tipo}`;
  mensajeDiv.style.display = "block";

  // Ocultar después de 3 segundos
  setTimeout(() => {
    mensajeDiv.style.display = "none";
  }, 3000);
}
