import { User } from "firebase/auth";
import { DocumentData, Firestore, addDoc, collection, deleteDoc, doc, orderBy, query, updateDoc, where } from "firebase/firestore";
import { useFirestoreCollectionData } from "reactfire";
import './ProtocolProject.scss'
import { ProtocolTasks } from "./ProtocolTasks";
import { useState } from "react";
import { CreateProjectForm } from "../projects/CreateProjectForm";
import Popup from "reactjs-popup";
import { ProtocolConfirmationBox } from "./ProtocolConfirmationBox";
import { FaHammer } from "react-icons/fa";
import { BiEditAlt } from "react-icons/bi";
import { EditProjectForm } from "../projects/EditProjectForm";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import { useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";

type ProtocolProjectProps = {
    project: DocumentData;
    db: Firestore;
    path: string;
    addSaveAction: (taskId: string, action: () => void) => void;
}

export const ProtocolProject = (props: ProtocolProjectProps) => {
    const user = useAppSelector(selectUser);
    const subProjectsCollection = collection(props.db, props.path, 'projects');
    const subProjectsQuery = query(subProjectsCollection,
        where("user_id", "==", user.uid || 0));
    const projectSubjectsCollection = collection(props.db, props.path, 'subjects');
    const projectSubjectsQuery = query(projectSubjectsCollection,
        where("user_id", "==", user.uid || 0));
    const [editProject, setEditProject] = useState({} as DocumentData);
    const [createSubjectFlag, setCreateSubjectFlag] = useState(false);
    const [createSubProject, setCreateSubProject] = useState(false);
    const [deleteSubject, setDeleteSubject] = useState({} as DocumentData);
    const [editSubject, setEditSubject] = useState({} as DocumentData);
    const [subjectName, setSubjectName] = useState('');
    const { status: statusP, data: projects } = useFirestoreCollectionData(subProjectsQuery, { idField: 'id',});
    const { status: statusS, data: subjects } = useFirestoreCollectionData(projectSubjectsQuery, { idField: 'id',});
    // check the loading status
    if (statusP === 'loading') {
        return <p>טוען פרויקטים...</p>;
    }
    if (statusS === 'loading') {
        return <p>טוען נושאים...</p>;
    }

    return (<div className="form" id="protocol-project">

        <div className="form-tasks">
            {
                !createSubjectFlag && !createSubProject
                ? <div className="buttons">
                    <button 
                        onClick={() => setCreateSubjectFlag(!createSubjectFlag)}
                        className="new-subject-button" >
                            נושא חדש
                    </button>
                    <button 
                        onClick={() => setCreateSubProject(!createSubProject)}
                        className="new-subproject-button" >
                            תת פרויקט חדש
                    </button>
                </div>
                : <></>
            }
            {
                createSubjectFlag &&
                <div>
                    <label>
                        כותרת:
                        <input
                            value={subjectName}
                            onChange={e => setSubjectName(e.target.value)}
                            type="string" />
                    </label>
                    <button onClick={() => {
                        if (subjectName == '') {
                            alert('לא ניתן ליצור נושא ללא כותרת');
                            return;
                        }
                        addDoc(projectSubjectsCollection, {title: subjectName, creation_time: new Date().toString()});
                                                setCreateSubjectFlag(false);
                                            }}>
                        שמירה
                    </button>
                    <button onClick={() => setCreateSubjectFlag(false)}>
                        ביטול
                    </button>
                </div>
            }
            {
                createSubProject && 
                <CreateProjectForm 
                    createProjectFlag={createSubProject}
                    onProjectCreate={(createSubProject) => {
                        setCreateSubProject(false)
                    }}
                    projectsCollection={subProjectsCollection}
                    />
            }
            {
                subjects.map(subject => (
                    
                    <div className='p-subject' key={subject.id}>
                        <div className='subject-title'>
                            <h1>{subject.title}</h1>
                            {
                                editSubject?.id != subject.id
                                ? <div className='buttons'>
                                    <button 
                                        className="delete-button"
                                        title="מחיקת נושא"
                                        onClick={() => setDeleteSubject(subject)}>
                                            <MdDeleteForever size={24}/>
                                    </button>
                                    <button 
                                        className="edit-button"
                                        title="עריכת נושא"
                                        onClick={() => setEditSubject(subject)}>
                                            <BiEditAlt size={24}/>
                                    </button>
                                </div>
                                : <div>
                                    <div className="edit-subject-form">
                                        <label className="title">
                                            נושא:
                                        </label>
                                        <input
                                            value={subjectName}
                                            onChange={e => setSubjectName(e.target.value)}
                                            type="string"
                                        />
                                        <div className="buttons">
                                            <button 
                                                onClick={() => {
                                                    setSubjectName(subject.title);
                                                    updateDoc(doc(projectSubjectsCollection, editSubject.id), {
                                                        title: subjectName,
                                                        });
                                                    editSubject.title = subjectName;
                                                    setEditSubject({});
                                                }}
                                                className="save-button" 
                                                title="אישור" >
                                                    <AiOutlineCheck size={20} />
                                            </button>
                                            <button 
                                                onClick={() => setEditSubject({})} 
                                                className="cancel-button" 
                                                title="ביטול" >
                                                    <AiOutlineClose size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                        <ProtocolTasks   
                            tasksCollection={collection(props.db, props.path, 'subjects', subject.id, 'tasks')}
                            addSaveAction={props.addSaveAction}
                            project={props.project} />
                    </div>
                ))
            }
        </div>
        <div className="form-sub-project">
            {
                projects.map(project => ( 
                    <div className="sub-project" key={project.id}>
                        <h1>{project.project_name}</h1>
                        <div className="buttons">
                            <button 
                                title='מחיקת הפרויקט' className="delete-subproject-button" onClick={() => deleteDoc(doc(subProjectsCollection, project.id))}>
                                <MdDeleteForever size="24" />
                            </button>
                            <button 
                                title='עריכת שם ומנהל הפרויקט'className="edit-subproject-button" onClick={() => setEditProject(project)}>
                                <BiEditAlt size="24" />
                            </button>
                        </div>
                        {
                            editProject?.id &&
                            <EditProjectForm 
                                db={props.db} 
                                editProject={editProject} 
                                projectsCollection={subProjectsCollection}
                                setEditProject={(editProject) => setEditProject(editProject)}
                                />
                        }
                        <ProtocolProject    
                            project={project}
                            db={props.db} 
                            path={props.path + '/projects/' + project.id}
                            addSaveAction={props.addSaveAction} />
                    </div>
                ))
            }
            {
                deleteSubject?.id &&
                <Popup 
                    contentStyle={{width: "300px"}}
                    modal={true}  
                    open={deleteSubject.id} >
                        <ProtocolConfirmationBox 
                            object="הנושא" 
                            onConfirm={() => {
                                deleteDoc(doc(projectSubjectsCollection, deleteSubject.id));
                                setDeleteSubject({});
                            }} 
                            onCancel={() => setDeleteSubject({})} />
                </Popup>
            }
        </div>
    </div>)
}