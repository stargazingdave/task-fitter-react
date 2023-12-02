import { CollectionReference, collection, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestoreCollectionData } from "reactfire";


import './ProjectTasks.scss'

import { CreateTaskForm } from "./CreateTaskForm";
import { BiSolidPlusCircle, BiTask } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";
import Popup from "reactjs-popup";
import { useAppDispatch, useAppSelector } from "../../reduxHooks";
import { selectContacts, selectUnknownContactsRedux, setUnknownContactsRedux } from "../../redux/contactsSlice";
import { selectProjectStack } from "../../redux/projectsSlice";
import { ProjectTask } from "./ProjectTask";
import { GoPersonAdd } from "react-icons/go";
import { CreateContactForm } from "../contacts/CreateContactForm";
import { selectDb } from "../../redux/databaseSlice";

type ProjectTasksProps = {
    tasksCollection: CollectionReference;
}



export const ProjectTasks = (props: ProjectTasksProps) => {
    const projectStack = useAppSelector(selectProjectStack);
    const unknownContactsRedux = useAppSelector(selectUnknownContactsRedux);
    const dispatch = useAppDispatch();
    // const [unknownContacts, setUnknownContacts] = useState([] as string[]);
    // const [unknownContactsCount, setUnknownContactsCount] = useState(0);

    const [newTask, setNewTask] = useState(false);
    // const [createContact, setCreateContact] = useState('');
    // const [unknownContactsPopupEnabled, setUnknownContactsPopupEnabled] = useState(true);

    const tasksQuery = query(props.tasksCollection,
        where("top_project_id", "==", projectStack[0].id));
    
    const { status, data: tasks } = useFirestoreCollectionData(tasksQuery, { idField: 'id',});

    useEffect(() => {
        const uniqueEmailsSet = new Set<string>(unknownContactsRedux);

        tasks?.forEach((task) => {
            task.collaborators?.forEach((collaborator) => {
                uniqueEmailsSet.add(collaborator);
            });
        });

        // Convert Set back to an array
        const updatedUnknownContacts = Array.from(uniqueEmailsSet);

        // Check if the state needs to be updated
        if (!arraysEqual(unknownContactsRedux, updatedUnknownContacts)) {
            dispatch(setUnknownContactsRedux(updatedUnknownContacts));
        }
    }, [tasks, unknownContactsRedux, dispatch]);

    // Helper function to compare arrays
    const arraysEqual = (a: string[], b: string[]) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    };

    if (status === 'loading') {
        return <p>טוען משימות...</p>;
    }

    
    return <div className="tasks">
        <div className="tasks-container">
            {tasks?.sort((x, y) => {
                if (x.deadline > y.deadline) {
                    return 1;
                }
                if (x.deadline < y.deadline) {
                    return -1;
                }
                return 0;
            }).map(task => (
                <ProjectTask 
                    task={task}
                    taskCollection={props.tasksCollection}
                />
                ))
            }
            {
                newTask
                ? <CreateTaskForm 
                    tasksCollection={props.tasksCollection} 
                    createTaskSelected={newTask} 
                    onTaskCreate={() => setNewTask(false)} 
                    onCancel={() => setNewTask(false)} 
                    projectId={projectStack[projectStack.length - 1].id} 
                    topProjectId={projectStack[0].id} 
                />
                : <button 
                    className="new-task-button" 
                    onClick={() => setNewTask(true)}
                    >
                    <BiSolidPlusCircle size={30} />
                    משימה חדשה
                </button>
            }
        </div>
        {/* <Popup
            open={unknownContacts.length !== 0 && unknownContactsPopupEnabled}>
            <button onClick={() => {
                dispatch(setUnknownContacts([]));
                setUnknownContactsPopupEnabled(false);
            }}>
                סגירה
            </button>
            <div>
                
                <br/>
                {
                    createContact === ''
                    ? <div>
                        קיימות בפרויקט משימות באחריות אנשים שאינם ברשימת אנשי הקשר:
                        {
                            unknownContacts.map((contactEmail) => 
                            <div className="unknown-contact">
                                {contactEmail}
                                <button
                                    onClick={() => {
                                        setCreateContact(contactEmail);
                                    }}
                                    title="הוספה לאנשי הקשר"
                                    >
                                    <GoPersonAdd size={20}/>
                                </button>
                            </div>
                        )}
                    </div>
                    : <CreateContactForm 
                        contactsCollection={collection(db, 'contacts')}
                        createContactFlag={createContact !== ''}
                        email={createContact}
                        onContactCreate={(newContact) => {
                            setCreateContact('');
                            let tempCount = unknownContactsCount;
                            tempCount--;
                            setUnknownContactsCount(tempCount);
                            const prevContacts = [...unknownContacts];
                            // Remove the newly added contact from unknownContacts
                            dispatch(setUnknownContacts(prevContacts.filter((contact: string) => contact !== newContact)
                            ));
                        }}
                    />
                }
            </div>
        </Popup> */}
    </div>
}