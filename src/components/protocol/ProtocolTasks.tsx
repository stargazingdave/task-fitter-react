import { CollectionReference, DocumentData, addDoc, deleteField, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestoreCollectionData } from "reactfire";

import './ProtocolTasks.scss'

import { ProtocolTask } from "./ProtocolTask";
import { deleteImage } from "../../utils";
import { useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";
import { AiOutlinePlus } from "react-icons/ai";
import { BiSolidLeftArrow, BiSolidPlusCircle, BiTask } from "react-icons/bi";
import { useParams } from "react-router";

type ProtocolTasksProps = {
    tasksCollection: CollectionReference;
    addSaveAction: (taskId: string, action: () => void) => void;
    project: DocumentData;
}


export const ProtocolTasks = (props: ProtocolTasksProps) => {
    let { id } = useParams();
    const user = useAppSelector(selectUser);

    const tasksQuery = query(props.tasksCollection,
        where("top_project_id", "==", id));

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
            {tasks?.sort((task1, task2) => {return task1.deadline - task2.deadline}).map(task => (
                <div className="p-task" key={task.id}>
                    <ProtocolTask   
                        task={task}
                        tasksCollection={props.tasksCollection}
                        addSaveAction={props.addSaveAction} 
                    />
                    <div className="image">
                        {
                            task.image && 
                            <img 
                                src={task.image} 
                                style={{
                                    maxHeight: "200px",
                                    margin: "20px",
                                }} 
                            />
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
                </div>
            ))}
            <div className="arrow"><BiSolidLeftArrow size={30} /></div>
            <button 
                className="new-task-button"
                title="משימה חדשה"
                onClick={() => {
                    addDoc(props.tasksCollection, {
                        task: "",
                        status: false,
                        deadline: new Date().getTime(),
                        user_id: user.uid,
                        collaborators: [],
                        project_id: props.project.id,
                        top_project_id: id,
                    });
                }}
                >
                    <BiSolidPlusCircle size={30} />
                    משימה חדשה
            </button>
        </div>
    </div>
}