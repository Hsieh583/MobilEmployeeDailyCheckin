import { createClient } from '@/lib/supabase/server'
import EmployeeManagement from '@/components/admin/EmployeeManagement'

export default async function AdminPage() {
  const supabase = await createClient()

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">員工管理</h1>
        <p className="mt-2 text-sm text-gray-600">
          管理員工白名單，新增或移除授權員工
        </p>
      </div>

      <EmployeeManagement initialProfiles={profiles || []} />
    </div>
  )
}
