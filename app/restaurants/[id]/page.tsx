'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

interface Restaurant {
  id: number
  name: string
  address: string
  phone: string
  capacity: number
  description: string
  image_url: string
}

export default function RestaurantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 预订表单状态
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [partySize, setPartySize] = useState<number>(2)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!id) return

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', parseInt(id))
        .single()

      if (error) {
        setError(error.message)
      } else {
        setRestaurant(data)
      }
      setLoading(false)
    }

    fetchRestaurant()
  }, [id])

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setSubmitError('请先登录')
      setSubmitting(false)
      return
    }

    // 合并日期和时间
    const bookingTimeFull = new Date(`${bookingDate}T${bookingTime}`)

    const { error } = await supabase
      .from('bookings')
      .insert([{
        restaurant_id: parseInt(id),
        user_id: user.id,
        party_size: partySize,
        booking_time: bookingTimeFull.toISOString(),
        status: 'pending'
      }])

    if (error) {
      setSubmitError(error.message)
    } else {
      setSubmitSuccess(true)
      setBookingDate('')
      setBookingTime('')
      setPartySize(2)
    }
    setSubmitting(false)
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">加载中...</div>
  }

  if (error || !restaurant) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">{error || '餐厅不存在'}</div>
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline mb-4"
        >
          ← 返回
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {restaurant.image_url && (
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-64 object-cover"
            />
          )}
          <div className="p-6">
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <p className="text-gray-600 mt-2">{restaurant.address}</p>
            <p className="text-gray-600">📞 {restaurant.phone}</p>
            <p className="text-gray-600">👥 容量：{restaurant.capacity} 人</p>
            {restaurant.description && (
              <p className="mt-4 text-gray-700">{restaurant.description}</p>
            )}

            <div className="mt-8 border-t pt-6">
              <h2 className="text-2xl font-semibold mb-4">预订</h2>
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">日期</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">时间</label>
                    <input
                      type="time"
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">人数</label>
                    <input
                      type="number"
                      value={partySize}
                      onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                      min={1}
                      max={restaurant.capacity}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {submitting ? '提交中...' : '确认预订'}
                </button>
                {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
                {submitSuccess && <p className="text-green-500 text-sm">✅ 预订成功！</p>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
