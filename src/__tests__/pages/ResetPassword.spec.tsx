import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import ResetPassword from '../../pages/ResetPassword';

const mockedHistoryPush = jest.fn();
const mockedLocationReplace = jest.fn();
const mockedAddToast = jest.fn()
const mockedPost = jest.fn()

jest.mock('react-router-dom', () => {
  return {
    useHistory: () => ({
      push: mockedHistoryPush,
    }),
    useLocation: () => ({
      search: {
        replace: () => mockedLocationReplace
      },
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
    mockedLocationReplace.mockClear()
  })
  it('should be able to reset password', async () => {
    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const passwordField = getByPlaceholderText('Nova senha');
    const passwordConfirmationField = getByPlaceholderText('Confirmação da senha');
    const buttonElement = getByText('Alterar senha');

    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(passwordConfirmationField, { target: { value: '123456' } });

    fireEvent.click(buttonElement);
    await waitFor(() =>
      expect(mockedAddToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }))
    );
  });
  it('should not be able to reset password with invalid credentials', async () => {
    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const passwordField = getByPlaceholderText('Nova senha');
    const passwordConfirmationField = getByPlaceholderText('Confirmação da senha');
    const buttonElement = getByText('Alterar senha');

    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(passwordConfirmationField, { target: { value: '1234567' } });

    fireEvent.click(buttonElement);
    await waitFor(() =>
      expect(mockedHistoryPush).not.toHaveBeenCalled()
    );
  });
  it('should display an error if reset password fails', async () => {

    const postSpy = jest.spyOn(require('../../services/api'), 'post');
    postSpy.mockImplementation(() => {
      throw new Error()
    })

    const { getByPlaceholderText, getByText } = render(<ResetPassword />);

    const passwordField = getByPlaceholderText('Nova senha');
    const passwordConfirmationField = getByPlaceholderText('Confirmação da senha');
    const buttonElement = getByText('Alterar senha');

    fireEvent.change(passwordField, { target: { value: '123456' } });
    fireEvent.change(passwordConfirmationField, { target: { value: '123456' } });
    fireEvent.click(buttonElement);

    await waitFor(() =>
      expect(mockedAddToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }))
    );
  });

});
