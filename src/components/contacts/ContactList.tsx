import { User } from 'firebase/auth';
import { DocumentData, collection, deleteDoc, doc, orderBy, query, where } from 'firebase/firestore';
import { useFirestore, useFirestoreCollectionData } from 'reactfire';
import { useState } from 'react';
import { CreateContactForm } from './CreateContactForm';
import './ContactList.scss';
import { ContactTasks } from './ContactTasks';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { EditContactForm } from './EditContactForm';
import { ConfirmationBox } from '../general/ConfirmationBox';
import { FaHammer, FaTasks } from 'react-icons/fa';
import { BiEditAlt } from 'react-icons/bi';





type ContactListProps = {
    user: User;
  }
  

export const ContactList = (props: ContactListProps) => {
    // access the Firestore library
    //const dbRef = doc(useFirestore(), 'projects', 'KgZALPsAYOxhD9KS1dqg');
    const db = useFirestore();
    const contactsCollection = collection(db, 'contacts');
    const [isAscending, setIsAscending] = useState(true);
    const [editContact, setEditContact] = useState({} as DocumentData);
    const [createContactFlag, setCreateContactFlag] = useState(false);
    const [contactDeletePopup, setContactDeletePopup] = useState({} as DocumentData);
    const contactsQuery = query(contactsCollection,
                                where("user_id", "==", props.user.uid || 0),
                                orderBy('name', isAscending ? 'asc' : 'desc'));

    const { status, data: contacts } = useFirestoreCollectionData(contactsQuery, { idField: 'id',});
    // check the loading status
    if (status === 'loading') {
        return <p>טוען אנשי קשר...</p>;
        }

    console.log('list: ', contacts);
    
    return <div className="contacts">
            <h1>אנשי קשר</h1>
                {contacts.map(contact => (
                    <div className="contact" key={contact.id}>
                        <div className="name">
                            <h1 title={contact.role}>{contact.name}</h1>
                        </div>
                        <div className='buttons'>
                        <button title='עריכת איש קשר' className='edit-button' onClick={() => {
                                setEditContact(contact);
                            }}>
                                <BiEditAlt size={20} />
                        </button>
                        <button 
                            title='מחיקת איש קשר'
                            className='delete-button' 
                            onClick={() => {
                                setContactDeletePopup(contact);
                            }}>
                                <FaHammer size={20} />
                        </button>
                        <Popup modal={true} trigger={
                            <button title='רשימת משימות של איש הקשר' className='tasks-button'>
                                <FaTasks  size={20} />
                        </button>} position="right center">
                            <ContactTasks contact={contact} user={props.user} />
                        </Popup>
                        </div>
                        {
                            editContact?.id == contact.id && 
                            <div className="edit-contact-form">
                                <EditContactForm 
                                    editContact={editContact} 
                                    setEditContact={setEditContact}
                                    contactsCollection={contactsCollection} 
                                    user={props.user} 
                                    onContactUpdate={(editContact) => {
                                        const i = contacts.findIndex((contact) => contact.id == editContact.id);
                                        contacts[i] = editContact;
                                        setEditContact({});
                                    }} 
                                    db={db} />
                            </div>
                        }
                    </div>
                ))}
            <div className="create-contact">
            {createContactFlag
            ? <div className="create-contact-form">
                <CreateContactForm createContact={createContactFlag} 
                                    contactsCollection={contactsCollection} 
                                    user={props.user} 
                                    createContactFlag={createContactFlag} 
                                    onContactCreate={(createContactFlag) => {setCreateContactFlag(!createContactFlag)}}/>
                </div>
            : <button onClick={() => setCreateContactFlag(!createContactFlag)}>איש קשר חדש</button>}
            
            </div>
            {
                contactDeletePopup?.id &&
                <Popup 
                    contentStyle={{width: "300px"}}
                    open={contactDeletePopup?.id}
                    modal={true}>
                    <ConfirmationBox 
                        onConfirm={() => {
                            deleteDoc(doc(db, "contacts", contactDeletePopup.id));
                            setContactDeletePopup({});
                        }}
                        onCancel={() => setContactDeletePopup({})} />
                </Popup>
            }
        </div>
}