import React, { useState } from 'react';
import { BsFillBuildingsFill } from 'react-icons/bs';
import './Projects.scss';
import { EditProjectForm } from './EditProjectForm';

import { DocumentData, collection, or, orderBy, query, where } from 'firebase/firestore';
import { useFirestoreCollectionData} from 'reactfire';
import { CreateProjectForm } from './CreateProjectForm';
import Popup from 'reactjs-popup';
import { MdDeleteForever } from 'react-icons/md';
import { BiEditAlt, BiSolidUserVoice } from 'react-icons/bi';
import { useAppDispatch, useAppSelector } from '../../reduxHooks';
import { selectIsAdmin, selectUser } from '../../redux/userSlice';
import { selectDb } from '../../redux/databaseSlice';
import { deleteProject } from '../../utils';
import { store } from '../../store';
import { pushProject, selectProjectStack, selectProjects, setProjectStack } from '../../redux/projectsSlice';
import { CreateCompanyForm } from './CreateCompanyForm';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


type ProjectsProps = {
    editProject: DocumentData;
    setEditProject: (editProject: DocumentData) => void;
}





export const Projects = (props: ProjectsProps) =>  {
    const user = useAppSelector(selectUser);
    const db = useAppSelector(selectDb);
    const isAdmin = useAppSelector(selectIsAdmin);
    const dispatch = useAppDispatch();
    const [isAscending, setIsAscending] = useState(false);
    const [createProjectFlag, setCreateProjectFlag] = useState(false);
    const [createCompanyFlag, setCreateCompanyFlag] = useState(false);
    
    // const projectsCollection = collection(db, 'projects');
    // const projectsQuery = query(projectsCollection,
    //                             or(where("user_id", "==", user.uid),
    //                             where("shared_emails", "array-contains", user.email)),
    //                             orderBy('creation_time', isAscending ? 'asc' : 'desc'));
    // const { status, data: projects } = useFirestoreCollectionData(projectsQuery, { idField: 'id',});

    const projects = useAppSelector(selectProjects);
    
    const [projectDeletePopup, setProjectDeletePopup] = useState('');

    // check the loading status
    // if (status === 'loading') {
    //     return <p>טוען פרויקטים...</p>;
    // }
    
    return <div className='projects-container'>
        <h1>פרויקטים</h1>
        {
            createCompanyFlag
            ? <CreateCompanyForm  
                createCompanyFlag={createCompanyFlag} 
                onCompanyCreate={(createCompanyFlag) => {
                    setCreateCompanyFlag(!createCompanyFlag)
                }}
            />
            : <button 
                className='create-company-button'
                onClick={() => setCreateCompanyFlag(!createCompanyFlag)}
                disabled={!isAdmin}
                title={isAdmin ? 'יצירת חברה חדשה' : 'אין לחשבון שלך גישה ליצירת חברות'}
                >
                יצירת חברה חדשה
            </button>
        }
        {
            createProjectFlag
            ? <CreateProjectForm  
                projectsCollection={collection(db, 'projects')} 
                createProjectFlag={createProjectFlag} 
                onProjectCreate={(createProjectFlag) => {
                    setCreateProjectFlag(!createProjectFlag)
                }}
                topProjectId={''}
            />
            : <button 
                className='create-project-button'
                onClick={() => setCreateProjectFlag(!createProjectFlag)}
                disabled={!isAdmin}
                title={isAdmin ? 'יצירת פרויקט חדש' : 'אין לחשבון שלך גישה ליצירת פרויקטים'}
                >
                יצירת פרויקט חדש
            </button>
        }
            <div className="projects">
                {
                    projects?.map(project => (
                        <div className="project-tile" key={project.id}>
                            {
                                project.user_id !== user.uid &&
                                <div 
                                    className='shared-icon' 
                                    title={"פרויקט זה שותף איתך על ידי: " + project.creator_name}
                                    >
                                    <BiSolidUserVoice size={20}/>
                                </div>
                            }
                            {
                                props.editProject?.id != project.id
                                ? <>
                                    <div className='project-details'>
                                        <h1>{project.project_name}</h1>
                                        <h2>{project.project_manager}</h2>
                                    </div>
                                    <button title='פתיחת הפרויקט' className='open-button' onClick={() => {
                                                                dispatch(pushProject(project));
                                                            }}>
                                        <BsFillBuildingsFill size={50}/>
                                    </button>
                                    <button 
                                        title='מחיקת הפרויקט'
                                        className='delete-button' 
                                        onClick={() => setProjectDeletePopup(project.id)} >
                                        <MdDeleteForever size={25}/>
                                    </button>
                                    <Popup 
                                        contentStyle={{width: "300px"}}
                                        open={projectDeletePopup != ''}
                                        modal={true} >
                                            <div className='delete-project-confirmation-box'>
                                                <p>פעולה זו תמחק את הפרויקט לתמיד <b>ללא אפשרות שחזור התוכן שלו</b>. להמשיך במחיקה?</p>
                                                <div className='buttons'>
                                                    <button onClick={() => {
                                                            const path = 'projects/'; 
                                                            // delete project and nested data
                                                            deleteProject(store.getState(), 
                                                                path + projectDeletePopup);
                                                            setProjectDeletePopup('');
                                                        }}>
                                                            מחיקה לתמיד
                                                    </button>
                                                    <button onClick={() => setProjectDeletePopup('')} >ביטול</button>
                                                </div>
                                            </div>
                                    </Popup>
                                    <button 
                                        title='עריכת שם ומנהל הפרויקט' 
                                        className='edit-button' 
                                        onClick={() => {
                                            props.setEditProject(project);
                                        }}>
                                            <BiEditAlt size={25}/>
                                    </button>
                                </>
                                : <div className="edit-project-form">
                                    <EditProjectForm 
                                        editProject={props.editProject} 
                                        projectsCollection={collection(db, 'projects')} 
                                        setEditProject={(editProject) => props.setEditProject(editProject)} 
                                    />
                                </div>
                                
                            }
                        </div>
                ))}
            </div>
    </div>
}

