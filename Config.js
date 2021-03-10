  // import * as firebase from 'firebase'
import firebase from 'firebase/app'
require('@firebase/firestore')

const firebaseConfig = {
    apiKey: "AIzaSyBJJAgSTLla4Y3OMNu8HQ_VIStsF02XDEI",
    authDomain: "thelmsapp.firebaseapp.com",
    databaseURL: "https://thelmsapp-default-rtdb.firebaseio.com",
    projectId: "thelmsapp",
    storageBucket: "thelmsapp.appspot.com",
    messagingSenderId: "1070202043267",
    appId: "1:1070202043267:web:b5ba1579236711fde114b6"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore()
