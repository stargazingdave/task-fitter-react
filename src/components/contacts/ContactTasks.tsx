import { User } from "firebase/auth";
import { DocumentData, collectionGroup, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestoreCollectionData } from "reactfire";

import './ContactTasks.scss'
import { useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";


type ContactTasksProps = {
    contact: DocumentData;
}


export const ContactTasks = (props: ContactTasksProps) => {
    const user = useAppSelector(selectUser);
    const [isAscending, setIsAscending] = useState(false);
    const db = getFirestore();
    // const tasksCollection = collectionGroup(db, 'tasks');
    const tasksCollection = collectionGroup(db, 'tasks');
    debugger
    const tasksQuery = query(tasksCollection, 
        where("user_id", '==', user.uid),
        where("collaborators", 'array-contains', props.contact.email),
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
                    <h2>{new Date(task.deadline).toLocaleDateString("he-IL")}</h2>
                    <p>{task.status ? <h4>בוצע</h4> : <h3>לא בוצע</h3>}</p>                    
                </div>
            ))}
        </div>
    </div>
}