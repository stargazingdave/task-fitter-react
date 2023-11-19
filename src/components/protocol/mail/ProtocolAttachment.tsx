import '.././Protocol.scss';

// Import the functions you need from the SDKs you need
import { DocumentData, collectionGroup, doc, query, where } from 'firebase/firestore';
import { useFirestoreCollectionData, useFirestoreDocData } from 'reactfire';
import { useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { ProtocolProjectAttachment } from './ProtocolProjectAttachment';
import { useAppSelector } from '../../../reduxHooks';
import { selectIsAdmin, selectUser } from '../../../redux/userSlice';
import { selectContacts, selectOpenContacts } from '../../../redux/contactsSlice';
import { selectDb } from '../../../redux/databaseSlice';
import { TbMailFast, TbMailForward, TbMailShare } from 'react-icons/tb';
import { useState } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytes, uploadString } from 'firebase/storage';
import { User } from 'firebase/auth';
import { ContactList } from '../../contacts/ContactList';
import emailjs from "@emailjs/browser";


type ProtocolAttachmentProps = {
}

const actions = {}; // key-value map. key - task id, value - action(function)

const addSaveAction = (taskId: string, action: () => void) => {
    actions[taskId] = action;
}

const getCanvasBlob = (canvas) => {
    return new Promise<Blob>(function(resolve, reject) {
        canvas.toBlob(function(blob: Blob) {
            resolve(blob)
        })
    })
}


const sendMail = async (
    project: DocumentData, 
    tasks: DocumentData[], 
    contacts: DocumentData[],
    setSending: (boolean) => void,
    user: User,
    ) => {
    const storage = getStorage();

    // Create a child reference
    const imageRef = ref(storage, 'images/' + project.id + '.png'); // imagesRef now points to 'images'

    setSending(true);
    const linkToProtocolProject = document.getElementById("protocol-project");
    // @ts-ignore
    const canvas = await html2canvas(linkToProtocolProject, { scale: 1.5 })
    const base64 = canvas.toDataURL("image/jpeg", 1.0);
    let file = await getCanvasBlob(canvas);
    // upload file to firebase storage
    await uploadBytes(imageRef, file)
    const imageLink = await getDownloadURL(imageRef);
    
    
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
    
    // let sentCount = 0;
    // let responses = [] as string[];
    // Object.values<DocumentData>(collaborators).forEach(async (collaborator) => {
    //     debugger;
    //     await emailjs.send("task-fitter", "template_kqmklat", {
    //         //attachment: base64,
    //         project_name: project.project_name,
    //         reply_to: user.email,
    //         from_name: user.displayName,
    //         protocol_link: imageLink,
    //         contact_mail: collaborator.contact.email,
    //         contact_name: collaborator.contact.name,
    //         task_list: collaborator.tasks.map((task) => task.task).join('<br>')
    //     }, "vtVkQrnc2d67CfVRb")
    //         .then((response) => {
    //             sentCount++;
    //             responses.push(collaborator.contact.email + response.status + response.text);
    //         },
    //         (error) => {
    //             alert('שגיאה!' + error.status + error.text);
    //         });
    // })
    // alert('הצלחה! הפרוטוקול נשלח בהצלחה ל' + sentCount + '/' + collaboratorsLength + 'משתתפים' + responses);
    // setSending(false);
    let sentCount = 0;
    let responses = [] as string[];

    // Use `map` to create an array of promises
    const emailPromises = Object.values<DocumentData>(collaborators).map(async (collaborator) => {
        try {
            const response = await emailjs.send("task-fitter", "template_kqmklat", {
                project_name: project.project_name,
                reply_to: user.email,
                from_name: user.displayName,
                protocol_link: imageLink,
                contact_mail: collaborator.contact.email,
                contact_name: collaborator.contact.name,
                task_list: collaborator.tasks.map((task) => task.task).join('<br>')
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

export const ProtocolAttachment = (props: ProtocolAttachmentProps) => {
    const isAdmin = useAppSelector(selectIsAdmin);
    const db = useAppSelector(selectDb);
    const user = useAppSelector(selectUser);
    const contacts = useAppSelector(selectContacts);
    const openContacts = useAppSelector(selectOpenContacts);
    const [sending, setSending] = useState(false);

    let { id } = useParams();
    const projectRef = doc(db, 'projects', id || '');
    const { status: projectStatus, data: project } = useFirestoreDocData(projectRef, { idField: 'id', });
    const tasksCollection = collectionGroup(db, 'tasks');
    const projectTasksQuery = query(tasksCollection,
        where("top_project_id", "==", id));
    const {status: tasksStatus, data: projectTasks} = useFirestoreCollectionData(projectTasksQuery, { idField: 'id', });
    
    
    if (projectStatus === 'loading') {
        return <p>טוען פרוטוקול...</p>;
    }
    if (tasksStatus === 'loading') {
        return <p>טוען פרוטוקול...</p>;
    }
    
    if (!project) {
        return <p>פרויקט לא קיים</p>
    }

    return <div className='protocol-page'>
        <div className='protocol-container'>
            <div  id="protocol-project">
                <ProtocolProjectAttachment 
                    project={project}
                    path={'projects/' + project.id}
                    addSaveAction={addSaveAction} 
                />
            </div>
            <div className="buttons">
                {
                    sending
                    ? <button 
                        className='send-button sending' 
                        onClick={() => {}}
                        >
                        מתבצעת שליחה <TbMailFast size={34} /><div className="loader"></div>
                    </button>
                    : <button 
                        className='send-button' 
                        onClick={() => sendMail(project, projectTasks, contacts, setSending, user)}
                        disabled={!isAdmin}
                        title={isAdmin 
                            ? 'שליחת מייל לכל המשתתפים עם הפרוטוקול והמשימות האישיות.' 
                            : 'אין לחשבון שלך גישה לשליחת מיילים'}
                        >
                        שליחה <TbMailShare size={34} />
                    </button>
                }
            </div>
        </div>
        {
            openContacts &&
            <ContactList />
        }
    </div>
}

