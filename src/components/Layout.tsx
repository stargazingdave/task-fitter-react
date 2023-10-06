import * as React from 'react';
import { useAuth, useSigninCheck } from 'reactfire';
import { Auth, GoogleAuthProvider, User, signInWithPopup } from "firebase/auth";
import './Layout.scss';

export const LoadingSpinner = () => {
        return (
        <div className="animate-pulse">
            <span>Loading...</span>
        </div>
        );
    };


    const signOut = (auth: Auth) => auth.signOut().then(() => console.log('signed out'));
    const signIn = async (auth: Auth) => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });

    await signInWithPopup(auth, provider)
        .then((result) => {
            // Authentication successful
            // Handle the result here
        })
        .catch((error) => {
            if (error.code === 'auth/popup-closed-by-user') {
                // Handle popup closed by user
                console.log('Popup closed by user');
            } else {
                // Handle other errors
                console.error(error);
            }
        });
}

export const AuthWrapper = ({ children, fallback }: React.PropsWithChildren<{ fallback: JSX.Element }>): JSX.Element => {
    const { status, data: signInCheckResult } = useSigninCheck();

    if (!children) {
        throw new Error('Children must be provided');
    }
    if (status === 'loading') {
        return <LoadingSpinner />;
    } else if (signInCheckResult.signedIn === true) {
        return children as JSX.Element;
    }

    return fallback;
};

const UserDetails = ({ user } : { user: User}) => {
    const auth = useAuth();

    return (
        <div className='login-panel'>
        <h1>Task Fitter</h1>
        <div className='info'>
            <div title="Sign Out">
            <button onClick={() => signOut(auth)} >יציאה מהחשבון</button>
            </div>
            <div className='display-name' title="Displayname">{user.displayName}</div>
        </div>
        </div>
    );
};

const SignInForm = () => {
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
        <button onClick={() => signIn(auth)} >כניסה לחשבון</button>
        </div>
    );
};

export const Layout = () => {
    const { status, data: signinResult } = useSigninCheck();

    if (status === 'loading') {
        return <LoadingSpinner />;
    }

    const { signedIn, user } = signinResult;

    if (signedIn === true) {
        return <UserDetails user={user} />;
    } else {
        return <SignInForm />;
    }
};