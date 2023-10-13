import { User } from "firebase/auth";
import { CollectionReference, addDoc, deleteField, doc, getDocs, getFirestore, updateDoc } from "firebase/firestore";
import { useEffect } from "react";
import { useFirestoreCollectionData } from "reactfire";

import './ProtocolTasks.scss'

import { ProtocolTask } from "./ProtocolTask";
import { deleteImage } from "../../utils";

type ProtocolTasksProps = {
    user: User;
    tasksCollection: CollectionReference;
    addSaveAction: (taskId: string, action: () => void) => void;
}


export const ProtocolTasks = (props: ProtocolTasksProps) => {
    const db = getFirestore();
    


    useEffect(() => {
        async function getToken() {
            const querySnapshot = await getDocs(props.tasksCollection);
            querySnapshot.forEach((doc) => {
                console.log(doc.id, ' => ', doc.data());
            });
        }
    }, [])

    const { status, data: tasks } = useFirestoreCollectionData(props.tasksCollection, { idField: 'id',});
    
    if (status === 'loading') {
        return <p>טוען משימות...</p>;
    }
    return <div className="p-tasks">
        <div className="p-tasks-container">
            {tasks?.sort((task1, task2) => {return Date.parse(task1.deadline) - Date.parse(task2.deadline)}).map(task => (
                <div className="p-task" key={task.id}>
                    <ProtocolTask   task={task}
                                    tasksCollection={props.tasksCollection}
                                    user={props.user}
                                    db={db} 
                                    addSaveAction={props.addSaveAction} />
                    {
                        task.image && <img src={task.image} style={{scale: "90%", height: "200px", width: "fit-content"}} />
                    }
                    {
                        task.image && 
                        <button 
                            className="delete-image-button" 
                            onClick={() => {
                                deleteImage(task.id);
                                updateDoc(doc(props.tasksCollection, task.id), {
                                    image: deleteField()
                            })}} >
                                מחיקת תמונה
                        </button>
                    }
                </div>
            ))}
        </div>
    </div>
}