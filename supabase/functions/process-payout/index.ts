import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { participationId, userId } = await req.json()
    
    // Verify the authenticated user matches the userId parameter
    if (user.id !== userId) {
      console.error('Authorization failed: authenticated user does not match userId')
      return new Response(
        JSON.stringify({ error: 'Forbidden - User ID mismatch' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }
    
    if (!participationId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Participation ID and User ID are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Processing payout for participation: ${participationId}, user: ${userId}`)

    // Get participation with campaign details
    const { data: participation, error: participationError } = await supabase
      .from('campaign_participations')
      .select(`
        *,
        campaigns (
          payout_type,
          payout_rate,
          vip_bonus,
          max_payout,
          vip_max_payout,
          budget,
          artist_id
        )
      `)
      .eq('id', participationId)
      .eq('creator_id', userId)
      .single()

    if (participationError || !participation) {
      console.error('Participation not found or not owned by user:', participationError)
      return new Response(
        JSON.stringify({ error: 'Participation not found or access denied' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Check if already claimed
    if (participation.payout_claimed) {
      return new Response(
        JSON.stringify({ error: 'Payout already claimed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if participation is approved
    if (participation.status !== 'approved') {
      return new Response(
        JSON.stringify({ error: 'Participation not approved yet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const campaign = participation.campaigns
    if (!campaign) {
      return new Response(
        JSON.stringify({ error: 'Campaign not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Get user profile to check membership type
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('membership_type')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile) {
      console.error('User profile not found:', profileError)
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const isVip = profile.membership_type === 'premium'

    // Calculate payout based on campaign type
    let payoutAmount = 0
    const currentViews = participation.current_views || 0
    const currentLikes = participation.current_likes || 0

    switch (campaign.payout_type) {
      case 'per_view':
        payoutAmount = currentViews * parseFloat(campaign.payout_rate)
        if (isVip && campaign.vip_bonus) {
          payoutAmount += currentViews * parseFloat(campaign.vip_bonus)
        }
        break
        
      case 'per_like':
        payoutAmount = currentLikes * parseFloat(campaign.payout_rate)
        if (isVip && campaign.vip_bonus) {
          payoutAmount += currentLikes * parseFloat(campaign.vip_bonus)
        }
        break
        
      case 'flat_rate':
        payoutAmount = parseFloat(campaign.payout_rate)
        if (isVip && campaign.vip_bonus) {
          payoutAmount += parseFloat(campaign.vip_bonus)
        }
        break
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid payout type' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }

    // Apply max payout limits
    const maxPayout = isVip && campaign.vip_max_payout 
      ? parseFloat(campaign.vip_max_payout)
      : parseFloat(campaign.max_payout || '999999')
      
    if (payoutAmount > maxPayout) {
      payoutAmount = maxPayout
    }

    // Round to 2 decimal places
    payoutAmount = Math.round(payoutAmount * 100) / 100

    if (payoutAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'No payout amount calculated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Update participation with payout information
    const { error: updateError } = await supabase
      .from('campaign_participations')
      .update({
        payout_claimed: true,
        payout_amount: payoutAmount,
        payout_claimed_at: new Date().toISOString()
      })
      .eq('id', participationId)

    if (updateError) {
      console.error('Error updating participation:', updateError)
      throw updateError
    }

    console.log(`Payout processed: $${payoutAmount} for participation ${participationId}`)

    return new Response(
      JSON.stringify({
        success: true,
        payoutAmount,
        isVip,
        calculation: {
          type: campaign.payout_type,
          rate: campaign.payout_rate,
          vipBonus: isVip ? campaign.vip_bonus : null,
          views: currentViews,
          likes: currentLikes,
          maxPayout
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in process-payout function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})