import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { CollectionReference, Firestore } from 'firebase/firestore';
import userReducer from './redux/userSlice'
import contactsReducer from './redux/contactsSlice'
import databaseReducer from './redux/databaseSlice'
import userSettingsReducer from './redux/userSettingsSlice'
import projectsReducer from './redux/projectsSlice'
import { ContactList } from './components/contacts/ContactList';
import { ReactComponentElement } from 'react';


export const renderWithStore = (component: any, preloadedState: any) => {
    
   const store = configureStore({
        reducer: {
            user: userReducer,
            contacts: contactsReducer,
            database: databaseReducer,
            userSettings: userSettingsReducer,
            projects: projectsReducer,
        },
        preloadedState: preloadedState as any
      });

  render(
    <Provider store={store}>
        {component}
    </Provider>
    
  );
}