'use client'

import { Info } from 'lucide-react'

interface AnnouncementBannerProps {
  content: string
}

export default function AnnouncementBanner({ content }: AnnouncementBannerProps) {
  return (
    <div className="bg-indigo-50 border-b border-indigo-100">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-900">{content}</p>
        </div>
      </div>
    </div>
  )
}
