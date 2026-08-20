import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import Projects from '../components/Projects'

afterEach(cleanup)

describe('Projects', () => {
  it('renders every project from the data list', async () => {
    render(<Projects />)
    expect(await screen.findByText('Veloce Bikes')).toBeInTheDocument()
    expect(screen.getByText('Woodcraft')).toBeInTheDocument()
    expect(screen.getByText('Urbanic')).toBeInTheDocument()
  })

  it('renders the See More button', async () => {
    render(<Projects />)
    expect(await screen.findByRole('button', { name: /see more/i })).toBeInTheDocument()
  })

  it('energizes the See More button when there are more projects than fit in one row', async () => {
    window.innerWidth = 1280
    render(<Projects />)
    const button = await screen.findByRole('button', { name: /see more/i })
    expect(button.className).toMatch(/animate-pulseGlow/)
  })
})