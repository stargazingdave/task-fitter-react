import React, { useState } from 'react';
import './App.css';

import {Layout} from './components/general/Layout'

// Import the functions you need from the SDKs you need
import { getFirestore } from 'firebase/firestore';
import { 
         FirestoreProvider,
         useFirebaseApp, 
         AuthProvider,
} from 'reactfire';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import { MainPage } from './components/general/MainPage';
import { Protocol } from './components/protocol/Protocol';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Router, Routes, } from "react-router-dom";
import { ProtocolAttachment } from './components/protocol/mail/ProtocolAttachment';
import { useAppDispatch, useAppSelector } from './reduxHooks';
import { onSignStateChanged, selectUser } from './redux/userSlice';
import { AccountLoadder } from './components/general/AccountLoadder';



function MyRoutes() {
    const user = useAppSelector(selectUser);
    return (
        user.uid
        ? <Routes>
                <Route index element={<MainPage />} />
                <Route path="protocol/:id" element={<Protocol />} />
                <Route path="protocol-preview/:id" element={<ProtocolAttachment />} />
            </Routes>
        : <></>
    )
}

function App() {
    const db = getFirestore(useFirebaseApp());
    const app = useFirebaseApp();
    const auth = getAuth(app);
    const dispatch = useAppDispatch();
    onAuthStateChanged(auth, (user) => {
        dispatch(onSignStateChanged(user));
    });
    
    

  
    
  return (
    <AuthProvider sdk={auth}>
        <FirestoreProvider sdk={db}>
            <BrowserRouter>
                <Layout />
                <AccountLoadder />
                <MyRoutes />
            </BrowserRouter>
        </FirestoreProvider>
    </AuthProvider>
  );
}

export default App;
