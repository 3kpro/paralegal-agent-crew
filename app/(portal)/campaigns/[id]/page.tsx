import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import CampaignDetailClient from './CampaignDetailClient'

export default async function CampaignDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get campaign details
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (campaignError || !campaign) {
    notFound()
  }

  // Get generated content for this campaign
  const { data: content } = await supabase
    .from('campaign_content')
    .select('*')
    .eq('campaign_id', id)
    .order('platform', { ascending: true })

  return <CampaignDetailClient campaign={campaign} content={content} />
}
