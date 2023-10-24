import { CollectionReference, DocumentData, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useRef, useState } from "react";
import './ProtocolTask.scss'
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


type ProtocolTaskProps = {
    task: DocumentData;
    tasksCollection: CollectionReference;
    addSaveAction: (taskId: string, action: () => void) => void;
}
  
const animatedComponents = makeAnimated();



export const ProtocolTask = (props: ProtocolTaskProps) => {
    const contacts = useAppSelector(selectContacts);
    let contactsOptions = contacts.map((contact) => ({value: contact.id, label: contact.name}));
    const [taskTitle, setTaskTitle] = useState(props.task.task);
    const [taskDeadline, setTaskDeadline] = useState(new Date(Date.parse(props.task.deadline)));
    const [taskCollaborators, setTaskCollaborators] = useState(props.task.collaborators);
    const [selectedOptions, setSelectedOptions] = useState(contacts
        .filter((contact) => props.task.collaborators.includes(contact.id))
        .map((collaborator) => ({value: collaborator.id, label: collaborator.name})));
    const [deleteTask, setDeleteTask] = useState({} as DocumentData);
    const [image, setImage] = useState<File | null>(null);
    const selectContactRef = useRef<any>(null);



    props.addSaveAction(props.task.id, () => {
        const date = new Date(); // get current time for `update_time` field
        const docRef = doc(props.tasksCollection, props.task.id); // get document reference in firebase to update
        const comp = selectContactRef.current; // get reference to Select component
        const taskCollaboratorsNew = comp.getValue().map((value) => value.value); // get selected collaborators from Select component
        updateDoc(docRef, {
            task: taskTitle,
            update_time: date.toString(),
            deadline: taskDeadline.toString(),
            collaborators: taskCollaboratorsNew
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
                <div className="collaborators-selection">
                    <label>
                        משתתפים:
                    </label>
                    <Select 
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles,
                                borderColor: state.isFocused ? 'blue' : 'grey',
                            }),
                            multiValue: (baseStyles, state) => ({
                                ...baseStyles,
                                fontSize: 14,
                                width: "fit-content",
                            }),
                        }}
                        ref={selectContactRef}
                        options={contactsOptions} 
                        closeMenuOnSelect={false}
                        components={animatedComponents}
                        isMulti
                        defaultValue={selectedOptions}
                    />
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
                    <MdDeleteForever />
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
