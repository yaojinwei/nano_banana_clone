import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    version: "2.0",
    timestamp: new Date().toISOString(),
    features: {
      creem_integration: true,
      webhook_handler: true,
      test_mode: true
    },
    message: "If you see this, the latest code is deployed!"
  })
}
