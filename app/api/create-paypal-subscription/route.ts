import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { planId, userId } = body

    if (!planId || !userId) {
      return NextResponse.json(
        { error: '缺少 planId 或 userId' },
        { status: 400 }
      )
    }

    const clientId = process.env.PAYPAL_CLIENT_ID
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'PayPal 环境变量未配置' },
        { status: 500 }
      )
    }

    // 获取 PayPal Access Token
    const authResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    const authData = await authResponse.json()

    if (!authResponse.ok) {
      console.error('PayPal Auth Error:', authData)
      return NextResponse.json(
        { error: 'PayPal 认证失败' },
        { status: 500 }
      )
    }

    // 创建订阅
    const subscriptionResponse = await fetch('https://api-m.sandbox.paypal.com/v1/billing/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: {
          email_address: body.email || 'customer@example.com',
        },
        application_context: {
          brand_name: 'Korean BBQ Booking',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscribe/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscribe/cancel`,
        },
      }),
    })

    const subscriptionData = await subscriptionResponse.json()

    if (!subscriptionResponse.ok) {
      console.error('PayPal Subscription Error:', subscriptionData)
      return NextResponse.json(
        { error: subscriptionData.message || '创建订阅失败' },
        { status: 500 }
      )
    }

    // 提取批准链接
    const approvalLink = subscriptionData.links?.find((link: any) => link.rel === 'approve')?.href

    if (!approvalLink) {
      return NextResponse.json(
        { error: '无法获取 PayPal 批准链接' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      subscriptionId: subscriptionData.id,
      approvalUrl: approvalLink,
    })

  } catch (error: any) {
    console.error('PayPal API Error:', error)
    return NextResponse.json(
      { error: error.message || '服务器内部错误' },
      { status: 500 }
    )
  }
}
