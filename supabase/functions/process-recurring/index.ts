// Supabase Edge Function to process recurring transactions
// This function should be scheduled to run daily (e.g., via cron job or GitHub Actions)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface ProcessingResult {
  processed: number
  created: number
  errors: number
  details: Array<{
    templateId: string
    newTransactionId?: string
    error?: string
  }>
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify authorization (optional - can use service role key or API key)
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    console.log("Starting recurring transaction processing...")

    const result: ProcessingResult = {
      processed: 0,
      created: 0,
      errors: 0,
      details: [],
    }

    // Get all recurring transaction templates that are due
    const { data: templates, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("is_recurring", true)
      .eq("is_template", true)
      .eq("recurrence_enabled", true)
      .not("next_occurrence_date", "is", null)
      .lte("next_occurrence_date", new Date().toISOString().split("T")[0])

    if (fetchError) {
      console.error("Error fetching templates:", fetchError)
      return new Response(JSON.stringify({ error: "Failed to fetch recurring templates", details: fetchError }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    console.log(`Found ${templates?.length || 0} templates to process`)

    // Process each template
    for (const template of templates || []) {
      result.processed++

      try {
        // Check if end date has passed
        if (template.recurrence_end_date) {
          const endDate = new Date(template.recurrence_end_date)
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          if (endDate < today) {
            // Disable the recurring transaction
            await supabase
              .from("transactions")
              .update({ recurrence_enabled: false })
              .eq("id", template.id)

            console.log(`Disabled expired recurring transaction: ${template.id}`)
            result.details.push({
              templateId: template.id,
              error: "Expired - disabled",
            })
            continue
          }
        }

        // Create the new transaction occurrence
        const { data: newTransaction, error: insertError } = await supabase
          .from("transactions")
          .insert({
            user_id: template.user_id,
            type: template.type,
            amount: template.amount,
            category_id: template.category_id,
            category_name: template.category_name,
            description: template.description,
            date: template.next_occurrence_date,
            is_recurring: false,
            parent_transaction_id: template.id,
          })
          .select()
          .single()

        if (insertError) {
          console.error(`Error creating occurrence for ${template.id}:`, insertError)
          result.errors++
          result.details.push({
            templateId: template.id,
            error: insertError.message,
          })
          continue
        }

        // Calculate next occurrence date
        const nextDate = calculateNextOccurrence(template.next_occurrence_date, template.recurrence_pattern)

        // Update template with new next occurrence date
        const { error: updateError } = await supabase
          .from("transactions")
          .update({ next_occurrence_date: nextDate })
          .eq("id", template.id)

        if (updateError) {
          console.error(`Error updating next occurrence for ${template.id}:`, updateError)
          result.errors++
          result.details.push({
            templateId: template.id,
            newTransactionId: newTransaction.id,
            error: `Created but failed to update next occurrence: ${updateError.message}`,
          })
          continue
        }

        result.created++
        result.details.push({
          templateId: template.id,
          newTransactionId: newTransaction.id,
        })

        console.log(`Successfully created occurrence for ${template.id}, next: ${nextDate}`)
      } catch (error) {
        console.error(`Unexpected error processing ${template.id}:`, error)
        result.errors++
        result.details.push({
          templateId: template.id,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    console.log("Processing complete:", result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Fatal error:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

/**
 * Calculate the next occurrence date based on pattern
 */
function calculateNextOccurrence(currentDate: string, pattern: string): string {
  const date = new Date(currentDate)

  switch (pattern) {
    case "daily":
      date.setDate(date.getDate() + 1)
      break
    case "weekly":
      date.setDate(date.getDate() + 7)
      break
    case "biweekly":
      date.setDate(date.getDate() + 14)
      break
    case "monthly":
      date.setMonth(date.getMonth() + 1)
      break
    case "yearly":
      date.setFullYear(date.getFullYear() + 1)
      break
    default:
      throw new Error(`Unknown recurrence pattern: ${pattern}`)
  }

  return date.toISOString().split("T")[0]
}
