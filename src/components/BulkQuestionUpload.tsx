
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileSpreadsheet, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Switch } from "@/components/ui/switch";

interface ExcelQuestion {
  question_text: string;
  domain: string;
  subject_name: string;
  // exam_name removed - now handled via URL param
  difficulty: 'easy' | 'medium' | 'hard';
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

interface UploadResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

export default function BulkQuestionUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState<string>('');
  const [isPremium, setIsPremium] = useState(true);
  const { toast } = useToast();
  const location = useLocation();

  // Get exam ID from URL params (first param)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const examParam = params.get('exam');
    if (examParam) {
      setSelectedExamId(examParam);
      // Fetch exam title for display
      fetchExamTitle(examParam);
    }
  }, [location.search]);

  const fetchExamTitle = async (examId: string) => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('title')
        .eq('id', examId)
        .single();
      if (error) throw error;
      setExamTitle(data.title);
    } catch (error) {
      console.error('Error fetching exam title:', error);
      setExamTitle('Unknown Exam');
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        question_text: "What is the capital of France?",
        domain: "Geography",
        subject_name: "World Geography",
        // exam_name removed - now handled via URL param
        difficulty: "easy",
        option_a: "London",
        option_b: "Berlin",
        option_c: "Paris",
        option_d: "Madrid",
        correct_answer: "C",
        explanation: "Paris is the capital and largest city of France."
      },
      {
        question_text: "Which planet is known as the Red Planet?",
        domain: "Science",
        subject_name: "Astronomy",
        // exam_name removed - now handled via URL param
        difficulty: "medium",
        option_a: "Venus",
        option_b: "Mars",
        option_c: "Jupiter",
        option_d: "Saturn",
        correct_answer: "B",
        explanation: "Mars is called the Red Planet due to iron oxide on its surface."
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions Template");
    XLSX.writeFile(wb, "questions_template.xlsx");

    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded successfully.",
    });
  };

  const validateQuestion = (question: any, rowIndex: number): string[] => {
    const errors: string[] = [];
    const requiredFields = ['question_text', 'domain', 'subject_name', 'difficulty', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer'];

    requiredFields.forEach(field => {
      if (!question[field] || question[field].toString().trim() === '') {
        errors.push(`Row ${rowIndex + 2}: ${field} is required`);
      }
    });

    if (question.difficulty && !['easy', 'medium', 'hard'].includes(question.difficulty.toLowerCase())) {
      errors.push(`Row ${rowIndex + 2}: difficulty must be 'easy', 'medium', or 'hard'`);
    }

    if (question.correct_answer && !['A', 'B', 'C', 'D'].includes(question.correct_answer.toUpperCase())) {
      errors.push(`Row ${rowIndex + 2}: correct_answer must be 'A', 'B', 'C', or 'D'`);
    }

    return errors;
  };

  const processExcelFile = async (file: File): Promise<ExcelQuestion[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          resolve(jsonData as ExcelQuestion[]);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Finds or creates a subject and associates new subjects with the selected exam
  const findOrCreateSubject = async (subjectName: string): Promise<string> => {
    // First, try to find existing subject
    const { data: existingSubject } = await supabase
      .from('subjects')
      .select('id')
      .eq('name', subjectName)
      .single();

    if (existingSubject) {
      return existingSubject.id;
    } else {
      // Create new subject if it doesn't exist
      const { data: newSubject, error } = await supabase
        .from('subjects')
        .insert([{ name: subjectName }])
        .select('id')
        .single();
      if (error) throw error;

      // Associate the new subject with the selected exam
      if (selectedExamId) {
        const { error: mappingError } = await supabase
          .from('subject_exams')
          .insert([{ subject_id: newSubject.id, exam_id: selectedExamId }]);
        if (mappingError) {
          console.error('Error creating subject-exam mapping:', mappingError);
          // Don't throw error here - subject creation succeeded, mapping is secondary
        }
      }

      return newSubject.id;
    }
  };

  const uploadQuestions = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedExamId) {
      toast({
        title: "Error",
        description: "No exam selected. Please access this page with an exam parameter in the URL.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setResult(null);

    try {
      const questions = await processExcelFile(file);

      if (questions.length === 0) {
        throw new Error('No questions found in the Excel file');
      }

      // Validate all questions first
      const allErrors: string[] = [];
      questions.forEach((question, index) => {
        const errors = validateQuestion(question, index);
        allErrors.push(...errors);
      });

      if (allErrors.length > 0) {
        setResult({
          total: questions.length,
          successful: 0,
          failed: questions.length,
          errors: allErrors
        });
        return;
      }

      let successful = 0;
      const errors: string[] = [];

      for (let i = 0; i < questions.length; i++) {
        try {
          const question = questions[i];
          setProgress(((i + 1) / questions.length) * 100);

          // Find or create subject (no exam mapping needed here)
          let subjectId: string;
          try {
            subjectId = await findOrCreateSubject(question.subject_name);
          } catch (err: any) {
            errors.push(`Row ${i + 2}: ${err.message}`);
            continue; // Skip this question if subject creation fails
          }

          // Use exam ID from URL param
          const examId = selectedExamId;

          // Insert question with exam UUID if available
          const { data: questionData, error: questionError } = await supabase
            .from('questions')
            .insert([{
              question_text: question.question_text,
              domain: question.domain,
              subject_id: subjectId,
              difficulty: question.difficulty.toLowerCase(),
              question_type: 'multiple_choice',
              explanation: question.explanation || '',
              exam: examId || null,
              is_premium: isPremium
            }])
            .select('id')
            .single();

          if (questionError) throw questionError;

          // Insert options
          const options = [
            { option_letter: 'A', option_text: question.option_a, is_correct: question.correct_answer.toUpperCase() === 'A' },
            { option_letter: 'B', option_text: question.option_b, is_correct: question.correct_answer.toUpperCase() === 'B' },
            { option_letter: 'C', option_text: question.option_c, is_correct: question.correct_answer.toUpperCase() === 'C' },
            { option_letter: 'D', option_text: question.option_d, is_correct: question.correct_answer.toUpperCase() === 'D' }
          ];

          const optionsToInsert = options.map(option => ({
            question_id: questionData.id,
            option_letter: option.option_letter,
            option_text: option.option_text,
            is_correct: option.is_correct
          }));

          const { error: optionsError } = await supabase
            .from('question_options')
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;

          successful++;
        } catch (error) {
          console.error(`Error processing question ${i + 1}:`, error);
          errors.push(`Row ${i + 2}: ${error.message}`);
        }
      }

      setResult({
        total: questions.length,
        successful,
        failed: questions.length - successful,
        errors
      });

      if (successful > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${successful} out of ${questions.length} questions.`,
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      setResult({
        total: 0,
        successful: 0,
        failed: 1,
        errors: [error.message]
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileSpreadsheet className="h-5 w-5" />
          <span>Bulk Question Upload</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download Section */}
        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="font-semibold mb-2 flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Download the Excel template to see the required format for bulk upload.
          </p>
          <Button onClick={downloadTemplate} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>

        {/* Excel Structure Information */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Excel Structure Requirements:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• <strong>question_text</strong> - The question text (required)</li>
              <li>• <strong>domain</strong> - Subject domain/category (required)</li>
              <li>• <strong>subject_name</strong> - Subject name (will be created if doesn't exist)</li>
              {/* exam_name removed - now handled via URL param */}
              <li>• <strong>difficulty</strong> - easy, medium, or hard (required)</li>
              <li>• <strong>option_a</strong> - First option text (required)</li>
              <li>• <strong>option_b</strong> - Second option text (required)</li>
              <li>• <strong>option_c</strong> - Third option text (required)</li>
              <li>• <strong>option_d</strong> - Fourth option text (required)</li>
              <li>• <strong>correct_answer</strong> - A, B, C, or D (required)</li>
              <li>• <strong>explanation</strong> - Answer explanation (optional)</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Exam Selection Status */}
        {selectedExamId ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Selected Exam:</strong> {examTitle || 'Loading...'}
              <br />
              <span className="text-sm text-gray-600">All uploaded questions will be assigned to this exam.</span>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>No Exam Selected</strong>
              <br />
              Please access this page with an exam parameter in the URL (e.g., ?exam=uuid) to upload questions.
            </AlertDescription>
          </Alert>
        )}

        {/* File Upload Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="excel-file">Select Excel File</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={uploading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="premium-mode"
              checked={isPremium}
              onCheckedChange={setIsPremium}
            />
            <Label htmlFor="premium-mode">Mark as Premium Questions</Label>
          </div>

          <Button
            onClick={uploadQuestions}
            disabled={!file || uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Questions'}
          </Button>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-gray-600">
                Processing... {Math.round(progress)}%
              </p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{result.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 mr-1" />
                  {result.successful}
                </div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Errors encountered:</strong>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm">• {error}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
