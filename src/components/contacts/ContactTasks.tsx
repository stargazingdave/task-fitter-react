import { User } from "firebase/auth";
import { DocumentData, collectionGroup, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestoreCollectionData } from "reactfire";

import './ContactTasks.css'


type ContactTasksProps = {
    contact: DocumentData;
    user: User;
}


export const ContactTasks = (props: ContactTasksProps) => {
    
    const [isAscending, setIsAscending] = useState(false);
    const db = getFirestore();
    // const tasksCollection = collectionGroup(db, 'tasks');
    const tasksCollection = collectionGroup(db, 'tasks');
    
    const tasksQuery = query(tasksCollection, 
        where("collaborators", 'array-contains', props.contact.id),
        orderBy('deadline', isAscending ? 'asc' : 'desc'));


    useEffect(() => {
        async function getToken() {
            const querySnapshot = await getDocs(tasksQuery);
            querySnapshot.forEach((doc) => {
                console.log(doc.id, ' => ', doc.data());
            });
        }
    }, [])

    const { status, data: tasks } = useFirestoreCollectionData(tasksQuery, { idField: 'id',});
    if (status === 'loading') {
        return <p>טוען משימות...</p>;
    }
    return <div className="contact-tasks">
        <div className="contact-tasks-container">
            {tasks?.map(task => (
                <div className="contact-task" key={task.id}>
                    
                    <h1>{task.task}</h1>
                    <h2>{task.deadline}</h2>
                    <p>{task.status ? <h4>בוצע</h4> : <h3>לא בוצע</h3>}</p>                    
                </div>
            ))}
        </div>
    </div>
}