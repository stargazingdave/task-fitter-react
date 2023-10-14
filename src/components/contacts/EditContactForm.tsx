import { User } from "firebase/auth";
import { CollectionReference, DocumentData, Firestore, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useState } from "react";

type EditContactFormProps = {
  editContact: DocumentData;
  setEditContact: (DocumentData) => void;
  contactsCollection: CollectionReference;
  user: User;
  onContactUpdate: (editContact: DocumentData) => void;
  db: Firestore;
}
  


const updateContact = async (props: EditContactFormProps,
                    contactName: string, 
                    contactRole: string,
                    contactEmail: string) => {
        const temp = query(props.contactsCollection, 
            where("user_id", "==", props.user.uid || 0), 
            where("name", "==", contactName));
        const querySnapshot = await getDocs(temp);
        if (contactName == '') {
            alert('לא ניתן ליצור איש קשר ללא שם');
            return;
        }
        updateDoc(doc(props.db, 'contacts', props.editContact.id), {
            name: contactName,
            creation_time: Date.now(),
            role: contactRole,
            email: contactEmail,
            user_id: props.user.uid,
        });
        props.setEditContact({});
    }



export const EditContactForm = (props: EditContactFormProps) => {

    const [contactName, setContactName] = useState(props.editContact.name);
    const [contactRole, setContactRole] = useState(props.editContact.role);
    const [contactEmail, setContactEmail] = useState(props.editContact.email);


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
                <button 
                    onClick={() => {updateContact(props, contactName, contactRole, contactEmail)}}>
                        שמור
                </button>
                <button onClick={() => props.setEditContact({})}>ביטול</button>
            </div>
        </>
    )
}