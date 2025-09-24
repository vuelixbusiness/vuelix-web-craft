import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DatabaseSubmission {
  id: string
  status: string
  updated_at: string
  creator_id: string
  campaign_id: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting status transition check...')

    // Find submissions that have been "live" for 10+ days
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    const { data: eligibleSubmissions, error: fetchError } = await supabaseClient
      .from('campaign_participations')
      .select('id, status, updated_at, creator_id, campaign_id')
      .eq('status', 'live')
      .lt('updated_at', tenDaysAgo.toISOString())

    if (fetchError) {
      console.error('Error fetching eligible submissions:', fetchError)
      throw fetchError
    }

    console.log(`Found ${eligibleSubmissions?.length || 0} submissions eligible for status transition`)

    if (!eligibleSubmissions || eligibleSubmissions.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No submissions eligible for status transition',
          processed: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    let processedCount = 0
    const errors: string[] = []

    // Process each eligible submission
    for (const submission of eligibleSubmissions) {
      try {
        console.log(`Processing submission ${submission.id}...`)

        // Update status to paid_out
        const { error: updateError } = await supabaseClient
          .from('campaign_participations')
          .update({ 
            status: 'paid_out',
            updated_at: new Date().toISOString()
          })
          .eq('id', submission.id)

        if (updateError) {
          console.error(`Error updating submission ${submission.id}:`, updateError)
          errors.push(`Failed to update submission ${submission.id}: ${updateError.message}`)
          continue
        }

        // Trigger payout processing
        const { error: payoutError } = await supabaseClient.functions.invoke('process-payout', {
          body: {
            participationId: submission.id,
            userId: submission.creator_id
          }
        })

        if (payoutError) {
          console.error(`Error processing payout for submission ${submission.id}:`, payoutError)
          errors.push(`Failed to process payout for submission ${submission.id}: ${payoutError.message}`)
          // Don't continue here - the status was already updated
        }

        processedCount++
        console.log(`Successfully processed submission ${submission.id}`)

      } catch (error) {
        console.error(`Unexpected error processing submission ${submission.id}:`, error)
        errors.push(`Unexpected error for submission ${submission.id}: ${error.message}`)
      }
    }

    const result = {
      message: `Processed ${processedCount} submissions`,
      processed: processedCount,
      total: eligibleSubmissions.length,
      errors: errors.length > 0 ? errors : undefined
    }

    console.log('Status transition processing completed:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in status transition processing:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})