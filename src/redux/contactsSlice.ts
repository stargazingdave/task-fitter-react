import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../src/store'
import { CollectionReference, DocumentData } from 'firebase/firestore';


// Define a type for the slice state
interface ContactsState {
    openContacts: boolean,
    contacts: DocumentData[],
    contactsCollection: CollectionReference,
}

// Define the initial state using that type
const initialState: ContactsState = {
    openContacts: false,
    contacts: [],
    contactsCollection: {} as CollectionReference,
}

export const contactsSlice = createSlice({
  name: 'contacts',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    openContactsToggle: (state) => {
        state.openContacts = !state.openContacts;
    },
    initContacts: (state, action: PayloadAction<{ contacts: DocumentData[], contactsCollection: CollectionReference }>) => {
        state.contacts = action.payload.contacts;
        state.contactsCollection = action.payload.contactsCollection;
    },
    closeContacts: (state) => {
        state.openContacts = false;
    },
    onUpdateContact: (state, action: PayloadAction<DocumentData>) => {
        const temp = [...state.contacts];
        const index = temp.findIndex((contact) => contact.id == action.payload.id);
        temp[index] = action.payload;
        state.contacts = temp;
    },
    onAddContact: (state, action: PayloadAction<DocumentData>) => {
        const temp = [...state.contacts];
        temp.push(action.payload);
        state.contacts = temp;
    },
    onDeleteContact: (state, action: PayloadAction<DocumentData>) => {
        const temp = [...state.contacts];
        const index = temp.findIndex((contact) => contact.id == action.payload.id);
        temp.splice(index, 1);
        state.contacts = temp;
    },
  },
})

export const { 
    openContactsToggle, 
    initContacts, 
    onUpdateContact, 
    onAddContact, 
    onDeleteContact, 
    closeContacts 
} = contactsSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectOpenContacts = (state: RootState) => state.contacts.openContacts;
export const selectContacts = (state: RootState) => state.contacts.contacts;
export const selectContactsCollection = (state: RootState) => state.contacts.contactsCollection;

export default contactsSlice.reducer