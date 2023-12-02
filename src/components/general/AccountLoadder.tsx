import { CollectionReference, DocumentData, DocumentReference, addDoc, collection, doc, getFirestore, orderBy, query, updateDoc, where } from "firebase/firestore";
import { useState } from "react";
import { useFirebaseApp, useFirestore, useFirestoreCollectionData } from "reactfire";
import { useAppDispatch, useAppSelector } from "../../reduxHooks";
import { selectUser, setIsAdmin } from "../../redux/userSlice";
import { closeContacts, initContacts, openContactsToggle } from "../../redux/contactsSlice";
import { databaseInit } from "../../redux/databaseSlice";
import { userSettingsInit } from "../../redux/userSettingsSlice";

const AccountLoadderInternal = () => {
    const [isAscending, setIsAscending] = useState(true);
    const dispatch = useAppDispatch();
    const db = getFirestore(useFirebaseApp());
    dispatch(databaseInit(db));
    const user = useAppSelector(selectUser);

    user.getIdTokenResult()
    .then((idTokenResult) => {
        // Confirm the user is an Admin.
        if (!!idTokenResult.claims.admin) {
        // Show admin UI.
        } else {
        // Show regular user UI.
        }
        dispatch(setIsAdmin(!!idTokenResult.claims.admin));
    })
    .catch((error) => {
        console.log(error);
    });

    
    
    const contactsCollection = collection(db, 'contacts');
    const contactsQuery = query(contactsCollection,
        where("user_id", "==", user.uid),
        orderBy('name', isAscending ? 'asc' : 'desc'));
    const { status: contactsStatus, data: contacts } = useFirestoreCollectionData(contactsQuery, { idField: 'id',});
    
    dispatch(initContacts({contacts, contactsCollection}));

    const userSettingsCollection = collection(db, 'user_settings');
    const UserSettingsQuery = query(userSettingsCollection,
        where("user_id", "==", user.uid));
    const { status: userSettingsStatus, data: userSettings } = useFirestoreCollectionData(UserSettingsQuery, { idField: 'id',});

    // check the loading status
    if (contactsStatus === 'loading') {
        return <p>אנשי הקשר בטעינה...</p>;
    }
    if (userSettingsStatus === 'loading') {
        return <p>הגדרות בטעינה...</p>;
    }

    // check if new user and initiate settings
    if (userSettings?.length === 1) {
        dispatch(userSettingsInit(userSettings[0]));
    }
    if (userSettings?.length === 0) {
        const temp = {} as DocumentData;
        temp.user_id = user.uid;
        temp.manager_email = user.email;
        temp.demo = true;
        temp.admin = false;
        dispatch(userSettingsInit(temp));
        addDoc(userSettingsCollection, {
            user_id: temp.user_id,
            manager_email: temp.user_id,
            demo: temp.demo,
            admin: temp.admin,
        }).then((docRef) => {
            createDemoProjects()
            .then(() => {
                dispatch(userSettingsInit(temp));
                updateDoc(docRef, {
                    demo: false,
                });
            });
        });
        
    }
    
    return <></>
}

const createDemoProjects = async() => {

}

export const AccountLoadder = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    if (user?.uid) {
        return <AccountLoadderInternal />;
    }
    else {
        dispatch(initContacts({contacts: [], contactsCollection: {} as CollectionReference}));
        dispatch(closeContacts());
        return <></>;
    }
}