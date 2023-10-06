import './ProtocolConfirmationBox.scss'

type ConfirmationBoxProps = {
    onConfirm: () => void;
    onCancel: () => void;
    object: string;
}

export const ProtocolConfirmationBox = (props: ConfirmationBoxProps) => {
    return <div className="confirmation-box">
        <p>פעולה זו תמחק את {props.object} לתמיד <b>גם מחוץ לפרוטוקול</b>. האם להמשיך במחיקה?</p>
        <div className="buttons">
            <button onClick={() => props.onConfirm()}>אישור</button>
            <button onClick={() => props.onCancel()}>ביטול</button>
        </div>
    </div>
}