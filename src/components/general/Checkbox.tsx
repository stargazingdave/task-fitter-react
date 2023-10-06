import { useState } from "react"
import "./Checkbox.scss"
import { DocumentData } from "firebase/firestore";

type CheckboxProps = {
    updateFunc: (task: DocumentData) => void;
    task: DocumentData;
}

export const Checkbox = (props: CheckboxProps) => {
    const [isChecked, setIsChecked] = useState(props.task.status)

    const checkHandler = () => {
        setIsChecked(!isChecked);
        props.updateFunc(props.task);
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
