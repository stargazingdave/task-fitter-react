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

type ProjectProps = {
    onProjectSelected: (projectStack: DocumentData[]) => void;
    user: User;
    projectStack: DocumentData[];
    setProjectStack: (projectStack: DocumentData[]) => void;
    editProject: DocumentData;
    setEditProject: (editProject: DocumentData) => void;
}




export const Project = (props: ProjectProps) => {
    const [isAscending, setIsAscending] = useState(true);
    const parentPath = getProjectsPath(props.projectStack.slice(0, props.projectStack.length - 1));
    const db = useFirestore();
    const contactsCollection = collection(db, 'contacts');
    const contactsQuery = query(contactsCollection,
        where("user_id", "==", props.user.uid || 0),
        orderBy('name', isAscending ? 'asc' : 'desc'));
    const parentCollection = collection(db, parentPath);
    const { status: contactsStatus, data: contacts } = useFirestoreCollectionData(contactsQuery, { idField: 'id',});

    const updateProject = (project: DocumentData) => {
        props.setEditProject({} as DocumentData);
        
        if (project?.id) {
            let temp = [...props.projectStack];
            temp[temp.length-1] = project;
            props.setProjectStack(temp);
        }
    }

    // check the loading status
    if (contactsStatus === 'loading') {
        return <p>טוען אנשי קשר...</p>;
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
                                user={props.user} 
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
                                    user={props.user} 
                                    projectStack={props.projectStack} 
                                    contacts={contacts} />
                    <SubProjects 
                        onProjectSelected={props.onProjectSelected} 
                        user={props.user} 
                        projectStack={props.projectStack}
                        editProject={props.editProject}
                        setEditProject={(editProject) => props.setEditProject(editProject)} 
                    />
                </div>
            </div>
        </div>
    
}