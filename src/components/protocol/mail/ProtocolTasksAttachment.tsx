import { CollectionReference, DocumentData, getFirestore, query, where } from "firebase/firestore";
import { useFirestoreCollectionData } from "reactfire";

import '.././ProtocolTasks.scss'

import { ProtocolTaskAttachment } from "./ProtocolTaskAttachment";
import { useAppSelector } from "../../../reduxHooks";
import { selectUser } from "../../../redux/userSlice";
import { useParams } from "react-router";

type ProtocolTasksAttachmentProps = {
    tasksCollection: CollectionReference;
    addSaveAction: (taskId: string, action: () => void) => void;
    project: DocumentData;
}


export const ProtocolTasksAttachment = (props: ProtocolTasksAttachmentProps) => {
    let { id } = useParams();

    const tasksQuery = query(props.tasksCollection,
        where("top_project_id", "==", id));
    
    const { status, data: tasks } = useFirestoreCollectionData(tasksQuery, { idField: 'id',});
    
    if (status === 'loading') {
        return <p>טוען משימות...</p>;
    }
    
    return <div className="p-tasks attachment">
        <div className="p-tasks-container">
            {tasks?.map(task => (
                <div className="p-task attachment" key={task.id}>
                    <ProtocolTaskAttachment   task={task}
                                    tasksCollection={props.tasksCollection}
                                    addSaveAction={props.addSaveAction} />
                        {
                            task.image && 
                            <img 
                                src={task.image} 
                                style={{
                                    scale: "90%", 
                                    height: "200px", 
                                    width: "fit-content",
                                }} 
                            />
                        }
                </div>
            ))}
        </div>
    </div>
}