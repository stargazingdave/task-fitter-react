import * as React from 'react';
import { useAuth, useSigninCheck } from 'reactfire';
import './Layout.scss';
import { ImUsers } from 'react-icons/im';
import { useAppDispatch, useAppSelector } from '../../reduxHooks';
import { signIn, signOut, onSignStateChanged, selectUser, selectSignedIn } from '../../redux/userSlice';
import { openContactsToggle, selectOpenContacts } from '../../redux/contactsSlice';

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
    const auth = useAuth();
    const openContacts = useAppSelector(selectOpenContacts);
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
                onClick={() => dispatch(openContactsToggle())}
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
        <div 
            className='login-panel'
            style={{
                display: 'flex',
                height: '500px',
                gap: '10px',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white'
            }}>
            <h1 style={{color: '#1F3C88'}}>Task Fitter</h1>
            <button onClick={() => dispatch(signIn(auth))} >כניסה לחשבון</button>
        </div>
    );
};

export const Layout = () => {
    const { status, data: signinResult } = useSigninCheck();
    const dispatch = useAppDispatch();
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
