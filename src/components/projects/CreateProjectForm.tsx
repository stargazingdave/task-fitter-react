import { User } from "firebase/auth";
import { CollectionReference, addDoc } from "firebase/firestore";
import { useState } from "react";
import "./CreateProjectForm.scss"
import { useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";
import { selectCompanies } from "../../redux/projectsSlice";
import Select from 'react-select';

type CreateProjectFormProps = {
  projectsCollection: CollectionReference;
  createProjectFlag: boolean;
  onProjectCreate: (onProjectCreate: boolean) => void;
  topProjectId: string;
}
  


const addProject = (
        props: CreateProjectFormProps, 
        projectName: string, 
        managerName: string,
        user: User,
        companyId: string,
    ) => {
    if (projectName == '') {
        alert('לא ניתן ליצור פרויקט ללא שם');
        return;
    }
    if (props.topProjectId === '') {
        addDoc(props.projectsCollection, {
            project_name: projectName,
            creation_time: Date.now(),
            project_manager: managerName,
            creator_name: user.displayName,
            user_id: user.uid,
            shared_emails: [user.email],
            company_id: companyId,
        });
    }
    else {
        addDoc(props.projectsCollection, {
            project_name: projectName,
            creation_time: Date.now(),
            project_manager: managerName,
            creator_name: user.displayName,
            user_id: user.uid,
            shared_emails: [user.email],
            top_project_id: props.topProjectId,
        });
    }
    
    props.onProjectCreate(props.createProjectFlag);
}



export const CreateProjectForm = (props: CreateProjectFormProps) => {
    const user = useAppSelector(selectUser);
    const companies = useAppSelector(selectCompanies);
    const [projectName, setProjectName] = useState('');
    const [managerName, setManagerName] = useState('');
    const [selectedCompany, setSelectedCompany] = useState({value: '', label: ''});
    const companiesOptions = companies.map((company) => {
        return {value: company.id, label: company.company_name}
    });
    

    return (
        <div className="create-project-form">
            <h1>יצירת פרויקט חדש</h1>
            <label>שם הפרויקט:</label>
            <input
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                type="string" 
                autoFocus
                />
            <label>מנהל הפרויקט:</label>
            <input
                value={managerName}
                onChange={e => setManagerName(e.target.value)}
                type="string" />
            <label>חברה:</label>
            <Select 
                options={companiesOptions}
                defaultValue={selectedCompany}
                onChange={(selection) => {selection && setSelectedCompany(selection)}}
            />
            <div className="buttons">
                <button onClick={() => {addProject(props, projectName, managerName, user, selectedCompany.value)}}>
                    שמירה
                </button>
                <button onClick={() => props.onProjectCreate(props.createProjectFlag)}>
                    ביטול
                </button>
            </div>
        </div>
        )
}