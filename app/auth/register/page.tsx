'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Register() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'user' | 'merchant'>('user')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (password.length < 6) {
      setError('密码长度至少为 6 位')
      setLoading(false)
      return
    }

    // 1. 在 Supabase Auth 中注册
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // 2. 在 users 表中创建记录
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: data.user.id,
          email: email,
          role: role,
        }])

      if (insertError) {
        setError('用户记录创建失败：' + insertError.message)
        setLoading(false)
        return
      }

      setMessage(`注册成功！你已注册为${role === 'merchant' ? '商家' : '用户'}`)
      setTimeout(() => {
        router.push('/auth/login')
      }, 1500)
    }
    setLoading(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">注册</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">密码（至少 6 位）</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">注册类型</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="user"
                  checked={role === 'user'}
                  onChange={() => setRole('user')}
                />
                普通用户
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="merchant"
                  checked={role === 'merchant'}
                  onChange={() => setRole('merchant')}
                />
                商家
              </label>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <p className="mt-4 text-sm">
          已有账号？ <a href="/auth/login" className="text-blue-600">登录</a>
        </p>
      </div>
    </main>
  )
}
