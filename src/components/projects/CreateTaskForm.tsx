import { User } from "firebase/auth";
import { CollectionReference, DocumentData, Firestore, addDoc, collection, doc, updateDoc } from "firebase/firestore";
import React, { useRef } from "react";
import { useState } from "react";
import './CreateTaskForm.scss'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select, { GroupBase } from 'react-select'
import makeAnimated from 'react-select/animated';
import { uploadImage } from "../../utils";

const animatedComponents = makeAnimated();

type CreateTaskFormProps = {
    tasksCollection: CollectionReference;
    user: User;
    createTaskSelected: boolean;
    onTaskCreate: (onTaskCreate: boolean) => void;
    onCancel: () => void;
    db: Firestore;
    contacts: DocumentData[];
    project: DocumentData;
}



const addTask = async (props: CreateTaskFormProps, 
    taskTitle: string, 
    taskDeadline: Date,
    taskCollaborators: string[],
    image: File | null) => {
        if (taskTitle == '') {
            alert('יש למלא את תיאור המשימה');
            return;
        }
        await addDoc(props.tasksCollection, {
            task: taskTitle,
            status: false,
            deadline: taskDeadline.toString(),
            user_id: props.user.uid,
            collaborators: taskCollaborators,
            project_id: props.project.id
        })
        .then (docRef => {
            uploadImage(docRef.id, image, props.tasksCollection);
        })
        props.onTaskCreate(props.createTaskSelected);
}

    
const deleteCollaborator = (taskCollaborators: string[], collaborator: string, index: number) => {
    let temp = [...taskCollaborators];
    temp.splice(index, 1);
    return temp;
}



export const CreateTaskForm = (props: CreateTaskFormProps) => {

    const selectContactRef = useRef<any>(null);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskCollaborators, setTaskCollaborators] = useState([] as string[]);
    const [selectedOptions, setSelectedOptions] = useState();
    const [taskDeadline, setTaskDeadline] = useState(new Date());
    const [image, setImage] = useState<File | null>(null);
    let contacts = props.contacts.map((contact) => ({value: contact.id, label: contact.name}));

    console.log('task: ', contacts);

    


    return (
        <div className="create-task-form">
            <div className="text-box">
                <label htmlFor="task-input" >משימה: </label>
                <textarea 
                    className="task-input" 
                    style={{background: "white",
                            width: "auto",
                            borderRadius: "4px",
                            fontSize: "20px",
                            fontFamily: "Segoe UI"
                        }}
                    id="task-input"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    placeholder="משימה ריקה" 
                    autoFocus />
            </div>
            <div className="set-deadline">
                <label>
                    דד-ליין:
                </label>
                <DatePicker wrapperClassName={"datepicker-wrapper"} dateFormat={"dd/MM/yyyy"} showIcon selected={taskDeadline} onChange={(date) => date ? setTaskDeadline(date) : setTaskDeadline(taskDeadline)}/>
            </div>
            <div className="collaborators-container">
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
                <div className="collaborators">
                    {taskCollaborators?.map((collaborator: string, index: number) => (
                        <div key={collaborator} className="contact">
                            <h1 onClick={() => setTaskCollaborators(deleteCollaborator(taskCollaborators, collaborator, index))} title="מחיקה">{
                                //@ts-ignore
                            props.contacts.find(
                                (contact: DocumentData) => contact ? contact.id == collaborator : false)
                            .name}</h1>
                        </div>
                    ))}
                </div>
            </div>
            <div>
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
            <div className="confirmation-buttons">
                <button onClick={() => {
                        const comp = selectContactRef.current;
                        const taskCollaboratorsNew = comp.getValue().map((value) => value.value);
                        addTask(props, taskTitle, taskDeadline, taskCollaboratorsNew, image);
                    }}>
                    שמור
                </button>
                <button onClick={() => props.onCancel()}>ביטול</button>
            </div>
        </div>
    )
}