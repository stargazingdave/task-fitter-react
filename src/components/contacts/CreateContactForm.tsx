import { User } from "firebase/auth";
import { CollectionReference, addDoc, getDocs, query, snapshotEqual, where } from "firebase/firestore";
import { useState } from "react";

type CreateContactFormProps = {
  createContact: boolean;
  contactsCollection: CollectionReference;
  user: User;
  createContactFlag: boolean;
  onContactCreate: (onContactCreate: boolean) => void;
}
  


const addContact = async (props: CreateContactFormProps, 
                    contactName: string, 
                    contactRole: string,
                    contactEmail: string) => {
    const temp = query(props.contactsCollection, where("name", "==", contactName));
    const querySnapshot = await getDocs(temp);
    if (querySnapshot.size > 0) {
        alert('לא ניתן ליצור אנשי קשר עם שמות זהים');
        return;
    }
    if (contactName == '') {
        alert('לא ניתן ליצור איש קשר ללא שם');
        return;
    }
    addDoc(props.contactsCollection, {
        name: contactName,
        creation_time: Date.now(),
        role: contactRole,
        email: contactEmail,
        user_id: props.user.uid,
    });
    props.onContactCreate(props.createContactFlag);
}



export const CreateContactForm = (props: CreateContactFormProps) => {

    const [contactName, setContactName] = useState('');
    const [contactRole, setContactRole] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    return (
        <>
        <label>
            שם:
            <input
            value={contactName}
            onChange={e => setContactName(e.target.value)}
            type="string"
            />
        </label>
        <label>
            תפקיד:
            <input
            value={contactRole}
            onChange={e => setContactRole(e.target.value)}
            type="string"
            />
        </label>
        <label>
            כתובת אימייל:
            <input
            value={contactEmail}
            onChange={e => setContactEmail(e.target.value)}
            type="string"
            />
        </label>
        <button onClick={() => {addContact(props, contactName, contactRole, contactEmail)}}>
            שמור
            </button>
        </>
        )
}