import { DocumentData, deleteDoc, doc } from 'firebase/firestore';
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
import { BiEditAlt, BiUserPlus } from 'react-icons/bi';
import { Contact } from './Contact';
import { useAppSelector } from '../../reduxHooks';
import { selectContacts, selectContactsCollection } from '../../redux/contactsSlice';
import { selectDb } from '../../redux/databaseSlice';





type ContactListProps = {
}
  

export const ContactList = (props: ContactListProps) => {
    const db = useAppSelector(selectDb);
    const contacts = useAppSelector(selectContacts);
    const contactsCollection = useAppSelector(selectContactsCollection);
    
    const [editContact, setEditContact] = useState({} as DocumentData);
    const [openContact, setOpenContact] = useState({} as DocumentData);
    const [createContactFlag, setCreateContactFlag] = useState(false);
    const [contactDeletePopup, setContactDeletePopup] = useState({} as DocumentData);

    
    return <div className="contacts">
            <h1>אנשי קשר</h1>
                <div className="create-contact">
                    {
                        !createContactFlag &&
                        <button 
                            className='new-contact-button' 
                            title='יצירת איש קשר חדש'
                            onClick={() => setCreateContactFlag(true)}
                            >
                            <BiUserPlus size={25} />
                        </button>
                    }
                </div>
                {contacts.map(contact => (
                    <div 
                        data-testid={contact.id}    
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
                        <button title='עריכת איש קשר' data-testid={'edit-button' + contact.id} className='edit-button' onClick={() => {
                                setEditContact(contact);
                            }}>
                                <BiEditAlt size={20} />
                        </button>
                        <button 
                            title='מחיקת איש קשר'
                            data-testid={'delete-button' + contact.id}
                            className='delete-button' 
                            onClick={() => {
                                setContactDeletePopup(contact);
                            }}>
                                <MdDeleteForever size={20} />
                        </button>
                        <Popup 
                            trigger={
                                <button title='רשימת משימות של איש הקשר' className='tasks-button'>
                                    <FaTasks  size={20} />
                                </button>
                            } 
                            modal
                            contentStyle={{
                                width: "800px",
                                height: "300px",
                                overflow: "auto",
                                display: "flex",
                                position: "relative",
                                justifyContent: "flex-start"
                            }}
                            >
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
                                />
                        }
                        {
                            openContact?.id == contact.id &&
                            <Contact 
                                contact={openContact} 
                            />
                        }
                    </div>
                    
                ))}
            {
                contactDeletePopup?.id &&
                <Popup 
                    contentStyle={{width: "300px"}}
                    open={contactDeletePopup?.id}
                    modal={false}>
                    <ConfirmationBox 
                        onConfirm={() => {
                            deleteDoc(doc(db, "contacts", contactDeletePopup.id));
                            setContactDeletePopup({});
                        }}
                        onCancel={() => setContactDeletePopup({})} />
                </Popup>
            }
            <Popup
                open={createContactFlag} 
                closeOnDocumentClick={false}
                >
                <CreateContactForm 
                    contactsCollection={contactsCollection} 
                    createContactFlag={createContactFlag} 
                    onContactCreate={() => setCreateContactFlag(false)}
                    email=''
                />
            </Popup>
        </div>
}