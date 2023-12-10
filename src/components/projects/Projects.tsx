import React, { useState } from 'react';
import { BsFillBuildingsFill } from 'react-icons/bs';
import './Projects.scss';
import { EditProjectForm } from './EditProjectForm';
import { CgAdd } from "react-icons/cg";
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
import { pushProject, selectCompanies, selectProjectStack, selectProjects, setProjectStack } from '../../redux/projectsSlice';
import { CreateCompanyForm } from './CreateCompanyForm';

type ProjectsProps = {
    editProject: DocumentData;
    setEditProject: (editProject: DocumentData) => void;
}

export const Projects = (props: ProjectsProps) =>  {
    const user = useAppSelector(selectUser);
    const db = useAppSelector(selectDb);
    const isAdmin = useAppSelector(selectIsAdmin);
    const projects = useAppSelector(selectProjects);
    const companies = useAppSelector(selectCompanies);
    const dispatch = useAppDispatch();
    const [createProjectFlag, setCreateProjectFlag] = useState(false);
    const [createCompanyFlag, setCreateCompanyFlag] = useState(false);
    const [projectDeletePopup, setProjectDeletePopup] = useState('');
    const [selectedCompany, setSelectedCompany] = useState({} as DocumentData);
    debugger
    
    return <div className='main-container'>
        <div className='companies-container'>
            <h1 className='companies-header'>חברות</h1>
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
                    <CgAdd size={28}/><p>הוספת חברה חדשה</p>
                </button>
            }
            <div className='companies'>
                <button 
                    className={'all-projects-button' + (!selectedCompany.id ? ' selected' : '')}
                    onClick={() => setSelectedCompany({} as DocumentData)}>
                        <h1>כל הפרויקטים</h1>
                </button>
                {
                    companies?.map((company) => 
                    <button 
                        className={'company' + (selectedCompany.id === company.id ? ' selected' : '')}
                        onClick={() => setSelectedCompany(company)}
                        >
                        <img src={company.logo} width={30} />
                        <h1>{company.company_name}</h1>
                    </button>)
                }
            </div>
        </div>
        <div className='projects-container'>
            <h1 className='projects-header'>פרויקטים</h1>
            <button 
                className='create-project-button'
                onClick={() => setCreateProjectFlag(!createProjectFlag)}
                disabled={!isAdmin}
                title={isAdmin ? 'יצירת פרויקט חדש' : 'אין לחשבון שלך גישה ליצירת פרויקטים'}
                >
                    <CgAdd size={28}/><p>יצירת פרויקט חדש</p>
            </button>
            <div className="projects">
                {
                    projects?.filter((project) => selectedCompany.id ? project.company_id === selectedCompany.id : project)?.map(project => (
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
                            <button 
                                title='עריכת שם ומנהל הפרויקט' 
                                className='edit-button' 
                                onClick={() => {
                                    props.setEditProject(project);
                                }}>
                                    <BiEditAlt size={25}/>
                            </button>
                        </div>
                    ))
                }
            </div>
        </div>
        <Popup 
            contentStyle={{width: "300px"}}
            open={createProjectFlag}
            modal >
                <CreateProjectForm  
                    projectsCollection={collection(db, 'projects')} 
                    createProjectFlag={createProjectFlag} 
                    onProjectCreate={(createProjectFlag) => {
                        setCreateProjectFlag(!createProjectFlag)
                    }}
                    topProjectId={''}
                />
        </Popup>
        <Popup 
            contentStyle={{width: "300px"}}
            open={!!props.editProject?.id}
            modal >
                <EditProjectForm 
                    editProject={props.editProject} 
                    projectsCollection={collection(db, 'projects')} 
                    setEditProject={(editProject) => props.setEditProject(editProject)} 
                />
        </Popup>
        <Popup 
            contentStyle={{width: "300px"}}
            open={projectDeletePopup != ''}
            modal >
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
    </div>
}

