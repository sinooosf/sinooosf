import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import Projects from '../components/Projects'

afterEach(cleanup)

describe('Projects', () => {
  it('renders every project from the data list', () => {
    render(<Projects />)
    expect(screen.getByText('Veloce Bikes')).toBeInTheDocument()
    expect(screen.getByText('Woodcraft')).toBeInTheDocument()
    expect(screen.getByText('Urbanic')).toBeInTheDocument()
  })

  it('renders the View All Projects button', () => {
    render(<Projects />)
    expect(screen.getByRole('button', { name: /view all projects/i })).toBeInTheDocument()
  })

  it('does not energize the button on desktop with exactly one row (3 projects)', () => {
    window.innerWidth = 1280
    render(<Projects />)
    const button = screen.getByRole('button', { name: /view all projects/i })
    expect(button.className).not.toMatch(/animate-pulseGlow/)
  })
})
