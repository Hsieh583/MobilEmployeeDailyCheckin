import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CheckInButton from '@/components/CheckInButton'
import AttendanceList from '@/components/AttendanceList'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import { LogOut } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/unauthorized')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/unauthorized')
  }

  // Get latest announcement
  const { data: latestAnnouncement } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Get today's attendance records
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('user_id', user.id)
    .gte('check_time', today.toISOString())
    .order('check_time', { ascending: false })

  // Determine if last check was "in" or "out"
  const lastCheck = todayAttendance?.[0]
  const nextAction = lastCheck?.type === 'in' ? 'out' : 'in'

  return (
    <div className="min-h-screen bg-gray-50">
      {latestAnnouncement && (
        <AnnouncementBanner content={latestAnnouncement.content} />
      )}
      
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.full_name}
            </h1>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
          <form action={async () => {
            'use server'
            const supabase = await createClient()
            await supabase.auth.signOut()
            redirect('/unauthorized')
          }}>
            <button
              type="submit"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Check-in Button */}
        <div className="mb-8">
          <CheckInButton userId={user.id} nextAction={nextAction} />
        </div>

        {/* Attendance List */}
        <AttendanceList userId={user.id} />

        {/* Admin Link */}
        {(profile.role === 'admin' || profile.role === 'supervisor') && (
          <div className="mt-8 text-center">
            <a
              href="/admin"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              管理後台
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
