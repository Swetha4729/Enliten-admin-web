
-- Drop the exam_versions table and related references
DROP TABLE IF EXISTS public.exam_versions CASCADE;

-- Remove subject_exam_version_id column from questions table since it references the dropped table
ALTER TABLE public.questions DROP COLUMN IF EXISTS subject_exam_version_id;

-- Drop the subject_exam_versions junction table
DROP TABLE IF EXISTS public.subject_exam_versions CASCADE;

-- Remove any references to exam_version_id in other tables
ALTER TABLE public.daily_questions DROP COLUMN IF EXISTS exam_version_id;

-- Update questions table to only reference subjects directly
-- Questions will now only be associated with subjects and exams through the subject_exams junction
