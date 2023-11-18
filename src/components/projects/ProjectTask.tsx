import { CollectionReference, DocumentData, deleteDoc, doc, or, query, updateDoc, where } from "firebase/firestore";
import { useState } from "react";
import { getStorage, ref, deleteObject } from "firebase/storage";


import './ProjectTasks.scss'

import { Checkbox } from "../general/Checkbox";
import { BiEditAlt, BiTask } from "react-icons/bi";
import Popup from "reactjs-popup";
import { ConfirmationBox } from "../general/ConfirmationBox";
import { ImageContainer } from "../general/ImageContainer";
import { MdDeleteForever } from "react-icons/md";
import { useAppSelector } from "../../reduxHooks";
import { selectContacts } from "../../redux/contactsSlice";
import { FcImageFile } from "react-icons/fc";
import { EditTaskForm } from "./EditTaskForm";

type ProjectTaskProps = {
    task: DocumentData;
    taskCollection: CollectionReference;
}



export const ProjectTask = (props: ProjectTaskProps) => {
    const storage = getStorage();
    const contacts = useAppSelector(selectContacts);

    const [imageOpen, setImageOpen] = useState(false);
    const [editTask, setEditTask] = useState(false);
    const [taskDeletePopup, setTaskDeletePopup] = useState({} as DocumentData);

    


    return <div className="task">
        {
            editTask
            ? <EditTaskForm 
                tasksCollection={props.taskCollection} 
                setEditTask={setEditTask} 
                task={props.task} 
            />
            : <div className="task-details">
                <div className="task-visible">
                    <h1>{props.task.task}</h1>
                </div>
                <div className="task-invisible">
                    
                    <h2 className="task-deadline">{new Date(props.task.deadline).toLocaleDateString("he-IL")}</h2>
                    <div className="collaborators">
                        {
                            props.task.collaborators?.map((collaborator: string) => (
                                <div key={collaborator} className="collaborator">
                                    <p>
                                        {
                                            contacts.find((contact) => contact.email == collaborator)
                                            ? contacts.find((contact) => contact.email == collaborator)?.name
                                            : collaborator
                                        }
                                    </p><p className="comma">, </p>
                                </div>
                            ))
                        }
                    </div>
                        <div className="task-buttons">
                            {
                                props.task.image &&
                                <button
                                    className="view-image-button"
                                    title="הצגת התמונה"
                                    onClick={() => setImageOpen(!imageOpen)}
                                    >
                                    <FcImageFile size={25}/>
                                </button>
                            }
                            <button title='עריכת המשימה' className='edit-button' 
                                    onClick={() => setEditTask(true)}>
                                <BiEditAlt size={25}/>
                            </button>
                            <button 
                                title='מחיקת המשימה'
                                className='delete-button' 
                                onClick={() => {
                                    setTaskDeletePopup(props.task);
                                }}>
                                <MdDeleteForever size={25}/>
                            </button>
                            
                        </div>
                </div>
                <div className="task-status">
                    <Checkbox task={props.task} updateFunc={(task) => updateDoc(doc(props.taskCollection,
                                                                                task.id), 
                                                                                {status: !task.status})}/>
                    {props.task.status ? <h4>בוצע</h4> : <h3>לא בוצע</h3>}
                </div>
            </div>
            }
            {
                imageOpen &&
                <ImageContainer imageURL={props.task.image} />
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
                            deleteDoc(doc(props.taskCollection, taskDeletePopup.id));
                            setTaskDeletePopup({});
                        }}
                        onCancel={() => setTaskDeletePopup({})} />
                </Popup>
            }
    </div>
}