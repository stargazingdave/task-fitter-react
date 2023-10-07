import { User } from "firebase/auth";
import { CollectionReference, getFirestore } from "firebase/firestore";
import { useFirestoreCollectionData } from "reactfire";

import '.././ProtocolTasks.scss'

import { ProtocolTaskAttachment } from "./ProtocolTaskAttachment";

type ProtocolTasksAttachmentProps = {
    user: User;
    tasksCollection: CollectionReference;
    addSaveAction: (taskId: string, action: () => void) => void;
}


export const ProtocolTasksAttachment = (props: ProtocolTasksAttachmentProps) => {
    const db = getFirestore();
    const { status, data: tasks } = useFirestoreCollectionData(props.tasksCollection, { idField: 'id',});
    
    if (status === 'loading') {
        return <p>טוען משימות...</p>;
    }
    
    return <div className="p-tasks">
        <div className="p-tasks-container">
            {tasks?.map(task => (
                <div className="p-task" key={task.id}>
                    <ProtocolTaskAttachment   task={task}
                                    tasksCollection={props.tasksCollection}
                                    user={props.user}
                                    db={db} 
                                    addSaveAction={props.addSaveAction} />
                    {
                        task.image && <img src={task.image} style={{scale: "90%", height: "200px", width: "fit-content"}} />
                    }
                </div>
            ))}
        </div>
    </div>
}