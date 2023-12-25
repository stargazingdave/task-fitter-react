import { DocumentData, collectionGroup, doc, getDoc, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestoreCollectionData } from "reactfire";

import './ContactTasks.scss'
import { useAppSelector } from "../../reduxHooks";
import { selectProjects } from "../../redux/projectsSlice";
import { FaRegWindowClose } from "react-icons/fa";


type ContactTasksProps = {
    contact: DocumentData;
    closeFunction: () => void;
}


export const ContactTasks = (props: ContactTasksProps) => {
    const [isAscending, setIsAscending] = useState(false);
    // const [projects, setProjects] = useState([] as any[]);
    
    const db = getFirestore();
    // const tasksCollection = collectionGroup(db, 'tasks');
    const projects = useAppSelector(selectProjects);
    const projectIds = [] as string[];
    const [projectObjects, setProjectObjects] = useState([] as any);
    const [loading, setLoading] = useState(true);

    projects.forEach((project) => projectIds.push(project.id));
debugger
    const tasksCollection = collectionGroup(db, 'tasks');
    const tasksQuery = query(tasksCollection, 
        where("top_project_id", 'in', projectIds),
        where("collaborators", 'array-contains', props.contact?.email),
        orderBy('deadline', isAscending ? 'asc' : 'desc'));

    const { status: tasksStatus, data: tasks } = useFirestoreCollectionData(tasksQuery, { idField: 'id',});

    useEffect(() => {
        async function init() {
            setLoading(true);
            const newProjectObjects = [...projectObjects];
            
            // Use Promise.all to wait for all asynchronous tasks
            tasks?.map((task) => {
                const existingProjectObject = newProjectObjects.find((projectObject) => projectObject.id === task.top_project_id);
    
                if (existingProjectObject) {
                    existingProjectObject.tasks.push(task);
                } else {
                    const newProjectObject = { id: task.top_project_id, tasks: [task] };
                    newProjectObjects.push(newProjectObject);
                }
            });
            await Promise.all(newProjectObjects.map(async (projectObject) => {
                const projectData = await getDoc(doc(db, 'projects', projectObject.id));
                projectObject.name = await projectData.data()?.project_name;
            }));
            setProjectObjects(newProjectObjects);
            setLoading(false);
        }
        tasksStatus !== 'loading' && init();
    }, [tasksStatus]); // Include tasks in the dependency array
    
    
    if (tasksStatus === 'loading') {
        return <p>טוען משימות...</p>;
    }

    if (loading) {
        return <div className="loader"></div>;
    }

    return <div className="contact-tasks">
        <button 
            className='close-button'
            onClick={() => props.closeFunction()}>
                <FaRegWindowClose size={30} />
        </button>
        <h1 className="title">המשימות של {props.contact.name}</h1>
        <div className="contact-tasks-container">
            {
                projectObjects.length > 0
                ? projectObjects.map((project: any) => (
                    <div className="project">
                        <h1 className="project-title">{project.name}</h1>
                        {
                            project.tasks?.map(task => (
                                <div className="contact-task" key={task.id}>
                                    
                                    <h1>{task.task}</h1>
                                    <div className="deadline-and-status">
                                        <h2>{new Date(task.deadline).toLocaleDateString("he-IL")}</h2>
                                        {task.status ? <h4>בוצע</h4> : <h3>לא בוצע</h3>} 
                                    </div>                 
                                </div>
                            ))
                        }
                    </div>
                ))
                : <p>לא קיימות משימות באחריות איש קשר זה.</p>
            }
        </div>
    </div>
}