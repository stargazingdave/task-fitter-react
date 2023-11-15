import './Protocol.scss';

import { doc } from 'firebase/firestore';
import { useFirestoreDocData } from 'reactfire';
import { ProtocolProject } from './ProtocolProject';
import { FiSave } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../reduxHooks';
import { selectUser } from '../../redux/userSlice';
import { selectDb } from '../../redux/databaseSlice';
import { TbMailSearch } from 'react-icons/tb';
import { selectOpenContacts } from '../../redux/contactsSlice';
import { ContactList } from '../contacts/ContactList';


type ProtocolProps = {
}

const actions = {}; // key-value map. key - task id, value - action(function)

const addSaveAction = (taskId: string, action: () => void) => {
    actions[taskId] = action;
}

const save = () => {
    Object.keys(actions).forEach(taskId => {
        actions[taskId]();
    })
    alert("כל המשימות עודכנו בפרויקט");
}

export const Protocol = (props: ProtocolProps) => {
    const openContacts = useAppSelector(selectOpenContacts);
    const db = useAppSelector(selectDb);
    let { id } = useParams(); //extract from URL id="..."

    const { status, data: project } = useFirestoreDocData(doc(db, 'projects', id || ''), { idField: 'id', });

    if (status === 'loading') {
        return <p>טוען פרוטוקול...</p>;
    }

    if (!project) {
        return <p>פרויקט לא קיים</p>
    }

    return <div className='protocol-page'>
        <div className='protocol-container'>
            <div className="headers-container">
                <div className="headers">
                    <div className='tasks-header'>משימה: </div>
                    <div className='collaborators-header'>משתתפים: </div>
                    <div className='deadline-header'>דד-ליין: </div>
                </div>
            </div>
            <h1>פרוטוקול פרויקט: {project.project_name}</h1>
            <ProtocolProject 
                project={project}
                path={'projects/' + project.id}
                addSaveAction={addSaveAction} />
            <div className="buttons">
                <button 
                    title='שמירת כל השינויים בפרויקט'
                    onClick={save}
                    type='submit'
                    className='save-button' >
                        שמירת הפרויקט <FiSave size={28} />
                </button>
                <a 
                    title='תצוגה מקדימה של הפרוטוקול לפני שליחה'
                    className="preview-link" 
                    target="_blank" 
                    href={"/protocol-preview/" + id}>
                        תצוגה מקדימה <TbMailSearch size={28} />
                </a>
            </div>

        </div>
        {
            openContacts &&
            <ContactList />
        }
    </div>
}

