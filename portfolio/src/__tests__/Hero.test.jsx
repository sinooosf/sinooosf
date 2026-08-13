import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Hero from '../components/Hero'

describe('Hero', () => {
  it('shows "Web Developer" instead of "Web Designer"', () => {
    render(<Hero onOpenContact={() => {}} />)
    expect(screen.getByText(/web developer/i)).toBeInTheDocument()
    expect(screen.queryByText(/^web designer$/i)).not.toBeInTheDocument()
  })

  it('calls onOpenContact when the Contact Me button is clicked', async () => {
    const user = userEvent.setup()
    const onOpenContact = vi.fn()
    render(<Hero onOpenContact={onOpenContact} />)

    await user.click(screen.getByRole('button', { name: /contact me/i }))
    expect(onOpenContact).toHaveBeenCalledTimes(1)
  })
})
