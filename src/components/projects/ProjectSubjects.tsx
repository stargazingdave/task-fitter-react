import React, { useState } from 'react';

import './ProjectSubjects.scss';


// Import the functions you need from the SDKs you need
import { DocumentData, addDoc, collection, doc, or, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { useFirestoreCollectionData} from 'reactfire';
import { deleteSubject, getSubjectsPath } from '../../utils';
import { ProjectTasks } from './ProjectTasks';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import Popup from 'reactjs-popup';
import { ConfirmationBox } from '../general/ConfirmationBox';
import { BiEditAlt, BiListPlus } from 'react-icons/bi';
import { MdDeleteForever } from 'react-icons/md';
import { useAppDispatch, useAppSelector } from '../../reduxHooks';
import { selectUser } from '../../redux/userSlice';
import { selectDb } from '../../redux/databaseSlice';
import { store } from '../../store';
import { selectProjectStack } from '../../redux/projectsSlice';


type ProjectSubjectsProps = {
}





export const ProjectSubjects = (props: ProjectSubjectsProps) =>  {
    const user = useAppSelector(selectUser);
    const projectStack = useAppSelector(selectProjectStack);
    const subjectsPath = getSubjectsPath(projectStack);
    const db = useAppSelector(selectDb);
    const subjectsCollection = collection(db, subjectsPath);
    
    const subjectsQuery = query(subjectsCollection,
            where("top_project_id", "==", projectStack[0].id),
            orderBy("creation_time", "asc"));
    
    const [createSubjectFlag, setCreateSubjectFlag] = useState(false);
    const [editSubject, setEditSubject] = useState({} as DocumentData);
    const [subjectName, setSubjectName] = useState('');
    const [subjectDeletePopup, setSubjectDeletePopup] = useState({} as DocumentData);
    const { status, data: subjects } = useFirestoreCollectionData(subjectsQuery, { idField: 'id',});
    
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
                        className='new-subject-button' 
                        onClick={() => setCreateSubjectFlag(!createSubjectFlag)}>
                            <BiListPlus size={30}/>
                            נושא חדש בפרויקט
                        </button>
                    : <div className='form'>
                        <h1>נושא חדש</h1>
                        <label>
                            כותרת:
                            <input
                                value={subjectName}
                                onChange={e => setSubjectName(e.target.value)}
                                type="string" />
                        </label>
                        <div className='buttons'>
                            <button onClick={() => {
                                    if (subjectName == '') {
                                        alert('לא ניתן ליצור נושא ללא כותרת');
                                        return;
                                    }
                                    addDoc(collection(db, subjectsPath), {
                                        title: subjectName || '',
                                        creation_time: new Date().getTime(),
                                        user_id: user.uid,
                                        top_project_id: projectStack[0].id,
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
                    </div>
                }
            </div>
        </div>
        <>
            {subjects.map(subject => (
                <div className='subject' key={subject.id}>
                    <div className='subject-title'>
                        <h1>{subject.title}</h1>
                        {
                            editSubject?.id != subject.id
                            ? <div className='buttons'>
                                <button 
                                    title='מחיקת הנושא'
                                    className='delete-button'
                                    onClick={() => setSubjectDeletePopup(subject)}>
                                        <MdDeleteForever size={20}/>
                                </button>
                                <button 
                                    title='עריכת הנושא'
                                    className='edit-button'
                                    onClick={() => {
                                        setEditSubject(subject);
                                        setSubjectName(subject.title)
                                    }}>
                                        <BiEditAlt size={20}/>
                                </button>
                            </div>
                            : <div className="edit-subject-form">
                                <label className="title">
                                    נושא:
                                </label>
                                <input
                                    value={subjectName}
                                    onChange={e => setSubjectName(e.target.value)}
                                    type="string"
                                    autoFocus
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
                                            setSubjectName('');
                                            setEditSubject({});
                                        }}
                                        className="save-button" 
                                        title="אישור" >
                                            <AiOutlineCheck size={20} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setSubjectName('');
                                            setEditSubject({});
                                        }}
                                        className="cancel-button" 
                                        title="ביטול" >
                                            <AiOutlineClose size={20} />
                                    </button>
                                </div>
                            </div>
                        }
                    </div>
                    <ProjectTasks
                        tasksCollection={collection(db, getSubjectsPath(projectStack), subject.id, 'tasks')} 
                        />
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
                            // delete subject and nested data
                            deleteSubject(store.getState(), doc(db, subjectsPath, subjectDeletePopup.id), getSubjectsPath(projectStack) + '/');
                            setSubjectDeletePopup({});
                        }}
                        onCancel={() => setSubjectDeletePopup({})} />
                </Popup>
            }
        </>
    </div>
}

