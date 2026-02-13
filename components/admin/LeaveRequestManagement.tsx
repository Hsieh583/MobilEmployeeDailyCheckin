'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Calendar } from 'lucide-react'

interface LeaveRequest {
  id: number
  user_id: string
  start_date: string
  end_date: string
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  profiles: {
    full_name: string
    email: string
  }
}

interface LeaveRequestManagementProps {
  initialLeaveRequests: LeaveRequest[]
}

export default function LeaveRequestManagement({ initialLeaveRequests }: LeaveRequestManagementProps) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const supabase = createClient()

  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('leave_requests')
      .update({ status })
      .eq('id', id)

    if (!error) {
      setLeaveRequests(leaveRequests.map(req => 
        req.id === id ? { ...req, status } : req
      ))
    }
  }

  const filteredRequests = leaveRequests.filter(req => 
    filter === 'all' ? true : req.status === filter
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white shadow-md rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            待審核
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'approved'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            已核准
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            已拒絕
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredRequests.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            沒有{filter === 'pending' ? '待審核' : filter === 'approved' ? '已核准' : filter === 'rejected' ? '已拒絕' : ''}的請假申請
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {request.profiles.full_name}
                    </h3>
                    <span
                      className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${request.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                        ${request.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      `}
                    >
                      {request.status === 'pending' ? '待審核' : request.status === 'approved' ? '已核准' : '已拒絕'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{request.profiles.email}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDate(request.start_date)} - {formatDate(request.end_date)}
                    </span>
                  </div>
                  {request.reason && (
                    <p className="text-sm text-gray-600 mt-2">
                      原因：{request.reason}
                    </p>
                  )}
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'approved')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      核准
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'rejected')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      拒絕
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
