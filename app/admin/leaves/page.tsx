import { createClient } from '@/lib/supabase/server'
import LeaveRequestManagement from '@/components/admin/LeaveRequestManagement'

export default async function LeavesPage() {
  const supabase = await createClient()

  // Fetch all leave requests with user info
  const { data: leaveRequests } = await supabase
    .from('leave_requests')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">請假審核</h1>
        <p className="mt-2 text-sm text-gray-600">
          審核員工請假申請
        </p>
      </div>

      <LeaveRequestManagement initialLeaveRequests={leaveRequests || []} />
    </div>
  )
}
