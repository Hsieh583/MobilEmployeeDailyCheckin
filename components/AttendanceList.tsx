'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, MapPin } from 'lucide-react'

interface Attendance {
  id: number
  check_time: string
  type: 'in' | 'out'
  lat_lng: string | null
}

interface AttendanceListProps {
  userId: string
}

export default function AttendanceList({ userId }: AttendanceListProps) {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    // Get start of current week (Monday)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    monday.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .gte('check_time', monday.toISOString())
      .order('check_time', { ascending: false })

    if (!error && data) {
      setAttendance(data)
    }
    setIsLoading(false)
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return new Intl.DateTimeFormat('zh-TW', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">本週打卡記錄</h2>
        <p className="text-gray-500">載入中...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">本週打卡記錄</h2>
      {attendance.length === 0 ? (
        <p className="text-gray-500 text-center py-4">本週尚無打卡記錄</p>
      ) : (
        <div className="space-y-3">
          {attendance.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-2 h-2 rounded-full
                    ${record.type === 'in' ? 'bg-indigo-600' : 'bg-amber-600'}
                  `}
                />
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Clock className="h-4 w-4" />
                    {formatDateTime(record.check_time)}
                  </div>
                  {record.lat_lng && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3" />
                      {record.lat_lng}
                    </div>
                  )}
                </div>
              </div>
              <span
                className={`
                  text-sm font-medium px-3 py-1 rounded-full
                  ${
                    record.type === 'in'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-amber-100 text-amber-700'
                  }
                `}
              >
                {record.type === 'in' ? '上班' : '下班'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
