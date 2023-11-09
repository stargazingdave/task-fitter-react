import * as React from 'react';
import { useAuth, useSigninCheck } from 'reactfire';
import './Layout.scss';
import { ImUsers } from 'react-icons/im';
import { LiaHandPointer } from 'react-icons/lia';
import { useAppDispatch, useAppSelector } from '../../reduxHooks';
import { signIn, signOut, onSignStateChanged, selectUser, selectSignedIn } from '../../redux/userSlice';
import { openContactsToggle, selectOpenContacts } from '../../redux/contactsSlice';
import { BiMenu } from 'react-icons/bi';
import { menuOpenToggle, selectMenuOpen } from '../../redux/userSettingsSlice';
import { AiOutlineClose } from 'react-icons/ai';

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
    const menuOpen = useAppSelector(selectMenuOpen);
    const auth = useAuth();
    return (
        <div className='user-panel'>
            <button
                className={'user-menu-button' + (menuOpen ? ' open' : '')} 
                title='תפריט'
                onClick={() => dispatch(menuOpenToggle())}
                >
                    {
                        menuOpen
                        ? <AiOutlineClose size={30}/>
                        : <BiMenu size={30}/>
                    }
            </button>
            <a className='app-logo' href="https://task-fitter.com/">Task Fitter</a>
            <div className='info'>
                <div title="Sign Out">
                    <button className='logout-button' onClick={() => dispatch(signOut(auth))} >
                        יציאה מהחשבון
                    </button>
                </div>
                <div className='display-name' title="Displayname">
                    {user.displayName}
                </div>
            </div>
            
        </div>
    );
};

const SignInForm = () => {
    const dispatch = useAppDispatch();
    const auth = useAuth();
    

    return (
        <div className='login-panel'>
            <h1>Task Fitter</h1>
            <h2>עדכון אישי לכל חבר צוות בקליק <LiaHandPointer size={30} /></h2>
            <br></br>
            <button 
                className='login-button'
                onClick={() => dispatch(signIn(auth))} 
                >
                כניסה לחשבון
            </button>
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
