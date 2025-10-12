import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Extract video ID from various platform URLs
function extractVideoId(url: string, platform: string): string | null {
  try {
    const urlObj = new URL(url)
    
    switch (platform) {
      case 'youtube':
        // Handle YouTube URLs (youtube.com/watch?v=ID or youtu.be/ID)
        if (urlObj.hostname.includes('youtube.com')) {
          return urlObj.searchParams.get('v')
        } else if (urlObj.hostname.includes('youtu.be')) {
          return urlObj.pathname.slice(1)
        }
        break
        
      case 'tiktok':
        // Handle TikTok URLs (tiktok.com/@user/video/ID)
        const tiktokMatch = urlObj.pathname.match(/\/video\/(\d+)/)
        return tiktokMatch ? tiktokMatch[1] : null
        
      case 'instagram':
        // Handle Instagram URLs (instagram.com/reel/ID or instagram.com/p/ID)
        const igMatch = urlObj.pathname.match(/\/(reel|p)\/([A-Za-z0-9_-]+)/)
        return igMatch ? igMatch[2] : null
    }
    
    return null
  } catch (error) {
    console.error('Error extracting video ID:', error)
    return null
  }
}

// Get YouTube video statistics
async function getYouTubeStats(videoId: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=statistics&key=${youtubeApiKey}`
    )
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.items && data.items.length > 0) {
      const stats = data.items[0].statistics
      return {
        views: parseInt(stats.viewCount || '0'),
        likes: parseInt(stats.likeCount || '0')
      }
    }
    
    return { views: 0, likes: 0 }
  } catch (error) {
    console.error('Error fetching YouTube stats:', error)
    throw error
  }
}

// Get TikTok stats (Note: Limited API access - this is a placeholder)
async function getTikTokStats(videoId: string) {
  // TikTok's public API is very limited
  // In a real implementation, you'd need TikTok Business API access
  // For now, return placeholder data
  console.log('TikTok tracking not yet implemented - requires Business API access')
  return { views: 0, likes: 0 }
}

// Get Instagram stats (Note: Limited API access - this is a placeholder)
async function getInstagramStats(videoId: string) {
  // Instagram's API requires app approval and is mainly for business accounts
  // For now, return placeholder data
  console.log('Instagram tracking not yet implemented - requires Business API access')
  return { views: 0, likes: 0 }
}

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

    const { participationId, forceUpdate = false } = await req.json()
    
    if (!participationId) {
      return new Response(
        JSON.stringify({ error: 'Participation ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Tracking views for participation: ${participationId} by user: ${user.id}`)

    // Get participation details and verify ownership
    const { data: participation, error: participationError } = await supabase
      .from('campaign_participations')
      .select('*')
      .eq('id', participationId)
      .single()

    if (participationError || !participation) {
      console.error('Participation not found:', participationError)
      return new Response(
        JSON.stringify({ error: 'Participation not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Verify user owns this participation
    if (participation.creator_id !== user.id) {
      console.error('Authorization failed: user does not own participation')
      return new Response(
        JSON.stringify({ error: 'Forbidden - You can only track your own participations' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Check if we should update (avoid too frequent updates unless forced)
    const lastTracked = new Date(participation.last_tracked_at)
    const now = new Date()
    const minutesSinceLastUpdate = (now.getTime() - lastTracked.getTime()) / (1000 * 60)
    
    if (!forceUpdate && minutesSinceLastUpdate < 5) {
      return new Response(
        JSON.stringify({ 
          message: 'Recent update found, skipping',
          participation: participation
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract video ID
    const videoId = participation.video_id || extractVideoId(participation.video_url, participation.platform)
    
    if (!videoId) {
      console.error('Could not extract video ID from URL:', participation.video_url)
      return new Response(
        JSON.stringify({ error: 'Invalid video URL' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Update video_id if it wasn't stored
    if (!participation.video_id) {
      await supabase
        .from('campaign_participations')
        .update({ video_id: videoId })
        .eq('id', participationId)
    }

    // Get current stats based on platform
    let currentStats = { views: 0, likes: 0 }
    
    try {
      switch (participation.platform) {
        case 'youtube':
          currentStats = await getYouTubeStats(videoId)
          break
        case 'tiktok':
          currentStats = await getTikTokStats(videoId)
          break
        case 'instagram':
          currentStats = await getInstagramStats(videoId)
          break
        default:
          throw new Error(`Unsupported platform: ${participation.platform}`)
      }
    } catch (apiError) {
      console.error(`Error fetching stats from ${participation.platform}:`, apiError)
      // Continue with existing data if API fails
      currentStats = {
        views: participation.current_views || 0,
        likes: participation.current_likes || 0
      }
    }

    // Update participation with new stats
    const { error: updateError } = await supabase
      .from('campaign_participations')
      .update({
        current_views: currentStats.views,
        current_likes: currentStats.likes,
        last_tracked_at: now.toISOString()
      })
      .eq('id', participationId)

    if (updateError) {
      console.error('Error updating participation:', updateError)
      throw updateError
    }

    // Log the tracking data
    const { error: logError } = await supabase
      .from('view_tracking_logs')
      .insert({
        participation_id: participationId,
        views: currentStats.views,
        likes: currentStats.likes
      })

    if (logError) {
      console.error('Error logging tracking data:', logError)
    }

    console.log(`Updated stats for ${participation.platform} video ${videoId}: ${currentStats.views} views, ${currentStats.likes} likes`)

    return new Response(
      JSON.stringify({
        success: true,
        platform: participation.platform,
        videoId,
        stats: currentStats,
        previousViews: participation.current_views || 0,
        viewIncrease: currentStats.views - (participation.current_views || 0)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in track-video-views function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})