import type { ComponentPropsWithoutRef, ElementType } from 'react'

type CardTag = 'article' | 'section' | 'div'

type CardProps<T extends CardTag = 'div'> = {
  as?: T
} & ComponentPropsWithoutRef<T>

export default function Card<T extends CardTag = 'div'>({
  as,
  className = '',
  ...props
}: CardProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  return (
    <Tag
      className={`rounded-lg border border-gray-200 bg-white p-6 transition-[border-color,box-shadow] duration-200 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 ${className}`}
      {...props}
    />
  )
}
