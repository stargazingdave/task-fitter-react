import * as React from 'react';
import { useAuth, useSigninCheck } from 'reactfire';
import { Auth, GoogleAuthProvider, User, signInWithPopup } from "firebase/auth";
import './Layout.scss';
import { ImUsers } from 'react-icons/im';
import { useState } from 'react';
import { AppDispatch, RootState } from '../../store';
import { connect, ConnectedProps } from 'react-redux'
import { useAppDispatch, useAppSelector } from '../../reduxHooks';
import { signIn, signOut, onSignStateChanged, selectUser, selectSignedIn } from '../../redux/userSlice';

export const LoadingSpinner = () => {
    return (
    <div className="animate-pulse">
        <span>Loading...</span>
    </div>
    );
};

const UserPanel = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    debugger;
    const auth = useAuth();
    const [openContacts, setOpenContacts] = useState(false);
    return (
        <div className='user-panel'>
            <h1>Task Fitter</h1>
            <div className='info'>
                <div title="Sign Out">
                    <button onClick={() => dispatch(signOut(auth))} >
                        יציאה מהחשבון
                    </button>
                </div>
                <div className='display-name' title="Displayname">
                    {user.displayName}
                </div>
            </div>
            <button 
                className='contact-list-button' 
                title='רשימת אנשי הקשר'
                onClick={(openContacts) => setOpenContacts(!openContacts)}
                >
                <ImUsers size={24} />
            </button>
        </div>
    );
};

const SignInForm = () => {
    const dispatch = useAppDispatch();
    const auth = useAuth();

    return (
        <div className='login-panel'
            style={{display: 'flex',
                    height: '500px',
                    gap: '10px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white'}}>
        <h1 style={{color: '#1F3C88'}}>Task Fitter</h1>
        <button onClick={() => dispatch(signIn(auth))} >כניסה לחשבון</button>
        </div>
    );
};

export const Layout = () => {
    const { status, data: signinResult } = useSigninCheck();
    const dispatch = useAppDispatch();
    dispatch(onSignStateChanged(signinResult?.user));
    const signedIn = useAppSelector(selectSignedIn);

    if (status === 'loading') {
        return <LoadingSpinner />;
    }

    if (signedIn === true) {
        return <UserPanel />;
    } else {
        return <SignInForm />;
    }
};
