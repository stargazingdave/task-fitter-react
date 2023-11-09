import './Menu.scss';
import { BiEditAlt } from 'react-icons/bi';
import { useAppDispatch, useAppSelector } from '../../reduxHooks';
import { initContacts, openContactsToggle, selectContacts, selectContactsCollection, selectOpenContacts } from '../../redux/contactsSlice';
import { selectMenuOpen, selectUserSettings, setManagerEmail } from '../../redux/userSettingsSlice';
import { ImUsers } from 'react-icons/im';
import { selectUser } from '../../redux/userSlice';
import { FaUserTie } from 'react-icons/fa6';
import { useState } from 'react';
import { collection, doc, query, updateDoc, where } from 'firebase/firestore';
import { selectDb } from '../../redux/databaseSlice';
import { useFirestoreCollectionData } from 'reactfire';





type MenuProps = {
}
  

export const Menu = (props: MenuProps) => {
    const user = useAppSelector(selectUser);
    const db = useAppSelector(selectDb);
    const userSettings = useAppSelector(selectUserSettings);
    const userSettingsCollection = collection(db, 'user_settings');
    const UserSettingsQuery = query(userSettingsCollection,
        where("user_id", "==", user.uid));
    const { status: userSettingsStatus, data: userSettingsDb } = useFirestoreCollectionData(UserSettingsQuery, { idField: 'id',});
    
    const openContacts = useAppSelector(selectOpenContacts);
    const dispatch = useAppDispatch();
    const [editManagerEmail, setEditManagerEmail] = useState(false);
    const [newManagerEmail, setNewManagerEmail] = useState('');

    if (userSettingsStatus === 'loading') {
        return <p>הגדרות בטעינה...</p>;
    }

    return <div className="menu-panel">
            <div className='contact-list'>
                <button 
                    className={'contact-list-button' + (openContacts ? ' open' : '')} 
                    title='רשימת אנשי הקשר'
                    onClick={() => dispatch(openContactsToggle())}
                    >
                        <ImUsers size={24} />
                        אנשי קשר
                </button>
            </div>
            <div className='edit-manager'>
                {
                    editManagerEmail
                    ? <div className='edit-manager-email-form'>
                        <p>יש להזין את כתובת המייל שסופקה לך על ידי המנהל:</p>
                        <input
                            value={newManagerEmail}
                            onChange={e => setNewManagerEmail(e.target.value)}
                            type="string"
                            dir="ltr"
                        />
                        <div className='buttons'>
                            <button onClick={() => setEditManagerEmail(false)}>
                                ביטול
                            </button>
                            <button
                                onClick={() => {
                                    user.email && dispatch(setManagerEmail(user.email));
                                    updateDoc(doc(db, 'user_settings', userSettingsDb[0].id), {
                                        manager_email: newManagerEmail,
                                    });
                                    setEditManagerEmail(false);
                                }}
                                >
                                שמירה
                            </button>
                        </div>
                    </div>
                    : <button 
                        className='manager-email-button'
                        title='הגדרת מנהל שיקבל גישה לפרויקטים שלך'
                        onClick={() => {
                            setEditManagerEmail(true);
                            
                        }}
                        >
                            <FaUserTie size={24} />
                            הגדרת מנהל
                    </button>
                }
            </div>
        </div>
}