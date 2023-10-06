import { useState } from "react";

type ImageContainerProps = {
    imageURL: string;
}

export const ImageContainer = (props: ImageContainerProps) => {
    const [displayImage, setDisplayImage] = useState(false);
    if (displayImage) {
        return <div className="image-container">
            <button 
                className="open-pic" 
                onClick={() => setDisplayImage(!displayImage)} >
                    סגירת תמונה
            </button>
            <img src={props.imageURL} alt="תמונה"  style={{scale: "90%", width: "inherit"}} />
        </div>
    }
    else {
        return <button 
            className="open-pic" 
            onClick={() => setDisplayImage(!displayImage)} >
                פתיחת תמונה
        </button>
    }
}