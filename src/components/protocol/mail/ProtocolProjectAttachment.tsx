import { User } from "firebase/auth";
import { DocumentData, Firestore, addDoc, collection, deleteDoc, doc, query, updateDoc, where } from "firebase/firestore";
import { useFirestoreCollectionData } from "reactfire";
import '.././ProtocolProject.scss'
import { ProtocolTasksAttachment } from "./ProtocolTasksAttachment";

type ProtocolProjectAttachmentProps = {
    user: User;
    project: DocumentData;
    db: Firestore;
    path: string;
    addSaveAction: (taskId: string, action: () => void) => void;
}

export const ProtocolProjectAttachment = (props: ProtocolProjectAttachmentProps) => {
    const subProjectCollection = collection(props.db, props.path, 'projects');
    const subProjectsQuery = query(subProjectCollection,
        where("user_id", "==", props.user.uid || 0));
    const projectSubjectsCollection = collection(props.db, props.path, 'subjects');
    const subjectsQuery = query(projectSubjectsCollection,
        where("user_id", "==", props.user.uid || 0));
    const { status: statusP, data: projects } = useFirestoreCollectionData(subProjectsQuery, { idField: 'id',});
    const { status: statusS, data: subjects } = useFirestoreCollectionData(subjectsQuery, { idField: 'id',});
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