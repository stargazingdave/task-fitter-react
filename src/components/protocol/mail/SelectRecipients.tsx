import './ProtocolAttachment.scss';
import { DocumentData } from 'firebase/firestore';
import { useAppSelector } from '../../../reduxHooks';
import { selectContacts, selectOpenContacts } from '../../../redux/contactsSlice';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { useEffect } from 'react';

type SelectRecipientsProps = {
    recipients: any;
    setRecipients: (recipients: any) => void;
    tasks: DocumentData[];
    project: DocumentData;
}

const animatedComponents = makeAnimated();


export const SelectRecipients = (props: SelectRecipientsProps) => {
    const contacts = useAppSelector(selectContacts);
    
    // Create arrays for the Select component.
    // Format: [{value: email, label: name}]

    // Array of options to choose from.
    // let contactsOptions = contacts?.map((contact) => ({value: contact.email, label: contact.name}));
    const contactsOptions = contacts
        ?.filter((contact) => props.project.participants?.includes(contact.email))
        .map((contact) => ({value: contact.email, label: contact.name}));

    // Array of people who have tasks assigned to them.
    let taskCollaborators = [] as {value: 'string', label: 'string'}[];
    useEffect(() => {
        
        debugger
        props.tasks.forEach((task) => {
            task.collaborators?.map((collaborator) => {
                const contact = contacts.find((contact) => contact.email === collaborator);
                if (contact) {
                    !taskCollaborators.some(item => item.value === contact.email) &&
                    taskCollaborators.push({value: contact.email, label: contact.name});
                }
                else {
                    taskCollaborators.push({value: collaborator, label: collaborator});
                }
            });
        });
        let temp = {count: 0};
            taskCollaborators.forEach((item) => {
                const contact = contacts.find((contact) => contact.email === item.value);
                temp[item.value] = {contact, tasks: []};
                temp.count++;
            });
            props.setRecipients(temp);
    }, [props.tasks])



    return (
        <div className='select-recipients'>
            <h2>בחירת נמענים:</h2>
            <label>אנשים שיש באחריותם משימות נוספים באופן אוטומטי.</label>
            {contacts && <Select 
                styles={{
                    control: (baseStyles, state) => ({
                        ...baseStyles,
                        background: "none",
                        padding: "10px",
                        margin: "10px",
                        maxWidth: "270px",
                    }),
                    multiValue: (baseStyles, state) => ({
                        ...baseStyles,
                        fontSize: 14,
                        width: "fit-content",
                    }),
                    valueContainer: (baseStyles, state) => ({
                        ...baseStyles,
                        fontSize: 14,
                        width: "fit-content",
                        border: "none",
                        gap: "10px"
                    }),
                }}
                options={contactsOptions} 
                closeMenuOnSelect={false}
                components={animatedComponents}
                isMulti
                defaultValue={taskCollaborators}
                onChange={(value) => {
                    let temp = {count: 0};
                    value.forEach((item) => {
                        const contact = contacts.find((contact) => contact.email === item.value);
                        temp[item.value] = {contact, tasks: []};
                        temp.count++;
                    });
                    props.setRecipients(temp);
                }}
            />}
        </div>
    );

}
