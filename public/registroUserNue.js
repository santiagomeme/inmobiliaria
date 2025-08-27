document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addUserForm");
  const noAccess = document.getElementById("noAccess");

  // 🔐 Verificar usuario autenticado
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "registro.html"; // si no está logueado → fuera
      return;
    }

    try {
      const doc = await db.collection("usuarios").doc(user.uid).get();
      if (doc.exists && doc.data().rol === "admin") {
        form.style.display = "block"; // ✅ Solo admin ve el form
      } else {
        noAccess.style.display = "block"; // 🚫 Bloqueado para otros
      }
    } catch (err) {
      console.error("Error al obtener rol:", err);
      noAccess.style.display = "block";
    }
  });

  // 📌 Manejo del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("userEmail").value.trim();
    const password = document.getElementById("userPassword").value.trim();
    const role = document.getElementById("userRole").value;

    if (!email || !password) return alert("Completa todos los campos.");

    try {
      // 🔥 Crear usuario en Firebase Auth
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const newUser = userCredential.user;

      // Guardar rol en Firestore
      await db.collection("usuarios").doc(newUser.uid).set({
        email,
        rol: role   // 👈 aquí usé "rol" igual que en registro.js
      });

      alert("✅ Usuario creado. Ahora debes volver a iniciar sesión como admin.");
      form.reset();

      // Cerrar sesión automáticamente (porque ahora está logueado el nuevo usuario)
      await auth.signOut();
      window.location.href = "registro.html";

    } catch (err) {
      console.error(err);
      alert("❌ Error al crear usuario: " + err.message);
    }
  });
});
