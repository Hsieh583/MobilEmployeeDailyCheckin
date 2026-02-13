'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface CheckInButtonProps {
  userId: string
  nextAction: 'in' | 'out'
}

export default function CheckInButton({ userId, nextAction }: CheckInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const supabase = createClient()

  const handleCheckIn = async () => {
    setIsLoading(true)
    setStatus('idle')

    try {
      // Get GPS location
      let latLng = null
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject)
            }
          )
          latLng = `${position.coords.latitude}, ${position.coords.longitude}`
        } catch (error) {
          console.error('Failed to get location:', error)
        }
      }

      // Insert attendance record
      const { error } = await supabase.from('attendance').insert({
        user_id: userId,
        type: nextAction,
        lat_lng: latLng,
      })

      if (error) throw error

      setStatus('success')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Check-in error:', error)
      setStatus('error')
      setIsLoading(false)
    }
  }

  const buttonText = nextAction === 'in' ? '上班打卡' : '下班打卡'
  const buttonColor = status === 'success' 
    ? 'bg-emerald-500' 
    : nextAction === 'in' 
    ? 'bg-indigo-600 hover:bg-indigo-700' 
    : 'bg-amber-600 hover:bg-amber-700'

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleCheckIn}
        disabled={isLoading}
        className={`
          relative w-64 h-64 rounded-full shadow-2xl
          ${buttonColor}
          text-white font-bold text-2xl
          transform transition-all duration-200
          ${isLoading ? 'scale-95' : 'hover:scale-105'}
          ${status === 'success' ? 'scale-95' : ''}
          disabled:cursor-not-allowed
          flex items-center justify-center
        `}
      >
        {isLoading ? (
          <Loader2 className="h-12 w-12 animate-spin" />
        ) : status === 'success' ? (
          <div className="text-center">
            <div className="text-4xl mb-2">✓</div>
            <div className="text-xl">打卡成功</div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-3xl mb-2">{nextAction === 'in' ? '🌅' : '🌙'}</div>
            <div>{buttonText}</div>
          </div>
        )}
      </button>
      {status === 'error' && (
        <p className="mt-4 text-red-600 text-sm">打卡失敗，請重試</p>
      )}
    </div>
  )
}
