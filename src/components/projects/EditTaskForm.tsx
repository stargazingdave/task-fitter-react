import { User } from "firebase/auth";
import { CollectionReference, DocumentData, Firestore, collection, deleteDoc, deleteField, doc, updateDoc } from "firebase/firestore";
import { useRef, useState } from "react";
import "./EditTaskForm.scss";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { deleteImage, uploadImage } from "../../utils";
import Select, { GroupBase } from 'react-select';
import makeAnimated from 'react-select/animated';


type EditTaskFormProps = {
    tasksCollection: CollectionReference;
    user: User;
    setEditTask: (editProject: DocumentData) => void;
    db: Firestore;
    task: DocumentData;
    contacts: DocumentData[];
}

const animatedComponents = makeAnimated();


const updateTask = (props: EditTaskFormProps, 
    taskTitle: string, 
    taskDeadline: Date,
    taskCollaborators: string[],
    image: File | null) => {
        if (taskTitle == '') {
            alert('יש למלא את תיאור המשימה');
            return;
        }
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
    let contacts = props.contacts.map((contact) => ({value: contact.id, label: contact.name}));

    const selectContactRef = useRef<any>(null);
    const [selectedOptions, setSelectedOptions] = useState(props.contacts
        .filter((contact) => props.task.collaborators.includes(contact.id))
        .map((collaborator) => ({value: collaborator.id, label: collaborator.name})));
    const [taskTitle, setTaskTitle] = useState(props.task.task);
    const [taskCollaborators, setTaskCollaborators] = useState(props.task.collaborators);
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
                    <Select 
                        ref={selectContactRef}
                        options={contacts} 
                        closeMenuOnSelect={false}
                        components={animatedComponents}
                        isMulti
                        defaultValue={selectedOptions}
                    />
                </div>
                <div className="image-select">
                    <label htmlFor="image-upload">בחירת תמונה:</label>
                    <br></br>
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
                <div className="buttons">
                    <button onClick={() => {
                        const comp = selectContactRef.current;
                        const taskCollaboratorsNew = comp.getValue().map((value) => value.value);
                        updateTask(props, taskTitle, taskDeadline, taskCollaboratorsNew, image);
                        props.setEditTask({} as DocumentData);
                    }}>
                        שמירת שינויים
                    </button>
                    <button onClick={() => props.setEditTask({} as DocumentData)}>ביטול</button>
                </div>
            </div>
        </>
    )
}