import { CollectionReference, DocumentData, deleteDoc, doc, or, query, updateDoc, where } from "firebase/firestore";
import { useState } from "react";
import { useFirestoreCollectionData } from "reactfire";
import { getStorage, ref, deleteObject } from "firebase/storage";


import './ProjectTasks.scss'

import { CreateTaskForm } from "./CreateTaskForm";
import { Checkbox } from "../general/Checkbox";
import { EditTaskForm } from "./EditTaskForm";
import { BiEditAlt, BiTask } from "react-icons/bi";
import { AiOutlinePlus } from "react-icons/ai";
import Popup from "reactjs-popup";
import { ConfirmationBox } from "../general/ConfirmationBox";
import { ImageContainer } from "../general/ImageContainer";
import { MdDeleteForever } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";
import { selectContacts } from "../../redux/contactsSlice";
import { selectProjectStack } from "../../redux/projectsSlice";
import { FcImageFile } from "react-icons/fc";
import { ProjectTask } from "./ProjectTask";

type ProjectTasksProps = {
    tasksCollection: CollectionReference;
}



export const ProjectTasks = (props: ProjectTasksProps) => {
    const storage = getStorage();
    const contacts = useAppSelector(selectContacts);
    const projectStack = useAppSelector(selectProjectStack);

    const [newTask, setNewTask] = useState(false);
    const [editTask, setEditTask] = useState({} as DocumentData);
    const [taskDeletePopup, setTaskDeletePopup] = useState({} as DocumentData);

    const tasksQuery = query(props.tasksCollection,
        where("top_project_id", "==", projectStack[0].id));
    
    const { status, data: tasks } = useFirestoreCollectionData(tasksQuery, { idField: 'id',});

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
                    <div className="icons">
                        <AiOutlinePlus size={20} />
                        <BiTask size={24} />
                    </div>
                    משימה חדשה
                </button>
            }
        </div>
    </div>
}