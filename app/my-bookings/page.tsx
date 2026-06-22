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
  restaurants?: { name: string; address: string }
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUser(user)

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

    setActionLoading(bookingId)
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
    setActionLoading(null)
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

  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const otherBookings = bookings.filter(b => b.status !== 'pending')

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">📋 我的预订</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* 待确认预订 */}
        {pendingBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-yellow-700 mb-4">⏳ 待确认</h2>
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="bg-white border border-yellow-200 rounded-lg p-4 shadow-sm">
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
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          待确认
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={actionLoading === booking.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading === booking.id ? '处理中...' : '取消预订'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 历史预订 */}
        {otherBookings.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-600 mb-4">📜 历史记录</h2>
            <div className="space-y-4">
              {otherBookings.map((booking) => (
                <div key={booking.id} className="bg-white border rounded-lg p-4 shadow-sm opacity-75">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {booking.restaurants?.name || `餐厅 #${booking.restaurant_id}`}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        📅 {new Date(booking.booking_time).toLocaleString('zh-CN')}
                      </p>
                      <p className="text-gray-600">👥 {booking.party_size} 人</p>
                      <p className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : ''}
                          ${booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                          ${booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                        `}>
                          {booking.status === 'confirmed' ? '已确认' :
                           booking.status === 'cancelled' ? '已取消' :
                           booking.status === 'completed' ? '已完成' : booking.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bookings.length === 0 && (
          <p className="text-gray-500">暂无预订记录</p>
        )}
      </div>
    </main>
  )
}
