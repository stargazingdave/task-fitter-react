//import "./SaveConfirmBox.scss"

type SaveConfirmBoxProps = {
    trigger: boolean;
    confirm: boolean;
    onConfirm: (trigger: boolean, confirm: boolean) => void;
    onCancel: (trigger: boolean, confirm: boolean) => void;
}

export const SaveConfirmBox = (props: SaveConfirmBoxProps) => {

    return (
        <div className="confirm-box">
            <button onClick={() => props.onConfirm(props.trigger, props.confirm)} >
                אישור
            </button>
            <button onClick={() => props.onCancel(props.trigger, props.confirm)} >
                ביטול
            </button>
        </div>
    )
}
