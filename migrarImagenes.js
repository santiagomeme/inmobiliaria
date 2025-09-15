// migrarImagenes.js
const firebase = require("firebase/app");
require("firebase/firestore");

// ⚠️ Usa tu configuración real de Firebase (la misma que en tu app)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

async function migrarImagenes() {
  const snapshot = await db.collection("propiedades").get();

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Si la propiedad tiene "imagenes" como string, conviértela a array
    if (data.imagenes && typeof data.imagenes === "string") {
      const nueva = [data.imagenes];
      await db.collection("propiedades").doc(doc.id).update({ imagenes: nueva });
      console.log(`✅ Migrada propiedad ${doc.id}`);
    }
  }

  console.log("🎉 Migración terminada");
}

migrarImagenes().catch(console.error);
