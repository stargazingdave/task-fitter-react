import { CollectionReference, DocumentData, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import './ProtocolTask.scss';
import { Checkbox } from "../general/Checkbox";
import DatePicker from "react-datepicker";
import Select, { GroupBase } from 'react-select';
import makeAnimated from 'react-select/animated';
import "react-datepicker/dist/react-datepicker.css";
import Popup from "reactjs-popup";
import { ProtocolConfirmationBox } from "./ProtocolConfirmationBox";
import { deleteImage, uploadImage } from "../../utils";
import { MdDeleteForever } from "react-icons/md";
import { useAppSelector } from "../../reduxHooks";
import { selectContacts } from "../../redux/contactsSlice";
import { RiImageAddLine, RiImageEditLine } from "react-icons/ri";


type ProtocolTaskProps = {
    task: DocumentData;
    tasksCollection: CollectionReference;
    addSaveAction: (taskId: string, action: () => void) => void;
}
  
const animatedComponents = makeAnimated();



export const ProtocolTask = (props: ProtocolTaskProps) => {
    const contacts = useAppSelector(selectContacts);
    let contactsOptions = contacts.map((contact) => ({value: contact.email, label: contact.name}));
    const [taskTitle, setTaskTitle] = useState(props.task.task);
    const [taskDeadline, setTaskDeadline] = useState(new Date(props.task.deadline));
    const [taskCollaborators, setTaskCollaborators] = useState(props.task.collaborators);
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
    const [deleteTask, setDeleteTask] = useState({} as DocumentData);
    const [image, setImage] = useState<File | null>(null);



    props.addSaveAction(props.task.id, () => {
        const date = new Date().getTime(); // get current time for `update_time` field
        const docRef = doc(props.tasksCollection, props.task.id); // get document reference in firebase to update
        // const comp = selectContactRef.current; // get reference to Select component
        // const taskCollaboratorsNew = comp.getValue().map((value) => value.value); // get selected collaborators from Select component
        updateDoc(docRef, {
            task: taskTitle,
            update_time: date,
            deadline: taskDeadline.toString(),
            collaborators: taskCollaborators
        });
        if (image) {
            props.task.image && deleteImage(props.task.id);
            uploadImage(props.task.id, image, props.tasksCollection);
        }
    })
    
    return (
        <>
            <div className="protocol-task">
                <div className="task-title">
                    <textarea className="title-input" 
                                style={{
                                        outline: "none",
                                        border: "none",
                                        resize: "none",
                                        fontWeight: "bold",
                                    }}
                                id="title-input"
                                value={taskTitle}
                                onChange={e => setTaskTitle(e.target.value)}
                                placeholder="משימה ריקה"
                                rows={2}
                                aria-multiline={true}
                                overflow-wrap="anywhere"
                                overflow-y="scroll" 
                                />
                </div>
                <div className="collaborators-selection">
                    <Select 
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles,
                                border: "none",
                                background: "none",
                                borderRadius: "0",
                                padding: "0",
                                margin: "0",
                            }),
                            multiValue: (baseStyles, state) => ({
                                ...baseStyles,
                                fontSize: 14,
                                width: "fit-content",
                                border: "none",
                            }),
                        }}
                        options={contactsOptions} 
                        closeMenuOnSelect={false}
                        components={animatedComponents}
                        isMulti
                        defaultValue={selectedOptions}
                        onChange={(value) => {setTaskCollaborators(value.map((value) => value.value))}}
                    />
                </div>
                <div className="set-deadline">
                    <DatePicker 
                        wrapperClassName={"datepicker-wrapper"} 
                        dateFormat={"dd/MM/yyyy"} 
                        showIcon 
                        selected={taskDeadline} 
                        onChange={(date) => date ? setTaskDeadline(date) : setTaskDeadline(taskDeadline)}/>
                </div>
                <div className="task-status">
                    <Checkbox task= {props.task} updateFunc={(task) => updateDoc(doc(props.tasksCollection,
                                                                                    task.id), 
                                                                                    {status: !task.status})}/>
                    {props.task.status ? <h4>בוצע</h4> : <h3>לא בוצע</h3>}
                </div>
                <div className="task-buttons">
                    <label className="image-upload">
                        {
                            image
                            ? <div className="current-image"><h1>{image.name}</h1><RiImageEditLine size={25}/></div>
                            : <RiImageAddLine size={25}/>
                        }
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
                    <button 
                        className="delete-button" 
                        title="מחיקה"
                        onClick={() => setDeleteTask(props.task)}>
                        <MdDeleteForever size={25}/>
                    </button>
                </div>
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
            </div>
        </>
    )
}
