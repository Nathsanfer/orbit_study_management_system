import { getSupabase } from '@/lib/supabase.js';

export async function saveTopicMasteryRating(topicId, rating) {
  const { data, error } = await getSupabase()
    .from('topicos')
    .update({ nivel_dominio: rating })
    .eq('id', topicId)
    .select('nivel_dominio')
    .single();
  if (error) throw error;

  return data.nivel_dominio;
}
