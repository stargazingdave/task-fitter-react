import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../App';
import fetch from 'node-fetch';
import { Contact } from './Contact';

describe('contact', () => {

    test('renders correctly email and role', () => {
        const contact = {
            id: '123',
            name: 'test',
            role: 'role',
            email: 'email',
        }
      render(
        <Contact contact={contact} />
      );
      expect(screen.getByText(contact.role)).toBeDefined();
      expect(screen.getByText(contact.email)).toBeDefined();
    });
    
})
