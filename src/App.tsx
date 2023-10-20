import React, { useState } from 'react';
import './App.css';

import {Layout} from './components/general/Layout'

// Import the functions you need from the SDKs you need
import { DocumentData, collection, doc, getFirestore, orderBy, query } from 'firebase/firestore';
import { FirebaseAppProvider,
         FirestoreProvider,
         useFirestoreDocData,
         useFirestore,
         useFirebaseApp, 
         useFirestoreCollectionData,
         DatabaseProvider,
         AuthProvider,
         useSigninCheck} from 'reactfire';
import { User, getAuth, onAuthStateChanged } from 'firebase/auth'; 
import { getDatabase } from 'firebase/database'; 
import { MainPage } from './components/general/MainPage';
import { Protocol } from './components/protocol/Protocol';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Router, Routes, } from "react-router-dom";
import { ProtocolAttachment } from './components/protocol/mail/ProtocolAttachment';
import { useAppDispatch } from './reduxHooks';
import { onSignStateChanged } from './redux/userSlice';




function App() {
    const db = getFirestore(useFirebaseApp());
    const app = useFirebaseApp();
    const auth = getAuth(app);
    const [user, setUser] = useState({} as User);
    const dispatch = useAppDispatch();
    onAuthStateChanged(auth, (user) => {
        dispatch(onSignStateChanged(user));
    });

  

  return (
    <AuthProvider sdk={auth}>
        <FirestoreProvider sdk={db}>
            <BrowserRouter>
            <Layout />
                <Routes>
                    <Route index element={<MainPage />} />
                    <Route path="protocol/:id" element={<Protocol protocolOpen={true} />} />
                    <Route path="protocol-preview/:id" element={<ProtocolAttachment protocolOpen onClose={() => {}} />} />
                </Routes>
            </BrowserRouter>
        </FirestoreProvider>
    </AuthProvider>
  );
}

export default App;
