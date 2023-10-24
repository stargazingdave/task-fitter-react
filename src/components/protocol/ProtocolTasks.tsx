import { CollectionReference, DocumentData, addDoc, deleteField, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestoreCollectionData } from "reactfire";

import './ProtocolTasks.scss'

import { ProtocolTask } from "./ProtocolTask";
import { deleteImage } from "../../utils";
import { useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";
import { AiOutlinePlus } from "react-icons/ai";
import { BiTask } from "react-icons/bi";

type ProtocolTasksProps = {
    tasksCollection: CollectionReference;
    addSaveAction: (taskId: string, action: () => void) => void;
    project: DocumentData;
}


export const ProtocolTasks = (props: ProtocolTasksProps) => {
    const user = useAppSelector(selectUser);
    const tasksQuery = query(props.tasksCollection, where("user_id", "==", user.uid || 0));

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

    return <div className="p-tasks">
        <div className="p-tasks-container">
            {tasks?.sort((task1, task2) => {return Date.parse(task1.deadline) - Date.parse(task2.deadline)}).map(task => (
                <div className="p-task" key={task.id}>
                    <ProtocolTask   
                        task={task}
                        tasksCollection={props.tasksCollection}
                        addSaveAction={props.addSaveAction} 
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
                onClick={() => {
                    addDoc(props.tasksCollection, {
                        task: "",
                        status: false,
                        deadline: new Date().toString(),
                        user_id: user.uid,
                        collaborators: [],
                        project_id: props.project.id
                    });
                }}
                >
                    <div className="icons">
                        <AiOutlinePlus size={20} />
                        <BiTask size={30} />
                    </div>
                    משימה חדשה
            </button>
        </div>
    </div>
}