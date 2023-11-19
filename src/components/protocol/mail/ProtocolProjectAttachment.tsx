import { DocumentData, Firestore, collection, orderBy, query, where } from "firebase/firestore";
import { useFirestoreCollectionData } from "reactfire";
import '.././ProtocolProject.scss'
import { ProtocolTasksAttachment } from "./ProtocolTasksAttachment";
import { useAppSelector } from "../../../reduxHooks";
import { selectUser } from "../../../redux/userSlice";
import { selectDb } from "../../../redux/databaseSlice";
import { useState } from "react";
import { useParams } from "react-router";

type ProtocolProjectAttachmentProps = {
    project: DocumentData;
    path: string;
    addSaveAction: (taskId: string, action: () => void) => void;
}

export const ProtocolProjectAttachment = (props: ProtocolProjectAttachmentProps) => {
    const [isAscending, setIsAscending] = useState(true);
    let { id } = useParams();
    const db = useAppSelector(selectDb);
    const subProjectsCollection = collection(db, props.path, 'projects');
    const subjectsCollection = collection(db, props.path, 'subjects');


    const subProjectsQuery = query(subProjectsCollection,
        where("top_project_id", "==", id),
        orderBy('creation_time', isAscending ? 'asc' : 'desc'));
    const subjectsQuery = query(subjectsCollection,
        where("top_project_id", "==", id),
        orderBy("creation_time", "asc"));

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
        <h1>{props.project.project_name}</h1>
        <div className="headers-container">
            <div className="headers attachment">
                <div className="full-height"></div>
                <div >משימה: </div>
                <div >משתתפים: </div>
                <div >דד-ליין: </div>
            </div>
        </div>
        <div className="form-tasks">
        
            {
                subjects.map(subject => (
                    
                    <div className='p-subject' key={subject.id}>
                        <div className='subject-title attachment'>
                            <h1>{subject.title}</h1>
                        </div>
                        <ProtocolTasksAttachment   
                            tasksCollection={collection(db, props.path, 'subjects', subject.id, 'tasks')}
                            addSaveAction={props.addSaveAction} 
                            project={props.project}
                        />
                    </div>
                ))
            }
        </div>
        <div className="form-sub-project">
            {
                projects.map(project => ( 
                    <div className="sub-project" key={project.id}>
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