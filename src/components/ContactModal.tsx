import { useEffect, useRef, useState } from 'react'

interface ContactModalProps {
  open: boolean
  onClose: () => void
}

function encode(data: Record<string, string>) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300'

const inputBaseClass =
  'mt-1 w-full rounded-md border bg-white px-3 py-2 text-gray-900 focus:ring-1 focus:outline-none dark:bg-gray-700 dark:text-gray-100'
const inputBorderNormal =
  'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600'
const inputBorderError =
  'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500'

function inputClass(hasError: boolean) {
  return `${inputBaseClass} ${hasError ? inputBorderError : inputBorderNormal}`
}

function fieldErrorClass(show: boolean) {
  return `mt-1 text-sm text-red-600 dark:text-red-400 ${show ? 'visible' : 'invisible'}`
}

function validate(formData: { name: string; email: string; message: string }) {
  const errors: Partial<Record<'name' | 'email' | 'message', string>> = {}
  if (!formData.name.trim()) errors.name = 'Name is required'
  if (!formData.email.trim()) errors.email = 'Email is required'
  else if (!EMAIL_RE.test(formData.email)) errors.email = 'Enter a valid email'
  if (!formData.message.trim()) errors.message = 'Message is required'
  return errors
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [touched, setTouched] = useState<
    Partial<Record<'name' | 'email' | 'message', boolean>>
  >({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle',
  )
  const dialogRef = useRef<HTMLDialogElement>(null)

  const errors = validate(formData)
  const isValid = Object.keys(errors).length === 0

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    dialog.showModal()
  }, [open])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true, message: true })
    if (!isValid) return
    setStatus('sending')
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'contact', ...formData }),
      })
      if (!response.ok) throw new Error('Form submission failed')
      setStatus('sent')
      setFormData({ name: '', email: '', message: '' })
      setTouched({})
    } catch {
      setStatus('error')
    }
  }

  const handleClose = () => {
    setStatus('idle')
    onClose()
  }

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) handleClose()
      }}
      className="m-auto w-full max-w-md rounded-lg border border-gray-200 bg-white p-0 shadow-xl backdrop:bg-black/50 dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Contact
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="cursor-pointer text-gray-500 transition-all duration-200 hover:text-gray-700 active:scale-90 active:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 dark:active:text-gray-100"
          >
            &#x2715;
          </button>
        </div>

        {status === 'sent' ? (
          <div className="py-8 text-center">
            <p className="text-lg font-medium text-green-600 dark:text-green-400">
              Message sent! I'll get back to you soon.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 cursor-pointer rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-all duration-200 hover:bg-gray-300 active:scale-95 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:active:bg-gray-500"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot field - hidden from humans, traps bots */}
            <p className="hidden">
              <label>
                Don't fill this out if you're human:
                <input name="bot-field" />
              </label>
            </p>

            <div>
              <label
                htmlFor="contact-name"
                className={labelClass}
              >
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={touched.name && !!errors.name}
                aria-describedby={
                  touched.name && errors.name ? 'name-error' : undefined
                }
                className={inputClass(!!touched.name && !!errors.name)}
              />
              <p
                id="name-error"
                className={fieldErrorClass(!!touched.name && !!errors.name)}
              >
                {errors.name ?? '\u00A0'}
              </p>
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className={labelClass}
              >
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={touched.email && !!errors.email}
                aria-describedby={
                  touched.email && errors.email ? 'email-error' : undefined
                }
                className={inputClass(!!touched.email && !!errors.email)}
              />
              <p
                id="email-error"
                className={fieldErrorClass(!!touched.email && !!errors.email)}
              >
                {errors.email ?? '\u00A0'}
              </p>
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className={labelClass}
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={touched.message && !!errors.message}
                aria-describedby={
                  touched.message && errors.message
                    ? 'message-error'
                    : undefined
                }
                className={inputClass(!!touched.message && !!errors.message)}
              />
              <p
                id="message-error"
                className={fieldErrorClass(!!touched.message && !!errors.message)}
              >
                {errors.message ?? '\u00A0'}
              </p>
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-600 dark:text-red-400">
                Something went wrong. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={!isValid || status === 'sending'}
              className="w-full cursor-pointer rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-all duration-200 hover:bg-blue-700 active:scale-[0.98] active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'sending' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </dialog>
  )
}
