import React, { useState } from 'react';
import { BsFillBuildingsFill } from 'react-icons/bs';
import './Projects.scss';
import { EditProjectForm } from './EditProjectForm';

import { DocumentData, collection, orderBy, query, where } from 'firebase/firestore';
import { useFirestoreCollectionData} from 'reactfire';
import { CreateProjectForm } from './CreateProjectForm';
import Popup from 'reactjs-popup';
import { MdDeleteForever } from 'react-icons/md';
import { BiEditAlt } from 'react-icons/bi';
import { useAppDispatch, useAppSelector } from '../../reduxHooks';
import { selectUser } from '../../redux/userSlice';
import { selectDb } from '../../redux/databaseSlice';
import { deleteProject } from '../../utils';
import { store } from '../../store';
import { pushProject, selectProjectStack, setProjectStack } from '../../redux/projectsSlice';


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
    // access the Firestore library
    const db = useAppSelector(selectDb);
    const projectStack = useAppSelector(selectProjectStack);
    const dispatch = useAppDispatch();
    
    const projectsCollection = collection(db, 'projects');
    const [isAscending, setIsAscending] = useState(false);
    const [createProjectFlag, setCreateProjectFlag] = useState(false);
    const projectsQuery = query(projectsCollection,
                                where("user_id", "==", user.uid),
                                orderBy('creation_time', isAscending ? 'asc' : 'desc'));
    const { status, data: projects } = useFirestoreCollectionData(projectsQuery, { idField: 'id',});
    
    const [projectDeletePopup, setProjectDeletePopup] = useState('');

    // check the loading status
    if (status === 'loading') {
        return <p>טוען פרויקטים...</p>;
    }
    
    return <div className='projects-container'>
        <h1>פרויקטים</h1>
        <div>
            {projectStack.map(project => (
                <div>{project.project_name}</div>
            ))}
        </div>
        {
            !createProjectFlag
            ? <button 
                className='create-project-button'
                onClick={() => setCreateProjectFlag(!createProjectFlag)}
                disabled={props.editProject?.id}
                >
                    יצירת פרויקט חדש
                </button>
            : <></>
        }
        {
            createProjectFlag &&
            <CreateProjectForm  
                projectsCollection={projectsCollection} 
                createProjectFlag={createProjectFlag} 
                onProjectCreate={(createProjectFlag) => {
                    setCreateProjectFlag(!createProjectFlag)
                }}/>
        }  
            <div className="projects">
                {
                    projects.map(project => (
                        <div className="project-tile" key={project.id}>
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
                                        projectsCollection={projectsCollection} 
                                        setEditProject={(editProject) => props.setEditProject(editProject)} 
                                    />
                                </div>
                                
                            }
                        </div>
                ))}
            </div>
    </div>
}

