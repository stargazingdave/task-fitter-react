import { DocumentData, collection } from "firebase/firestore";
import "./Project.scss"
import { SubProjects } from "./SubProjects";
import { getProjectsPath } from "../../utils";
import { ProjectSubjects } from "./ProjectSubjects";
import { AiOutlineClose } from "react-icons/ai";
import { BiEditAlt } from "react-icons/bi";
import { EditProjectForm } from "./EditProjectForm";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../reduxHooks";
import { selectContacts } from "../../redux/contactsSlice";
import { selectDb } from "../../redux/databaseSlice";
import { pushProject, selectProjectStack, setProjectStack } from "../../redux/projectsSlice";

type ProjectProps = {
    editProject: DocumentData;
    setEditProject: (editProject: DocumentData) => void;
}




export const Project = (props: ProjectProps) => {
    
    const db = useAppSelector(selectDb);
    const projectStack = useAppSelector(selectProjectStack);
    const dispatch = useAppDispatch();

    const parentPath = getProjectsPath(projectStack.slice(0, projectStack.length - 1));
    const parentCollection = collection(db, parentPath);

    const updateProject = (project: DocumentData) => {
        props.setEditProject({} as DocumentData);
        
        if (project?.id) {
            let temp = [...projectStack];
            temp[temp.length-1] = project;
            dispatch(pushProject(project));
        }
    }


    return <div className="project">
            <div className="projects-path">
                פרויקט נוכחי:
                {
                    projectStack.map((project => 
                        <>
                            <button onClick={() => {
                                let temp = [...projectStack];
                                while(temp[temp.length-1] != project) {
                                    temp.pop();
                                }
                                dispatch(setProjectStack(temp));;
                                
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
                        <h1>שם הפרויקט: {projectStack[projectStack.length-1].project_name}</h1>
                        <h2>מנהל הפרויקט: {projectStack[projectStack.length-1].project_manager}</h2>
                        <div className="buttons">
                            <button 
                                className='edit-button' 
                                title="עריכת שם ומנהל הפרויקט" 
                                onClick={() => props.setEditProject(projectStack[projectStack.length-1])} >
                                    <BiEditAlt size={25}/>
                            </button>
                            {
                                projectStack.length == 1 &&
                                <a 
                                    className="protocol-link" 
                                    target="_blank" 
                                    href={"/protocol/" + projectStack[projectStack.length-1].id}>
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
                            /> 
                            : <></>
                        }
                    </div>
                    <button 
                            className="exit-button" 
                            title="יציאה מהפרויקט לדף הבית" 
                            onClick={() => dispatch(setProjectStack([] as DocumentData[]))}>
                                <AiOutlineClose size={25} />
                        </button>
                </div>
                <div className="content">
                    <ProjectSubjects />
                    <SubProjects 
                        editProject={props.editProject}
                        setEditProject={(editProject) => props.setEditProject(editProject)} 
                    />
                </div>
            </div>
        </div>
    
}