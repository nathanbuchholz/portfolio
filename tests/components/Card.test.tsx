import { render, screen } from '@testing-library/react'
import Card from '../../src/components/Card'

describe('Card', () => {
  it('renders a div by default', () => {
    render(<Card data-testid="card">content</Card>)
    const el = screen.getByTestId('card')
    expect(el.tagName).toBe('DIV')
  })

  it('renders an article when as="article"', () => {
    render(
      <Card as="article" data-testid="card">
        content
      </Card>,
    )
    expect(screen.getByTestId('card').tagName).toBe('ARTICLE')
  })

  it('renders a section when as="section"', () => {
    render(
      <Card as="section" data-testid="card">
        content
      </Card>,
    )
    expect(screen.getByTestId('card').tagName).toBe('SECTION')
  })

  it('merges additional className', () => {
    render(
      <Card className="extra-class" data-testid="card">
        content
      </Card>,
    )
    const el = screen.getByTestId('card')
    expect(el.className).toContain('rounded-lg')
    expect(el.className).toContain('extra-class')
  })

  it('passes children through', () => {
    render(<Card>hello world</Card>)
    expect(screen.getByText('hello world')).toBeInTheDocument()
  })
})
