import { 
    CollectionReference, 
    DocumentData, 
    DocumentReference, 
    collection, 
    deleteDoc, 
    doc, 
    getDocs, 
    query, 
    updateDoc, 
    where 
} from "firebase/firestore";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { RootState } from "./store";

// `path` needs to be to the project document.
// for example: `projects/<someProjectId>`
export const deleteProject = async (
    reduxState: RootState,
    path: string
) => {
    const db = reduxState.database.db;
    const user = reduxState.user.user;
    // delete sub projects
    const subProjectsCollection = collection(db,
        path, 'projects');
    const subProjectsQuery = query(subProjectsCollection,
        where("user_id", "==", user.uid || 0));
    const subProjectsQuerySnapshot = await getDocs(subProjectsQuery);
    subProjectsQuerySnapshot.size > 0 && 
    subProjectsQuerySnapshot.forEach(async (subProject) => {
        await deleteProject(reduxState,
            path + '/projects/' + subProject.id);
    });

    // delete all subjects and tasks
    const subjectsCollection = collection(db,
        path, 'subjects');
    const subjectsQuery = query(subjectsCollection,
        where("user_id", "==", user.uid || 0));
    const subjectsQuerySnapshot = await getDocs(subjectsQuery);
    subjectsQuerySnapshot.size > 0 && 
    subjectsQuerySnapshot.forEach(async (subject) => {
        await deleteSubject(reduxState,
            doc(subjectsCollection, subject.id),
            path + '/subjects/');
    });

    // delete project
    deleteDoc(doc(db, path));
}

// `path` needs to be to the collection containing the subject, with '/' in the
// end.
// for example: `projects/<someProjectId>/subjects/`
export const deleteSubject = async (
    reduxState: RootState,
    subject: DocumentReference,
    path: string
) => {
    const db = reduxState.database.db;
    const user = reduxState.user.user;
debugger
    // delete tasks
    const tasksCollection = collection(db,
        path + subject.id + '/' + 'tasks');
    const tasksQuery = query(tasksCollection,
        where("user_id", "==", user.uid || 0));
    const tasksQuerySnapshot = await getDocs(tasksQuery);
    tasksQuerySnapshot.size > 0 && 
    tasksQuerySnapshot.forEach(async (task) => {
        deleteDoc(doc(tasksCollection, task.id));
    });

    // delete subject
    deleteDoc(doc(db, path + subject.id));
}

export const getProjectsPath = (array: DocumentData[]) => {
    return array.length != 0
        ? 'projects/' + array.map(project => project.id).join('/projects/') + '/projects/'
        : 'projects/';
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

export { }