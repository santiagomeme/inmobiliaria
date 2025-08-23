const express = require("express");
const multer = require("multer");
const path = require("path");
const admin = require("firebase-admin");
const fetch = require("node-fetch"); // ⚡ necesario si usas Node <18
const app = express();

// 🔑 Inicializar Firebase Admin SDK
const serviceAccount = require("./firebase-key.json"); // tu JSON de credenciales
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 📂 Carpeta donde se guardarán las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/imagenes"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // evitar nombres repetidos
  }
});

const upload = multer({ storage });

// Middleware para parsear JSON
app.use(express.json());

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// 📌 Ruta para subir imagen + guardar en Firestore
app.post("/upload", upload.single("imagen"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No se subió ninguna imagen");
    }

    // URL de la imagen dentro de /public/imagenes
    const imageUrl = `/imagenes/${req.file.filename}`;

    // Extraer los demás datos que mandes desde el formulario (body)
    const { titulo, descripcion, precio } = req.body;

    // Guardar en Firestore
    const docRef = await db.collection("productos").add({
      titulo,
      descripcion,
      precio: parseFloat(precio), // asegurar número
      imagen: imageUrl,
      creadoEn: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ id: docRef.id, imageUrl });

  } catch (error) {
    console.error("Error subiendo producto:", error);
    res.status(500).send("Error al guardar el producto");
  }
});

// 📌 Ruta proxy para Nominatim
app.get("/buscar-direccion", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) {
      return res.status(400).json({ error: "Falta la dirección" });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;

    const response = await fetch(url, {
      headers: { "User-Agent": "inmobiliaria/1.0 (santiagomendoza960@gmail.com)" } // Nominatim exige un User-Agent válido
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Error en Nominatim" });
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Error en /buscar-direccion:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
