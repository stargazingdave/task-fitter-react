import { DocumentData, Firestore, collection, query, where } from "firebase/firestore";
import { useFirestoreCollectionData } from "reactfire";
import '.././ProtocolProject.scss'
import { ProtocolTasksAttachment } from "./ProtocolTasksAttachment";
import { useAppSelector } from "../../../reduxHooks";
import { selectUser } from "../../../redux/userSlice";
import { selectDb } from "../../../redux/databaseSlice";

type ProtocolProjectAttachmentProps = {
    project: DocumentData;
    path: string;
    addSaveAction: (taskId: string, action: () => void) => void;
}

export const ProtocolProjectAttachment = (props: ProtocolProjectAttachmentProps) => {
    const db = useAppSelector(selectDb);
    const user = useAppSelector(selectUser);
    const subProjectCollection = collection(db, props.path, 'projects');
    const subProjectsQuery = query(subProjectCollection,
        where("user_id", "==", user.uid || 0));
    const projectSubjectsCollection = collection(db, props.path, 'subjects');
    const subjectsQuery = query(projectSubjectsCollection,
        where("user_id", "==", user.uid || 0));
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
                        <div className='subject-title attachment'>
                            <h1>{subject.title}</h1>
                        </div>
                        <ProtocolTasksAttachment   
                            tasksCollection={collection(db, props.path, 'subjects', subject.id, 'tasks')}
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
                            project={project}
                            path={props.path + '/projects/' + project.id}
                            addSaveAction={props.addSaveAction} />
                    </div>
                ))
            }
        </div>
    </div>)
}