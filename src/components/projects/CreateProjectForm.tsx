import { User } from "firebase/auth";
import { CollectionReference, addDoc } from "firebase/firestore";
import { useState } from "react";
import "./CreateProjectForm.scss"
import { useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";

type CreateProjectFormProps = {
  projectsCollection: CollectionReference;
  createProjectFlag: boolean;
  onProjectCreate: (onProjectCreate: boolean) => void;
}
  


const addProject = (props: CreateProjectFormProps, 
                    projectName: string, 
                    managerName: string,
                    user: User) => {
    if (projectName == '') {
        alert('לא ניתן ליצור פרויקט ללא שם');
        return;
    }
    addDoc(props.projectsCollection, {
        project_name: projectName,
        creation_time: Date.now(),
        project_manager: managerName,
        creator_name: user.displayName,
        user_id: user.uid,
    });
    props.onProjectCreate(props.createProjectFlag);
}



export const CreateProjectForm = (props: CreateProjectFormProps) => {
    const user = useAppSelector(selectUser);
    const [projectName, setProjectName] = useState('');
    const [managerName, setManagerName] = useState('');
    return (
        <div className="create-project-form">
            <h1>יצירת פרויקט חדש</h1>
            <label>
                שם הפרויקט:
            </label>
            <input
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                type="string" />
            <label>
                מנהל הפרויקט:
            </label>
            <input
                value={managerName}
                onChange={e => setManagerName(e.target.value)}
                type="string" />
            <div className="buttons">
                <button onClick={() => {addProject(props, projectName, managerName, user)}}>
                    שמירה
                </button>
                <button onClick={() => props.onProjectCreate(props.createProjectFlag)}>
                    ביטול
                </button>
            </div>
        </div>
        )
}