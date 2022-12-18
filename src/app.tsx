import { IndexPage } from '@/components/IndexPage/IndexPage'
import React from 'react'

export function App() {
  return <React.Suspense>{<IndexPage />}</React.Suspense>
}
