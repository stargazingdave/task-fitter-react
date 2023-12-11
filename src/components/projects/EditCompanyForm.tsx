import { User } from "firebase/auth";
import { DocumentData, Firestore, addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import "./EditCompanyForm.scss"
import { useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";
import { selectDb } from "../../redux/databaseSlice";
import { RiImageAddLine, RiImageEditLine } from "react-icons/ri";

type EditCompanyFormProps = {
  company: DocumentData;
  onCompanyEdit: (company: DocumentData) => void;
}

const updateCompany = async (
        props: EditCompanyFormProps, 
        db: Firestore,
        companyName: string, 
        logoImage: File | null,
        user: User,
    ) => {
    if (companyName == '') {
        alert('לא ניתן ליצור חברה ללא שם');
        return;
    }
    const docRef = doc(collection(db, 'companies'), props.company.id);
    await updateDoc(docRef, {
        company_name: companyName,
        update_time: Date.now(),
        editor_name: user.displayName,
    }).then(async () => {
        if (logoImage != null) {
            const toBase64 = file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
            });
            let image64 = await toBase64(logoImage);
            updateDoc(doc(collection(db, 'companies'), docRef.id), {
                logo: image64
            });
        }
    });
    
    props.onCompanyEdit({});
}



export const EditCompanyForm = (props: EditCompanyFormProps) => {
    const user = useAppSelector(selectUser);
    const db = useAppSelector(selectDb);
    const [companyName, setCompanyName] = useState(props.company.company_name);
    const [logoImage, setLogoImage] = useState<File | null>(props.company.logo ? props.company.logo : null);

    return (
        <div className="create-company-form">
            <h1>יצירת חברה חדשה</h1>
            <label>
                שם החברה:
            </label>
            <input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                type="string" 
                autoFocus
                />
            <label>
                לוגו:
            </label>
            <label className="image-upload">
                {
                    logoImage
                    ? <div className="current-image"><h1>{logoImage.name}</h1><RiImageEditLine size={25}/></div>
                    : <RiImageAddLine size={25}/>
                }
                <br></br>
                <input
                    type="file" 
                    onChange={e => {
                        let files: FileList | null;
                        e.target.files
                        ? files = e.target.files
                        : files = null;
                        let tempImage = {} as File;
                        files && (tempImage = files[0]);
                        tempImage && setLogoImage(tempImage);
                    }} 
                    hidden 
                />
            </label>
            <div className="buttons">
                <button onClick={() => {updateCompany(props, db, companyName, logoImage, user)}}>
                    שמירה
                </button>
                <button onClick={() => props.onCompanyEdit({})}>
                    ביטול
                </button>
            </div>
        </div>
        )
}