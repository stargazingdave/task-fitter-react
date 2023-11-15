import { DocumentData, collection, doc } from "firebase/firestore";
import "./Project.scss";
import { SubProjects } from "./SubProjects";
import { getProjectsPath } from "../../utils";
import { ProjectSubjects } from "./ProjectSubjects";
import { AiOutlineClose } from "react-icons/ai";
import { BiEditAlt, BiUserPlus } from "react-icons/bi";
import { EditProjectForm } from "./EditProjectForm";
import { useAppDispatch, useAppSelector } from "../../reduxHooks";
import { selectDb } from "../../redux/databaseSlice";
import { pushProject, selectProjectStack, setProjectStack } from "../../redux/projectsSlice";
import Popup from "reactjs-popup";
import { ProjectPermissionsManager } from "./ProjectPermissionsManager";
import { useState } from "react";
import { selectIsAdmin } from "../../redux/userSlice";

type ProjectProps = {
    editProject: DocumentData;
    setEditProject: (editProject: DocumentData) => void;
}




export const Project = (props: ProjectProps) => {
    const isAdmin = useAppSelector(selectIsAdmin);
    const db = useAppSelector(selectDb);
    const projectStack = useAppSelector(selectProjectStack);
    const dispatch = useAppDispatch();
    const [permissionsManagerOpen, setPermissionsManagerOpen] = useState(false);

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
        <div className="navigation-bar">
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
            <button 
                className="exit-button" 
                title="יציאה מהפרויקט לדף הבית" 
                onClick={() => dispatch(setProjectStack([] as DocumentData[]))}>
                    <AiOutlineClose size={30} />
            </button>
        </div>
        <div className="project-container">
            <div className="project-header">
                <div className="project-title">
                    <div>
                        <h1>שם הפרויקט: {projectStack[projectStack.length-1].project_name}</h1>
                        <h2>מנהל הפרויקט: {projectStack[projectStack.length-1].project_manager}</h2>
                    </div>
                    <button 
                        className='edit-button' 
                        title="עריכת שם ומנהל הפרויקט" 
                        onClick={() => props.setEditProject(projectStack[projectStack.length-1])} >
                            <BiEditAlt size={25}/><p>עריכה</p>
                    </button>
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
                    <div className="buttons">
                        <button
                            className="shared-emails-button" 
                            onClick={() => setPermissionsManagerOpen(true)}
                            disabled={!isAdmin}
                            title={isAdmin 
                                ? 'עריכת החשבונות בעלי גישה לפרויקט לפי כתובות מייל' 
                                : 'אין לחשבון שלך גישה לעריכת הרשאות'}
                            >
                            <BiUserPlus size={22}/>
                            <p>ניהול גישה לפרויקט</p>
                        </button>
                        <a 
                            className="protocol-link" 
                            target="_blank" 
                            title="פתיחת תצוגת פרוטוקול.
                                תצוגה זו מציגה את כל המשימות בעמוד אחד 
                                ומאפשרת שליחת המשימות למשתתפים."
                            href={"/protocol/" + projectStack[0].id}>
                                פרוטוקול
                        </a>
                    </div>
            </div>
            <div className="content">
                <ProjectSubjects />
                <SubProjects 
                    editProject={props.editProject}
                    setEditProject={(editProject) => props.setEditProject(editProject)} 
                />
            </div>
        </div>
        <Popup 
            open={permissionsManagerOpen}
            closeOnDocumentClick={false}
            >
            <ProjectPermissionsManager 
                project={projectStack[0]} 
                projectReference={doc(parentCollection, projectStack[0].id)}
                open={permissionsManagerOpen}
                setOpen={setPermissionsManagerOpen}
            />
        </Popup>
    </div>
}