import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// We'll override mocks in specific tests when needed
type AuthSuccess = { success: true; user: { name: string } }
type AuthError = { success: false; error: string }

const mockSignIn = jest.fn<Promise<AuthSuccess | AuthError>, [string, string]>(
  async (email: string, name: string) => ({ success: true, user: { name } })
)
jest.mock('@/lib/auth', () => ({
  signIn: (email: string, name: string) => mockSignIn(email, name),
}))

const mockToast = jest.fn()
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

import { LoginForm } from './login-form'

describe('LoginForm', () => {
  beforeEach(() => {
    mockSignIn.mockClear()
    mockToast.mockClear()
  })

  it('renderiza campos e faz submit com sucesso', async () => {
    const onSuccess = jest.fn()
    render(<LoginForm onSuccess={onSuccess} />)

    const nameInput = screen.getByLabelText(/Nome completo/i)
    const emailInput = screen.getByLabelText(/Email/i)
    const submit = screen.getByRole('button', { name: /Entrar no Sistema/i })

    fireEvent.change(nameInput, { target: { value: 'Usuário Teste' } })
    fireEvent.change(emailInput, { target: { value: 'teste@exemplo.com' } })
    fireEvent.click(submit)

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(mockToast).toHaveBeenCalled()
  })

  it('mostra toast de erro quando campos estão vazios', async () => {
    const onSuccess = jest.fn()
    const { container } = render(<LoginForm onSuccess={onSuccess} />)

    const form = container.querySelector('form') as HTMLFormElement
    fireEvent.submit(form)

    await waitFor(() => expect(mockToast).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('mostra toast quando signIn falha', async () => {
    // Make signIn return an error
    mockSignIn.mockImplementationOnce(async () => ({ success: false, error: 'Invalid' }))

    const onSuccess = jest.fn()
    render(<LoginForm onSuccess={onSuccess} />)

    const nameInput = screen.getByLabelText(/Nome completo/i)
    const emailInput = screen.getByLabelText(/Email/i)
    const submit = screen.getByRole('button', { name: /Entrar no Sistema/i })

    fireEvent.change(nameInput, { target: { value: 'Usuário Teste' } })
    fireEvent.change(emailInput, { target: { value: 'falha@exemplo.com' } })
    fireEvent.click(submit)

    await waitFor(() => expect(mockToast).toHaveBeenCalled())
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
