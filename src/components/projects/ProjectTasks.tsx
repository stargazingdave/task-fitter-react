import { User } from "firebase/auth";
import { CollectionReference, DocumentData, deleteDoc, doc, getFirestore, query, updateDoc, where } from "firebase/firestore";
import { useState } from "react";
import { useFirestoreCollectionData } from "reactfire";
import { getStorage, ref, deleteObject, StorageReference } from "firebase/storage";


import './ProjectTasks.scss'

import { CreateTaskForm } from "./CreateTaskForm";
import { Checkbox } from "../general/Checkbox";
import { EditTaskForm } from "./EditTaskForm";
import { BiEditAlt } from "react-icons/bi";
import Popup from "reactjs-popup";
import { ConfirmationBox } from "../general/ConfirmationBox";
import { FaHammer } from "react-icons/fa";
import { ImageContainer } from "../general/ImageContainer";

type ProjectTasksProps = {
    projectStack: DocumentData[];
    user: User;
    tasksCollection: CollectionReference;
    contacts: DocumentData[];
}



export const ProjectTasks = (props: ProjectTasksProps) => {
    
    const db = getFirestore();

    const storage = getStorage();
    

    const [newTask, setNewTask] = useState(false);
    const [editTask, setEditTask] = useState({} as DocumentData);
    const [taskDeletePopup, setTaskDeletePopup] = useState({} as DocumentData);
    const tasksQuery = query(props.tasksCollection,
        where("user_id", "==", props.user.uid || 0));


    const { status, data: tasks } = useFirestoreCollectionData(tasksQuery, { idField: 'id',});
    

    if (status === 'loading') {
        return <p>טוען משימות...</p>;
    }

    
    return <div className="tasks">
        <div className="tasks-container">
            {tasks?.sort((x, y) => {
                if (Date.parse(x.deadline) > Date.parse(y.deadline)) {
                    return 1;
                }
                if (new Date(Date.parse(x.deadline)) < new Date(Date.parse(y.deadline))) {
                    return -1;
                }
                return 0;
            }).map(task => (
                <div className="task" key={task.id}>
                    <div className="task-top">
                        <div className="task-details">
                            <h1>{task.task}</h1>
                            <h2>{new Date(Date.parse(task.deadline)).toLocaleDateString("he-IL")}</h2>
                        </div>
                        <div className="collaborators">
                            {task.collaborators?.map((collaborator: string) => (
                            <div key={collaborator} className="collaborator">
                                <p>{props.contacts.find((contact) => contact.id == collaborator)?.name}</p><p className="comma">, </p>
                            </div>
                            ))}
                        </div>
                        {
                            editTask?.id != task.id &&
                            <div className="task-buttons">
                                <button title='עריכת המשימה' className='edit-button' 
                                                onClick={() => setEditTask(task)}>
                                    <BiEditAlt size={25}/>
                                </button>
                                <button 
                                    title='מחיקת המשימה'
                                    className='delete-button' 
                                    onClick={() => {
                                        setTaskDeletePopup(task);
                                    }}>
                                    <FaHammer size={25}/>
                                </button>
                                
                            </div>
                        }
                    </div>
                    <div className="task-status">
                        <Checkbox task= {task} updateFunc={(task) => updateDoc(doc(props.tasksCollection,
                                                                                    task.id), 
                                                                                    {status: !task.status})}/>
                        {task.status ? <h4>בוצע</h4> : <h3>לא בוצע</h3>}
                    </div>
                    {
                        task.image &&
                        <ImageContainer imageURL={task.image} />
                    }
                    {
                        editTask?.id == task.id &&
                        <EditTaskForm editTask={editTask} 
                                        tasksCollection={props.tasksCollection} 
                                        user={props.user} 
                                        setEditTask={setEditTask} 
                                        db={db} 
                                        task={task} 
                                        contacts={props.contacts} /> 
                    }
                </div>
            ))}
            {
                newTask
                ? <CreateTaskForm tasksCollection={props.tasksCollection} 
                                    db={db}
                                    user={props.user} 
                                    createTaskSelected={newTask} 
                                    onTaskCreate={() => setNewTask(false)} 
                                    onCancel={() => setNewTask(false)} 
                                    contacts={props.contacts}
                                    project={props.projectStack[props.projectStack.length - 1]} />
                : <button className="new-task-button" onClick={() => setNewTask(true)}>
                    משימה חדשה
                </button>
            }
            {
                taskDeletePopup?.id &&
                <Popup 
                    contentStyle={{width: "300px"}}
                    open={taskDeletePopup?.id}
                    modal={true}>
                    <ConfirmationBox 
                        onConfirm={() => {
                            // Create a reference to the file to delete
                            const imageRef = ref(storage, 'images/' + taskDeletePopup.id);
                            // Delete the file
                            deleteObject(imageRef).then(() => {
                                // File deleted successfully
                            }).catch((error) => {
                                // Uh-oh, an error occurred!
                            });
                            deleteDoc(doc(props.tasksCollection, taskDeletePopup.id));
                            setTaskDeletePopup({});
                        }}
                        onCancel={() => setTaskDeletePopup({})} />
                </Popup>
            }
        </div>
    </div>
}