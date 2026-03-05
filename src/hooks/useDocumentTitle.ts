import { useEffect } from 'react'

export function useDocumentTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `${page} | Nathan Buchholz` : 'Nathan Buchholz'
  }, [page])
}
