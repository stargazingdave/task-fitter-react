import './InternalTasks.scss'
import { CollectionReference, DocumentData, DocumentReference, addDoc, collection, deleteDoc, doc, orderBy, query, updateDoc, where } from "firebase/firestore";
import { useAppSelector } from "../../reduxHooks";
import { selectDb } from "../../redux/databaseSlice";
import { selectProjects } from "../../redux/projectsSlice";
import { useState } from "react";
import { useFirestoreCollectionData } from 'reactfire';
import { CgAdd } from 'react-icons/cg';
import { Popup } from 'reactjs-popup';
import DatePicker from "react-datepicker";
import { selectUser } from '../../redux/userSlice';
import { BiEditAlt } from 'react-icons/bi';
import { MdDeleteForever } from 'react-icons/md';
import { ConfirmationBox } from '../general/ConfirmationBox';
import { FaRegWindowClose } from 'react-icons/fa';

type InternalTasksProps = {
    project: DocumentData;
    closeFunction: () => void;
}

type CheckboxProps = {
    updateFunc: () => void;
    checked: boolean;
}

const taskStyle = {
    fontWeight: "500"
}

const Checkbox = (props: CheckboxProps) => {
    const [isChecked, setIsChecked] = useState(props.checked)

    const checkHandler = () => {
        setIsChecked(!isChecked);
        props.updateFunc();
    }

    return (
        <label className="container">
            <input
                type="checkbox"
                id="checkbox"
                checked={isChecked}
                onChange={checkHandler}
            />
            <span className="checkmark"></span>
        </label>
    )
}

const updateTask = ( 
    taskTitle: string, 
    taskDeadline: Date,
    tasksCollection: CollectionReference,
    taskId: string) => {
        if (taskTitle == '') {
            alert('יש למלא את תיאור המשימה');
            return;
        }
        const date = new Date().getTime();
        updateDoc(doc(tasksCollection, taskId), {
            task: taskTitle,
            update_time: date,
            deadline: taskDeadline.getTime(),
            });
}

