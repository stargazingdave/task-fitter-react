import { User } from "firebase/auth";
import { CollectionReference, DocumentData, addDoc } from "firebase/firestore";
import React, { useRef } from "react";
import { useState } from "react";
import './CreateTaskForm.scss'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select, { GroupBase } from 'react-select';
import makeAnimated from 'react-select/animated';
import { uploadImage } from "../../utils";
import { useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";
import { selectContacts } from "../../redux/contactsSlice";
import { RiImageAddLine, RiImageEditLine } from "react-icons/ri";
import Popup from "reactjs-popup";
import emailjs from "@emailjs/browser";
import { selectProjectStack } from "../../redux/projectsSlice";

const animatedComponents = makeAnimated();

type CreateTaskFormProps = {
    tasksCollection: CollectionReference;
    createTaskSelected: boolean;
    onTaskCreate: () => void;
    onCancel: () => void;
}



const addTask = async (projectStack: DocumentData[],
    tasksCollection: CollectionReference, 
    taskTitle: string, 
    taskDeadline: Date,
    taskCollaborators: {value: string, label: string}[],
    image: File | null,
    user: User,
    sendEmail: boolean) => {
        if (taskTitle == '') {
            alert('יש למלא את תיאור המשימה');
            return;
        }
        await addDoc(tasksCollection, {
            task: taskTitle,
            status: false,
            deadline: taskDeadline.getTime(),
            user_id: user.uid,
            collaborators: taskCollaborators.map((item) => item.value),
            project_id: projectStack[projectStack.length - 1].id,
            top_project_id: projectStack[0].id,
        })
        .then (docRef => {
            uploadImage(docRef.id, image, tasksCollection)
                .then(async () => {
                    if (sendEmail && taskCollaborators.length > 0) {
                        taskCollaborators.forEach(async (collaborator) => {
                            try {
                                const response = await emailjs.send("task-fitter", "template_kqmklat", {
                                    email_subject: "משימה חדשה בפרויקט " + projectStack[0].project_name,
                                    project_name: projectStack[0].project_name,
                                    deadline: taskDeadline.toLocaleDateString("he-IL"),
                                    reply_to: user.email,
                                    from_name: user.displayName,
                                    contact_mail: collaborator.value,
                                    contact_name: collaborator.label,
                                    task: taskTitle,
                                }, "vtVkQrnc2d67CfVRb");
                                
                                // sentCount++;
                                // responses.push('\n' + recipient.contact.email + '\t' + response.status + '\t' + response.text + '\n');
                                alert(response.status + '\t' + response.text + '\n')
                            } catch (error: any) {
                                alert('שגיאה!' + error.status + error.text);
                            }
                        })
                    }
                });
        })
}


export const CreateTaskForm = (props: CreateTaskFormProps) => {
    const user = useAppSelector(selectUser);
    const contacts = useAppSelector(selectContacts);
    const projectStack = useAppSelector(selectProjectStack);
    const selectContactRef = useRef<any>(null);
    const [taskTitle, setTaskTitle] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
    const [taskDeadline, setTaskDeadline] = useState(new Date());
    const [image, setImage] = useState<File | null>(null);
    const [savePopup, setSavePopup] = useState(false);
    let contactsOptions = contacts.map((contact) => ({value: contact.email, label: contact.name}));



    return <div className="create-task-form">
        <h1>יצירת משימה חדשה</h1>
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
            <button onClick={() => setSavePopup(true)}>
                שמור
            </button>
            <button onClick={() => props.onCancel()}>ביטול</button>
        </div>
        <Popup open={savePopup} >
            <div className="confirmation-box">
                <div className="buttons">
                    <button
                        onClick={() => {
                            const comp = selectContactRef.current;
                            const taskCollaboratorsNew: any[] = comp.getValue();
                            addTask(projectStack,
                                props.tasksCollection, 
                                taskTitle, 
                                taskDeadline,
                                taskCollaboratorsNew,
                                image,
                                user,
                                true).then(props.onTaskCreate);
                        }}
                        >
                        שמירה ושליחת עדכון במייל
                    </button>
                    <button
                        onClick={() => {
                            const comp = selectContactRef.current;
                            const taskCollaboratorsNew: any[] = comp.getValue();
                            addTask(projectStack,
                                props.tasksCollection, 
                                taskTitle, 
                                taskDeadline,
                                taskCollaboratorsNew,
                                image,
                                user,
                                false).then(props.onTaskCreate);
                        }}
                        >
                        שמירה בלבד
                    </button>
                    <button onClick={() => setSavePopup(false)}>
                        ביטול
                    </button>
                </div>
            </div>
        </Popup>
    </div>
}