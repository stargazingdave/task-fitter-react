import './ConfirmationBox.scss'

type ConfirmationBoxProps = {
    onConfirm: () => void;
    onCancel: () => void;
    message?: string;
}

export const ConfirmationBox = (props: ConfirmationBoxProps) => {
    return <div className="confirmation-box">
        <p>
            {
                props.message
                ? props.message
                : 'להמשך ביצוע הפעולה יש ללחוץ על אישור'
            }
        </p>
        <div className="buttons">
            <button onClick={() => props.onConfirm()}>אישור</button>
            <button onClick={() => props.onCancel()}>ביטול</button>
        </div>
    </div>
}