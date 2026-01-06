import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@/lib/supabase/server'

// Helper function to poll task status
async function pollTaskStatus(taskId: string, apiKey: string, maxAttempts = 30, interval = 2000): Promise<any> {
  const taskUrl = `https://api.apimart.ai/v1/tasks/${taskId}`

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(taskUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Task status check failed: ${response.status}`)
      }

      const data = await response.json()
      console.log(`Task ${taskId} status check - Attempt:`, attempt + 1)
      console.log("Response data:", JSON.stringify(data, null, 2))

      // Check various status fields
      // API returns: { code: 200, data: { status: "pending", id: "...", ... } }
      const status = data.data?.status || data.status || data.code

      // Don't treat HTTP code 200 as completion - check actual task status
      // Check if task is completed (succeeded/completed/success)
      if (status === "succeeded" || status === "completed" || status === "success") {
        console.log("Task completed successfully!")
        return data
      }

      // If task failed, throw error
      if (status === "failed" || status === "error") {
        const errorMsg = data.error || data.message || data.data?.[0]?.error || "Task failed"
        throw new Error(errorMsg)
      }

      // If still processing, wait and retry
      if (status === "processing" || status === "pending" || status === "queued" || status === "submitted") {
        console.log(`Task still ${status}, waiting ${interval}ms...`)
        await new Promise(resolve => setTimeout(resolve, interval))
        continue
      }

      // Unknown status, return data for inspection
      console.log("Unknown status, returning data:", JSON.stringify(data, null, 2))
      return data
    } catch (error) {
      console.error(`Error polling task status (attempt ${attempt + 1}):`, error)
      if (attempt === maxAttempts - 1) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, interval))
    }
  }

  throw new Error("Task timeout: Maximum polling attempts reached")
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      )
    }

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (!user || userError) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { prompt, imageBase64, model = "nano-banana", size = "1:1" } = body

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    // Convert model name from kebab-case to snake_case for database
    const dbModel = model.replace(/-/g, '_')

    // Map frontend models to API models
    const apiModel = "gemini-2.5-flash-image-preview" // All models use the same API

    // Determine credits needed and type
    const creditsNeeded = imageBase64 ? 2 : 3
    const type = imageBase64 ? "image_to_image" : "text_to_image"

    // Check user's credits balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits_balance')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError)
      return NextResponse.json(
        { error: "Failed to verify credits balance" },
        { status: 500 }
      )
    }

    if (profile.credits_balance < creditsNeeded) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${creditsNeeded} credits but have ${profile.credits_balance}.` },
        { status: 402 }
      )
    }

    // Get API configuration from environment variables
    const apiUrl = process.env.NANO_BANANA_API_URL || "https://api.apimart.ai/v1/images/generations"
    const apiKey = process.env.NANO_BANANA_API_KEY

    if (!apiKey) {
      console.error("NANO_BANANA_API_KEY is not configured")
      return NextResponse.json(
        { error: "API configuration error. Please check server configuration." },
        { status: 500 }
      )
    }

    // Prepare the payload
    const payload: {
      model: string
      prompt: string
      size: string
      n: number
      image_urls?: string[]
    } = {
      model: apiModel,
      prompt,
      size,
      n: 1,
    }

    // Add image if provided
    if (imageBase64) {
      payload.image_urls = [imageBase64]
    }

    console.log("Calling generation API with:", { apiUrl, model: apiModel, size, hasImage: !!imageBase64 })
    console.log("Request payload:", JSON.stringify(payload, null, 2))

    // Call the Nano Banana API to generate image
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("API Error:", response.status, errorData)
      return NextResponse.json(
        { error: "Failed to generate image", details: errorData },
        { status: response.status }
      )
    }

    const initialData = await response.json()
    console.log("Initial API Response:", JSON.stringify(initialData, null, 2))

    // Check if response contains task ID
    // API returns: { code: 200, data: [{ status: "submitted", task_id: "..." }] }
    let taskId = initialData.task_id || initialData.id || initialData.taskId || initialData.task?.id

    // Try to extract from data array
    if (!taskId && initialData.data && Array.isArray(initialData.data) && initialData.data.length > 0) {
      taskId = initialData.data[0].task_id || initialData.data[0].id
    }

    if (!taskId) {
      console.error("No task ID found in response. Keys:", Object.keys(initialData))
      console.error("Full response data:", JSON.stringify(initialData, null, 2))
      // If no task ID, try to return data directly
      if (initialData.data && initialData.data.length > 0) {
        return NextResponse.json(initialData)
      }
      return NextResponse.json(
        { error: "No task ID in response", data: initialData },
        { status: 500 }
      )
    }

    console.log("Task ID received:", taskId)

    // Poll task status with longer timeout for image generation
    // maxAttempts: 60 attempts * 3 seconds = 3 minutes max wait time
    const taskResult = await pollTaskStatus(taskId, apiKey, 60, 3000)
    console.log("Task completed:", JSON.stringify(taskResult, null, 2))

    // Extract image URLs from task result
    // API might return various formats, try multiple patterns
    let images: string[] = []

    console.log("Attempting to extract images from response...")
    console.log("Full taskResult structure:", JSON.stringify(taskResult, null, 2))
    console.log("Checking paths:")
    console.log("  - data?.result?.images:", !!taskResult.data?.result?.images)
    console.log("  - data?.result?.url:", !!taskResult.data?.result?.url)
    console.log("  - result?.images:", !!taskResult.result?.images)
    console.log("  - result?.url:", !!taskResult.result?.url)

    // Format 1: { code: 200, data: { url: "..." } }
    if (taskResult.data?.url) {
      images = [taskResult.data.url]
      console.log("Found image in data.url")
    }
    // Format 2: { code: 200, data: { urls: ["...", "..."] } }
    else if (taskResult.data?.urls && Array.isArray(taskResult.data.urls)) {
      images = taskResult.data.urls
      console.log("Found images in data.urls:", images.length)
    }
    // Format 3: { code: 200, data: [{ url: "..." }] }
    else if (taskResult.data?.data && Array.isArray(taskResult.data.data)) {
      images = taskResult.data.data.map((item: any) => item.url || item.image || item)
      console.log("Found images in data.data:", images.length)
    }
    // Format 4: { code: 200, data: [{ url: "..." }] } (direct data array)
    else if (taskResult.data && Array.isArray(taskResult.data)) {
      images = taskResult.data.map((item: any) => item.url || item.image || item)
      console.log("Found images in data array:", images.length)
    }
    // Format 5: { images: [{ url: "..." }] } or { images: [{ url: ["..."] }] }
    else if (taskResult.images && Array.isArray(taskResult.images)) {
      images = taskResult.images.map((item: any) => {
        const url = item.url || item.image || item
        // Handle case where url is an array
        return Array.isArray(url) ? url[0] : url
      })
      console.log("Found images in images array:", images.length)
    }
    // Format 5b: { data: { result: { images: [{ url: ["..."] }] } } }
    else if (taskResult.data?.result?.images && Array.isArray(taskResult.data.result.images)) {
      images = taskResult.data.result.images.map((item: any) => {
        const url = item.url || item.image || item
        // Handle case where url is an array
        return Array.isArray(url) ? url[0] : url
      })
      console.log("Found images in data.result.images array:", images.length)
    }
    // Format 5c: { result: { images: [{ url: ["..."] }] } }
    else if (taskResult.result?.images && Array.isArray(taskResult.result.images)) {
      images = taskResult.result.images.map((item: any) => {
        const url = item.url || item.image || item
        // Handle case where url is an array
        return Array.isArray(url) ? url[0] : url
      })
      console.log("Found images in result.images array:", images.length)
    }
    // Format 6: { data: { result: { url: "..." } } } or { data: { result: { url: ["..."] } } }
    else if (taskResult.data?.result?.url) {
      const url = taskResult.data.result.url
      images = [Array.isArray(url) ? url[0] : url]
      console.log("Found image in data.result.url")
    }
    // Format 6b: { result: { url: "..." } } or { result: { url: ["..."] } }
    else if (taskResult.result?.url) {
      const url = taskResult.result.url
      images = [Array.isArray(url) ? url[0] : url]
      console.log("Found image in result.url")
    }
    // Format 7: { url: "..." }
    else if (taskResult.url) {
      images = [taskResult.url]
      console.log("Found image in url")
    }
    // Format 8: { data: "base64..." } (single image as string)
    else if (typeof taskResult.data === 'string') {
      images = [taskResult.data]
      console.log("Found image as data string")
    }

    console.log("Extracted images:", images.length, images)

    if (images.length === 0) {
      throw new Error("No images found in task result")
    }

    // Save usage record and deduct credits
    const { error: insertError } = await supabase
      .from('usage_records')
      .insert({
        user_id: user.id,
        type: type,
        model: dbModel,
        prompt: prompt,
        image_url: images[0], // Save the first generated image URL
        credits_used: creditsNeeded,
      })

    if (insertError) {
      console.error("Error saving usage record:", insertError)
      // Don't fail the request if usage record insert fails
      // But log it for monitoring
    }

    // Deduct credits from user's balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits_balance: profile.credits_balance - creditsNeeded })
      .eq('id', user.id)

    if (updateError) {
      console.error("Error deducting credits:", updateError)
      // Don't fail the request if credit deduction fails
      // But log it for monitoring
    }

    // Return in the format expected by the frontend
    return NextResponse.json({
      data: images.map(url => ({ url })),
      task_id: taskId,
      status: taskResult.status,
      credits_remaining: profile.credits_balance - creditsNeeded,
    })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
