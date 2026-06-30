'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      setUser(user)
      if (user) {
        checkUserRole(user)
      } else {
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setUser(user)
      if (user) {
        checkUserRole(user)
      } else {
        setUserRole(null)
        setIsSuperAdmin(false)
        setLoading(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const checkUserRole = async (user: any) => {
    // 超管：硬编码邮箱
    if (user.email === 'dgsjk3258@126.com') {
      setIsSuperAdmin(true)
      setUserRole('merchant')
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    setUserRole(data?.role || 'user')
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">加载中...</div>
  }

  const isMerchant = userRole === 'merchant'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Korean BBQ Booking</h1>
      <p className="mt-4 text-lg">韩国烤肉预订平台</p>

      <div className="mt-8 space-x-4 flex flex-wrap justify-center gap-2">
        <Link href="/restaurants" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          浏览餐厅
        </Link>
        {user && (
          <Link href="/my-bookings" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            我的预订
          </Link>
        )}
        {user && !isMerchant && (
          <Link href="/subscribe" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            ⭐ 升级为商家
          </Link>
        )}
        {user && isMerchant && (
          <Link href="/admin" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            🔐 商家管理
          </Link>
        )}
        {isSuperAdmin && (
          <Link href="/superadmin" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            🏢 平台管理
          </Link>
        )}
      </div>

      {user ? (
        <div className="mt-8 text-center">
          <p className="text-green-600">✅ 已登录：{user.email}</p>
          {isMerchant && <p className="text-purple-600 text-sm">商家账号</p>}
          {isSuperAdmin && <p className="text-red-600 text-sm font-bold">平台管理员</p>}
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
EOFcat > app/page.tsx << 'EOF'
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      setUser(user)
      if (user) {
        checkUserRole(user)
      } else {
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setUser(user)
      if (user) {
        checkUserRole(user)
      } else {
        setUserRole(null)
        setIsSuperAdmin(false)
        setLoading(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const checkUserRole = async (user: any) => {
    // 超管：硬编码邮箱
    if (user.email === 'dgsjk3258@126.com') {
      setIsSuperAdmin(true)
      setUserRole('merchant')
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    setUserRole(data?.role || 'user')
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">加载中...</div>
  }

  const isMerchant = userRole === 'merchant'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Korean BBQ Booking</h1>
      <p className="mt-4 text-lg">韩国烤肉预订平台</p>

      <div className="mt-8 space-x-4 flex flex-wrap justify-center gap-2">
        <Link href="/restaurants" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          浏览餐厅
        </Link>
        {user && (
          <Link href="/my-bookings" className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            我的预订
          </Link>
        )}
        {user && !isMerchant && (
          <Link href="/subscribe" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            ⭐ 升级为商家
          </Link>
        )}
        {user && isMerchant && (
          <Link href="/admin" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            🔐 商家管理
          </Link>
        )}
        {isSuperAdmin && (
          <Link href="/superadmin" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            🏢 平台管理
          </Link>
        )}
      </div>

      {user ? (
        <div className="mt-8 text-center">
          <p className="text-green-600">✅ 已登录：{user.email}</p>
          {isMerchant && <p className="text-purple-600 text-sm">商家账号</p>}
          {isSuperAdmin && <p className="text-red-600 text-sm font-bold">平台管理员</p>}
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
