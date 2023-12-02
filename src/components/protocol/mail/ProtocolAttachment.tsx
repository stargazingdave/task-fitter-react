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
import { ContactList } from '../../contacts/ContactList';
import emailjs from "@emailjs/browser";
import { jsPDF } from "jspdf";
import { createProtocol } from '../../../utils';
import { SelectRecipients } from './SelectRecipients';


const sendMail = async (
    project: DocumentData, 
    tasks: DocumentData[], 
    contacts: DocumentData[],
    setSending: (sending: boolean) => void,
    pdf: string,
    emailSubject: string,
    replyTo: string,
    fromName: string,
    recipients: any
    ) => {
    setSending(true);
    debugger
    // key (collaboratorEmail) => value ({contact, tasks})
    // const recipients = {};
    tasks.forEach((task) => {
        task.collaborators.forEach((collaboratorEmail) => {
            // if (!recipients[collaboratorEmail]) {
            //     const contact = contacts.find((contact) => contact.email == collaboratorEmail);
            //     recipients[collaboratorEmail] = {contact, tasks: []};
            //     recipientsCount++;
            // }
            // recipients[collaboratorEmail].tasks.push(task);
            if (recipients[collaboratorEmail]) {
                recipients[collaboratorEmail].tasks.push(task);
            }
        })
    });
    
    let sentCount = 0;
    let responses = [] as string[];

    // Use `map` to create an array of promises
    const emailPromises = Object.values<DocumentData>(recipients).map(async (recipient) => {
        if (typeof recipient !== "number") {
            try {
                const response = await emailjs.send("task-fitter", "template_3009rc8", {
                    project_name: project.project_name,
                    email_subject: emailSubject,
                    reply_to: replyTo,
                    from_name: fromName,
                    contact_mail: recipient.contact.email,
                    contact_name: recipient.contact.name,
                    task_list: recipient.tasks.map((task) => task.task).join('<br>'),
                    attachment: pdf,
                }, "vtVkQrnc2d67CfVRb");
                
                sentCount++;
                responses.push('\n' + recipient.contact.email + '\t' + response.status + '\t' + response.text + '\n');
            } catch (error: any) {
                alert('שגיאה!' + error.status + error.text);
            }
        }
        
    });

    // Wait for all promises to resolve before showing the alert
    await Promise.all(emailPromises);

    // Now, you can safely display the alert
    alert('השליחה הסתיימה. הפרוטוקול נשלח בהצלחה ל' + sentCount + '/' + recipients.count + 'משתתפים' + responses);
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
    const [emailSubject, setEmailSubject] = useState("");
    const [replyTo, setReplyTo] = useState(user.email || '');
    const [fromName, setFromName] = useState(user.displayName || '');
    const [recipients, setRecipients] = useState({count: 0} as any);
    

    
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
        <div className='email'>
            <div className='email-form'>
                <h1>שליחת הפרוטוקול במייל:</h1>
                <div className='parameters'>
                    <div className='parameter-inputs'>
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
                    </div>
                    <SelectRecipients
                        recipients={recipients} 
                        setRecipients={setRecipients}
                        tasks={projectTasks ? projectTasks : []}
                        project={project}
                        />
                </div>
                {
                    sending 
                    ? <button className='send-button sending' onClick={() => {}}>
                        מתבצעת שליחה <TbMailFast size={34} /><div className="loader"></div>
                    </button>
                    : <button
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
                                    fromName,
                                    recipients
                                    );
                            } else {
                                alert("יש להמתין ליצירת קובץ ה-PDF")
                            }
                        }}
                        disabled={!isAdmin}
                        title={isAdmin ? 'שליחת מייל לכל המשתתפים עם הפרוטוקול והמשימות האישיות.' : 'אין לחשבון שלך גישה לשליחת מיילים'}
                        >
                        שליחה <TbMailShare size={34} />
                    </button>
                }
            </div>
            <div className='protocol-container-attachment'>
                {
                    pdf 
                    ? <PdfViewer 
                        pdfPromise={Promise.resolve(pdf)} 
                        pdfDataUri={pdfDataUri}
                        setPdfDataUri={setPdfDataUri}
                        />
                    : <div className='protocol-loader'><div className="loader"></div>הפרוטוקול בטעינה</div>
                }
            </div>
        </div>
        {openContacts && <ContactList />}
    </div>
    );
};


