'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">加载中...</div>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Korean BBQ Booking</h1>
      <p className="mt-4 text-lg">韩国烤肉预订平台</p>
      {user ? (
        <div className="mt-8 text-center">
          <p className="text-green-600">✅ 已登录：{user.email}</p>
          <button
            onClick={handleLogout}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            登出
          </button>
        </div>
      ) : (
        <div className="mt-8 space-x-4">
          <a href="/auth/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            登录
          </a>
          <a href="/auth/register" className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            注册
          </a>
        </div>
      )}
    </main>
  )
}
