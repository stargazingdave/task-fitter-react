import { DocumentData, addDoc, collection, deleteDoc, doc, orderBy, query, updateDoc, where } from "firebase/firestore";
import { useFirestoreCollectionData } from "reactfire";
import './ProtocolProject.scss'
import { ProtocolTasks } from "./ProtocolTasks";
import { useState } from "react";
import { CreateProjectForm } from "../projects/CreateProjectForm";
import Popup from "reactjs-popup";
import { ProtocolConfirmationBox } from "./ProtocolConfirmationBox";
import { BiDotsVerticalRounded, BiEditAlt, BiListPlus } from "react-icons/bi";
import { IoIosArrowDropdownCircle } from "react-icons/io";

import { EditProjectForm } from "../projects/EditProjectForm";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import { useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";
import { selectDb } from "../../redux/databaseSlice";
import { deleteProject, deleteSubject } from "../../utils";
import { store } from "../../store";
import { useParams } from "react-router";
import { BsBuildingFillAdd, BsFillPlusCircleFill } from "react-icons/bs";

type ProtocolProjectProps = {
    project: DocumentData;
    path: string;
    addSaveAction: (taskId: string, action: () => void) => void;
}

export const ProtocolProject = (props: ProtocolProjectProps) => {
    const [isAscending, setIsAscending] = useState(false);
    const db = useAppSelector(selectDb);
    const user = useAppSelector(selectUser);
    const subProjectsCollection = collection(db, props.path, 'projects');
    let { id } = useParams();
    

    const subProjectsQuery = query(subProjectsCollection,
        where("top_project_id", "==", id),
        orderBy('creation_time', isAscending ? 'asc' : 'desc'));
    const subjectsCollection = collection(db, props.path, 'subjects');
    const subjectsQuery = query(subjectsCollection,
        where("top_project_id", "==", id),
        orderBy("creation_time", "asc"));

    const [projectButtonsOpen, setProjectButtonsOpen] = useState(false);
    const [editProject, setEditProject] = useState({} as DocumentData);
    const [createSubjectFlag, setCreateSubjectFlag] = useState(false);
    const [createSubProject, setCreateSubProject] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState({} as DocumentData);
    const [selectedProject, setSelectedProject] = useState({} as DocumentData);
    const [editSubject, setEditSubject] = useState({} as DocumentData);
    const [subjectName, setSubjectName] = useState('');
    const { status: statusP, data: projects } = useFirestoreCollectionData(subProjectsQuery, { idField: 'id',});
    const { status: statusS, data: subjects } = useFirestoreCollectionData(subjectsQuery, { idField: 'id',});
    // check the loading status
    if (statusP === 'loading') {
        return <p>טוען פרויקטים...</p>;
    }
    if (statusS === 'loading') {
        return <p>טוען נושאים...</p>;
    }

    return (<div className="form" id="protocol-project">

        <div className="form-tasks">
            <button
                    className="add-button"
                    onClick={() => setProjectButtonsOpen(!projectButtonsOpen)}
                    >
                    <IoIosArrowDropdownCircle size={40}/>
                </button>
            {
                projectButtonsOpen
                ? <div className="project-buttons">
                    <button 
                        onClick={() => {
                            setCreateSubProject(!createSubProject);
                            setProjectButtonsOpen(!projectButtonsOpen);
                        }}
                        className="new-subproject-button" >
                            <BsBuildingFillAdd size={20}/>
                            <p style={{margin: "0",}}>תת פרויקט חדש</p>
                    </button>
                    <button 
                        onClick={() => {
                            setCreateSubjectFlag(!createSubjectFlag);
                            setProjectButtonsOpen(!projectButtonsOpen);
                        }}
                        className="new-subject-button" >
                            <BiListPlus size={20}/>
                            <p style={{margin: "0",}}>נושא חדש בפרויקט</p>
                    </button>
                    <button 
                        title='עריכת שם ומנהל הפרויקט'
                        className="edit-subproject-button" 
                        onClick={() => setEditProject(props.project)}>
                        <BiEditAlt size={20} />
                        <p style={{margin: "0",}}>עריכת שם ומנהל הפרויקט</p>
                    </button>
                    <button 
                        title='מחיקת הפרויקט' 
                        className="delete-subproject-button" 
                        onClick={() => setSelectedProject(props.project)} >
                        <MdDeleteForever size={20} />
                        <p style={{margin: "0",}}>מחיקת הפרויקט</p>
                    </button>
                </div>
                : <></>
            }
            {
                subjects.map(subject => (
                    
                    <div className='p-subject' key={subject.id}>
                        <div className='subject-title'>
                            <h1>{subject.title}</h1>
                            {
                                editSubject?.id != subject.id
                                ? <div className='subject-buttons'>
                                    <button 
                                        className="delete-button"
                                        title="מחיקת נושא"
                                        onClick={() => setSelectedSubject(subject)}>
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
                                                    updateDoc(doc(subjectsCollection, editSubject.id), {
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
                            tasksCollection={collection(db, props.path, 'subjects', subject.id, 'tasks')}
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
                        <h1 className="project-name">{project.project_name}</h1>
                        {
                            editProject?.id &&
                            <EditProjectForm 
                                editProject={editProject} 
                                projectsCollection={subProjectsCollection}
                                setEditProject={(editProject) => setEditProject(editProject)}
                                />
                        }
                        <ProtocolProject    
                            project={project}
                            path={props.path + '/projects/' + project.id}
                            addSaveAction={props.addSaveAction} />
                    </div>
                ))
            }
            {
                selectedSubject?.id &&
                <Popup 
                    contentStyle={{width: "300px"}}
                    modal={true}  
                    open={selectedSubject.id} >
                        <ProtocolConfirmationBox 
                            object="הנושא" 
                            onConfirm={() => {
                                //deleteDoc(doc(projectSubjectsCollection, selectedSubject.id));
                                // delete subject and nested data (tasks)
                                deleteSubject(store.getState(), 
                                    doc(subjectsCollection, selectedSubject.id), 
                                    props.path + '/subjects/');
                                setSelectedSubject({});
                            }} 
                            onCancel={() => setSelectedSubject({})} />
                </Popup>
            }
            {
                selectedProject?.id &&
                <Popup 
                    contentStyle={{width: "300px"}}
                    modal={true}  
                    open={selectedProject.id} >
                        <ProtocolConfirmationBox 
                            object="הפרויקט" 
                            onConfirm={() => {
                                // delete project and nested data
                                deleteProject(store.getState(), 
                                props.path + '/projects/' + selectedProject.id)
                                setSelectedProject({});
                            }} 
                            onCancel={() => setSelectedProject({})} />
                </Popup>
            }
        </div>
        <Popup 
            open={createSubjectFlag}
            closeOnDocumentClick={false}
            >
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
                        addDoc(subjectsCollection, 
                            {
                                title: subjectName, 
                                creation_time: new Date().getTime(),
                                user_id: user.uid,
                                top_project_id: id,
                            });
                        setCreateSubjectFlag(false);
                    }}>
                        שמירה
                    </button>
                    <button onClick={() => setCreateSubjectFlag(false)}>
                        ביטול
                    </button>
                </div>
        </Popup>
        <Popup 
            open={createSubProject}
            closeOnDocumentClick={false}
            >
            <CreateProjectForm 
                createProjectFlag={createSubProject}
                onProjectCreate={(createSubProject) => {
                    setCreateSubProject(false)
                }}
                projectsCollection={subProjectsCollection}
                topProjectId={id || ''}
                />
        </Popup>
    </div>)
}