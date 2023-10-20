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
import { FaTasks } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md'
import { BiEditAlt } from 'react-icons/bi';
import { Contact } from './Contact';
import { useAppSelector } from '../../reduxHooks';
import { selectSignedIn, selectUser } from '../../redux/userSlice';





type ContactListProps = {
}
  

export const ContactList = (props: ContactListProps) => {
    // access the Firestore library
    //const dbRef = doc(useFirestore(), 'projects', 'KgZALPsAYOxhD9KS1dqg');
    const user = useAppSelector(selectUser);
    const db = useFirestore();
    const contactsCollection = collection(db, 'contacts');
    const [isAscending, setIsAscending] = useState(true);
    const [editContact, setEditContact] = useState({} as DocumentData);
    const [openContact, setOpenContact] = useState({} as DocumentData);
    const [createContactFlag, setCreateContactFlag] = useState(false);
    const [contactDeletePopup, setContactDeletePopup] = useState({} as DocumentData);
    const contactsQuery = query(contactsCollection,
                                where("user_id", "==", user.uid),
                                orderBy('name', isAscending ? 'asc' : 'desc'));

    const { status, data: contacts } = useFirestoreCollectionData(contactsQuery, { idField: 'id',});
    // check the loading status
    if (status === 'loading') {
        return <p>טוען אנשי קשר...</p>;
    }

    
    return <div className="contacts">
            <h1>אנשי קשר</h1>
                {contacts.map(contact => (
                    <div 
                        className="contact" 
                        key={contact.id} 
                        >
                        <div className="name">
                            <h1 
                                title={contact.role}
                                onClick={() => {
                                    openContact?.id == contact.id
                                    ? setOpenContact({})
                                    : setOpenContact(contact)
                                }}
                                >
                                    {contact.name}
                            </h1>
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
                                <MdDeleteForever size={20} />
                        </button>
                        <Popup trigger={
                            <button title='רשימת משימות של איש הקשר' className='tasks-button'>
                                <FaTasks  size={20} />
                        </button>} position="right center">
                            <ContactTasks contact={contact} />
                        </Popup>
                        </div>
                        {
                            editContact?.id == contact.id && 
                                <EditContactForm 
                                    editContact={editContact} 
                                    setEditContact={setEditContact}
                                    contactsCollection={contactsCollection} 
                                    onContactUpdate={(editContact) => {
                                        const i = contacts.findIndex((contact) => contact.id == editContact.id);
                                        contacts[i] = editContact;
                                        setEditContact({});
                                    }} 
                                    db={db} />
                        }
                        {
                            openContact?.id == contact.id &&
                            <Contact 
                                contact={openContact} 
                            />
                        }
                    </div>
                    
                ))}
            <div className="create-contact">
            {createContactFlag
            ? <div className="create-contact-form">
                <CreateContactForm 
                    createContact={createContactFlag} 
                    contactsCollection={contactsCollection} 
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