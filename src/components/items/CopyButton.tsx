import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { CopyIcon, CheckIcon } from 'lucide-react'

interface CopyButtonProps {
  value: string
}

export function CopyButton({ value }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // Reset after 2 seconds
    })
  }, [value])

  return (
    <Button size="icon" onClick={copyToClipboard}>
      {copied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
    </Button>
  )
}
