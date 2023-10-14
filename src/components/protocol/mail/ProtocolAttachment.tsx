import '.././Protocol.scss';

// Import the functions you need from the SDKs you need
import { DocumentData, Firestore, collection, collectionGroup, doc, query, where } from 'firebase/firestore';
import { useFirestore, useFirestoreCollectionData, useFirestoreDocData } from 'reactfire';
import { User } from 'firebase/auth';
import { useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { ProtocolProjectAttachment } from './ProtocolProjectAttachment';


type ProtocolAttachmentProps = {
    user: User;
    protocolOpen: boolean;
    onClose?: (protocolOpen: boolean) => void;
}

const actions = {}; // key-value map. key - task id, value - action(function)

const addSaveAction = (taskId: string, action: () => void) => {
    actions[taskId] = action;
}



const sendMail = async (project: DocumentData, tasks: DocumentData[], contacts: DocumentData[]) => {
    const linkToProtocolProject = document.getElementById("protocol-project");
    // @ts-ignore
    const canvas = await html2canvas(linkToProtocolProject, { scale: 1.5 })
    const base64 = canvas.toDataURL();
    
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
        debugger
        //@ts-ignore
        emailjs.send("task-fitter", "template_kqmklat", {
            attachment: base64,
            project_name: project.project_name,
            //@ts-ignore
            contact_mail: instance.collaborator.email,
            //@ts-ignore
            contact_name: instance.collaborator.name,
            //@ts-ignore
            task_list: instance.tasks.map((task) => task.task).join('<br>')
        }, "vtVkQrnc2d67CfVRb");
    })
}

export const ProtocolAttachment = (props: ProtocolAttachmentProps) => {
    const db = useFirestore();
    
    let { id } = useParams();

    const { status, data: project } = useFirestoreDocData(doc(db, 'projects', id || ''), { idField: 'id', });
    const tasksCollection = collectionGroup(db, 'tasks');
    const projectTasksQuery = query(tasksCollection, where('project_id', '==', id));
    const {status: tasksStatus, data: projectTasks} = useFirestoreCollectionData(projectTasksQuery, { idField: 'id', });
    const contactsCollection = collection(db, 'contacts');
    const contactsQuery = query(contactsCollection,
        where("user_id", "==", props.user.uid || 0));
    const {status: contactsStatus, data: contacts} = useFirestoreCollectionData(contactsQuery, { idField: 'id', });
    if (contactsStatus === 'loading') {
        return <p>טוען פרוטוקול...</p>;
    }
    if (status === 'loading') {
        return <p>טוען פרוטוקול...</p>;
    }
    if (!project) {
        return <p>פרויקט לא קיים</p>
    }

    if (tasksStatus === 'loading') {
        return <p>טוען משימות...</p>;
    }
   

    

    return <div className='protocol-container'>
        <div  id="protocol-project">
            <h1>פרוטוקול פרויקט: {project.project_name}</h1>
            <ProtocolProjectAttachment user={props.user}
                project={project}
                db={db}
                path={'projects/' + project.id}
                addSaveAction={addSaveAction} />
        </div>
        <div className="buttons">
            <button onClick={() => sendMail(project, projectTasks, contacts)}>שליחה</button>
        </div>
    </div>
}

