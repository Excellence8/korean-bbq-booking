'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Restaurant {
  id: number
  name: string
  address: string
  phone: string
  capacity: number
  description: string
  image_url: string
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRestaurants = async (search?: string) => {
    setLoading(true)
    setError(null)

    let query = supabase.from('restaurants').select('*')

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      setError(error.message)
    } else {
      setRestaurants(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchRestaurants(searchTerm)
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">加载中...</div>
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">韩国烤肉餐厅</h1>

        <form onSubmit={handleSearch} className="mb-8 flex gap-4">
          <input
            type="text"
            placeholder="搜索餐厅..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            搜索
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                fetchRestaurants()
              }}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              清除
            </button>
          )}
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {restaurants.length === 0 ? (
          <p className="text-gray-500">暂无餐厅数据</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                className="block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {restaurant.image_url && (
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold">{restaurant.name}</h2>
                  <p className="text-gray-600 text-sm">{restaurant.address}</p>
                  <p className="text-gray-600 text-sm">容量：{restaurant.capacity} 人</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
