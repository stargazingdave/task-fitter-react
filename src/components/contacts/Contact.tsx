import { DocumentData } from 'firebase/firestore';
import './Contact.scss';





type ContactProps = {
    contact: DocumentData;
  }
  

export const Contact = (props: ContactProps) => {
    
    return <div className="contact-details">
        <h2>{props.contact.role}</h2>
        <h3>{props.contact.email}</h3>
    </div>
}