import { getSupabase } from '@/lib/supabase.js';

export const topicAssetsBucket = 'orbit-topic-assets';
export const maxTopicAssetSize = 50 * 1024 * 1024;
const signedUrlLifetimeSeconds = 60 * 60 * 24 * 7;

function createStoragePath(topicId, file) {
  const extension = file.name.includes('.')
    ? file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)
    : '';
  return `${topicId}/summary/${crypto.randomUUID()}${extension ? `.${extension}` : ''}`;
}

async function createSignedUrl(path, options) {
  const { data, error } = await getSupabase()
    .storage
    .from(topicAssetsBucket)
    .createSignedUrl(path, signedUrlLifetimeSeconds, options);
  if (error) throw error;
  return data.signedUrl;
}

async function removeUploadedFile(path) {
  const { error } = await getSupabase()
    .storage
    .from(topicAssetsBucket)
    .remove([path]);
  if (error) throw error;
}

export async function uploadTopicImage(topicId, file) {
  if (file.size > maxTopicAssetSize) {
    throw new Error('A imagem deve ter no máximo 50 MB.');
  }

  const path = createStoragePath(topicId, file);
  const { error } = await getSupabase()
    .storage
    .from(topicAssetsBucket)
    .upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });
  if (error) throw error;

  try {
    return {
      path,
      signedUrl: await createSignedUrl(path),
    };
  } catch (error) {
    try {
      await removeUploadedFile(path);
    } catch (cleanupError) {
      throw new Error(`${error.message} O arquivo enviado também não pôde ser removido: ${cleanupError.message}`);
    }
    throw error;
  }
}

export async function deleteTopicAssets(topicId) {
  const folderPath = `${topicId}/summary`;
  const storage = getSupabase().storage.from(topicAssetsBucket);
  const paths = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await storage.list(folderPath, {
      limit: pageSize,
      offset,
    });
    if (error) throw error;

    const files = data ?? [];
    paths.push(
      ...files
        .filter((file) => file.id)
        .map((file) => `${folderPath}/${file.name}`),
    );
    if (files.length < pageSize) break;
    offset += files.length;
  }

  for (let index = 0; index < paths.length; index += 100) {
    const { error } = await storage.remove(paths.slice(index, index + 100));
    if (error) throw error;
  }
}

export function getTopicAssetUrl(path) {
  return createSignedUrl(path);
}
