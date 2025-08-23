document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addUserForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("userEmail").value.trim();
    const password = document.getElementById("userPassword").value.trim();
    const role = document.getElementById("userRole").value;

    if (!email || !password) return alert("Completa todos los campos.");

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Guardar rol en Firestore
      await db.collection("usuarios").doc(user.uid).set({
        email,
        role
      });

      alert("Usuario creado ✅");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("Error al crear usuario: " + err.message);
    }
  });
});
