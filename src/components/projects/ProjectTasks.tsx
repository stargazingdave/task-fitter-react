import { CollectionReference, DocumentData, deleteDoc, doc, query, updateDoc, where } from "firebase/firestore";
import { useState } from "react";
import { useFirestoreCollectionData } from "reactfire";
import { getStorage, ref, deleteObject } from "firebase/storage";


import './ProjectTasks.scss'

import { CreateTaskForm } from "./CreateTaskForm";
import { Checkbox } from "../general/Checkbox";
import { EditTaskForm } from "./EditTaskForm";
import { BiEditAlt, BiTask } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";
import Popup from "reactjs-popup";
import { ConfirmationBox } from "../general/ConfirmationBox";
import { ImageContainer } from "../general/ImageContainer";
import { MdDeleteForever } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";
import { selectContacts } from "../../redux/contactsSlice";
import { selectProjectStack } from "../../redux/projectsSlice";

type ProjectTasksProps = {
    tasksCollection: CollectionReference;
}



export const ProjectTasks = (props: ProjectTasksProps) => {
    const user = useAppSelector(selectUser);
    const storage = getStorage();
    const contacts = useAppSelector(selectContacts);
    const projectStack = useAppSelector(selectProjectStack);
    const dispatch = useAppDispatch();

    const [newTask, setNewTask] = useState(false);
    const [editTask, setEditTask] = useState({} as DocumentData);
    const [taskDeletePopup, setTaskDeletePopup] = useState({} as DocumentData);
    const tasksQuery = query(props.tasksCollection,
        where("user_id", "==", user.uid || 0));


    const { status, data: tasks } = useFirestoreCollectionData(tasksQuery, { idField: 'id',});
    

    if (status === 'loading') {
        return <p>טוען משימות...</p>;
    }

    return <div className="tasks">
        <div className="tasks-container">
            {tasks?.sort((x, y) => {
                if (x.deadline > y.deadline) {
                    return 1;
                }
                if (x.deadline < y.deadline) {
                    return -1;
                }
                return 0;
            }).map(task => (
                <div className="task" key={task.id}>
                    {
                        editTask?.id == task.id
                        ? <EditTaskForm 
                            tasksCollection={props.tasksCollection} 
                            setEditTask={setEditTask} 
                            task={editTask} 
                        />
                        : <div className="task-details">
                            <div className="task-visible">
                                <h1>{task.task}</h1>
                            </div>
                            <div className="task-invisible">
                                
                                <h2 className="task-deadline">{new Date(task.deadline).toLocaleDateString("he-IL")}</h2>
                                <div className="collaborators">
                                    {
                                        task.collaborators?.map((collaborator: string) => (
                                            <div key={collaborator} className="collaborator">
                                                <p>{contacts.find((contact) => contact.id == collaborator)?.name}</p><p className="comma">, </p>
                                            </div>
                                        ))
                                    }
                                </div>
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
                                            <MdDeleteForever size={25}/>
                                        </button>
                                        
                                    </div>
                            </div>
                            <div className="task-status">
                                <Checkbox task={task} updateFunc={(task) => updateDoc(doc(props.tasksCollection,
                                                                                            task.id), 
                                                                                            {status: !task.status})}/>
                                {task.status ? <h4>בוצע</h4> : <h3>לא בוצע</h3>}
                            </div>
                        </div>
                        }
                        {
                            task.image &&
                            <ImageContainer imageURL={task.image} />
                        }
                    </div>
                ))
            }
            {
                newTask
                ? <CreateTaskForm tasksCollection={props.tasksCollection} 
                                    createTaskSelected={newTask} 
                                    onTaskCreate={() => setNewTask(false)} 
                                    onCancel={() => setNewTask(false)} 
                                    project={projectStack[projectStack.length - 1]} />
                : <button className="new-task-button" onClick={() => setNewTask(true)}>
                    <div className="icons">
                        <AiOutlinePlus size={20} />
                        <BiTask size={24} />
                    </div>
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