export const InternalTasks = (props: InternalTasksProps) => {
    const db = useAppSelector(selectDb);
    const user = useAppSelector(selectUser);
    const projects = useAppSelector(selectProjects);
    const projectIds = [] as string[];
    projects.forEach((project) => projectIds.push(project.id));
    const [isAscending, setIsAscending] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [createTask, setCreateTask] = useState(false);
    const [editTask, setEditTask] = useState({} as DocumentData);
    const [deleteTaskReference, setDeleteTaskReference] = useState<DocumentReference | null>(null);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDeadline, setTaskDeadline] = useState(new Date());
    
    const tasksCollection = collection(db, 'projects', props.project.id, 'internal_tasks');
    const tasksQuery = query(tasksCollection, 
        where("top_project_id", 'in', projectIds),
        orderBy('deadline', isAscending ? 'asc' : 'desc'));

    const { status, data: tasks } = useFirestoreCollectionData(tasksQuery, { idField: 'id',});

    if (status === 'loading') {
        return <p>טוען משימות...</p>;
    }


    return <div className="internal-tasks-container">
        <button 
            className='close-button'
            onClick={() => props.closeFunction()}>
                <FaRegWindowClose size={30} />
        </button>
        <div className='header'>
            <h1>{props.project.project_name} - משימות למעקב</h1>
            {
                !createTask &&
                <button
                className='new-task-button'    
                onClick={() => setCreateTask(true)}
                    >
                    <CgAdd />
                    יצירת משימה חדשה
                </button>
            }
            {
            createTask &&
            <div className='create-task-form'>
                <h1>יצירת משימת מעקב חדשה</h1>
                <div className='task-title'>
                    <label>משימה:</label>
                    <textarea 
                        value={taskTitle}
                        onChange={e => setTaskTitle(e.target.value)}
                    />
                </div>
                <div className='task-deadline'>
                    <label>דדליין:</label>
                    <DatePicker 
                        wrapperClassName={"datepicker-wrapper"} 
                        dateFormat={"dd/MM/yyyy"} 
                        showIcon 
                        selected={taskDeadline}
                        onChange={(date) => date ? setTaskDeadline(date) : setTaskDeadline(taskDeadline)}
                        portalId="popper-calendar"
                    />
                </div>
                <div className='buttons'>
                    <button
                        onClick={() => {
                            addDoc(tasksCollection, {
                                task: taskTitle,
                                deadline: taskDeadline.getTime(),
                                status: false,
                                user_id: user.uid,
                                top_project_id: props.project.id,
                            });
                            setCreateTask(false);
                        }}
                        >
                        יצירה
                    </button>
                    <button
                        onClick={() => setCreateTask(false)}
                        >
                        ביטול
                    </button>
                </div>
            </div>
            }
        </div>
        <div className='tasks'>
            {
                tasks.map((task) => <div className='task-container'>
                    {
                        editTask?.id !== task.id
                        ? <div className='task'>
                            <p style={taskStyle} >{task.task}</p>
                            <p>{new Date(task.deadline).toLocaleDateString("he-IL")}</p>
                            <div className='status'>
                                <Checkbox 
                                    checked={task.status}
                                    updateFunc={() => {
                                        setUpdating(true);
                                        updateDoc(doc(tasksCollection, task.id), {
                                                status: !task.status
                                            })
                                        .then(() => setUpdating(false));
                                    }}
                                />
                                <p>{task.status ? 'בוצע' : 'לא בוצע'}</p>
                            </div>
                            <div className='buttons'>
                                <button
                                    className='edit-button'
                                    onClick={() => {
                                        setTaskTitle(task.task);
                                        setTaskDeadline(new Date(task.deadline))
                                        setEditTask(task);
                                    }}
                                    >
                                    <BiEditAlt />
                                </button>
                                <button
                                    className='delete-button'
                                    onClick={() => setDeleteTaskReference(doc(tasksCollection, task.id))}
                                    >
                                    <MdDeleteForever />
                                </button>
                            </div>
                        </div>
                        : <div className='edit-task-form'>
                            <div className="text-box">
                                <label htmlFor="task-input" >משימה: </label>
                                <textarea 
                                    className="task-input" 
                                    style={{background: "#ffffff57",
                                            width: "85%",
                                            borderRadius: "4px",
                                            fontSize: "14px",
                                            fontFamily: "Segoe UI",
                                            marginTop: "6px"
                                        }}
                                    id="task-input"
                                    value={taskTitle}
                                    onChange={e => setTaskTitle(e.target.value)}
                                    placeholder="משימה ריקה"
                                    autoFocus
                                    cols={34}
                                    rows={6}
                                />
                            </div>
                            <div className="deadline_collaborators_image">
                                <div className="set-deadline">
                                    <label>
                                        דד-ליין:
                                    </label>
                                    <DatePicker 
                                        wrapperClassName={"datepicker-wrapper"} 
                                        dateFormat={"dd/MM/yyyy"} 
                                        showIcon 
                                        selected={taskDeadline} 
                                        onChange={(date) => 
                                            date 
                                            ? setTaskDeadline(date) 
                                            : setTaskDeadline(new Date(task.deadline))
                                        }
                                        portalId="popper-calendar"
                                    />
                                </div>
                            </div>
                            <div className="confirmation-buttons">
                                <button onClick={() => {
                                    updateTask(taskTitle, taskDeadline, tasksCollection, editTask.id);
                                    setEditTask({});
                                }}>
                                    שמירת שינויים
                                </button>
                                <button onClick={() => setEditTask({})}>ביטול</button>
                            </div>
                        </div>
                    }
                </div>)
            }
        </div>
        <Popup
            open={deleteTaskReference !== null}
            >
            <ConfirmationBox 
                onCancel={() => setDeleteTaskReference(null)}
                onConfirm={() => {
                    deleteTaskReference && deleteDoc(deleteTaskReference);
                    setDeleteTaskReference(null);
                }}
                message='להמשך מחיקת המשימה יש ללחוץ על אישור.'
            />
        </Popup>
    </div>
}