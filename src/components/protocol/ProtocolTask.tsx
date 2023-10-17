import { User } from "firebase/auth";
import { CollectionReference, DocumentData, Firestore, collection, deleteDoc, doc, orderBy, query, updateDoc, where } from "firebase/firestore";
import { useRef, useState } from "react";
import './ProtocolTask.scss'
import { Checkbox } from "../general/Checkbox";
import { useFirestoreCollectionData } from "reactfire";
import { AiOutlinePlus } from 'react-icons/ai';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { FaHammer } from "react-icons/fa";
import Popup from "reactjs-popup";
import { ProtocolConfirmationBox } from "./ProtocolConfirmationBox";
import { deleteImage, uploadImage } from "../../utils";


type ProtocolTaskProps = {
    task: DocumentData;
    tasksCollection: CollectionReference;
    user: User;
    db: Firestore;
    addSaveAction: (taskId: string, action: () => void) => void;
}
  




export const ProtocolTask = (props: ProtocolTaskProps) => {
    const [taskTitle, setTaskTitle] = useState(props.task.task);
    const [isAscending, setIsAscending] = useState(true);
    const [taskDeadline, setTaskDeadline] = useState(new Date(Date.parse(props.task.deadline)));
    const [taskCollaborators, setTaskCollaborators] = useState(props.task.collaborators);
    const [deleteTask, setDeleteTask] = useState({} as DocumentData);
    const [image, setImage] = useState<File | null>(null);
    const contactsCollection = collection(props.db, "contacts");
    const contactsQuery = query(contactsCollection,
        where("user_id", "==", props.user.uid || 0),
        orderBy('name', isAscending ? 'asc' : 'desc'));
    const { status, data: contacts } = useFirestoreCollectionData(contactsQuery, { idField: 'id',});
    const selectContactRef = useRef<HTMLSelectElement>(null);


    if (status === 'loading') {
        return <p>טוען אנשי קשר...</p>;
    }

    props.addSaveAction(props.task.id, () => {
        const date = new Date();
        const docRef = doc(props.tasksCollection, props.task.id);
        
        updateDoc(docRef, {
            task: taskTitle,
            update_time: date.toString(),
            deadline: taskDeadline.toString(),
            collaborators: taskCollaborators
        });
        if (image) {
            props.task.image && deleteImage(props.task.id);
            uploadImage(props.task.id, image, props.tasksCollection);
        }
    })

    const deleteCollaborator = (taskCollaborators: string[], collaborator: string, index: number) => {
        let temp = [...taskCollaborators];
        temp.splice(index, 1);
        return temp;
    }

    
    return (
        <>
            <div className="protocol-task">
                <div className="task-title">
                    <label htmlFor="title-input" >משימה: </label>
                    <textarea className="title-input" 
                                style={{background: "white",
                                        width: "auto",
                                        borderRadius: "4px",
                                        fontSize: "20px",
                                        fontFamily: "Segoe UI"
                                    }}
                                id="title-input"
                                value={taskTitle}
                                onChange={e => setTaskTitle(e.target.value)}
                                placeholder="משימה ריקה"
                                rows={2}
                                aria-multiline={true}
                                overflow-wrap="anywhere"
                                overflow-y="scroll" />
                </div>
                <div className="task-collaborators" >
                    <label htmlFor="title-input" >משתתפים: </label>
                    <select 
                        className="title-input" 
                        ref={selectContactRef}
                        style={{width: "100%"}}  >
                            {contacts?.map(contact => (
                                <option key={contact.id} className="contact" value={contact.id}>{contact.name}</option>
                            ))}
                    </select>
                    <button onClick={() => {
                        if (selectContactRef?.current && !taskCollaborators.includes(selectContactRef.current.value)) {
                            setTaskCollaborators([...taskCollaborators, selectContactRef.current.value]);
                        }
                    }}>
                        <AiOutlinePlus />
                    </button>
                    <div className="collaborators-list">
                        {taskCollaborators?.map((collaborator: string, index: number) => (
                            <div key={collaborator} className="contact">
                                <h1 
                                    title="מחיקה"
                                    onClick={() => {
                                            setTaskCollaborators(deleteCollaborator(taskCollaborators, collaborator, index));
                                        }} >
                                    {contacts.find((contact) => contact.id == collaborator)?.name}
                                </h1>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="set-deadline">
                    <label>
                        דד-ליין:
                    </label>
                    <>
                    <DatePicker 
                        wrapperClassName={"datepicker-wrapper"} 
                        dateFormat={"dd/MM/yyyy"} 
                        showIcon 
                        selected={taskDeadline} 
                        onChange={(date) => date ? setTaskDeadline(date) : setTaskDeadline(taskDeadline)}/>
                    </>
                </div>
                <div className="task-status">
                    <Checkbox task= {props.task} updateFunc={(task) => updateDoc(doc(props.tasksCollection,
                                                                                    task.id), 
                                                                                    {status: !task.status})}/>
                    {props.task.status ? <h4>בוצע</h4> : <h3>לא בוצע</h3>}
                </div>
                <button 
                    className="delete-button" 
                    title="מחיקה"
                    onClick={() => setDeleteTask(props.task)}>
                    <FaHammer />
                </button>
                {
                    deleteTask?.id &&
                    <Popup 
                        contentStyle={{width: "300px"}}
                        modal={true}  
                        open={deleteTask.id} >
                            <ProtocolConfirmationBox 
                                object="המשימה" 
                                onConfirm={() => {
                                    deleteDoc(doc(props.tasksCollection, deleteTask.id));
                                    props.addSaveAction(props.task.id, () => {});
                                    setDeleteTask({});
                                }} 
                                onCancel={() => setDeleteTask({})} />
                    </Popup>
                }
                {
                    <input 
                    className="image-upload"
                    id="image-upload"
                    type="file" 
                    accept="image/jpeg"
                    onChange={e => {
                        let files: FileList | null;
                        e.target.files
                        ? files = e.target.files
                        : files = null;
                        let tempImage = {} as File;
                        files && (tempImage = files[0]);
                        tempImage && setImage(tempImage);
                    }} />
                }
            </div>
        </>
    )
}
