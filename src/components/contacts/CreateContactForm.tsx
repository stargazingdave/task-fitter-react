import { User } from "firebase/auth";
import { CollectionReference, addDoc, getDocs, query, snapshotEqual, where } from "firebase/firestore";
import { useState } from "react";
import { useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";

type CreateContactFormProps = {
  contactsCollection: CollectionReference;
  createContactFlag: boolean;
  onContactCreate: (onContactCreate: boolean) => void;
}
  


const addContact = async (props: CreateContactFormProps, 
                    contactName: string, 
                    contactRole: string,
                    contactEmail: string,
                    user: User) => {
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
    addDoc(props.contactsCollection, {
        name: contactName,
        creation_time: Date.now(),
        role: contactRole,
        email: contactEmail,
        user_id: user.uid,
    });
    props.onContactCreate(props.createContactFlag);
}



export const CreateContactForm = (props: CreateContactFormProps) => {
    const user = useAppSelector(selectUser);
    const [contactName, setContactName] = useState('');
    const [contactRole, setContactRole] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    return (
        <>
        <label>
            שם:
        </label>
        <input
            value={contactName}
            onChange={e => setContactName(e.target.value)}
            type="string"
            />
        <label>
            תפקיד:
        </label>
        <input
            value={contactRole}
            onChange={e => setContactRole(e.target.value)}
            type="string"
            />
        <label>
            כתובת אימייל:
        </label>
        <input
            value={contactEmail}
            onChange={e => setContactEmail(e.target.value)}
            type="string"
            />
        <div className="buttons">
            <button onClick={() => {addContact(props, contactName, contactRole, contactEmail, user)}}>
                שמור
            </button>
            <button onClick={() => props.onContactCreate(props.createContactFlag)}>ביטול</button>
        </div>
        </>
        )
}