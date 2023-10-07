import { CollectionReference, DocumentData, doc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";

export const getProjectsPath = (array: DocumentData[]) => {
    return array.length != 0 
    ? 'projects/' + array.map(project => project.id).join('/projects/') + '/projects'
    :'projects/'; 
}

export const getTasksPath = (array: DocumentData[]) => {
    return 'projects/' + array.map(project => project.id).join('/projects/') + '/tasks'; 
}

export const getSubjectsPath = (array: DocumentData[]) => {
    return 'projects/' + array.map(project => project.id).join('/projects/') + '/subjects'; 
}

export const uploadImage = async (imageName: string, 
                            image: File | null,
                            tasksCollection: CollectionReference) => {
    if (image != null) {
        const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
        });
        let image64 = await toBase64(image);
                    updateDoc(doc(tasksCollection, imageName), {
                        image: image64
                    });
            }
}

export const deleteImage = (imageName: string) => {
    const storage = getStorage();
    // Create a reference to the file to delete
    const imageRef = ref(storage, 'images/' + imageName);
    // Delete the file
    deleteObject(imageRef).then(() => {
        // File deleted successfully
    }).catch((error) => {
        // Uh-oh, an error occurred!
    });
}

export {}