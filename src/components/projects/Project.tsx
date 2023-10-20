import { DocumentData, collection, orderBy, query, where } from "firebase/firestore";
import "./Project.scss"
import { useFirestore, useFirestoreCollectionData } from "reactfire";
import { User } from "firebase/auth";
import { SubProjects } from "./SubProjects";
import { getProjectsPath } from "../../utils";
import { ProjectSubjects } from "./ProjectSubjects";
import { AiOutlineClose } from "react-icons/ai";
import { BiEditAlt } from "react-icons/bi";
import { EditProjectForm } from "./EditProjectForm";
import { useState } from "react";
import { useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";
import { selectContacts } from "../../redux/contactsSlice";

type ProjectProps = {
    onProjectSelected: (projectStack: DocumentData[]) => void;
    projectStack: DocumentData[];
    setProjectStack: (projectStack: DocumentData[]) => void;
    editProject: DocumentData;
    setEditProject: (editProject: DocumentData) => void;
}




export const Project = (props: ProjectProps) => {
    const contacts = useAppSelector(selectContacts);
    const [isAscending, setIsAscending] = useState(true);
    const parentPath = getProjectsPath(props.projectStack.slice(0, props.projectStack.length - 1));
    const db = useFirestore();
    const parentCollection = collection(db, parentPath);

    const updateProject = (project: DocumentData) => {
        props.setEditProject({} as DocumentData);
        
        if (project?.id) {
            let temp = [...props.projectStack];
            temp[temp.length-1] = project;
            props.setProjectStack(temp);
        }
    }


    return <div className="project">
            <div className="projects-path">
                פרויקט נוכחי:
                {
                    props.projectStack.map((project => 
                        <>
                            <button onClick={() => {
                                let temp = [...props.projectStack];
                                while(temp[temp.length-1] != project) {
                                    temp.pop();
                                }
                                props.onProjectSelected(temp);
                                
                            }}>
                                {project.project_name}
                            </button>
                            <p className="slash">/</p>
                        </>
                    ))
                }
            </div>
            <div className="project-container">
                <div className="project-header">
                    <div className="project-title">
                        <h1>שם הפרויקט: {props.projectStack[props.projectStack.length-1].project_name}</h1>
                        <h2>מנהל הפרויקט: {props.projectStack[props.projectStack.length-1].project_manager}</h2>
                        <div className="buttons">
                            <button 
                                className='edit-button' 
                                title="עריכת שם ומנהל הפרויקט" 
                                onClick={() => props.setEditProject(props.projectStack[props.projectStack.length-1])} >
                                    <BiEditAlt size={25}/>
                            </button>
                            {
                                props.projectStack.length == 1 &&
                                <a 
                                    className="protocol-link" 
                                    target="_blank" 
                                    href={"/protocol/" + props.projectStack[props.projectStack.length-1].id}>
                                        פרוטוקול
                                </a>
                            }
                        </div>
                        {
                            props.editProject?.id 
                            ? <EditProjectForm 
                                editProject={props.editProject} 
                                projectsCollection={parentCollection} 
                                setEditProject={(project: DocumentData) => updateProject(project)} 
                                db={db} 
                            /> 
                            : <></>
                        }
                    </div>
                    <button 
                            className="exit-button" 
                            title="יציאה מהפרויקט לדף הבית" 
                            onClick={() => props.onProjectSelected([] as DocumentData[])}>
                                <AiOutlineClose size={25} />
                        </button>
                </div>
                <div className="content">
                    <ProjectSubjects onProjectSelected={props.onProjectSelected} 
                                    projectStack={props.projectStack} 
                                    contacts={contacts} />
                    <SubProjects 
                        onProjectSelected={props.onProjectSelected} 
                        projectStack={props.projectStack}
                        editProject={props.editProject}
                        setEditProject={(editProject) => props.setEditProject(editProject)} 
                    />
                </div>
            </div>
        </div>
    
}