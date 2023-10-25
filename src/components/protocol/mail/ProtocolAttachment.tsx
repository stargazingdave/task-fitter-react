import '.././Protocol.scss';

// Import the functions you need from the SDKs you need
import { DocumentData, collectionGroup, doc, query, where } from 'firebase/firestore';
import { useFirestoreCollectionData, useFirestoreDocData } from 'reactfire';
import { useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { ProtocolProjectAttachment } from './ProtocolProjectAttachment';
import { useAppSelector } from '../../../reduxHooks';
import { selectUser } from '../../../redux/userSlice';
import { selectContacts, selectOpenContacts } from '../../../redux/contactsSlice';
import { selectDb } from '../../../redux/databaseSlice';
import { TbMailFast, TbMailForward, TbMailShare } from 'react-icons/tb';
import { useState } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytes, uploadString } from 'firebase/storage';
import { User } from 'firebase/auth';
import { ContactList } from '../../contacts/ContactList';


type ProtocolAttachmentProps = {
    protocolOpen: boolean;
    onClose?: (protocolOpen: boolean) => void;
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
    const imageRef = ref(storage, 'images/' + project.id + '.png');
    // imagesRef now points to 'images'

    setSending(true);
    const linkToProtocolProject = document.getElementById("protocol-project");
    // @ts-ignore
    const canvas = await html2canvas(linkToProtocolProject, { scale: 1.5 })
    const base64 = canvas.toDataURL("image/jpeg", 1.0);
    let file = await getCanvasBlob(canvas);
    debugger; 
    // upload file to firebase storage
    await uploadBytes(imageRef, file)
    const imageLink = await getDownloadURL(imageRef);
    
    
    
    const collaborators = {}; // key (collaboratorId) => value ({collaborator, tasks})
    tasks.forEach((task) => {
        task.collaborators.forEach((collaboratorId) => {
            if (!collaborators[collaboratorId]) {
                const collaborator = contacts.find((contact) => contact.id == collaboratorId);
                collaborators[collaboratorId] = {collaborator, tasks: []};
            }
            collaborators[collaboratorId].tasks.push(task);
        })
    });
    
    Object.values(collaborators).forEach((instance) => {
        debugger;
        //@ts-ignore
        emailjs.send("task-fitter", "template_kqmklat", {
            //attachment: base64,
            project_name: project.project_name,
            reply_to: user.email,
            from_name: user.displayName,
            protocol_link: imageLink,
            //@ts-ignore
            contact_mail: instance.collaborator.email,
            //@ts-ignore
            contact_name: instance.collaborator.name,
            //@ts-ignore
            task_list: instance.tasks.map((task) => task.task).join('<br>')
        }, "vtVkQrnc2d67CfVRb")
            .then((response) => {
                alert('הצלחה! הפרוטוקול נשלח בהצלחה לכל המשתתפים' + response.status + response.text);
                setSending(false);
            },
            (error) => {
                alert('שגיאה!' + error.status + error.text);
                setSending(false);
            });
            
    })
}

export const ProtocolAttachment = (props: ProtocolAttachmentProps) => {
    const db = useAppSelector(selectDb);
    const user = useAppSelector(selectUser);
    const contacts = useAppSelector(selectContacts);
    const openContacts = useAppSelector(selectOpenContacts);
    const [sending, setSending] = useState(false);

    let { id } = useParams();

    const { status: projectStatus, data: project } = useFirestoreDocData(doc(db, 'projects', id || ''), { idField: 'id', });
    
    const tasksCollection = collectionGroup(db, 'tasks');
    const projectTasksQuery = query(tasksCollection, 
        where("user_id", "==", user.uid || 0),
        where('project_id', '==', id));
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
                <h1>פרוטוקול פרויקט: {project.project_name}</h1>
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
                        disabled
                        >
                        מתבצעת שליחה <TbMailFast size={34} /><div className="loader"></div>
                    </button>
                    : <button 
                        className='send-button' 
                        onClick={() => sendMail(project, projectTasks, contacts, setSending, user)}
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

