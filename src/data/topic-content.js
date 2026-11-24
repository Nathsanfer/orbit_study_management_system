import { getSupabase } from '@/lib/supabase.js';

export async function saveTopicContent(topicId, content) {
  const { error } = await getSupabase()
    .from('topicos')
    .update({ conteudo: content })
    .eq('id', topicId);
  if (error) throw error;
}
