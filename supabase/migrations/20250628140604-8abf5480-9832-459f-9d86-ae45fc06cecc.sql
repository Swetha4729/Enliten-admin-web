
-- Create storage bucket for notes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'notes', 
  'notes', 
  true, 
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
);

-- Create storage policies for the notes bucket
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'notes' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public access to files" ON storage.objects
  FOR SELECT USING (bucket_id = 'notes');

CREATE POLICY "Allow authenticated users to update files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'notes' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'notes' AND 
    auth.role() = 'authenticated'
  );

-- Create table for file resources
CREATE TABLE public.file_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT, -- For uploaded files
  file_url TEXT, -- For YouTube links or external URLs
  resource_type TEXT NOT NULL CHECK (resource_type IN ('file', 'youtube_link')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create junction table for file resources and exams
CREATE TABLE public.file_resource_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_resource_id UUID REFERENCES public.file_resources(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(file_resource_id, exam_id)
);

-- Enable RLS on file_resources table
ALTER TABLE public.file_resources ENABLE ROW LEVEL SECURITY;

-- Enable RLS on file_resource_exams table  
ALTER TABLE public.file_resource_exams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for file_resources
CREATE POLICY "Allow all users to view active file resources" ON public.file_resources
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admins to manage file resources" ON public.file_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create RLS policies for file_resource_exams
CREATE POLICY "Allow all users to view file resource exam relationships" ON public.file_resource_exams
  FOR SELECT USING (true);

CREATE POLICY "Allow admins to manage file resource exam relationships" ON public.file_resource_exams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_file_resources_updated_at 
  BEFORE UPDATE ON public.file_resources 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
