import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('App', () => {
  it('opens the shared contact modal from the hero "Contact Me" button', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    const [heroButton] = screen.getAllByRole('button', { name: /contact me/i })
    await user.click(heroButton)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('opens the same modal from the footer trigger too', async () => {
    const user = userEvent.setup()
    render(<App />)

    const footerButton = screen.getAllByRole('button', { name: /contact me/i }).at(-1)
    await user.click(footerButton)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })
})
