import { CollectionReference, getFirestore, query, where } from "firebase/firestore";
import { useFirestoreCollectionData } from "reactfire";

import '.././ProtocolTasks.scss'

import { ProtocolTaskAttachment } from "./ProtocolTaskAttachment";
import { useAppSelector } from "../../../reduxHooks";
import { selectUser } from "../../../redux/userSlice";

type ProtocolTasksAttachmentProps = {
    tasksCollection: CollectionReference;
    addSaveAction: (taskId: string, action: () => void) => void;
}


export const ProtocolTasksAttachment = (props: ProtocolTasksAttachmentProps) => {
    const user = useAppSelector(selectUser);
    const tasksQuery = query(props.tasksCollection,
        where("user_id", "==", user.uid || 0));
    const { status, data: tasks } = useFirestoreCollectionData(tasksQuery, { idField: 'id',});
    
    if (status === 'loading') {
        return <p>טוען משימות...</p>;
    }
    
    return <div className="p-tasks">
        <div className="p-tasks-container">
            {tasks?.map(task => (
                <div className="p-task" key={task.id}>
                    <ProtocolTaskAttachment   task={task}
                                    tasksCollection={props.tasksCollection}
                                    addSaveAction={props.addSaveAction} />
                    {
                        task.image && <img src={task.image} style={{scale: "90%", height: "200px", width: "fit-content"}} />
                    }
                </div>
            ))}
        </div>
    </div>
}