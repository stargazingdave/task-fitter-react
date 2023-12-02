import { 
    CollectionReference, 
    DocumentData, 
    DocumentReference, 
    collection, 
    deleteDoc, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    updateDoc, 
    where 
} from "firebase/firestore";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { RootState, store } from "./store";
import jsPDF from "jspdf";
import './fonts/tahoma-normal';
import './fonts/tahomabd-bold';
import './fonts/segoeui-normal';
import './fonts/segoeuib-bold';


// --------- Deletion Functions ---------
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
// -----------------------------------------------



// --------- Protocol Creation Functions ---------
// `path` needs to be to the project document.
// for example: `projects/<someProjectId>`
export const projectToProtocolArray = async (
    reduxState: RootState,
    path: string,
    protocolArray: any[],
    contacts: DocumentData[]
) => {
    const db = reduxState.database.db;
    const user = reduxState.user.user;

    // Add project's name and subjects
    const projectDoc = await getDoc(doc(db, path));

    if (projectDoc.exists()) {
        const projectData = {
            projectName: projectDoc.data().project_name,
            subjects: [] as any[],
        };

        // Add each subject as object
        const subjectsCollection = collection(db, path, 'subjects');
        const subjectsQuery = query(subjectsCollection, where("user_id", "==", user.uid || 0));
        const subjectsQuerySnapshot = await getDocs(subjectsQuery);

        if (subjectsQuerySnapshot.size > 0) {
            // Use for...of loop to ensure proper order of processing
            for (const subject of subjectsQuerySnapshot.docs) {
                const subjectObject = await subjectToProtocolArray(reduxState, doc(subjectsCollection, subject.id), path + '/subjects/', contacts);
                projectData.subjects.push(subjectObject);
            }
        }

        protocolArray.push(projectData);

        // Add sub projects
        const subProjectsCollection = collection(db, path, 'projects');
        const subProjectsQuery = query(subProjectsCollection, where("user_id", "==", user.uid || 0));
        const subProjectsQuerySnapshot = await getDocs(subProjectsQuery);

        if (subProjectsQuerySnapshot.size > 0) {
            // Use for...of loop to ensure proper order of processing
            for (const subProject of subProjectsQuerySnapshot.docs) {
                await projectToProtocolArray(reduxState, path + '/projects/' + subProject.id, protocolArray, contacts);
            }
        }
    } else {
        alert('קרתה שגיאה');
    }

    return protocolArray;
}


