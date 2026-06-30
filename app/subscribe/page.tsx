'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SubscribePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      setIsSubscribed(data?.role === 'merchant')
      setLoading(false)
    }

    checkUser()
  }, [router])

  const handleSubscribe = async () => {
    setSubscribing(true)

    const { error } = await supabase
      .from('users')
      .update({ role: 'merchant' })
      .eq('id', user.id)

    if (error) {
      alert('订阅失败：' + error.message)
    } else {
      setIsSubscribed(true)
      alert('🎉 订阅成功！你现在可以访问商家后台了。')
      router.push('/admin')
    }
    setSubscribing(false)
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">加载中...</div>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6">🚀 升级为商家</h1>

        {isSubscribed ? (
          <div className="text-center">
            <p className="text-green-600 text-lg font-semibold">✅ 你已经是商家</p>
            <Link href="/admin" className="mt-4 inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              进入商家后台
            </Link>
          </div>
        ) : (
          <div>
            <div className="border rounded-lg p-6 mb-6 bg-gray-50">
              <p className="text-2xl font-bold text-center text-purple-600">$9.99</p>
              <p className="text-center text-gray-500">/ 每月</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">✅ 管理所有预订</li>
                <li className="flex items-center gap-2">✅ 确认/取消预订</li>
                <li className="flex items-center gap-2">✅ 查看数据统计</li>
                <li className="flex items-center gap-2">✅ 随时取消订阅</li>
              </ul>
            </div>

            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-lg font-semibold"
            >
              {subscribing ? '处理中...' : '立即订阅 ($9.99/月)'}
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:underline text-sm">
            ← 返回首页
          </Link>
        </div>
      </div>
    </main>
  )
}
