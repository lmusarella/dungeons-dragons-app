import { supabase } from '../../lib/supabase.js';

const SESSION_FILES_BUCKET = 'journal-session-files';

export async function fetchEntries(characterId) {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('character_id', characterId)
    .order('entry_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTags(userId) {
  const { data, error } = await supabase
    .from('journal_tags')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchEntryTags(entryIds) {
  if (!entryIds.length) return [];
  const { data, error } = await supabase
    .from('journal_entry_tags')
    .select('*')
    .in('entry_id', entryIds);
  if (error) throw error;
  return data ?? [];
}

export async function fetchSessionFiles(characterId) {
  const { data, error } = await supabase
    .from('journal_session_files')
    .select('*')
    .eq('character_id', characterId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function uploadSessionFile({ userId, characterId, file }) {
  const extension = (file.name.split('.').pop() || 'pdf').toLowerCase();
  const safeBaseName = (file.name.replace(/\.[^.]+$/, '') || 'session-file')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'session-file';
  const filePath = `${userId}/${characterId}/${Date.now()}-${safeBaseName}.${extension}`;

  const { error } = await supabase
    .storage
    .from(SESSION_FILES_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/pdf'
    });

  if (error) throw error;
  return filePath;
}


export async function getSessionFileSignedUrl(filePath, expiresInSeconds = 300) {
  const { data, error } = await supabase
    .storage
    .from(SESSION_FILES_BUCKET)
    .createSignedUrl(filePath, expiresInSeconds);
  if (error) throw error;
  return data?.signedUrl ?? null;
}

export async function createSessionFile(payload) {
  const { data, error } = await supabase
    .from('journal_session_files')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSessionFile(fileRecord) {
  const { error: deleteRowError } = await supabase
    .from('journal_session_files')
    .delete()
    .eq('id', fileRecord.id);
  if (deleteRowError) throw deleteRowError;

  const { error: deleteObjectError } = await supabase
    .storage
    .from(SESSION_FILES_BUCKET)
    .remove([fileRecord.file_path]);
  if (deleteObjectError) throw deleteObjectError;
}

export async function createEntry(payload) {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateEntry(id, payload) {
  const { data, error } = await supabase
    .from('journal_entries')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEntry(id) {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function createTag(payload) {
  const { data, error } = await supabase
    .from('journal_tags')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function attachTag(entryId, tagId) {
  const { error } = await supabase
    .from('journal_entry_tags')
    .insert({ entry_id: entryId, tag_id: tagId });
  if (error) throw error;
}

export async function detachTag(entryId, tagId) {
  const { error } = await supabase
    .from('journal_entry_tags')
    .delete()
    .eq('entry_id', entryId)
    .eq('tag_id', tagId);
  if (error) throw error;
}


export async function unlinkTagFromAllEntries(tagId) {
  const { error } = await supabase
    .from('journal_entry_tags')
    .delete()
    .eq('tag_id', tagId);
  if (error) throw error;
}

export async function deleteTag(tagId) {
  const { error } = await supabase
    .from('journal_tags')
    .delete()
    .eq('id', tagId);
  if (error) throw error;
}
