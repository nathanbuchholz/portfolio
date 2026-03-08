import { Link } from 'react-router'

const base =
  'text-blue-600 transition-colors duration-200 hover:text-blue-800 hover:underline active:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 dark:active:text-blue-200'

type ExternalProps = {
  href: string
  to?: never
} & Omit<React.ComponentPropsWithoutRef<'a'>, 'href'>

type InternalProps = {
  to: string
  href?: never
} & Omit<React.ComponentPropsWithoutRef<typeof Link>, 'to'>

type TextLinkProps = ExternalProps | InternalProps

export default function TextLink({ className = '', ...props }: TextLinkProps) {
  const merged = `${base} ${className}`

  if ('to' in props && props.to != null) {
    return <Link viewTransition className={merged} {...props} />
  }

  return (
    <a target="_blank" rel="noopener noreferrer" className={merged} {...props} />
  )
}
