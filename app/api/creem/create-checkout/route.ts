import { NextRequest, NextResponse } from "next/server"

const CREEM_API_KEY = process.env.CREEM_API_KEY
const CREEM_API_URL = process.env.CREEM_API_URL || "https://test-api.creem.io"
const CREEM_TEST_MODE = process.env.CREEM_TEST_MODE !== "false" // Default to true for development

// Product IDs mapping for subscription plans
const PRODUCT_IDS: Record<string, { monthly: string; yearly: string }> = {
  basic: {
    monthly: "prod_basic_monthly",
    yearly: "prod_basic_yearly",
  },
  pro: {
    monthly: "prod_pro_monthly",
    yearly: "prod_pro_yearly",
  },
  max: {
    monthly: "prod_max_monthly",
    yearly: "prod_max_yearly",
  },
}

// Product IDs for one-time credit purchases
// TEMPORARY: Using same product ID for testing - will update after creating all products in Creem Dashboard
const CREDIT_PRODUCT_IDS: Record<number, string> = {
  100: "prod_5Y2l5t9ExT3DnmErjWZxfz",
  500: "prod_5Y2l5t9ExT3DnmErjWZxfz",
  1000: "prod_5Y2l5t9ExT3DnmErjWZxfz",
  5000: "prod_5Y2l5t9ExT3DnmErjWZxfz",
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, billingCycle, userEmail, userId, amount, credits } = body

    if (!userEmail || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!CREEM_API_KEY) {
      return NextResponse.json({ error: "Creem API key not configured" }, { status: 500 })
    }

    let productId
    let cancelUrl = "/pricing"
    let metadata: any = {
      userId,
      planId,
      billingCycle,
    }

    // Handle one-time credit purchases
    if (billingCycle === "onetime" && credits) {
      productId = CREDIT_PRODUCT_IDS[credits]
      cancelUrl = "/wallet/recharge"
      metadata = {
        userId,
        type: "credits_purchase",
        credits,
        amount,
      }

      if (!productId) {
        return NextResponse.json({ error: "Invalid credit package" }, { status: 400 })
      }
    }
    // Handle subscription plans
    else if (planId && billingCycle) {
      productId = PRODUCT_IDS[planId]?.[billingCycle]

      if (!productId) {
        return NextResponse.json({ error: "Invalid plan or billing cycle" }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create checkout session with Creem
    const checkoutResponse = await fetch(`${CREEM_API_URL}/v1/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CREEM_API_KEY,
      },
      body: JSON.stringify({
        product_id: productId,
        customer: {
          email: userEmail,
        },
        metadata,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      }),
    })

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json()
      console.error("Creem API error:", errorData)
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: checkoutResponse.status }
      )
    }

    const checkoutData = await checkoutResponse.json()

    return NextResponse.json({
      checkout_url: checkoutData.checkout_url,
      session_id: checkoutData.id,
    })
  } catch (error) {
    console.error("Checkout creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
