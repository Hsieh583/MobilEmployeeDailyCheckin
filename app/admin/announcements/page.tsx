import { createClient } from '@/lib/supabase/server'
import AnnouncementManagement from '@/components/admin/AnnouncementManagement'

export default async function AnnouncementsPage() {
  const supabase = await createClient()

  // Fetch all announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">公告管理</h1>
        <p className="mt-2 text-sm text-gray-600">
          發布和管理系統公告
        </p>
      </div>

      <AnnouncementManagement initialAnnouncements={announcements || []} />
    </div>
  )
}
