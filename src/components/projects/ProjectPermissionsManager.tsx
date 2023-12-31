import { DocumentData, DocumentReference, updateDoc } from "firebase/firestore";
import "./ProjectPermissionsManager.scss";
import { useAppDispatch, useAppSelector } from "../../reduxHooks";
import { selectContacts } from "../../redux/contactsSlice";
import { useRef, useState } from "react";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { selectProjectStack, setProjectStack } from "../../redux/projectsSlice";

type ProjectPermissionsManagerProps = {
    project: DocumentData;
    projectReference: DocumentReference;
    setOpen: (boolean) => void;
}

const animatedComponents = makeAnimated();

const updateProject = (
        props: ProjectPermissionsManagerProps, 
        newPermissions: string[],
        dispatch: any,
        projectStack: DocumentData[],
        setSaving: (boolean) => void
    ) => {
    let tempProjectStack = [...projectStack];
    tempProjectStack[0] = {...tempProjectStack[0], shared_emails: newPermissions};
    dispatch(setProjectStack(tempProjectStack));
    updateDoc(props.projectReference, {shared_emails: newPermissions})
        .then(() => {
            setSaving(false);
            alert('הרשאות הגישה לפרויקט עודכנו בהצלחה')
        });
}

export const ProjectPermissionsManager = (props: ProjectPermissionsManagerProps) => {
    const dispatch = useAppDispatch();
    const contacts = useAppSelector(selectContacts);
    const projectStack = useAppSelector(selectProjectStack);
    let contactsOptions = contacts.map((contact) => ({value: contact.email, label: contact.name}));
    
    const selectedOptions = contacts
        .filter((contact) => props.project.shared_emails?.includes(contact.email))
        .map((contact) => ({value: contact.email, label: contact.name}));
    const selectContactRef = useRef<any>(null);

    const [saving, setSaving] = useState(false);

    return (
        <div className="permissions-manager">
            <h1>חשבונות בעלי גישה לפרויקט:</h1>
            <Select 
                ref={selectContactRef}
                options={contactsOptions} 
                closeMenuOnSelect={false}
                components={animatedComponents}
                isMulti
                defaultValue={selectedOptions}
            />
            <div className="buttons">
                <button 
                    className="save-button"
                    onClick={() => {
                    const comp = selectContactRef.current;
                    const newPermissions = comp.getValue().map((value) => value.value);
                    updateProject(props, newPermissions, dispatch, projectStack, setSaving);
                    props.setOpen(false);
                }}>
                    שמירת שינויים
                </button>
                <button 
                    className="close-button" 
                    onClick={() => props.setOpen(false)}>
                        סגירה
                </button>
            </div>
        </div>
    )
}