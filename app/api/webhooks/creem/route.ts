import { NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"

const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET

// Verify Creem webhook signature
function verifySignature(payload: string, signature: string): boolean {
  if (!CREEM_WEBHOOK_SECRET) {
    console.error("CREEM_WEBHOOK_SECRET is not configured")
    return false
  }

  const computedSignature = createHmac("sha256", CREEM_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex")

  return computedSignature === signature
}

// Handle checkout.completed event
async function handleCheckoutCompleted(event: any) {
  const { order, customer, subscription, metadata } = event.object

  console.log("Checkout completed:", {
    orderId: order.id,
    customerId: customer.id,
    subscriptionId: subscription?.id,
    metadata,
  })

  // TODO: Implement your business logic here:
  // 1. Grant user access to the service
  // 2. Add credits to user's wallet
  // 3. Update subscription status in database
  // 4. Send confirmation email to user

  // Example: Update user credits
  // await updateUserCredits(metadata.userId, calculateCredits(order.product_id))
}

// Handle subscription.paid event
async function handleSubscriptionPaid(event: any) {
  const { subscription, customer, metadata } = event.object

  console.log("Subscription paid:", {
    subscriptionId: subscription.id,
    customerId: customer.id,
    metadata,
  })

  // TODO: Implement subscription payment logic
  // 1. Extend user's subscription access
  // 2. Update subscription period in database
}

// Handle subscription.canceled event
async function handleSubscriptionCanceled(event: any) {
  const { subscription, customer } = event.object

  console.log("Subscription canceled:", {
    subscriptionId: subscription.id,
    customerId: customer.id,
  })

  // TODO: Implement cancellation logic
  // 1. Revoke user access
  // 2. Update subscription status
}

export async function POST(request: NextRequest) {
  try {
    // Get the signature from headers
    const signature = request.headers.get("creem-signature")
    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 401 }
      )
    }

    // Get the raw body for signature verification
    const rawBody = await request.text()

    // Verify the signature
    if (!verifySignature(rawBody, signature)) {
      console.error("Invalid webhook signature")
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    // Parse the webhook event
    const event = JSON.parse(rawBody)

    console.log("Received webhook event:", event.eventType)

    // Route to appropriate handler based on event type
    switch (event.eventType) {
      case "checkout.completed":
        await handleCheckoutCompleted(event)
        break

      case "subscription.paid":
        await handleSubscriptionPaid(event)
        break

      case "subscription.canceled":
        await handleSubscriptionCanceled(event)
        break

      case "subscription.expired":
        console.log("Subscription expired:", event.object.id)
        // TODO: Handle subscription expiration
        break

      case "refund.created":
        console.log("Refund created:", event.object.id)
        // TODO: Handle refund logic
        break

      default:
        console.log("Unhandled event type:", event.eventType)
    }

    // Return 200 OK to acknowledge receipt of the webhook
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
