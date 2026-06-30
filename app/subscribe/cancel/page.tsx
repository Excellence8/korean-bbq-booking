import Link from 'next/link'

export default function SubscribeCancel() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">😅</div>
        <h1 className="text-3xl font-bold text-gray-700">订阅已取消</h1>
        <p className="text-gray-600 mt-4">你没有完成订阅，可以随时回来升级为商家。</p>
        <div className="mt-6 space-y-3">
          <a
            href="/subscribe"
            className="block w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            重新订阅
          </a>
          <a
            href="/"
            className="block w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            返回首页
          </a>
        </div>
      </div>
    </main>
  )
}
