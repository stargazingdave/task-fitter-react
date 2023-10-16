import './Protocol.scss';

// Import the functions you need from the SDKs you need
import { doc } from 'firebase/firestore';
import { useFirestore, useFirestoreDocData } from 'reactfire';
import { User } from 'firebase/auth';
import { ProtocolProject } from './ProtocolProject';
import { FiSave } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';


type ProtocolProps = {
    user: User;
    protocolOpen: boolean;
    onClose?: (protocolOpen: boolean) => void;
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

/*
   method1: html2canvas
    images don't work
    some css properties broken

   method2: capture screen
    captures only only visible area
    so we tried to zoom out, but the quality isn't good enough to see details 
    this solution sucks
 */


export const Protocol = (props: ProtocolProps) => {
    const db = useFirestore();

    let { id } = useParams(); //extract from URL id="..."

    const { status, data: project } = useFirestoreDocData(doc(db, 'projects', id || ''), { idField: 'id', });

    if (status === 'loading') {
        return <p>טוען פרוטוקול...</p>;
    }

    if (!project) {
        return <p>פרויקט לא קיים</p>
    }

    return <div className='protocol-container'>
        <h1>פרוטוקול פרויקט: {project.project_name}</h1>
        <ProtocolProject user={props.user}
            project={project}
            db={db}
            path={'projects/' + project.id}
            addSaveAction={addSaveAction} />
        <div className="buttons">
            <button 
                title='שמירת כל השינויים בפרויקט'
                onClick={save}
                type='submit'
                className='save-button' >
                <FiSave size={"60px"} />
            </button>
            <a 
                title='תצוגה מקדימה של הפרוטוקול לפני שליחה'
                className="preview-link" 
                target="_blank" 
                href={"/protocol-preview/" + id}>
                    תצוגה מקדימה
            </a>
        </div>
    </div>
}

