import { createClient } from '@supabase/supabase-js';

/**
 * API Endpoint: POST /api/upload-chat-file
 * 
 * Accepts a base64-encoded file from the Expo app, uploads it to
 * Supabase Storage (chat-attachments bucket), and returns the public URL
 * along with file metadata.
 * 
 * Request body (JSON):
 * {
 *   file_base64: string,    // base64-encoded file content
 *   file_name: string,      // original file name
 *   file_type: string,      // MIME type e.g. "image/png", "application/pdf"
 *   file_size: number,      // size in bytes
 *   thread_id?: string      // optional thread_id for organizing files
 * }
 * 
 * Response:
 * {
 *   url: string,            // public URL of the uploaded file
 *   storage_path: string,   // path in the bucket
 *   name: string,
 *   type: string,
 *   size: number
 * }
 */
export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.replace('Bearer ', '');

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://nufmkzmukwplugqvtiie.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51Zm1rem11a3dwbHVncXZ0aWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Nzk3NzgsImV4cCI6MjA5MDM1NTc3OH0.-rYm-UnMSbEJQCowxU2RpvsNT3k27O2zH93D9ohZpz0';

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  try {
    const { file_base64, file_name, file_type, file_size, thread_id } = req.body;

    if (!file_base64 || !file_name || !file_type) {
      return res.status(400).json({ error: 'Missing required fields: file_base64, file_name, file_type' });
    }

    // Validate file size (50MB max)
    if (file_size && file_size > 52428800) {
      return res.status(400).json({ error: 'File too large. Maximum 50MB allowed.' });
    }

    // Convert base64 to Buffer
    const fileBuffer = Buffer.from(file_base64, 'base64');

    // Generate unique storage path: userId/timestamp_filename
    const timestamp = Date.now();
    const safeName = file_name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${user.id}/${timestamp}_${safeName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(storagePath, fileBuffer, {
        contentType: file_type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[UPLOAD] Storage error:', uploadError);
      return res.status(500).json({ error: `Upload failed: ${uploadError.message}` });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    console.log(`[UPLOAD] Success: ${file_name} -> ${storagePath}`);

    return res.status(200).json({
      url: publicUrl,
      storage_path: storagePath,
      name: file_name,
      type: file_type,
      size: file_size || fileBuffer.length,
    });

  } catch (err: any) {
    console.error('[UPLOAD] Error:', err);
    return res.status(500).json({ error: 'Upload failed', details: err.message });
  }
}
