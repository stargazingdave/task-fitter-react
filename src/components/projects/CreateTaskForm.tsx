import { User } from "firebase/auth";
import { CollectionReference, DocumentData, addDoc } from "firebase/firestore";
import React, { useRef } from "react";
import { useState } from "react";
import './CreateTaskForm.scss'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select, { GroupBase } from 'react-select'
import makeAnimated from 'react-select/animated';
import { uploadImage } from "../../utils";
import { useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";
import { selectContacts } from "../../redux/contactsSlice";
import { RiImageAddLine, RiImageEditLine } from "react-icons/ri";

const animatedComponents = makeAnimated();

type CreateTaskFormProps = {
    tasksCollection: CollectionReference;
    createTaskSelected: boolean;
    onTaskCreate: (onTaskCreate: boolean) => void;
    onCancel: () => void;
    projectId: string;
    topProjectId: string;
}



const addTask = async (props: CreateTaskFormProps, 
    taskTitle: string, 
    taskDeadline: Date,
    taskCollaborators: string[],
    image: File | null,
    user: User) => {
        if (taskTitle == '') {
            alert('יש למלא את תיאור המשימה');
            return;
        }
        await addDoc(props.tasksCollection, {
            task: taskTitle,
            status: false,
            deadline: taskDeadline.getTime(),
            user_id: user.uid,
            collaborators: taskCollaborators,
            project_id: props.projectId,
            top_project_id: props.topProjectId,
        })
        .then (docRef => {
            uploadImage(docRef.id, image, props.tasksCollection);
        })
        props.onTaskCreate(props.createTaskSelected);
}


export const CreateTaskForm = (props: CreateTaskFormProps) => {
    const user = useAppSelector(selectUser);
    const contacts = useAppSelector(selectContacts);
    const selectContactRef = useRef<any>(null);
    const [taskTitle, setTaskTitle] = useState('');
    const [selectedOptions, setSelectedOptions] = useState();
    const [taskDeadline, setTaskDeadline] = useState(new Date());
    const [image, setImage] = useState<File | null>(null);
    let contactsOptions = contacts.map((contact) => ({value: contact.email, label: contact.name}));

    console.log('task: ', contacts);

    


    return (
        <div className="create-task-form">
            <div className="text-box">
                <label >משימה: </label>
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
            <div className="deadline_collaborators_image">
                <div className="set-deadline">
                    <label>
                        דד-ליין:
                    </label>
                    <DatePicker 
                        wrapperClassName={"datepicker-wrapper"} 
                        dateFormat={"dd/MM/yyyy"} 
                        showIcon 
                        selected={taskDeadline} 
                        onChange={(date) => date ? setTaskDeadline(date) : setTaskDeadline(taskDeadline)}
                        portalId="popper-calendar"
                    />
                </div>
                <div className="collaborators-container">
                    <div className="collaborators-selection">
                        <label>
                            אחראיים:
                        </label>
                        <Select 
                            menuPortalTarget={document.body} 
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            ref={selectContactRef}
                            options={contactsOptions} 
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            isMulti
                            defaultValue={selectedOptions}
                        />
                    </div>
                </div>
                <label className="image-upload">
                    {
                        image
                        ? <div className="current-image"><h1>{image.name}</h1><RiImageEditLine size={25}/></div>
                        : <RiImageAddLine size={25}/>
                    }
                    <br></br>
                    <input 
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
                        }} 
                        hidden
                    />
                </label>
            </div>
            <div className="confirmation-buttons">
                <button onClick={() => {
                        const comp = selectContactRef.current;
                        const taskCollaboratorsNew = comp.getValue().map((value) => value.value);
                        addTask(props, taskTitle, taskDeadline, taskCollaboratorsNew, image, user);
                    }}>
                    שמור
                </button>
                <button onClick={() => props.onCancel()}>ביטול</button>
            </div>
        </div>
    )
}