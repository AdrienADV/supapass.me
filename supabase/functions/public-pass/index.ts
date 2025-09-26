import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};
async function getPublicPass(passId) {
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const { data: pass, error: passError } = await supabase.from('passes').select(`
    id,
    user_id,
    created_at,
    updated_at,
    pull_requests_count,
    merged_pull_requests_count,
    issues_opened_count,
    total_contributions_count,
    is_core_member
  `).eq('id', passId).single();
    if (passError || !pass) {
      throw new Error('Pass not found');
    }
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(pass.user_id);
    if (userError || !user.user) {
      throw new Error('User not found');
    }
    return {
      pass,
      user: {
        id: user.user.user_metadata.id,
        userName: user.user.user_metadata?.user_name,
        photo: user.user.user_metadata?.photo
      }
    };
  } catch (error) {
    console.error(`Error fetching public pass ${passId}:`, error);
    throw error;
  }
}
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    if (!Deno.env.get('SUPABASE_URL') || !Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')) {
      throw new Error('Supabase configuration missing');
    }
    const url = new URL(req.url);
    const passId = url.pathname.split('/').pop();
    if (!passId || passId === 'public-pass') {
      if (req.method === 'POST') {
        const { passId: bodyPassId } = await req.json();
        if (!bodyPassId?.trim()) {
          throw new Error('Missing pass ID');
        }
        const passData = await getPublicPass(bodyPassId.trim());
        return Response.json(passData, {
          headers: corsHeaders
        });
      }
      throw new Error('Missing pass ID in URL');
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(passId)) {
      throw new Error('Invalid pass ID format');
    }
    const passData = await getPublicPass(passId);
    return Response.json(passData, {
      headers: corsHeaders
    });
  } catch (error) {
    const status = error.message.includes('Missing') || error.message.includes('Invalid') ? 400 : error.message.includes('not found') ? 404 : 500;
    return Response.json({
      error: error.message
    }, {
      status,
      headers: corsHeaders
    });
  }
});
