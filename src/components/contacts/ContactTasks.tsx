import { User } from "firebase/auth";
import { DocumentData, collectionGroup, doc, getDoc, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestoreCollectionData } from "reactfire";

import './ContactTasks.scss'
import { useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";
import { selectProjects } from "../../redux/projectsSlice";


type ContactTasksProps = {
    contact: DocumentData;
}


export const ContactTasks = (props: ContactTasksProps) => {
    const [isAscending, setIsAscending] = useState(false);
    // const [projects, setProjects] = useState([] as any[]);
    
    const db = getFirestore();
    // const tasksCollection = collectionGroup(db, 'tasks');
    const projects = useAppSelector(selectProjects);
    const projectIds = [] as string[];
    const [projectObjects, setProjectObjects] = useState([] as any)
    projects.forEach((project) => projectIds.push(project.id));

    const tasksCollection = collectionGroup(db, 'tasks');
    const tasksQuery = query(tasksCollection, 
        where("top_project_id", 'in', projectIds),
        where("collaborators", 'array-contains', props.contact.email),
        orderBy('deadline', isAscending ? 'asc' : 'desc'));

    const { status, data: tasks } = useFirestoreCollectionData(tasksQuery, { idField: 'id',});

    useEffect(() => {
        async function init() {
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
        }
        debugger
        console.log("blablabla")
        status !== 'loading' && init();
    }, [status]); // Include tasks in the dependency array
    
    
    if (status === 'loading') {
        return <p>טוען משימות...</p>;
    }

    return <div className="contact-tasks">
        <div className="contact-tasks-container">
        {
            projectObjects.map((project) => (
                <div>
                    <h1>{project.name}</h1>
                    {
                        project.tasks?.map(task => (
                            <div className="contact-task" key={task.id}>
                                
                                <h1>{task.task}</h1>
                                <h2>{new Date(task.deadline).toLocaleDateString("he-IL")}</h2>
                                <p>{task.status ? <h4>בוצע</h4> : <h3>לא בוצע</h3>}</p>                    
                            </div>
                        ))
                    }
                </div>
            ))
        }
        </div>
    </div>
}