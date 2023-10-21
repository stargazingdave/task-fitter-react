import React, { useState } from 'react';
import { GiLargePaintBrush } from 'react-icons/gi';
import './SubProjects.scss';
import { EditProjectForm } from './EditProjectForm';



// Import the functions you need from the SDKs you need
import { DocumentData, collection, deleteDoc, doc, orderBy, query, where } from 'firebase/firestore';
import { useFirestoreCollectionData } from 'reactfire';
import { CreateProjectForm } from './CreateProjectForm';
import { getProjectsPath } from '../../utils';
import { BsFillBuildingsFill } from 'react-icons/bs';
import Popup from 'reactjs-popup';
import { MdDeleteForever } from 'react-icons/md';
import { useAppSelector } from '../../reduxHooks';
import { selectUser } from '../../redux/userSlice';
import { selectDb } from '../../redux/databaseSlice';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional


type SubProjectsProps = {
  onProjectSelected: (projectStack: DocumentData[]) => void;
  projectStack: DocumentData[];
  editProject: DocumentData;
  setEditProject: (editProject: DocumentData) => void;
}





export const SubProjects = (props: SubProjectsProps) =>  {
    const user = useAppSelector(selectUser);
  const path = getProjectsPath(props.projectStack);
  const db = useAppSelector(selectDb);
  const projectsCollection = collection(db, path);
  const [isAscending, setIsAscending] = useState(false);
  const [createSubProject, setCreateSubProject] = useState(false);
  const [editSubProject, setEditSubProject] = useState({} as DocumentData);
  const [projectDeletePopup, setProjectDeletePopup] = useState('');
  const projectsQuery = query(projectsCollection,
                              where("user_id", "==", user.uid || 0),
                              orderBy('creation_time', isAscending ? 'asc' : 'desc'));
  const { status, data: projects } = useFirestoreCollectionData(projectsQuery, { idField: 'id',});
  
  // check the loading status
  if (status === 'loading') {
    return <p>טוען פרויקטים...</p>;
  }
  

  return <div className='sub-projects-container'>
    <h1>תת-פרויקטים</h1>
    <div className="sub-projects">
    {projects.map(project => (<>
        <div className="sub-project-tile" key={project.id}>
            <div className='sub-project-details'>
            <h1>{project.project_name}</h1>
            <p>{project.project_manager}</p>
            </div>
            <button className='open-button' 
                title='פתיחה'
                onClick={() => {
                    props.onProjectSelected([...props.projectStack, project]);
                }}>
                    <BsFillBuildingsFill size={26}/>
            </button>
            <button 
                title='מחיקת תת הפרויקט'
                className='delete-button' 
                onClick={() => setProjectDeletePopup(project.id)} >
                <MdDeleteForever size={22}/>
            </button>
            <Popup 
                contentStyle={{width: "300px"}}
                open={projectDeletePopup != ''}
                modal={true} >
                    <div className='delete-project-confirmation-box'>
                        <p>פעולה זו תמחק את הפרויקט לתמיד <b>ללא אפשרות שחזור התוכן שלו</b>. להמשיך במחיקה?</p>
                        <div className='buttons'>
                            <button onClick={() => {
                                    deleteDoc(doc(db, path, projectDeletePopup));
                                    setProjectDeletePopup('');
                                }}>
                                    מחיקה לתמיד
                            </button>
                            <button onClick={() => setProjectDeletePopup('')} >ביטול</button>
                        </div>
                    </div>
            </Popup>
            <button 
                className='edit-button' 
                title='עריכת שם ומנהל תת הפרויקט'
                onClick={() => {
                    setEditSubProject(project);
                }}>
                    <GiLargePaintBrush size={22}/>
            </button>
        </div>
        {editSubProject?.id == project.id &&
            <div className="edit-sub-project-form">
            <EditProjectForm editProject={editSubProject} 
                            projectsCollection={projectsCollection} 
                            setEditProject={(project) => setEditSubProject(project)} 
                            />
            </div>
        }
    </>
    ))}
    </div>
    <div className="create-sub-project">
    {createSubProject &&
        <div className="create-sub-project-form">
            <CreateProjectForm 
                                projectsCollection={projectsCollection} 
                                createProjectFlag={createSubProject} 
                                onProjectCreate={
                                    (createProjectFlag) => {
                                        setCreateSubProject(!createProjectFlag)
                                    }
                                }/>
        </div>
      }
      
      {
        !createSubProject && !editSubProject?.id
        ? <button onClick={() => setCreateSubProject(!createSubProject)}>תת פרויקט חדש</button>
        : <></>
      }
    </div>
  </div>
}

