import { User } from "firebase/auth";
import { CollectionReference, DocumentData, addDoc, collection, deleteField, doc, getDocs, getFirestore, orderBy, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestoreCollectionData } from "reactfire";

import './ProtocolTasks.scss'

import { ProtocolTask } from "./ProtocolTask";
import { deleteImage } from "../../utils";

type ProtocolTasksProps = {
    user: User;
    tasksCollection: CollectionReference;
    addSaveAction: (taskId: string, action: () => void) => void;
    project: DocumentData;
}


export const ProtocolTasks = (props: ProtocolTasksProps) => {
    const [isAscending, setIsAscending] = useState(true);
    const db = getFirestore();
    const tasksQuery = query(props.tasksCollection, where("user_id", "==", props.user.uid || 0));
    const contactsCollection = collection(db, 'contacts');
    const contactsQuery = query(contactsCollection,
        where("user_id", "==", props.user.uid || 0),
        orderBy('name', isAscending ? 'asc' : 'desc'));
    const { status: contactsStatus, data: contacts } = useFirestoreCollectionData(contactsQuery, { idField: 'id',});

    useEffect(() => {
        async function getToken() {
            const querySnapshot = await getDocs(tasksQuery);
            querySnapshot.forEach((doc) => {
                console.log(doc.id, ' => ', doc.data());
            });
        }
    }, [])

    
    const { status: tasksStatus, data: tasks } = useFirestoreCollectionData(tasksQuery, { idField: 'id',});
    
    if (tasksStatus === 'loading') {
        return <p>טוען משימות...</p>;
    }
    if (contactsStatus === 'loading') {
        return <p>טוען משימות...</p>;
    }
    return <div className="p-tasks">
        <div className="p-tasks-container">
            {tasks?.sort((task1, task2) => {return Date.parse(task1.deadline) - Date.parse(task2.deadline)}).map(task => (
                <div className="p-task" key={task.id}>
                    <ProtocolTask   
                        task={task}
                        tasksCollection={props.tasksCollection}
                        user={props.user}
                        db={db} 
                        addSaveAction={props.addSaveAction} 
                        contacts={contacts}
                    />
                    {
                        task.image && <img src={task.image} style={{maxHeight: "200px"}} />
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
            <button 
                className="new-task-button"
                title="משימה חדשה"
                onClick={() => {addDoc(props.tasksCollection, {
                    task: "",
                    status: false,
                    deadline: new Date().toString(),
                    user_id: props.user.uid,
                    collaborators: [],
                    project_id: props.project.id
                })}}>
                    משימה חדשה
            </button>
        </div>
    </div>
}