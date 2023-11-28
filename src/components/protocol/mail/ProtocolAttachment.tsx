import './ProtocolAttachment.scss';
import { DocumentData, collectionGroup, doc, query, where } from 'firebase/firestore';
import { useFirestoreCollectionData, useFirestoreDocData } from 'reactfire';
import { useParams } from 'react-router-dom';
import PdfViewer from './PdfViewer';
import { useAppSelector } from '../../../reduxHooks';
import { selectIsAdmin, selectUser } from '../../../redux/userSlice';
import { selectContacts, selectOpenContacts } from '../../../redux/contactsSlice';
import { selectDb } from '../../../redux/databaseSlice';
import { TbMailFast, TbMailShare } from 'react-icons/tb';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { ContactList } from '../../contacts/ContactList';
import emailjs from "@emailjs/browser";
import { jsPDF } from "jspdf";
import { createProtocol } from '../../../utils';


const sendMail = async (
    project: DocumentData, 
    tasks: DocumentData[], 
    contacts: DocumentData[],
    setSending: (sending: boolean) => void,
    pdf: string,
    emailSubject: string,
    replyTo: string,
    fromName: string,
    ) => {
    setSending(true);
    
    // key (collaboratorEmail) => value ({contact, tasks})
    const collaborators = {};
    let collaboratorsLength = 0;
    tasks.forEach((task) => {
        task.collaborators.forEach((collaboratorEmail) => {
            if (!collaborators[collaboratorEmail]) {
                const contact = contacts.find((contact) => contact.email == collaboratorEmail);
                collaborators[collaboratorEmail] = {contact, tasks: []};
                collaboratorsLength++;
            }
            collaborators[collaboratorEmail].tasks.push(task);
        })
    });
    
    let sentCount = 0;
    let responses = [] as string[];

    // Use `map` to create an array of promises
    const emailPromises = Object.values<DocumentData>(collaborators).map(async (collaborator) => {
        try {
            const response = await emailjs.send("task-fitter", "template_3009rc8", {
                project_name: project.project_name,
                email_subject: emailSubject,
                reply_to: replyTo,
                from_name: fromName,
                contact_mail: collaborator.contact.email,
                contact_name: collaborator.contact.name,
                task_list: collaborator.tasks.map((task) => task.task).join('<br>'),
                attachment: pdf,
            }, "vtVkQrnc2d67CfVRb");
            
            sentCount++;
            responses.push('\n' + collaborator.contact.email + '\t' + response.status + '\t' + response.text);
        } catch (error: any) {
            alert('שגיאה!' + error.status + error.text);
        }
    });

    // Wait for all promises to resolve before showing the alert
    await Promise.all(emailPromises);

    // Now, you can safely display the alert
    alert('הצלחה! הפרוטוקול נשלח בהצלחה ל' + sentCount + '/' + collaboratorsLength + 'משתתפים' + responses);
    setSending(false);
    
}


export const ProtocolAttachment = () => {
    const isAdmin = useAppSelector(selectIsAdmin);
    const db = useAppSelector(selectDb);
    const user = useAppSelector(selectUser);
    const contacts = useAppSelector(selectContacts);
    const openContacts = useAppSelector(selectOpenContacts);

    const [pdf, setPdf] = useState<jsPDF | null>(null);
    const [pdfDataUri, setPdfDataUri] = useState<string | null>(null);
    const [emailSubject, setEmailSubject] = useState("פרוטוקול פרויקט");
    const [replyTo, setReplyTo] = useState(user.email || '');
    const [fromName, setFromName] = useState(user.displayName || '');
    

    
    const [sending, setSending] = useState(false);

    let { id } = useParams();

    const projectRef = doc(db, 'projects', id || '');
    const { status: projectStatus, data: project } = useFirestoreDocData(projectRef, { idField: 'id' });
    const tasksCollection = collectionGroup(db, 'tasks');
    const projectTasksQuery = query(tasksCollection, where("top_project_id", "==", id));
    const { status: tasksStatus, data: projectTasks } = useFirestoreCollectionData(projectTasksQuery, { idField: 'id' });

    useEffect(() => {
    if (projectStatus === 'loading' || tasksStatus === 'loading' || !project) {
        return; // Do nothing if conditions aren't met yet
    }

    const generatePdf = async () => {

        const generatedPdf = await createProtocol(project, contacts);
        setPdf(generatedPdf);

    };

    if (!pdf) {
        generatePdf();
    }
    }, [pdf, project, projectTasks, contacts, user, projectStatus, tasksStatus]);

    return (
    <div className='protocol-attachment-page'>
        <div className='pdf-header'>
            <h1>{"פרוטוקול " + project?.project_name}</h1>
            
        </div>
        <div className='email'>
            <div className='email-parameters'>
                <label className='email-subject-label'>נושא המייל:</label>
                <input
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    type="string"
                />
                <br/>
                <label className='email-reply-label'>כתובת להשבה:</label>
                <input
                    value={replyTo}
                    onChange={e => setReplyTo(e.target.value)}
                    type="string"
                />
                <br/>
                <label className='email-from-label'>שם השולח:</label>
                <input
                    value={fromName}
                    onChange={e => setFromName(e.target.value)}
                    type="string"
                />
                {sending ? (
                <button className='send-button sending' onClick={() => {}}>
                    מתבצעת שליחה <TbMailFast size={24} /><div className="loader"></div>
                </button>
                ) : (
                <button
                    className='send-button'
                    onClick={() => {
                        if (pdfDataUri) {
                            sendMail(
                                project, 
                                projectTasks, 
                                contacts, 
                                setSending, 
                                pdfDataUri,
                                emailSubject,
                                replyTo,
                                fromName
                                );
                        } else {
                            alert("התרחשה שגיאה, יש לנסות שוב")
                        }
                    }}
                    disabled={!isAdmin}
                    title={isAdmin ? 'שליחת מייל לכל המשתתפים עם הפרוטוקול והמשימות האישיות.' : 'אין לחשבון שלך גישה לשליחת מיילים'}
                >
                    שליחה <TbMailShare size={24} />
                </button>
                )}
            </div>
            <div className='protocol-container-attachment'>
                {
                    pdf 
                    ? <PdfViewer 
                        pdfPromise={Promise.resolve(pdf)} 
                        pdfDataUri={pdfDataUri}
                        setPdfDataUri={setPdfDataUri}
                        />
                    : <div>הפרוטוקול בטעינה</div>
                }
            </div>
        </div>
        {openContacts && <ContactList />}
    </div>
    );
};


