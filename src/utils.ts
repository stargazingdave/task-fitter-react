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

export const uploadImage = (imageName: string, 
                            image: File | null,
                            tasksCollection: CollectionReference) => {
    if (image != null) {
        // Create a root reference
        const storage = getStorage();

        // Create the file metadata
        /** @type {any} */
        const metadata = {
            contentType: 'image/jpeg'
        };
        

        // Upload file and metadata to the object 'images/mountains.jpg'
        const storageRef = ref(storage, 'images/' + imageName);
        const uploadTask = uploadBytesResumable(storageRef, image, metadata);

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed',
            (snapshot) => {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
                }
            }, 
            (error) => {
                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                case 'storage/unauthorized':
                    // User doesn't have permission to access the object
                    break;
                case 'storage/canceled':
                    // User canceled the upload
                    break;

                // ...

                case 'storage/unknown':
                    // Unknown error occurred, inspect error.serverResponse
                    break;
                }
            }, 
            async () => {
                // Upload completed successfully, now we can get the download URL
                await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    updateDoc(doc(tasksCollection, imageName), {
                        image: downloadURL
                    });
                });
            }
        );
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