import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
// import {...} from 'firebase/auth';
// import {...} from 'firebase/database';
// import {...} from 'firebase/firestore';
// import {...} from 'firebase/functions';
// import {...} from 'firebase/storage';

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyDWPJhGxA1Wk8LqBoETlyzX',
  authDomain: 'allocatr-1b845.firebaseapp.com',
  databaseURL: 'https://allocatr-1b845.firebaseio.com',
  projectId: 'allocatr-1b845',
  storageBucket: 'allocatr-1b845.firebasestorage.app',
  messagingSenderId: '701634289972',
  appId: '1:701634289972:web:98b0d8a9a77b5c63e04561',
  measurementId: 'G-measurement-id',
};

const app = initializeApp(firebaseConfig);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
