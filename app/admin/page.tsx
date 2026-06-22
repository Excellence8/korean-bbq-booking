'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Booking {
  id: number
  restaurant_id: number
  user_id: string
  party_size: number
  booking_time: string
  status: string
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [usersMap, setUsersMap] = useState<Record<string, string>>({})
  const [restaurantsMap, setRestaurantsMap] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isMerchant, setIsMerchant] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push('/auth/login')
          return
        }
        setUser(user)

        const { data: userData, error: roleError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()

        if (roleError || !userData || userData.role !== 'merchant') {
          setError('您不是商家，无权访问')
          setLoading(false)
          return
        }

        setIsMerchant(true)
        await fetchAllData()
        setLoading(false)

      } catch (err: any) {
        setError(err.message || '未知错误')
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const fetchAllData = async () => {
    // 1. 获取所有预订
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_time', { ascending: false })

    if (bookingsError) {
      setError(bookingsError.message)
      return
    }
    setBookings(bookingsData || [])

    // 2. 获取所有用户信息（用于显示邮箱）
    const userIds = [...new Set((bookingsData || []).map(b => b.user_id).filter(Boolean))]
    if (userIds.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds)
      const map: Record<string, string> = {}
      usersData?.forEach(u => { map[u.id] = u.email })
      setUsersMap(map)
    }

    // 3. 获取所有餐厅信息
    const restaurantIds = [...new Set((bookingsData || []).map(b => b.restaurant_id).filter(Boolean))]
    if (restaurantIds.length > 0) {
      const { data: restaurantsData } = await supabase
        .from('restaurants')
        .select('id, name')
        .in('id', restaurantIds)
      const map: Record<number, string> = {}
      restaurantsData?.forEach(r => { map[r.id] = r.name })
      setRestaurantsMap(map)
    }
  }

  const updateBookingStatus = async (bookingId: number, status: 'confirmed' | 'cancelled') => {
    setActionLoading(bookingId)
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)

    if (error) {
      alert('更新失败：' + error.message)
    } else {
      await fetchAllData()
    }
    setActionLoading(null)
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">加载中...</div>
  }

  if (!user || !isMerchant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-2xl font-bold text-red-600">无权访问</h1>
        <p className="mt-4">{error || '请使用商家账号登录'}</p>
        <a href="/" className="mt-4 text-blue-600 hover:underline">返回首页</a>
      </div>
    )
  }

  const totalBookings = bookings.length
  const pendingBookings = bookings.filter(b => b.status === 'pending').length
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">📊 商家管理后台</h1>
            <p className="text-gray-600">当前用户：{user?.email}</p>
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">总预订</p>
            <p className="text-2xl font-bold">{totalBookings}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4 border border-yellow-200">
            <p className="text-yellow-700 text-sm">待确认</p>
            <p className="text-2xl font-bold text-yellow-700">{pendingBookings}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4 border border-green-200">
            <p className="text-green-700 text-sm">已确认</p>
            <p className="text-2xl font-bold text-green-700">{confirmedBookings}</p>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-4 border border-red-200">
            <p className="text-red-700 text-sm">已取消</p>
            <p className="text-2xl font-bold text-red-700">{cancelledBookings}</p>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">📋 预订列表</h2>

          {bookings.length === 0 ? (
            <p className="text-gray-500">暂无预订</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">餐厅</th>
                    <th className="px-4 py-2 text-left">用户</th>
                    <th className="px-4 py-2 text-left">时间</th>
                    <th className="px-4 py-2 text-left">人数</th>
                    <th className="px-4 py-2 text-left">状态</th>
                    <th className="px-4 py-2 text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{restaurantsMap[booking.restaurant_id] || '-'}</td>
                      <td className="px-4 py-2">{usersMap[booking.user_id] || '匿名'}</td>
                      <td className="px-4 py-2">{new Date(booking.booking_time).toLocaleString('zh-CN')}</td>
                      <td className="px-4 py-2">{booking.party_size}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                          ${booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                          ${booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                          {booking.status === 'pending' ? '待确认' :
                           booking.status === 'confirmed' ? '已确认' :
                           booking.status === 'cancelled' ? '已取消' :
                           booking.status === 'completed' ? '已完成' : booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              disabled={actionLoading === booking.id}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-xs"
                            >
                              {actionLoading === booking.id ? '处理中...' : '确认'}
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              disabled={actionLoading === booking.id}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-xs"
                            >
                              {actionLoading === booking.id ? '处理中...' : '取消'}
                            </button>
                          </div>
                        )}
                        {booking.status === 'confirmed' && <span className="text-xs text-green-600">已确认</span>}
                        {booking.status === 'cancelled' && <span className="text-xs text-red-600">已取消</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
