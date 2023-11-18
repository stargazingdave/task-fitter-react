import { useState } from "react";

type ImageContainerProps = {
    imageURL: string;
}

export const ImageContainer = (props: ImageContainerProps) => {
    return <div className="image-container">
        <img src={props.imageURL} alt="תמונה"  style={{scale: "90%", width: "inherit"}} />
    </div>
}