'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2 } from 'lucide-react'

interface Profile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'supervisor' | 'employee'
  created_at: string
}

interface EmployeeManagementProps {
  initialProfiles: Profile[]
}

export default function EmployeeManagement({ initialProfiles }: EmployeeManagementProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [isAdding, setIsAdding] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    email: '',
    full_name: '',
    role: 'employee' as 'admin' | 'supervisor' | 'employee',
  })
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // In a real app, you would need to create the auth user first
      // For now, we'll just add to profiles table
      // Note: This requires manual user creation in Supabase Auth
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([newEmployee])
        .select()
        .single()

      if (error) {
        setError(error.message)
        return
      }

      setProfiles([data, ...profiles])
      setNewEmployee({ email: '', full_name: '', role: 'employee' })
      setIsAdding(false)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('確定要移除此員工嗎？')) return

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (!error) {
      setProfiles(profiles.filter(p => p.id !== id))
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          新增員工
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddEmployee} className="px-6 py-4 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="email"
              placeholder="Email"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="姓名"
              value={newEmployee.full_name}
              onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
              required
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={newEmployee.role}
              onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as any })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="employee">員工</option>
              <option value="supervisor">主管</option>
              <option value="admin">管理員</option>
            </select>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              確認新增
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setError('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                姓名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                角色
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                加入日期
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {profiles.map((profile) => (
              <tr key={profile.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {profile.full_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {profile.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${profile.role === 'admin' ? 'bg-purple-100 text-purple-800' : ''}
                    ${profile.role === 'supervisor' ? 'bg-blue-100 text-blue-800' : ''}
                    ${profile.role === 'employee' ? 'bg-gray-100 text-gray-800' : ''}
                  `}>
                    {profile.role === 'admin' ? '管理員' : profile.role === 'supervisor' ? '主管' : '員工'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(profile.created_at).toLocaleDateString('zh-TW')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDeleteEmployee(profile.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
