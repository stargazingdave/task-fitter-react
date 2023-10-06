import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { FirebaseAppProvider,
    FirestoreProvider,
    useFirestoreDocData,
    useFirestore,
    useFirebaseApp } from 'reactfire';



const firebaseConfig = {
    apiKey: "AIzaSyCiYjAn7A03CBGhvRV0hhurwbU4iFJYJ_Q",
    authDomain: "task-fitter.firebaseapp.com",
    projectId: "task-fitter",
    storageBucket: "task-fitter.appspot.com",
    messagingSenderId: "616647975129",
    appId: "1:616647975129:web:73e527d86a35c0fb0e1ec8",
    measurementId: "G-74M3TG69TM"
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <div className='frame'>
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <App />
    </FirebaseAppProvider>
  </div>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
