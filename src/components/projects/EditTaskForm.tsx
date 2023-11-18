import { CollectionReference, DocumentData, deleteField, doc, updateDoc } from "firebase/firestore";
import { KeyboardEventHandler, useRef, useState } from "react";
import "./EditTaskForm.scss";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { deleteImage, uploadImage } from "../../utils";
import Select, { GroupBase } from 'react-select';
import makeAnimated from 'react-select/animated';
import { useAppSelector } from "../../reduxHooks";
import { selectContacts } from "../../redux/contactsSlice";
import { FcAddImage, FcEditImage, FcRemoveImage } from "react-icons/fc";


type EditTaskFormProps = {
    tasksCollection: CollectionReference;
    setEditTask: (editTask: boolean) => void;
    task: DocumentData;
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
        const date = new Date().getTime();
        updateDoc(doc(props.tasksCollection, props.task.id), {
            task: taskTitle,
            update_time: date,
            deadline: taskDeadline.getTime(),
            collaborators: taskCollaborators || [],
            });
        if (image != null) {
            props.task.image && deleteImage(props.task.id);
            uploadImage(props.task.id, image, props.tasksCollection);
        }
}


export const EditTaskForm = (props: EditTaskFormProps) => {
    const contacts = useAppSelector(selectContacts);
    let contactsOptions = contacts.map((contact) => ({value: contact.email, label: contact.name}));

    const selectContactRef = useRef<any>(null);
    const selectedOptions = props.task.collaborators
        .map((collaborator) => {
            const contact = contacts.find((contact) => contact.email === collaborator);
            if (contact) {
                return ({value: contact.email, label: contact.name});
            }
            else {
                return ({value: collaborator, label: collaborator});
            }
        });
    const [taskTitle, setTaskTitle] = useState(props.task.task);
    const [taskDeadline, setTaskDeadline] = useState(new Date(props.task.deadline));
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
                                autoFocus
                    />
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
                            onChange={(date) => 
                                date 
                                ? setTaskDeadline(date) 
                                : setTaskDeadline(new Date(props.task.deadline))
                            }
                        />
                    </div>
                    <div className="collaborators-selection">
                        <label>
                            משתתפים:
                        </label>
                        <Select 
                            ref={selectContactRef}
                            options={contactsOptions} 
                            closeMenuOnSelect={false}
                            components={animatedComponents}
                            isMulti
                            defaultValue={selectedOptions}
                            onKeyDown={(e: any) => {
                                if (e.key === 'Enter') {debugger
                                    const unknownContact = {value: e.target.value, label: e.target.value};
                                    contactsOptions.push(unknownContact);
                                    selectContactRef.current.selectOption(unknownContact);
                                    //setSelectedOptions([...selectedOptions, unknownContact]);
                                }
                            }}
                        />
                    </div>
                    <div className="image-select">
                        {
                            props.task.image && 
                            <button 
                                className="delete-image-button" 
                                title='מחיקת התמונה הקיימת'
                                onClick={() => {
                                    deleteImage(props.task.id);
                                    updateDoc(doc(props.tasksCollection, props.task.id), {
                                        image: deleteField()
                                })}} >
                                    <FcRemoveImage size={25}/>
                            </button>
                        }
                        <label className="image-upload">
                            {
                                image || props.task.image
                                ? <div 
                                    className="current-image"
                                    title='החלפת התמונה הקיימת'
                                    >
                                    <h1>{image?.name}</h1><FcEditImage size={25}/>
                                </div>
                                : <div 
                                    className="new-image"
                                    title='הוספת תמונה למשימה'
                                    >
                                    <FcAddImage size={25}/>
                                </div>
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
                </div>
                <div className="confirmation-buttons">
                    <button onClick={() => {
                        const comp = selectContactRef.current;
                        const taskCollaboratorsNew = comp.getValue().map((value) => value.value);
                        updateTask(props, taskTitle, taskDeadline, taskCollaboratorsNew, image);
                        props.setEditTask(false);
                    }}>
                        שמירת שינויים
                    </button>
                    <button onClick={() => props.setEditTask(false)}>ביטול</button>
                </div>
            </div>
        </>
    )
}