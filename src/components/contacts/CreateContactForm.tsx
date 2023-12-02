import './CreateContactForm.scss'
import { User } from "firebase/auth";
import { CollectionReference, DocumentData, addDoc, getDoc, getDocs, query, snapshotEqual, where } from "firebase/firestore";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";
import { onAddContact } from '../../redux/contactsSlice';

type CreateContactFormProps = {
  contactsCollection: CollectionReference;
  createContactFlag: boolean;
  onContactCreate: (newContact: string) => void;
  email: string;
}
  


const addContact = async (props: CreateContactFormProps, 
                    contactName: string, 
                    contactRole: string,
                    contactEmail: string,
                    user: User,
                    ) => {
    const temp = query(props.contactsCollection, 
        where("user_id", "==", user.uid || 0), 
        where("name", "==", contactName));
    const querySnapshot = await getDocs(temp);
    if (querySnapshot.size > 0) {
        alert('לא ניתן ליצור אנשי קשר עם שמות זהים');
        return;
    }
    if (contactName == '') {
        alert('לא ניתן ליצור איש קשר ללא שם');
        return;
    }
    let newContact = {} as DocumentData | undefined;
    addDoc(props.contactsCollection, {
        name: contactName,
        creation_time: Date.now(),
        role: contactRole,
        email: contactEmail,
        user_id: user.uid,
    }).then(async (contact) => {
        newContact = (await getDoc(contact)).data();
        props.onContactCreate(newContact?.email);
    })
        
    
    
    return newContact;
}



export const CreateContactForm = (props: CreateContactFormProps) => {
    const user = useAppSelector(selectUser);
    const dispatch = useAppDispatch();
    const [contactName, setContactName] = useState('');
    const [contactRole, setContactRole] = useState('');
    const [contactEmail, setContactEmail] = useState(props.email);
    return (
        <div className="create-contact-form">
            <h1>יצירת איש קשר חדש</h1>
            <label className='name-input'>
                שם:
                <input
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    type="string"
                    autoFocus
                    />
            </label>
            <label className='role-input'>
                תפקיד:
                <input
                    value={contactRole}
                    onChange={e => setContactRole(e.target.value)}
                    type="string"
                    />
            </label>
            <label className='email-input'>
                כתובת אימייל:
                <input
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    type="string"
                    dir="ltr"
                    />
            </label>
            <div className="buttons">
                <button onClick={() => {
                    const newContact = addContact(props, contactName, contactRole, contactEmail, user);
                    dispatch(onAddContact(newContact));
                }}>
                    שמור
                </button>
                <button onClick={() => props.onContactCreate('')}>ביטול</button>
            </div>
        </div>
        )
}