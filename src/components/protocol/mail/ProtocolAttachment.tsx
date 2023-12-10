import './ProtocolAttachment.scss';
import '../../general/Checkbox.scss';
import { DocumentData, DocumentSnapshot, collectionGroup, doc, getDoc, query, where } from 'firebase/firestore';
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

type ProtocolAttachmentInternalProps = {
    pdf: jsPDF;
}

const ProtocolAttachmentInternal = (props: ProtocolAttachmentInternalProps) => {
    const isAdmin = useAppSelector(selectIsAdmin);
    const db = useAppSelector(selectDb);
    const user = useAppSelector(selectUser);
    const contacts = useAppSelector(selectContacts);
    const openContacts = useAppSelector(selectOpenContacts);
    const pdfDataUri = props.pdf.output('datauristring');

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

    if (projectStatus === 'loading' || tasksStatus === 'loading' || !project) {
        return <div>טוען</div>;
    }
    
    return <div className='protocol-attachment-page'>
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
                props.pdf 
                ? <PdfViewer 
                    // pdfPromise={Promise.resolve(pdf)} 
                    pdfDataUri={props.pdf.output('datauristring')}
                    // setPdfDataUri={setPdfDataUri}
                    />
                : <div className='protocol-loader'><div className="loader"></div>הפרוטוקול בטעינה</div>
            }
        </div>
    </div>
    {openContacts && <ContactList />}
</div>
}


export const ProtocolAttachment = () => {
    const db = useAppSelector(selectDb);
    const contacts = useAppSelector(selectContacts);
    const openContacts = useAppSelector(selectOpenContacts);

    const [pdf, setPdf] = useState<jsPDF | null>(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [protocolHeader, setProtocolHeader] = useState("");
    const [withLogo, setWithLogo] = useState(true);
    const [withCompanyName, setWithCompanyName] = useState(true);
    const [nameOfWriter, setNameOfWriter] = useState('');

    let { id } = useParams();

    const projectRef = doc(db, 'projects', id || '');
    const { status: projectStatus, data: project } = useFirestoreDocData(projectRef, { idField: 'id' });
    

    if (projectStatus === 'loading') {
        return <>טוען</>;
    }

    const generatePdf = async () => {
        setGeneratingPdf(true);
        const companyLogo = new Image();
        let company = {} as DocumentSnapshot
        if (project.company_id) {
            const companyRef = doc(db, 'companies', project.company_id);
            company = await getDoc(companyRef);
            
            
            companyLogo.src = company.data()?.logo;
        }
        const generatedPdf = await createProtocol(project, protocolHeader, contacts, companyLogo, company.data()?.company_name || '', withLogo, withCompanyName, nameOfWriter);
        setPdf(generatedPdf);
        setGeneratingPdf(false);
    };

    

    return <div>
        {
            pdf 
            ? <ProtocolAttachmentInternal pdf={pdf} />
            : <div className='protocol-creation-from'>
                <h1>יצירת פרוטוקול בפורמט PDF</h1>
                <div className='inputs'>
                    <div className='text'>
                        <label className='input-label'>כותרת המסמך:</label>
                        <input
                            value={protocolHeader}
                            onChange={e => setProtocolHeader(e.target.value)}
                            type="string"
                        />
                        <label className='input-label'>רושם הפרוטוקול:</label>
                        <input
                            value={nameOfWriter}
                            onChange={e => setNameOfWriter(e.target.value)}
                            type="string"
                        />
                    </div>
                    <div className='checkmarks'>
                        <div className='checkmark-input'>
                            <label className="container">
                                <input
                                    type="checkbox"
                                    id="checkbox"
                                    checked={withLogo}
                                    onChange={() => setWithLogo(!withLogo)}
                                />
                                <span className="checkmark"></span>
                            </label>
                            <label className='input-label'>הוספת לוגו לפרוטוקול</label>
                        </div>
                        <div className='checkmark-input'>
                            <label className="container">
                                <input
                                    type="checkbox"
                                    id="checkbox"
                                    checked={withCompanyName}
                                    onChange={() => setWithCompanyName(!withCompanyName)}
                                />
                                <span className="checkmark"></span>
                            </label>
                            <label className='input-label'>הוספת שם החברה לפרוטוקול</label>
                        </div>
                    </div>
                </div>
                <button 
                    className='generate-pdf-button'
                    onClick={() => generatePdf()}
                    disabled={generatingPdf}
                    >
                        {
                            generatingPdf
                            ? <div className='generating'><p>PDF בתהליך יצירה</p><div className='loader'></div></div>
                            : <p>יצירת PDF</p>
                        }
                    </button>
            </div>
        }
    </div>
}


