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
  users?: {
    email: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isMerchant, setIsMerchant] = useState(false)

  // 检查用户是否为商家
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // 检查 users 表中的 role
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error) {
        setError('用户信息不存在，请先注册')
        return
      }

      if (data?.role === 'merchant') {
        setIsMerchant(true)
        fetchBookings(user.id)
      } else {
        setError('您不是商家，无权访问此页面')
      }
      setLoading(false)
    }

    checkUser()
  }, [router])

  const fetchBookings = async (userId: string) => {
    // 先获取商家关联的餐厅
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', userId) // 假设 restaurant_id 与 user_id 对应

    if (!restaurants || restaurants.length === 0) {
      setBookings([])
      setLoading(false)
      return
    }

    const restaurantIds = restaurants.map(r => r.id)

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        users:user_id (email)
      `)
      .in('restaurant_id', restaurantIds)
      .order('booking_time', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setBookings(data || [])
    }
    setLoading(false)
  }

  const updateBookingStatus = async (bookingId: number, status: 'confirmed' | 'cancelled') => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)

    if (error) {
      alert('更新失败：' + error.message)
    } else {
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status } : b
      ))
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">加载中...</div>
  }

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">请先登录</div>
  }

  if (!isMerchant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-2xl font-bold text-red-600">无权访问</h1>
        <p className="mt-4">您不是商家，无法访问管理后台</p>
        <a href="/" className="mt-4 text-blue-600 hover:underline">返回首页</a>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">商家管理后台</h1>
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

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">📋 预订列表</h2>

          {bookings.length === 0 ? (
            <p className="text-gray-500">暂无预订</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">
                        用户：{booking.users?.email || '匿名用户'}
                      </p>
                      <p className="text-lg font-medium">
                        📅 {new Date(booking.booking_time).toLocaleString('zh-CN')}
                      </p>
                      <p className="text-gray-600">👥 {booking.party_size} 人</p>
                      <p className="mt-1">
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
                      </p>
                    </div>
                    <div className="space-x-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            确认
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            取消
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
