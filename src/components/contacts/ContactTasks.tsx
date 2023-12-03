import { User } from "firebase/auth";
import { DocumentData, collectionGroup, doc, getDoc, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirestoreCollectionData } from "reactfire";

import './ContactTasks.scss'
import { useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";


type ContactTasksProps = {
    contact: DocumentData;
}


export const ContactTasks = (props: ContactTasksProps) => {
    const user = useAppSelector(selectUser);
    const [isAscending, setIsAscending] = useState(false);
    const [projects, setProjects] = useState([] as any[]);
    const db = getFirestore();
    // const tasksCollection = collectionGroup(db, 'tasks');
    const tasksCollection = collectionGroup(db, 'tasks');
    debugger
    const tasksQuery = query(tasksCollection, 
        where("user_id", '==', user.uid),
        where("collaborators", 'array-contains', props.contact.email),
        orderBy('deadline', isAscending ? 'asc' : 'desc'));

    const { status, data: tasks } = useFirestoreCollectionData(tasksQuery, { idField: 'id',});

    useEffect(() => {
        async function init() {
            const newProjects = [...projects];
            
            // Use Promise.all to wait for all asynchronous tasks
            tasks?.map((task) => {
                const existingProject = newProjects.find((project) => project.id === task.top_project_id);
    
                if (existingProject) {
                    existingProject.tasks.push(task);
                } else {
                    const newProject = { id: task.top_project_id, tasks: [task] };
                    newProjects.push(newProject);
                }
            });
            await Promise.all(newProjects.map(async (project) => {
                const projectData = await getDoc(doc(db, 'projects', project.id));
                project.name = await projectData.data()?.project_name;
            }));
            setProjects(newProjects);
        }
        debugger
        console.log("blablabla")
        status !== 'loading' && init();
    }, [status]); // Include tasks in the dependency array
    
    useEffect(() => {
        
        console.log("contact tasks: ", projects);
    }, [projects]);
    
    if (status === 'loading') {
        return <p>טוען משימות...</p>;
    }

    return <div className="contact-tasks">
        <div className="contact-tasks-container">
        {
            projects.map((project) => (
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
            {/* {tasks?.map(task => (
                <div className="contact-task" key={task.id}>
                    
                    <h1>{task.task}</h1>
                    <h2>{new Date(task.deadline).toLocaleDateString("he-IL")}</h2>
                    <p>{task.status ? <h4>בוצע</h4> : <h3>לא בוצע</h3>}</p>                    
                </div>
            ))} */}
        </div>
    </div>
}