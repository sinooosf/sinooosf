import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactModal from '../components/ContactModal'

describe('ContactModal', () => {
  it('renders nothing when closed', () => {
    render(<ContactModal open={false} onClose={() => {}} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the form fields when open', () => {
    render(<ContactModal open onClose={() => {}} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tell me about your project/i)).toBeInTheDocument()
  })

  it('calls onClose when the backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ContactModal open onClose={onClose} />)

    await user.click(screen.getByLabelText(/close contact form/i))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ContactModal open onClose={onClose} />)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows the thank-you message after submitting the form', async () => {
    const user = userEvent.setup()
    render(<ContactModal open onClose={() => {}} />)

    await user.type(screen.getByLabelText(/name/i), 'Ada Lovelace')
    await user.type(screen.getByLabelText(/number/i), '+62 812 0000 0000')
    await user.type(
      screen.getByLabelText(/tell me about your project/i),
      'I need a portfolio site.',
    )
    await user.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() =>
      expect(screen.getByText(/thanks, i'll respond very soon/i)).toBeInTheDocument(),
    )
  })
})
