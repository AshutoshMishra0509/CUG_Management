// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBzzRRDsgTDmmiXqxecfJDpQRPPD-bccKw",
  authDomain: "cug-management-1042a.firebaseapp.com",
  databaseURL: "https://cug-management-1042a-default-rtdb.firebaseio.com",
  projectId: "cug-management-1042a",
  storageBucket: "cug-management-1042a.appspot.com",
  messagingSenderId: "481415058881",
  appId: "1:481415058881:web:97aefacd91023a7b6ccb40",
  measurementId: "G-VEBW245WYH",
  databaseURL: "https://cug-management-1042a-default-rtdb.firebaseio.com/",
};
// const firebaseConfig = {
//   apiKey: "AIzaSyB5gQX_cPY1oH-0Au7xwJYCN8daTMjpYYo",
//   authDomain: "cugmanagement-3f4f0.firebaseapp.com",
//   projectId: "cugmanagement-3f4f0",
//   storageBucket: "cugmanagement-3f4f0.appspot.com",
//   messagingSenderId: "145760142049",
//   appId: "1:145760142049:web:7d7d115d7ba4b445202da0",
//   measurementId: "G-T7TZT6GRTT",
//   databaseURL: "https://cugmanagement-3f4f0-default-rtdb.firebaseio.com/",
// };

// Initialize Firebase
const Fapp = initializeApp(firebaseConfig);
const analytics = getAnalytics(Fapp);
export default Fapp;
