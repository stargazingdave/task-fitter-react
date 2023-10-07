import { User } from "firebase/auth";
import { DocumentData, Firestore, addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useFirestoreCollectionData } from "reactfire";
import '.././ProtocolProject.scss'
import { ProtocolTasksAttachment } from "./ProtocolTasksAttachment";
import { useState } from "react";
import { CreateProjectForm } from "../../projects/CreateProjectForm";
import Popup from "reactjs-popup";
import { ProtocolConfirmationBox } from ".././ProtocolConfirmationBox";
import { FaHammer } from "react-icons/fa";
import { BiEditAlt } from "react-icons/bi";
import { EditProjectForm } from "../../projects/EditProjectForm";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { MdAddTask } from "react-icons/md";

type ProtocolProjectAttachmentProps = {
    user: User;
    project: DocumentData;
    db: Firestore;
    path: string;
    addSaveAction: (taskId: string, action: () => void) => void;
}

export const ProtocolProjectAttachment = (props: ProtocolProjectAttachmentProps) => {
    const subProjectCollection = collection(props.db, props.path, 'projects');
    const projectSubjectsCollection = collection(props.db, props.path, 'subjects');
    const [editProject, setEditProject] = useState({} as DocumentData);
    const { status: statusP, data: projects } = useFirestoreCollectionData(subProjectCollection, { idField: 'id',});
    const { status: statusS, data: subjects } = useFirestoreCollectionData(projectSubjectsCollection, { idField: 'id',});
    // check the loading status
    if (statusP === 'loading') {
        return <p>טוען פרויקטים...</p>;
    }
    if (statusS === 'loading') {
        return <p>טוען נושאים...</p>;
    }

    return (<div className="form">

        <div className="form-tasks">
            {
                subjects.map(subject => (
                    
                    <div className='p-subject' key={subject.id}>
                        <div className='subject-title'>
                            <h1>{subject.title}</h1>
                        </div>
                        <ProtocolTasksAttachment   
                            user={props.user}
                            tasksCollection={collection(props.db, props.path, 'subjects', subject.id, 'tasks')}
                            addSaveAction={props.addSaveAction} />
                    </div>
                ))
            }
        </div>
        <div className="form-sub-project">
            {
                projects.map(project => ( 
                    <div className="sub-project" key={project.id}>
                        <h1>{project.project_name}</h1>
                        {
                            editProject?.id &&
                            <EditProjectForm 
                                db={props.db} 
                                editProject={editProject} 
                                projectsCollection={subProjectCollection}
                                setEditProject={(editProject) => setEditProject(editProject)}
                                user={props.user} />
                        }
                        <ProtocolProjectAttachment    
                            user={props.user}
                            project={project}
                            db={props.db} 
                            path={props.path + '/projects/' + project.id}
                            addSaveAction={props.addSaveAction} />
                    </div>
                ))
            }
        </div>
    </div>)
}