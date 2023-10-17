import { User } from "firebase/auth";
import { CollectionReference, DocumentData, Firestore, collection, deleteDoc, deleteField, doc, updateDoc } from "firebase/firestore";
import { useRef, useState } from "react";
import "./EditTaskForm.scss"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { deleteImage, uploadImage } from "../../utils";


type EditTaskFormProps = {
    editTask: DocumentData;
    tasksCollection: CollectionReference;
    user: User;
    setEditTask: (editProject: DocumentData) => void;
    db: Firestore;
    task: DocumentData;
    contacts: DocumentData[];
}
  

const deleteCollaborator = (taskCollaborators: string[], collaborator: string, index: number) => {
    let temp = [...taskCollaborators];
    temp.splice(index, 1);
    return temp;
}

const updateTask = (props: EditTaskFormProps, 
    taskTitle: string, 
    taskDeadline: Date,
    taskCollaborators: string[],
    image: File | null) => {
        const date = new Date();
        updateDoc(doc(props.tasksCollection, props.task.id), {
            task: taskTitle,
            update_time: date.toLocaleDateString("he-IL"),
            deadline: taskDeadline.toString(),
            collaborators: taskCollaborators || [],
            });
        if (image != null) {
            props.task.image && deleteImage(props.task.id);
            uploadImage(props.task.id, image, props.tasksCollection);
        }
}


export const EditTaskForm = (props: EditTaskFormProps) => {
    
    const selectContactRef = useRef<HTMLSelectElement>(null);
    const [taskTitle, setTaskTitle] = useState(props.task.task);
    const [taskCollaborators, setTaskCollaborators] = useState(props.editTask.collaborators);
    const [taskDeadline, setTaskDeadline] = useState(new Date(Date.parse(props.task.deadline)));
    const [image, setImage] = useState<File | null>(null);


    return (
        <>
            <div className="edit-task-form">
                <div className="text-box">
                    <label htmlFor="task-input" >משימה: </label>
                    <textarea className="task-input" 
                                style={{background: "white",
                                        width: "85%",
                                        borderRadius: "4px",
                                        fontSize: "20px",
                                        fontFamily: "Segoe UI"
                                    }}
                                id="task-input"
                                value={taskTitle}
                                onChange={e => setTaskTitle(e.target.value)}
                                placeholder="משימה ריקה"
                    />
                </div>
                <div className="set-deadline">
                    <label>
                        דד-ליין:
                    </label>
                    <DatePicker wrapperClassName={"datepicker-wrapper"} dateFormat={"dd/MM/yyyy"} showIcon selected={taskDeadline} onChange={(date) => date ? setTaskDeadline(date) : setTaskDeadline(taskDeadline)}/>
                </div>
                <div className="collaborators-selection">
                    <label>
                        משתתפים:
                    </label>
                    <select ref={selectContactRef}
                            style={{width: "100%"}}>            
                        {props.contacts?.map(contact => (
                            <option key={contact.id} className="contact" value={contact.id}>{contact.name}</option>
                        ))}
                    </select>
                    <button onClick={() => {
                        if (selectContactRef?.current && !taskCollaborators.includes(selectContactRef.current.value)) {
                            setTaskCollaborators([...taskCollaborators, selectContactRef.current.value]);
                        }
                    }}>
                        הוספה
                    </button>
                    <div className="collaborators">
                        {taskCollaborators?.map((collaborator: string, index: number) => (
                            <div key={collaborator} className="contact">
                                <h1 onClick={() => setTaskCollaborators(deleteCollaborator(taskCollaborators, collaborator, index))} title="מחיקה">{
                                props.contacts.find((contact) => contact.id == collaborator)?.name}</h1>
                            </div>
                        ))}
                    </div>
                    <div className="image-select">
                        {
                            props.task.image && 
                            <button 
                                className="delete-image-button" 
                                onClick={() => {
                                    deleteImage(props.task.id);
                                    updateDoc(doc(props.tasksCollection, props.task.id), {
                                        image: deleteField()
                                })}} >
                                    מחיקת תמונה
                            </button>
                        }
                        <label htmlFor="image-upload">בחירת תמונה</label>
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
                    </div>
                </div>
                <button onClick={() => {
                    if (taskTitle == '') {
                        alert('יש למלא את תיאור המשימה');
                        return;
                    }
                    updateTask(props, taskTitle, taskDeadline, taskCollaborators, image);
                    props.setEditTask({} as DocumentData);
                }}>
                    שמירת שינויים
                </button>
                <button onClick={() => props.setEditTask({} as DocumentData)}>ביטול</button>
            </div>
        </>
    )
}