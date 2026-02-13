'use client'

import { AlertCircle } from 'lucide-react'

export default function Unauthorized() {
  const handleSignIn = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    
    await supabase.auth.signOut()
    window.location.href = '/unauthorized'
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">未授權訪問</h2>
          <p className="mt-2 text-sm text-gray-600">
            您的帳號未在員工白名單中，請聯繫管理員。
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <button
            onClick={handleSignIn}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-white font-medium hover:bg-indigo-700 transition-colors"
          >
            使用 Google 登入
          </button>
          <button
            onClick={handleSignOut}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            登出
          </button>
        </div>
      </div>
    </div>
  )
}
