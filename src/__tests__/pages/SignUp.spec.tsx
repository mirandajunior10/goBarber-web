import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import SignUp from '../../pages/SignUp';

const mockedHistoryPush = jest.fn();
const mockedAddToast = jest.fn()
const mockedPost = jest.fn()

jest.mock('react-router-dom', () => {
  return {
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
    Link: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('../../services/api', () => {
  return {
    post: () => mockedPost
  };
});



jest.mock('../../hooks/toast', () => {
  return {
    useToast: () => ({
      addToast: mockedAddToast
    }),
  };
});


describe('SignUp page', () => {
  beforeEach(() => {
    mockedHistoryPush.mockClear();
    mockedPost.mockClear();
  })
  it('should be able to sign Up', async () => {
    const { getByPlaceholderText, getByText } = render(<SignUp />);
    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Senha');
    const buttonElement = getByText('Cadastrar');

    fireEvent.change(nameField, { target: { value: 'John Doe' } });
    fireEvent.change(emailField, { target: { value: 'johndoe@example.com' } });
    fireEvent.change(passwordField, { target: { value: '123456' } });

    fireEvent.click(buttonElement);
    await waitFor(() =>
      expect(mockedAddToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }))
    );
  });
  it('should not be able to sign up with invalid credentials', async () => {
    const { getByPlaceholderText, getByText } = render(<SignUp />);

    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Senha');
    const buttonElement = getByText('Cadastrar');

    fireEvent.change(nameField, { target: { value: 'John Doe' } });
    fireEvent.change(emailField, { target: { value: 'not-valid-email' } });
    fireEvent.change(passwordField, { target: { value: '123456' } });

    fireEvent.click(buttonElement);
    await waitFor(() =>
      expect(mockedHistoryPush).not.toHaveBeenCalled()
    );
  });
  it('should display an error if sign up fails', async () => {

    const postSpy = jest.spyOn(require('../../services/api'), 'post');
    postSpy.mockImplementation(() => {
      throw new Error()
    })

    const { getByPlaceholderText, getByText } = render(<SignUp />);

    const nameField = getByPlaceholderText('Nome');
    const emailField = getByPlaceholderText('E-mail');
    const passwordField = getByPlaceholderText('Senha');
    const buttonElement = getByText('Cadastrar');

    fireEvent.change(nameField, { target: { value: 'John Doe' } });
    fireEvent.change(emailField, { target: { value: 'johndoe@example.com' } });
    fireEvent.change(passwordField, { target: { value: '123456' } });

    fireEvent.click(buttonElement);
    await waitFor(() =>
      expect(mockedAddToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }))
    );
  });
});
