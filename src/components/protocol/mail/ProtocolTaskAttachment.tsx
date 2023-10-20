import { User } from "firebase/auth";
import { CollectionReference, DocumentData, Firestore, collection, query, where } from "firebase/firestore";
import '.././ProtocolTask.scss'
import { useFirestoreCollectionData } from "reactfire";

import "react-datepicker/dist/react-datepicker.css";
import { useAppSelector } from "../../../reduxHooks";
import { selectUser } from "../../../redux/userSlice";


type ProtocolTaskAttachmentProps = {
    task: DocumentData;
    tasksCollection: CollectionReference;
    db: Firestore;
    addSaveAction: (taskId: string, action: () => void) => void;
}
  




export const ProtocolTaskAttachment = (props: ProtocolTaskAttachmentProps) => {
    const user = useAppSelector(selectUser);
    const contactsCollection = collection(props.db, "contacts");
    const contactsQuery = query(contactsCollection,
        where("user_id", "==", user.uid || 0));
    const { status, data: contacts } = useFirestoreCollectionData(contactsQuery, { idField: 'id',});


    if (status === 'loading') {
        return <p>טוען אנשי קשר...</p>;
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