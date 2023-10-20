import { CollectionReference, collection, getFirestore, orderBy, query, where } from "firebase/firestore";
import { useState } from "react";
import { useFirebaseApp, useFirestore, useFirestoreCollectionData } from "reactfire";
import { useAppDispatch, useAppSelector } from "../../reduxHooks";
import { selectUser } from "../../redux/userSlice";
import { initContacts } from "../../redux/contactsSlice";

const AccountLoadderInternal = () => {
    const dispatch = useAppDispatch();
    const db = getFirestore(useFirebaseApp());
    const user = useAppSelector(selectUser);
    const contactsCollection = collection(db, 'contacts');
    const [isAscending, setIsAscending] = useState(true);
    const contactsQuery = query(contactsCollection,
        where("user_id", "==", user.uid),
        orderBy('name', isAscending ? 'asc' : 'desc'));
    const { status, data: contacts } = useFirestoreCollectionData(contactsQuery, { idField: 'id',});
    // check the loading status
    if (status === 'loading') {
        return <p>החשבון בטעינה...</p>;
    }
    dispatch(initContacts({contacts, contactsCollection}));

    
    return <></>
}

export const AccountLoadder = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    if (user?.uid) {
        return <AccountLoadderInternal />;
    }
    else {
        dispatch(initContacts({contacts: [], contactsCollection: {} as CollectionReference}));
        return <></>;
    }
}