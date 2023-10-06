import { User } from "firebase/auth";
import { CollectionReference, DocumentData, Firestore, addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import "./EditProjectForm.scss"
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";

type EditProjectFormProps = {
    editProject: DocumentData;
    projectsCollection: CollectionReference;
    user: User;
    setEditProject: (editProject: DocumentData) => void;
    db: Firestore;
}
  





export const EditProjectForm = (props: EditProjectFormProps) => {

    const [projectName, setProjectName] = useState(props.editProject.project_name);
    const [managerName, setManagerName] = useState(props.editProject.project_manager);
    
    return (
        <div className="edit-project-form">
            <label className="name-label">
                שם הפרויקט:
            </label>
            <input
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                type="string"
            />
            <label className="manager-label">
                מנהל הפרויקט:
            </label>
            <input
                value={managerName}
                onChange={e => setManagerName(e.target.value)}
                type="string"
            />
            <div className="buttons">
                <button 
                    onClick={() => {
                        const date = new Date().toLocaleDateString();
                        if (projectName == '') {
                            alert('לא ניתן ליצור פרויקט ללא שם');
                            return;
                        }
                        updateDoc(doc(props.projectsCollection, props.editProject.id), {
                            project_name: projectName,
                            update_time: date,
                            project_manager: managerName,
                            });
                        props.editProject.project_name = projectName;
                        props.editProject.update_time = date;
                        props.editProject.project_manager = managerName;
                        props.setEditProject({});
                    }}
                    className="save-button" 
                    title="אישור" >
                        <AiOutlineCheck size={20} />
                </button>
                <button 
                    onClick={() => props.setEditProject({} as DocumentData)} 
                    className="cancel-button" 
                    title="ביטול" >
                        <AiOutlineClose size={20} />
                </button>
            </div>
        </div>
        )
}