import { User } from "firebase/auth";
import { CollectionReference, addDoc } from "firebase/firestore";
import { useState } from "react";
import "./CreateProjectForm.scss"

type CreateProjectFormProps = {
  projectsCollection: CollectionReference;
  user: User;
  createProjectFlag: boolean;
  onProjectCreate: (onProjectCreate: boolean) => void;
}
  


const addProject = (props: CreateProjectFormProps, 
                    projectName: string, 
                    managerName: string) => {
        if (projectName == '') {
            alert('לא ניתן ליצור פרויקט ללא שם');
            return;
        }
        addDoc(props.projectsCollection, {
        project_name: projectName,
        creation_time: Date.now(),
        project_manager: managerName,
        creator_name: props.user.displayName,
        user_id: props.user.uid,
    });
    props.onProjectCreate(props.createProjectFlag);
}



export const CreateProjectForm = (props: CreateProjectFormProps) => {

    const [projectName, setProjectName] = useState('');
    const [managerName, setManagerName] = useState('');
    return (
        <div className="create-project-form">
            <label>
                שם הפרויקט:
                <input
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    type="string" />
            </label>
            <label>
                מנהל הפרויקט:
                <input
                    value={managerName}
                    onChange={e => setManagerName(e.target.value)}
                    type="string" />
            </label>
            <button onClick={() => {addProject(props, projectName, managerName)}}>
                שמירה
            </button>
            <button onClick={() => props.onProjectCreate(props.createProjectFlag)}>
                ביטול
            </button>
        </div>
        )
}