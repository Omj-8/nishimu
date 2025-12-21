import { render, screen } from '@testing-library/react'
import LandingPage from '../page'

describe('LandingPage', () => {
  it('renders the landing page with title', () => {
    render(<LandingPage />)
    
    const title = screen.getByText(/麻雀/i)
    expect(title).toBeInTheDocument()
    
    const evaluator = screen.getByText(/Evaluator/i)
    expect(evaluator).toBeInTheDocument()
  })

  it('renders login and signup buttons', () => {
    render(<LandingPage />)
    
    const loginButton = screen.getByText('ログイン')
    const signupButton = screen.getByText('新規登録')
    
    expect(loginButton).toBeInTheDocument()
    expect(signupButton).toBeInTheDocument()
  })

  it('has correct links', () => {
    render(<LandingPage />)
    
    const loginLink = screen.getByRole('link', { name: /ログイン/i })
    const signupLink = screen.getByRole('link', { name: /新規登録/i })
    
    expect(loginLink).toHaveAttribute('href', '/login')
    expect(signupLink).toHaveAttribute('href', '/signup')
  })
})
