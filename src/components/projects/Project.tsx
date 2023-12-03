import { DocumentData, collection, doc } from "firebase/firestore";
import "./Project.scss";
import { SubProjects } from "./SubProjects";
import { getProjectsPath } from "../../utils";
import { ProjectSubjects } from "./ProjectSubjects";
import { AiOutlineClose } from "react-icons/ai";
import { GoPasskeyFill, GoPeople, GoPersonAdd } from "react-icons/go";
import { BiEditAlt, BiSolidHome, BiUserPlus } from "react-icons/bi";
import { EditProjectForm } from "./EditProjectForm";
import { useAppDispatch, useAppSelector } from "../../reduxHooks";
import { selectDb } from "../../redux/databaseSlice";
import { pushProject, selectProjectStack, setProjectStack } from "../../redux/projectsSlice";
import Popup from "reactjs-popup";
import { ProjectPermissionsManager } from "./ProjectPermissionsManager";
import { useEffect, useState } from "react";
import { selectIsAdmin } from "../../redux/userSlice";
import { ProjectParticipantsManager } from "./ProjectParticipantsManager";
import { selectUnknownContactsRedux, setUnknownContacts as setUnknownContactsRedux } from "../../redux/contactsSlice";
import { CreateContactForm } from "../contacts/CreateContactForm";
import { FaRegWindowClose } from "react-icons/fa";

type ProjectProps = {
    editProject: DocumentData;
    setEditProject: (editProject: DocumentData) => void;
}




export const Project = (props: ProjectProps) => {
    const isAdmin = useAppSelector(selectIsAdmin);
    const db = useAppSelector(selectDb);
    const unknownContactsRedux = useAppSelector(selectUnknownContactsRedux);
    const projectStack = useAppSelector(selectProjectStack);
    const dispatch = useAppDispatch();
    const [participantsManagerOpen, setParticipantsManagerOpen] = useState(false);
    const [permissionsManagerOpen, setPermissionsManagerOpen] = useState(false);
    const [createContact, setCreateContact] = useState('');
    const [unknownContactsPopupEnabled, setUnknownContactsPopupEnabled] = useState(true);
    const [unknownContacts, setUnknownContacts] = useState([] as string[]);

    useEffect(() => {
        setUnknownContacts(unknownContactsRedux);
    }, [unknownContactsRedux])

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

    console.log("Unknown: ", unknownContactsRedux)
    debugger

    return <div className="project">
        <div className="navigation-bar">
            <button 
                className="exit-button" 
                title="יציאה מהפרויקט לדף הבית" 
                onClick={() => dispatch(setProjectStack([] as DocumentData[]))}>
                    <BiSolidHome size={30} />
            </button>
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
                            className="project-participants-button" 
                            onClick={() => setParticipantsManagerOpen(true)}
                            title="הוספת אנשים לפרויקט מתוך אנשי הקשר או הסרתם"
                            >
                            <GoPeople size={22}/>
                            <p>ניהול משתתפים בפרויקט</p>
                        </button>
                        <button
                            className="shared-emails-button" 
                            onClick={() => setPermissionsManagerOpen(true)}
                            disabled={!isAdmin}
                            title={isAdmin 
                                ? 'עריכת החשבונות בעלי גישה לפרויקט לפי כתובות מייל' 
                                : 'אין לחשבון שלך גישה לעריכת הרשאות'}
                            >
                            <GoPasskeyFill size={22}/>
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
            open={participantsManagerOpen}
            closeOnDocumentClick={false}
            >
            <ProjectParticipantsManager 
                project={projectStack[0]} 
                projectReference={doc(parentCollection, projectStack[0].id)}
                setOpen={setParticipantsManagerOpen}
            />
        </Popup>
        <Popup 
            open={permissionsManagerOpen}
            closeOnDocumentClick={false}
            >
            <ProjectPermissionsManager 
                project={projectStack[0]} 
                projectReference={doc(parentCollection, projectStack[0].id)}
                setOpen={setPermissionsManagerOpen}
            />
        </Popup>
        <Popup
            open={unknownContacts.length !== 0 && unknownContactsPopupEnabled}>
            <button 
                className="popup-close-button"
                title="סגירה"
                onClick={() => {
                    dispatch(setUnknownContactsRedux([]));
                    setUnknownContactsPopupEnabled(false);
                }}>
                <FaRegWindowClose size={30}/>
            </button>
            <div className="popup-container">
                {
                    createContact === ''
                    ? <div className="unknown-contacts-container">
                        <h1>קיימות בפרויקט משימות באחריות אנשים שאינם ברשימת אנשי הקשר:</h1>
                        <div className="unknown-contacts">
                            {
                                unknownContacts.map((contactEmail) => 
                                <div className="unknown-contact">
                                    <button
                                        onClick={() => {
                                            setCreateContact(contactEmail);
                                        }}
                                        title="הוספה לאנשי הקשר"
                                        >
                                        <GoPersonAdd size={20}/>
                                    </button>
                                    <p>{contactEmail}</p>
                                </div>
                            )}
                        </div>
                        <h2>ניתן להוסיף אותם לאנשי הקשר מחלון זה, או מתוך המשימות שבאחריותם, או באופן ידני.</h2>
                    </div>
                    : <CreateContactForm 
                        contactsCollection={collection(db, 'contacts')}
                        createContactFlag={createContact !== ''}
                        email={createContact}
                        onContactCreate={(newContact) => {
                            setCreateContact('');
                            // let tempCount = unknownContactsCount;
                            // tempCount--;
                            // setUnknownContactsCount(tempCount);
                            const prevContacts = [...unknownContacts];
                            // Remove the newly added contact from unknownContacts
                            dispatch(setUnknownContactsRedux(prevContacts.filter((contact: string) => contact !== newContact)
                            ));
                        }}
                    />
                }
            </div>
        </Popup>
    </div>
}