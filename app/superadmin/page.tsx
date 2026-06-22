'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SuperAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMerchants: 0,
    totalRestaurants: 0,
    totalBookings: 0,
  })
  const [merchants, setMerchants] = useState<any[]>([])
  const [allBookings, setAllBookings] = useState<any[]>([])

  useEffect(() => {
    const checkSuperAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // 检查是否为超管（硬编码邮箱）
      if (user.email !== 'dgsjk3258@126.com') {
        setError('无权访问')
        setLoading(false)
        return
      }

      await fetchAllData()
      setLoading(false)
    }

    checkSuperAdmin()
  }, [router])

  const fetchAllData = async () => {
    // 统计用户
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // 统计商家
    const { count: merchantCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'merchant')

    // 统计餐厅
    const { count: restaurantCount } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true })

    // 统计预订
    const { count: bookingCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })

    // 获取商家列表
    const { data: merchantsData } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'merchant')

    // 获取所有预订
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    setStats({
      totalUsers: userCount || 0,
      totalMerchants: merchantCount || 0,
      totalRestaurants: restaurantCount || 0,
      totalBookings: bookingCount || 0,
    })
    setMerchants(merchantsData || [])
    setAllBookings(bookingsData || [])
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">加载中...</div>
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-2xl font-bold text-red-600">无权访问</h1>
        <p className="mt-4">{error}</p>
        <a href="/" className="mt-4 text-blue-600 hover:underline">返回首页</a>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🏢 平台管理后台</h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/')
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            登出
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">总用户</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4 border border-purple-200">
            <p className="text-purple-700 text-sm">商家</p>
            <p className="text-2xl font-bold text-purple-700">{stats.totalMerchants}</p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4 border border-blue-200">
            <p className="text-blue-700 text-sm">餐厅</p>
            <p className="text-2xl font-bold text-blue-700">{stats.totalRestaurants}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
            <p className="text-green-700 text-sm">总预订</p>
            <p className="text-2xl font-bold text-green-700">{stats.totalBookings}</p>
          </div>
        </div>

        {/* 商家列表 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">👥 商家列表</h2>
          {merchants.length === 0 ? (
            <p className="text-gray-500">暂无商家</p>
          ) : (
            <ul className="space-y-2">
              {merchants.map((m) => (
                <li key={m.id} className="border p-3 rounded">
                  <p className="font-medium">{m.email}</p>
                  <p className="text-sm text-gray-500">ID: {m.id}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 预订列表 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">📋 最新预订</h2>
          {allBookings.length === 0 ? (
            <p className="text-gray-500">暂无预订</p>
          ) : (
            <ul className="space-y-2">
              {allBookings.map((b) => (
                <li key={b.id} className="border p-3 rounded text-sm">
                  <p>预订时间：{new Date(b.booking_time).toLocaleString()}</p>
                  <p>人数：{b.party_size}</p>
                  <p>状态：
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs
                      ${b.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                      ${b.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {b.status}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}
