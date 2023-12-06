import { CollectionReference, DocumentData, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import Select from 'react-select';
import "./EditProjectForm.scss"
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { useAppDispatch, useAppSelector } from "../../reduxHooks";
import { selectCompanies, selectProjectStack, setProjectStack } from "../../redux/projectsSlice";

type EditProjectFormProps = {
    editProject: DocumentData;
    projectsCollection: CollectionReference;
    setEditProject: (editProject: DocumentData) => void;
}
  





export const EditProjectForm = (props: EditProjectFormProps) => {

    const [projectName, setProjectName] = useState(props.editProject.project_name);
    const [managerName, setManagerName] = useState(props.editProject.project_manager);
    const companies = useAppSelector(selectCompanies);
    const currentCompany = companies.find((company) => company.id === props.editProject.company_id);
    const [selectedCompany, setSelectedCompany] = useState({value: currentCompany?.id, label: currentCompany?.company_name});
    const companiesOptions = companies.map((company) => {
        return {value: company.id, label: company.company_name}
    });

    const projectStack = useAppSelector(selectProjectStack);
    const dispatch = useAppDispatch();
    
    return (
        <div className="edit-project-form">
            <h1>עריכת הפרויקט</h1>
            <label className="name-label">
                שם הפרויקט:
            </label>
            <input
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                type="string"
                autoFocus
            />
            <label className="manager-label">
                מנהל הפרויקט:
            </label>
            <input
                value={managerName}
                onChange={e => setManagerName(e.target.value)}
                type="string"
            />
            <label>חברה:</label>
            <Select 
                options={companiesOptions}
                defaultValue={selectedCompany}
                onChange={(selection) => {selection && setSelectedCompany(selection)}}
            />
            <div className="buttons">
                <button 
                    onClick={() => {debugger
                        const date = new Date().getTime();
                        if (projectName == '') {
                            alert('לא ניתן ליצור פרויקט ללא שם');
                            return;
                        }
                        updateDoc(doc(props.projectsCollection, props.editProject.id), {
                            project_name: projectName,
                            update_time: date,
                            project_manager: managerName,
                            company_id: selectedCompany,
                            });
                        let tempProject = { ...props.editProject } as DocumentData;
                        tempProject.project_name = projectName;
                        tempProject.update_time = date;
                        tempProject.project_manager = managerName;
                        // check if editing from project page
                        if (projectStack[projectStack.length - 1]?.id === props.editProject.id) {
                            let tempStack = [...projectStack];
                            tempStack.pop();
                            tempStack.push(tempProject);
                            dispatch(setProjectStack(tempStack));
                        }
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