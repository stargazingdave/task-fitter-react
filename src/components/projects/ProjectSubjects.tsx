import React, { useState } from 'react';

import './ProjectSubjects.scss';


// Import the functions you need from the SDKs you need
import { DocumentData, addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useFirestoreCollectionData} from 'reactfire';
import { User } from 'firebase/auth';
import { getProjectsPath, getSubjectsPath } from '../../utils';
import { ProjectTasks } from './ProjectTasks';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import Popup from 'reactjs-popup';
import { ConfirmationBox } from '../general/ConfirmationBox';
import { FaHammer } from 'react-icons/fa';
import { BiEditAlt } from 'react-icons/bi';
import { CreateTaskForm } from './CreateTaskForm';
import { MdAddTask } from 'react-icons/md';


type ProjectSubjectsProps = {
    onProjectSelected: (projectStack: DocumentData[]) => void;
    user: User;
    projectStack: DocumentData[];
    contacts: DocumentData[];
}





export const ProjectSubjects = (props: ProjectSubjectsProps) =>  {
    const subjectsPath = getSubjectsPath(props.projectStack);
    const db = useFirestore();
    const subjectsCollection = collection(db, subjectsPath);
    const [createSubjectFlag, setCreateSubjectFlag] = useState(false);
    const [createTaskSubjectId, setCreateTaskSubjectId] = useState('');
    const [editSubject, setEditSubject] = useState({} as DocumentData);
    const [subjectName, setSubjectName] = useState('');
    const [subjectDeletePopup, setSubjectDeletePopup] = useState({} as DocumentData);
    const { status, data: subjects } = useFirestoreCollectionData(subjectsCollection, { idField: 'id',});
    
    // check the loading status
    if (status === 'loading') {
        return <p>טוען נושאים...</p>;
    }
    

    return <div className='tasks-area'>
        <div className='tasks-header'>
            <h1>משימות</h1>
            <div className='create-subject'>
            {
                !createSubjectFlag 
                ? <button 
                    className='create-button' 
                    onClick={() => setCreateSubjectFlag(!createSubjectFlag)}>
                        נושא חדש
                    </button>
                : <div className='form'>
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
                            addDoc(collection(db, subjectsPath), {
                                title: subjectName || '',
                                creation_time: new Date().toString()
                            });
                            setSubjectName('');
                            setCreateSubjectFlag(!createSubjectFlag);
                        }}>
                        שמירה
                    </button>
                    <button onClick={() => {
                            setSubjectName('');
                            setCreateSubjectFlag(!createSubjectFlag);
                    }}>ביטול</button>
                </div>
            }
            </div>
        </div>
        
        <>
            {subjects.map(subject => (
                <div className='subject' key={subject.id}>
                    <div >
                    <h1>{subject.title}</h1>
                    <div className='buttons'>
                    {
                        editSubject?.id != subject.id
                        ? <>
                            <button 
                                title='מחיקת הנושא'
                                className='delete-button'
                                onClick={() => setSubjectDeletePopup(subject)}>
                                    <FaHammer size={20}/>
                            </button>
                        </>
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
                                            if (subjectName == '') {
                                                alert('לא ניתן ליצור נושא ללא כותרת');
                                                return;
                                            }
                                            updateDoc(doc(subjectsCollection, editSubject.id), {
                                                title: subjectName
                                                });
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
                    <button 
                        title='עריכת הנושא'
                        className='edit-button'
                        onClick={() => {
                            setEditSubject(subject);
                            setSubjectName(subject.title)
                        }}>
                            <BiEditAlt size={20}/>
                    </button>
                    {createTaskSubjectId == subject.id
                    ? <></>
                    : <button
                        title='משימה חדשה'
                        className='new-task-button' 
                        onClick={() => setCreateTaskSubjectId(subject.id)}>
                        <MdAddTask size={20}/>    
                    </button>}
                    </div>
                    
                    </div>
                    <ProjectTasks   projectStack={props.projectStack}
                                    user={props.user}
                                    tasksCollection={collection(db, getSubjectsPath(props.projectStack), subject.id, 'tasks')} 
                                    contacts={props.contacts} 
                                    createTaskSelected={createTaskSubjectId == subject.id} 
                                    setCreateTaskSubjectId={(createTaskSubjectId: string) => setCreateTaskSubjectId(createTaskSubjectId)} />
                </div>
            ))}
            {
                subjectDeletePopup?.id &&
                <Popup 
                    contentStyle={{width: "300px"}}
                    open={subjectDeletePopup?.id}
                    modal={true}>
                    <ConfirmationBox 
                        onConfirm={() => {
                            deleteDoc(doc(db, subjectsPath, subjectDeletePopup.id));
                            setSubjectDeletePopup({});
                        }}
                        onCancel={() => setSubjectDeletePopup({})} />
                </Popup>
            }
        </>
    </div>
}

