// ==========================
//  Configuración de Firebase
// ==========================
const firebaseConfig = {
  apiKey: "AIzaSyCi-40HpYqMAvDR_6vnUtJFYmjq1TBS-zg",
  authDomain: "catalogopublicidad-a3609.firebaseapp.com",
  databaseURL: "https://catalogopublicidad-a3609-default-rtdb.firebaseio.com",
  projectId: "catalogopublicidad-a3609",
  storageBucket: "catalogopublicidad-a3609.appspot.com",
  messagingSenderId: "10516908094",
  appId: "1:10516908094:web:3f46eaf00bdbfa4eac696f",
  measurementId: "G-41BZFJ0CM7"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// ==========================
//  Servicios principales
// ==========================
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// ==========================
//  Helpers globales para Firestore
// ==========================
const firebaseCollection = (col) => db.collection(col);
const firebaseDoc = (col, id) => db.collection(col).doc(id);
const firebaseAddDoc = (col, data) => db.collection(col).add(data);
const firebaseGetDoc = (col, id) => db.collection(col).doc(id).get();
