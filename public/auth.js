// ==========================
//  REGISTRO DE USUARIO / ADMIN
// ==========================
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Asignar rol: solo email admin principal puede ser 'admin'
      const rol = email === "admin@tuproyecto.com" ? "admin" : "editor";

      // Guardar info del usuario en Firestore
      await db.collection("usuarios").doc(user.uid).set({
        email,
        rol
      });

      alert(`✅ Registro exitoso. Bienvenido ${rol}: ${user.email}`);
      window.location.href = "registroPropiedad.html";
    } catch (error) {
      alert("Error en registro: " + error.message);
    }
  });
}

// ==========================
//  LOGIN DE USUARIO
// ==========================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Obtener rol desde Firestore
      const doc = await db.collection("usuarios").doc(user.uid).get();
      if (!doc.exists) {
        alert("⚠️ Usuario no registrado en la base de datos.");
        await auth.signOut();
        return;
      }

      const { rol } = doc.data();

      if (rol !== "admin" && rol !== "editor") {
        alert("⚠️ No tienes permisos para acceder al panel.");
        await auth.signOut();
        return;
      }

      alert(`✅ Bienvenido ${rol}: ${user.email}`);
      window.location.href = "registroPropiedad.html";

    } catch (error) {
      alert("Error en login: " + error.message);
    }
  });
}

// ==========================
//  LOGOUT
// ==========================
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await auth.signOut();
    alert("Sesión cerrada.");
    window.location.href = "inicio.html";
  });
}

// ==========================
//  PROTECCIÓN DE RUTAS
// ==========================
auth.onAuthStateChanged(async (user) => {
  if (!user && window.location.pathname.includes("registroPropiedad.html")) {
    window.location.href = "registro.html";
  } else if (user) {
    // opcional: comprobar rol para páginas admin
    const doc = await db.collection("usuarios").doc(user.uid).get();
    const rol = doc.exists ? doc.data().rol : null;
    if (!rol || (rol !== "admin" && rol !== "editor")) {
      await auth.signOut();
      window.location.href = "registro.html";
    }
  }
});
