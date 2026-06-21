'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Booking {
  id: number
  restaurant_id: number
  party_size: number
  booking_time: string
  status: string
  created_at: string
  restaurants?: {
    name: string
    address: string
  }
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUser(user)

      // 获取预订数据（包含餐厅信息）
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          restaurants:restaurant_id (name, address)
        `)
        .eq('user_id', user.id)
        .order('booking_time', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setBookings(data || [])
      }
      setLoading(false)
    }

    fetchUserAndBookings()
  }, [])

  const handleCancel = async (bookingId: number) => {
    if (!confirm('确定要取消这个预订吗？')) return

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)

    if (error) {
      alert('取消失败：' + error.message)
    } else {
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ))
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">加载中...</div>
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-2xl font-bold mb-4">请先登录</h1>
        <a href="/auth/login" className="text-blue-600 hover:underline">去登录</a>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">我的预订</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {bookings.length === 0 ? (
          <p className="text-gray-500">暂无预订记录</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {booking.restaurants?.name || `餐厅 #${booking.restaurant_id}`}
                    </h3>
                    <p className="text-gray-600 text-sm">{booking.restaurants?.address}</p>
                    <p className="text-gray-600">
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
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      取消预订
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
