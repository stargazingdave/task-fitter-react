import { User } from "firebase/auth";
import { CollectionReference, DocumentData, Firestore, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useRef, useState } from "react";
import '.././ProtocolTask.scss'
import { Checkbox } from "../../general/Checkbox";
import { useFirestoreCollectionData } from "reactfire";
import { AiOutlinePlus } from 'react-icons/ai';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { FaHammer } from "react-icons/fa";
import Popup from "reactjs-popup";
import { ProtocolConfirmationBox } from ".././ProtocolConfirmationBox";
import { deleteImage, uploadImage } from "../../../utils";


type ProtocolTaskAttachmentProps = {
    task: DocumentData;
    tasksCollection: CollectionReference;
    user: User;
    db: Firestore;
    addSaveAction: (taskId: string, action: () => void) => void;
}
  




export const ProtocolTaskAttachment = (props: ProtocolTaskAttachmentProps) => {
    const [deleteTask, setDeleteTask] = useState({} as DocumentData);
    const [image, setImage] = useState<File | null>(null);
    const contactsCollection = collection(props.db, "contacts");
    const { status, data: contacts } = useFirestoreCollectionData(contactsCollection, { idField: 'id',});
    const selectContactRef = useRef<HTMLSelectElement>(null);


    if (status === 'loading') {
        return <p>טוען אנשי קשר...</p>;
    }


    const deleteCollaborator = (taskCollaborators: string[], collaborator: string, index: number) => {
        let temp = [...taskCollaborators];
        temp.splice(index, 1);
        return temp;
    }

    
    return (
        <>
            <div className="protocol-task">
                <div className="task-title">
                    <label >משימה: </label>
                    <p className="task-title" 
                        style={{width: "auto",
                                margin: "0",
                                fontSize: "20px",
                                fontFamily: "Segoe UI"
                            }}
                        overflow-wrap="anywhere"
                        overflow-y="scroll" >
                            {props.task.task}
                    </p>
                </div>
                <div className="task-collaborators" >
                    <label>משתתפים: </label>
                    <div className="collaborators-list">
                        {props.task.collaborators?.map((collaborator: string, index: number) => (
                            <div key={collaborator} className="contact">
                                <h1>
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
                    <div>
                        {new Date(Date.parse(props.task.deadline)).toLocaleDateString("he-IL")}
                    </div>
                </div>
                <div className="task-status">
                    {props.task.status ? <h4>בוצע</h4> : <h3>לא בוצע</h3>}
                </div>
            </div>
        </>
    )
}