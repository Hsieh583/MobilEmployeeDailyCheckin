'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2 } from 'lucide-react'

interface Announcement {
  id: number
  content: string
  created_at: string
}

interface AnnouncementManagementProps {
  initialAnnouncements: Announcement[]
}

export default function AnnouncementManagement({ initialAnnouncements }: AnnouncementManagementProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements)
  const [isAdding, setIsAdding] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newContent.trim()) {
      setError('請輸入公告內容')
      return
    }

    try {
      const { data, error } = await supabase
        .from('announcements')
        .insert([{ content: newContent }])
        .select()
        .single()

      if (error) throw error

      setAnnouncements([data, ...announcements])
      setNewContent('')
      setIsAdding(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm('確定要刪除此公告嗎？')) return

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (!error) {
      setAnnouncements(announcements.filter(a => a.id !== id))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white shadow-md rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          新增公告
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddAnnouncement} className="px-6 py-4 bg-gray-50 border-b">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="輸入公告內容..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              發布公告
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setNewContent('')
                setError('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </form>
      )}

      <div className="divide-y divide-gray-200">
        {announcements.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            目前沒有公告
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-900 mb-2">{announcement.content}</p>
                  <p className="text-sm text-gray-500">
                    發布時間：{formatDate(announcement.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                  className="ml-4 text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
