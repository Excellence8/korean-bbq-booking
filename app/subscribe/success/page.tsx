'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SubscribeSuccess() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // 更新用户角色为商家
      await supabase
        .from('users')
        .update({ role: 'merchant' })
        .eq('id', user.id)
    }

    checkUser()
  }, [router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-green-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-green-600">订阅成功！</h1>
        <p className="text-gray-600 mt-4">你现在已经是商家了，可以开始管理预订。</p>
        <div className="mt-6 space-y-3">
          <a
            href="/admin"
            className="block w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            进入商家后台
          </a>
          <a
            href="/"
            className="block w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            返回首页
          </a>
        </div>
      </div>
    </main>
  )
}
