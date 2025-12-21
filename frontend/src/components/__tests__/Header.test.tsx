import { render, screen } from '@testing-library/react'
import Header from '../Header'

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}))

describe('Header', () => {
  it('renders the header with logo', () => {
    render(<Header />)
    
    const logo = screen.getByText(/麻雀 Evaluator/i)
    expect(logo).toBeInTheDocument()
  })

  it('renders navigation links when logged in', () => {
    // Mock localStorage to simulate logged in state
    Storage.prototype.getItem = jest.fn(() => '1')
    
    render(<Header />)
    
    // Check if logout button appears
    const logoutButton = screen.queryByText('ログアウト')
    expect(logoutButton).toBeInTheDocument()
  })
})
