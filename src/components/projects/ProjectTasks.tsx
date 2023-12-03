import { CollectionReference, collection, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestoreCollectionData } from "reactfire";


import './ProjectTasks.scss'

import { CreateTaskForm } from "./CreateTaskForm";
import { BiSolidPlusCircle, BiTask } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";
import Popup from "reactjs-popup";
import { useAppDispatch, useAppSelector } from "../../reduxHooks";
import { addUnknownContacts, selectContacts, selectUnknownContactsRedux, setUnknownContacts } from "../../redux/contactsSlice";
import { selectProjectStack } from "../../redux/projectsSlice";
import { ProjectTask } from "./ProjectTask";
import { GoPersonAdd } from "react-icons/go";
import { CreateContactForm } from "../contacts/CreateContactForm";
import { selectDb } from "../../redux/databaseSlice";

type ProjectTasksProps = {
    tasksCollection: CollectionReference;
}



export const ProjectTasks = (props: ProjectTasksProps) => {
    const dispatch = useAppDispatch();
    const projectStack = useAppSelector(selectProjectStack);
    const contacts = useAppSelector(selectContacts);
    const [newTask, setNewTask] = useState(false);

    const tasksQuery = query(props.tasksCollection,
        where("top_project_id", "==", projectStack[0].id));
    
    const { status, data: tasks } = useFirestoreCollectionData(tasksQuery, { idField: 'id',});

    useEffect(() => {

        if (tasks?.length) {
            const newUnknownContacts = [] as string[];
            tasks?.forEach((task) => {
                task.collaborators?.forEach((collaborator: string) => {
                    const existingContact = contacts.find((contact) => contact.email === collaborator);
                    if (!existingContact) {
                        newUnknownContacts.push(collaborator);
                    }
                });
            });
            debugger
            dispatch(addUnknownContacts(newUnknownContacts));
        }

        // Check if the state needs to be updated
        // if (!arraysEqual(unknownContactsRedux, updatedUnknownContacts)) {
        //     dispatch(setUnknownContactsRedux(updatedUnknownContacts));
        // }
    }, [tasks]);

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
    </div>
}