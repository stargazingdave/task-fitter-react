import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import App from '../../App';
import fetch from 'node-fetch';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ContactList } from './ContactList';
import { CollectionReference, Firestore } from 'firebase/firestore';
import userReducer from '../../redux/userSlice'
import contactsReducer from '../../redux/contactsSlice'
import databaseReducer from '../../redux/databaseSlice'
import userSettingsReducer from '../../redux/userSettingsSlice'
import projectsReducer from '../../redux/projectsSlice'
import { renderWithStore } from '../../storeForTest';

describe('contactList', () => {
    const contacts = [{
        id: '123',
        name: 'test',
        role: 'role',
        email: 'email',
    },
    {
        id: '321',
        name: 'tset',
        role: 'elor',
        email: 'liame',
    }];
    
    const preloadedState = {
        contacts: {
            contacts: contacts,
            contactsCollection: {} as CollectionReference,
        },
        database: {
            db: {} as Firestore,
        },
    };
    test('renders correctly all contacts', () => {
        renderWithStore(<ContactList />, preloadedState);
        expect(screen.getByText('אנשי קשר')).toBeDefined();
        
        contacts.forEach((contact) => {
            expect(screen.getByText(contact.name)).toBeDefined();
            expect(screen.getByTestId('edit-button' + contact.id)).toBeDefined();
            expect(screen.getByTestId('delete-button' + contact.id)).toBeDefined();
        })
    });
    test('renders create form on button click', () => {
        renderWithStore(<ContactList />, preloadedState);
        const newButton = screen.getByText('איש קשר חדש');
        act(() => {
            newButton.click();
        });
        expect(screen.getByText('שם:')).toBeDefined();
        expect(screen.getByText('תפקיד:')).toBeDefined();
        expect(screen.getByText('כתובת אימייל:')).toBeDefined();
    }); // make sure edit button opens form, make sure delete button opens popup
})