export const subjectToProtocolArray = async (
    reduxState: RootState,
    subject: DocumentReference,
    path: string,
    contacts: DocumentData[]
) => {
    const subjectObject = {name: '', tasksArray: [] as any[]};
    const db = reduxState.database.db;
    const user = reduxState.user.user;

    try {
        // Add subject's name
        const subjectDoc = await getDoc(doc(db, path + subject.id));
        if (subjectDoc.exists()) {
            subjectObject.name = subjectDoc.data().title;

            // Add tasks
            const tasksCollection = collection(db, path + subject.id + '/' + 'tasks');
            const tasksQuery = query(tasksCollection, where("user_id", "==", user.uid || 0));
            const tasksQuerySnapshot = await getDocs(tasksQuery);

            if (tasksQuerySnapshot.size > 0) {
                tasksQuerySnapshot.forEach(async (task) => {
                    let taskObject = {} as any;
                    let collaborators = [] as string[];
                    const collaboratorsEmails = await task.data().collaborators;
                    collaboratorsEmails.forEach((collaborator) => {
                        collaborator = contacts.find((contact) => {
                            return contact.email === collaborator;
                        });
                        collaborators.push(collaborator?.name);
                    });

                    if (task.data().image) {
                        const image = new Image();
                        image.src = task.data().image;
                        taskObject = {
                            task: task.data().task,
                            deadline: new Date(task.data().deadline).toLocaleDateString("he-IL"),
                            collaborators: collaborators.join(', '),
                            status: task.data().status ? 'בוצע' : 'לא בוצע',
                            image: image
                        }
                    } else {
                        taskObject = {
                            task: task.data().task,
                            deadline: new Date(task.data().deadline).toLocaleDateString("he-IL"),
                            collaborators: collaborators.join(', '),
                            status: task.data().status ? 'בוצע' : 'לא בוצע'
                        }
                    }
                    subjectObject.tasksArray.push(taskObject);
                });
            }
        } else {
            console.error('Subject document does not exist');
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }

    return subjectObject;
}

// `path` needs to be to the project document.
// for example: `projects/<someProjectId>`
export const createProtocol = async (
    project: DocumentData, 
    contacts: DocumentData[]
    ): Promise<jsPDF> => {
    const currentDate = new Date();
    const pdfTitle = 'פרוטוקול ' + currentDate.toLocaleDateString("he-IL");
    let tasksTable = await projectToProtocolArray(store.getState(), 
    'projects/' + project.id, [], contacts);
    console.log(tasksTable);
    
    // Create a new jsPDF instance
    let pdf = new jsPDF({compress: true});

    // Set font and font size
    pdf.setFont('segoeuib', 'bold');
    pdf.setFontSize(14);

    // Set up table headers
    const headers = ['משימה', 'דדליין', 'אחראיים', 'סטטוס'];

    // Set initial position for the table
    let yPosition = 20;

    // Set text direction to right-to-left
    pdf.setR2L(true);

    // Define cells' width and margin
    const subjectWidth = 35;
    const taskWidth = 55;
    const deadlineWidth = 30;
    const collaboratorsWidth = 55;
    const statusWidth = 25;
    const taskHeadersWidth = [taskWidth, deadlineWidth, collaboratorsWidth, statusWidth]
    const cellMargin = 3;
    let lineHeight = 0;

    // Loop through data and draw the rows with added margins
    await Promise.all(tasksTable.map(async (row, rowIndex) => {
        pdf.setFont('segoeuib', 'bold');
        const cellText = pdf.splitTextToSize(row.projectName, pdf.internal.pageSize.width - 55 - 2 * cellMargin);
        const cellHeight = cellText.length * 5; // Adjust the multiplier based on font size
        const cellWidth = 50;
        yPosition += 2 * cellMargin;
        pdf.text(row.projectName, pdf.internal.pageSize.width - 55 - cellWidth, yPosition + 2 * cellMargin, { align: 'center', maxWidth: cellWidth * 4 - cellMargin });
        pdf.rect(55 - cellWidth, yPosition, 200, cellHeight + 2 * cellMargin);
        yPosition += cellHeight;
        let cellPosition = subjectWidth + 5;
        // Loop through headers and draw them with added margins and borders
        pdf.text(headers[0], pdf.internal.pageSize.width - cellPosition - taskWidth / 2, yPosition + 5 + 2 * cellMargin, { align: 'center', maxWidth: taskWidth - cellMargin });
        // Draw cell border with added margins
        cellPosition += taskWidth;
        pdf.rect(pdf.internal.pageSize.width - cellPosition, yPosition + 2 * cellMargin, taskWidth, 5 + 2 * cellMargin);
        
        pdf.text(headers[1], pdf.internal.pageSize.width - cellPosition - deadlineWidth / 2, yPosition + 5 + 2 * cellMargin, { align: 'center', maxWidth: deadlineWidth - cellMargin });
        // Draw cell border with added margins
        cellPosition += deadlineWidth;
        pdf.rect(pdf.internal.pageSize.width - cellPosition, yPosition + 2 * cellMargin, deadlineWidth, 5 + 2 * cellMargin);
        
        pdf.text(headers[2], pdf.internal.pageSize.width - cellPosition - collaboratorsWidth / 2, yPosition + 5 + 2 * cellMargin, { align: 'center', maxWidth: collaboratorsWidth - cellMargin });
        // Draw cell border with added margins
        cellPosition += collaboratorsWidth;
        pdf.rect(pdf.internal.pageSize.width - cellPosition, yPosition + 2 * cellMargin, collaboratorsWidth, 5 + 2 * cellMargin);
        
        pdf.text(headers[3], pdf.internal.pageSize.width - cellPosition - statusWidth / 2, yPosition + 5 + 2 * cellMargin, { align: 'center', maxWidth: statusWidth - cellMargin });
        // Draw cell border with added margins
        cellPosition += statusWidth;
        pdf.rect(pdf.internal.pageSize.width - cellPosition, yPosition + 2 * cellMargin, statusWidth, 5 + 2 * cellMargin);    
        yPosition += lineHeight + 5 + 4 * cellMargin;
        row.subjects.forEach((subject, subjectIndex) => {
            let subjectHeight = 0;
            subject.tasksArray.forEach((task, taskIndex) => {
                cellPosition = subjectWidth + 5;
                pdf.setFont('segoeui', 'normal');
                let cellText = pdf.splitTextToSize(task.task, taskHeadersWidth[0] - cellMargin);
                let cellHeight = cellText.length * 5 + 2 * cellMargin; // Adjust the multiplier based on font size
                if (lineHeight < cellHeight) {
                    lineHeight = cellHeight;
                }
                cellText = pdf.splitTextToSize(task.collaborators, taskHeadersWidth[0] - cellMargin);
                cellHeight = cellText.length * 5 + 2 * cellMargin; // Adjust the multiplier based on font size
                if (lineHeight < cellHeight) {
                    lineHeight = cellHeight;
                }
                if (yPosition + lineHeight > pdf.internal.pageSize.height - 20) {
                    pdf.setFont('segoeuib', 'bold');
                    pdf.text(subject.name, 
                        pdf.internal.pageSize.width - 5 - cellMargin, 
                        yPosition - subjectHeight/2 + 2 * cellMargin, 
                        { align: 'right', maxWidth: deadlineWidth - cellMargin });
                    pdf.rect(pdf.internal.pageSize.width - (subjectWidth + 5), 
                        yPosition - subjectHeight, 
                        subjectWidth, 
                        subjectHeight);
                    pdf.addPage();
                    yPosition = 20;
                    subjectHeight = 0;
                    pdf.setFont('segoeui', 'normal');
                } else if (task.image && yPosition + lineHeight + 100 > pdf.internal.pageSize.height - 20) {
                    pdf.setFont('segoeuib', 'bold');
                    pdf.text(subject.name, 
                        pdf.internal.pageSize.width - 5 - cellMargin, 
                        yPosition - subjectHeight/2 + 2 * cellMargin, 
                        { align: 'right', maxWidth: deadlineWidth - cellMargin });
                    pdf.rect(pdf.internal.pageSize.width - (subjectWidth + 5), 
                        yPosition - subjectHeight, 
                        subjectWidth, 
                        subjectHeight);
                    pdf.addPage();
                    yPosition = 20;
                    subjectHeight = 0;
                    pdf.setFont('segoeui', 'normal');
                }
                subjectHeight += lineHeight + 2 * cellMargin;
                pdf.text(task.task, pdf.internal.pageSize.width - cellPosition - cellMargin, yPosition + 2 * cellMargin, { align: 'right', maxWidth: taskWidth - cellMargin });
                // Draw cell border with added margins
                cellPosition += taskWidth;
                pdf.rect(pdf.internal.pageSize.width - cellPosition, yPosition, taskWidth, lineHeight + 2 * cellMargin);
                
                pdf.setR2L(false);
                pdf.text(task.deadline, pdf.internal.pageSize.width - cellPosition - cellMargin, yPosition + 2 * cellMargin, { align: 'right', maxWidth: deadlineWidth - cellMargin });
                // Draw cell border with added margins
                cellPosition += deadlineWidth;
                pdf.rect(pdf.internal.pageSize.width - cellPosition, yPosition, deadlineWidth, lineHeight + 2 * cellMargin);
                
                pdf.setR2L(true);
                pdf.text(task.collaborators, pdf.internal.pageSize.width - cellPosition - cellMargin, yPosition + 2 * cellMargin, { align: 'right', maxWidth: collaboratorsWidth - cellMargin });
                // Draw cell border with added margins
                cellPosition += collaboratorsWidth;
                pdf.rect(pdf.internal.pageSize.width - cellPosition, yPosition, collaboratorsWidth, lineHeight + 2 * cellMargin);
                
                pdf.text(task.status, pdf.internal.pageSize.width - cellPosition - cellMargin, yPosition + 2 * cellMargin, { align: 'right', maxWidth: statusWidth - cellMargin });
                // Draw cell border with added margins
                cellPosition += statusWidth;
                pdf.rect(pdf.internal.pageSize.width - cellPosition, yPosition, statusWidth, lineHeight + 2 * cellMargin);

                if (task.image) {
                    yPosition += lineHeight + 2 * cellMargin;
                    subjectHeight += 90 + 2 * cellMargin;
                    const imageWidth = 90 * (task.image.width/task.image.height);
                    pdf.addImage(task.image, 'JPEG', (pdf.internal.pageSize.width - subjectWidth) / 2 - imageWidth / 2, yPosition + cellMargin, imageWidth, 90);
                    pdf.rect(pdf.internal.pageSize.width - cellPosition, yPosition, statusWidth + collaboratorsWidth + deadlineWidth + taskWidth, 90 + 2 * cellMargin);
                    yPosition += 90 - lineHeight;
                }
                yPosition += lineHeight + 2 * cellMargin;
                lineHeight = 0;
            });
            pdf.setFont('segoeuib', 'bold');
            pdf.text(subject.name, 
                pdf.internal.pageSize.width - 5 - cellMargin, 
                yPosition - subjectHeight/2 + 2 * cellMargin, 
                { align: 'right', maxWidth: deadlineWidth - cellMargin });
            pdf.rect(pdf.internal.pageSize.width - (subjectWidth + 5), 
                yPosition - subjectHeight, 
                subjectWidth, 
                subjectHeight);
            // yPosition -= 2 * cellMargin;
            if (yPosition + subjectHeight > pdf.internal.pageSize.height - 20
                && subjectHeight < pdf.internal.pageSize.height - 40) {
                pdf.addPage()
                yPosition = 20;
            }
        })
        yPosition += 5;
    }));

    // Save the PDF
    // pdf.save('table-document-rtl-with-margins.pdf');
    return pdf;
}
// -----------------------------------------------



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