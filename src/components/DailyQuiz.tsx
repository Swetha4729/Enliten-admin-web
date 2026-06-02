import React,{useState, useEffect} from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Pencil } from 'lucide-react';
import { Trash2Icon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import * as XLSX from 'xlsx';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';

const DailyQuiz = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedExamId = params.get('exam');
    const [examTitle, setExamTitle] = useState<string>('');
    const { toast } = useToast();
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [editingAssignment, setEditingAssignment] = React.useState<any|null>(null);
    const [crudDialogOpen, setCrudDialogOpen] = useState(false);
    const [crudForm, setCrudForm] = useState({question_text:'', assign_date:'', exam_id:''});
    const [assignments, setAssignments] = React.useState<any[]>([]);
    // const [crudFeedback, setCrudFeedback] = React.useState<{type: 'success'|'error', message: string}|null>(null);
    // Exams cache for mapping
    const [examsCache, setExamsCache] = useState<{id: string, title: string, short_name: string}[]>([]);

    // State for Excel upload dialog and logic
      const [excelDialogOpen, setExcelDialogOpen] = useState(false);
      const [excelFile, setExcelFile] = useState<File | null>(null);
      // Removed excelErrors and excelSuccess state, using only row feedback and toast.
      const [processingExcel, setProcessingExcel] = useState(false);
      // Feedback for each Excel row
      const [excelRowFeedback, setExcelRowFeedback] = useState<{row: number, status: 'success'|'updated'|'deleted'|'failed', message: string}[]>([]);
      
    
    useEffect(() => {
      async function fetchExamTitle() {
        if (!selectedExamId) {
          setExamTitle('');
          return;
        }
        const { data, error } = await supabase.from('exams').select('title').eq('id', selectedExamId).single();
        if (error) setExamTitle('Unknown Exam');
        else setExamTitle(data.title);
      }
      fetchExamTitle();
    }, [selectedExamId]);

    function excelSerialDateToISO(serial) {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel starts on Dec 30, 1899
        const date = new Date(excelEpoch.getTime() + serial * 86400000);
        return date.toISOString().split('T')[0]; // returns 'YYYY-MM-DD'
    }
  async function processExcelUpload() {
    setExcelRowFeedback([]);
    if (!excelFile) return;
    setProcessingExcel(true);
    try {
      const data = await excelFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (!rows.length) throw new Error('Excel file is empty.');
      // Validate columns
      const requiredCols = ['question_text', 'assign_date'];
      const missingCols = requiredCols.filter(col => !Object.keys(rows[0]).map(k => k.toLowerCase()).includes(col));
      if (missingCols.length) {
        toast({
          title: "Excel Error",
          description: `Missing columns: ${missingCols.join(', ')}`,
          variant: "destructive",
        });
        setProcessingExcel(false);
        return;
      }
      if (!selectedExamId) {
        toast({
          title: "No Exam Selected",
          description: "Please access this page with an exam parameter in the URL (e.g., ?exam=uuid)",
          variant: "destructive",
        });
        setProcessingExcel(false);
        return;
      }

      const errors: string[] = [];
      let successCount = 0;
      for (let [i, row] of rows.entries()) {
        const questionText = row['question_text'] || row['Question_Text'] || row['QUESTION_TEXT'];
        const assignDate = excelSerialDateToISO(row['assign_date'] || row['Assign_Date'] || row['ASSIGN_DATE']);
        if (!questionText || !assignDate) {
          errors.push(`Row ${i + 2}: Missing required fields.`);
          setExcelRowFeedback(prev => [...prev, { row: i + 2, status: 'failed', message: 'Missing required fields.' }]);
          continue;
        }
        // Find question by text for this exam id
        const { data: qData, error: qError } = await supabase.from('questions').select('id').eq('question_text', questionText).eq('exam', selectedExamId).maybeSingle();
        let questionId = qData?.id;
        if (!questionId) {
          errors.push(`Row ${i + 2}: Question not found in database.`);
          setExcelRowFeedback(prev => [...prev, { row: i + 2, status: 'failed', message: 'Question not found in database.' }]);
          continue;
        }
        // Check if daily_questions already exists
        const { data: dqExists, error: dqCheckErr } = await supabase.from('daily_questions')
          .select('id')
          .eq('question_id', questionId)
          .eq('date_assigned', assignDate)
          .maybeSingle();
        if (dqExists?.id) {
          setExcelRowFeedback(prev => [...prev, { row: i + 2, status: 'updated', message: 'Already assigned for this date (skipped).' }]);
          continue;
        }
        // Insert into daily_questions
        const { error: dqError } = await supabase.from('daily_questions').insert({
          question_id: questionId,
          date_assigned: assignDate,
          exam: selectedExamId
        });
        if (dqError) {
          errors.push(`Row ${i + 2}: Failed to assign daily quiz (${dqError.message}).`);
          setExcelRowFeedback(prev => [...prev, { row: i + 2, status: 'failed', message: `Failed to assign daily quiz (${dqError.message})` }]);
          continue;
        }
        setExcelRowFeedback(prev => [...prev, { row: i + 2, status: 'success', message: 'Successfully assigned.' }]);
        successCount++;
      }
      if (errors.length) {
        toast({
          title: "Excel Upload Errors",
          description: `${errors.length} errors encountered. Check row feedback.`,
          variant: "destructive",
        });
      }
      if (successCount) {
        toast({
          title: "Excel Upload Success",
          description: `Successfully assigned ${successCount} daily quiz questions.`,
        });
      }
      setExcelFile(null);
    } catch (err: any) {
      toast({
        title: "Excel Upload Failed",
        description: err.message || 'Failed to process file.',
        variant: "destructive",
      });
    }
    setProcessingExcel(false);
  }
      useEffect(() => {
        // Fetch all active exams for mapping
        const fetchExams = async () => {
          const { data, error } = await supabase.from('exams').select('id, title, short_name').eq('is_active', true);
          if (!error && data) setExamsCache(data);
        };
        fetchExams();
      }, []);
    
      function handleExcelFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        setExcelRowFeedback([]);
        if (e.target.files && e.target.files[0]) {
          setExcelFile(e.target.files[0]);
        } else {
          setExcelFile(null);
        }
      }
    // Exam filter state
    const [filterExamId, setFilterExamId] = useState<string | null>(selectedExamId);

    // Fetch all assignments for selected exam
    useEffect(() => {
      const fetchAssignments = async () => {
        setLoadingAssignments(true);
        let query = supabase
          .from('daily_questions')
          .select(`
            id,
            date_assigned,
            question_id,
            exam,
            questions (
              question_text,
              exam
            ),
            exams (
              id,
              title,
              short_name
            )
          `)
          .order('date_assigned', { ascending: false });
        if (filterExamId) {
          query = query.eq('exam', filterExamId);
        }
        const { data, error } = await query;
        setAssignments(data || []);
        setLoadingAssignments(false);
      };
      fetchAssignments();
    }, [filterExamId]);
    // Delete assignment
    async function handleCrudDelete(id: string) {
    const { error } = await supabase.from('daily_questions').delete().eq('id', id);
     if (error) {
       toast({
         title: "Delete Failed",
         description: error.message || 'Delete failed',
         variant: "destructive",
       });
     } else {
       toast({
         title: "Deleted",
         description: 'Deleted successfully',
       });
     }
    }

             // Add or update assignment
             async function handleCrudSubmit(e: React.FormEvent) {
               e.preventDefault();
               // Find or create question
               let questionId = null;
               const { data: qData } = await supabase.from('questions').select('id').eq('question_text', crudForm.question_text).eq('exam', crudForm.exam_id).maybeSingle();
               if (qData?.id) {
                 questionId = qData.id;
               } else {
                 const { data: newQ, error: newQErr } = await supabase.from('questions').insert({
                   question_text: crudForm.question_text,
                   domain: 'General',
                   subject_id: examsCache[0]?.id || null,
                   exam: crudForm.exam_id
                 }).select('id').single();
                 if (newQ?.id) questionId = newQ.id;
                 else {
                   toast({
                     title: "Error",
                     description: 'Failed to create/find question',
                     variant: "destructive",
                   });
                   return;
                 }
               }
               if (editingAssignment) {
                 // Update
                 const { error } = await supabase.from('daily_questions').update({
                   question_id: questionId,
                   date_assigned: crudForm.assign_date
                 }).eq('id', editingAssignment.id);
                  if (error) {
                    toast({
                      title: "Update Failed",
                      description: error.message || 'Update failed',
                      variant: "destructive",
                    });
                  } else {
                    toast({
                      title: "Updated",
                      description: 'Updated successfully',
                    });
                  }
               } else {
                 // Insert
                 const { error } = await supabase.from('daily_questions').insert({
                   question_id: questionId,
                   date_assigned: crudForm.assign_date
                 });
                  if (error) {
                    toast({
                      title: "Insert Failed",
                      description: error.message || 'Insert failed',
                      variant: "destructive",
                    });
                  } else {
                    toast({
                      title: "Created",
                      description: 'Created successfully',
                    });
                  }
               }
                setCrudDialogOpen(false);
            }
            return (
                <div>
            {/* Assign Daily Quiz via Excel Section */}
                   <div className="mt-20">
                       {/* Show selected exam info */}
            <div className="mb-12">

            {selectedExamId ? (
                <Alert>
                <AlertDescription>
                    <div className="flex items-center mb-2 mt-2">
                    <CheckCircle className="mr-2" size={16} /> 
                    <strong className="font-bolder">Selected Exam: </strong> {examTitle || 'Loading...'}
                    </div>
                    <span className="text-sm text-gray-500">All uploaded questions will be assigned to this exam.</span>
                </AlertDescription>
                </Alert>
            ) : (
                <Alert variant="destructive">
                <AlertDescription>
                    <strong>No Exam Selected</strong>
                    <br />
                    Please access this page with an exam parameter in the URL (e.g., ?exam=uuid) to upload questions.
                </AlertDescription>
                </Alert>
            )}
            </div>
                    <div className="flex items-center justify-between mb-12">

                     <h3 className="text-lg font-semibold mb-2">Assign Daily Quiz via Excel</h3>
                     <Button variant="default" onClick={() => setExcelDialogOpen(true)}>
                       Upload Excel for Daily Quiz
                     </Button>
                    </div>
                     <Dialog open={excelDialogOpen} onOpenChange={setExcelDialogOpen}>
                       <DialogContent>
                         <DialogHeader>
                           <DialogTitle>Upload Excel to Assign Daily Quiz</DialogTitle>
                         </DialogHeader>
                         <div className="space-y-2">
                           <Label>Excel Format: <code>question_text</code>, <code>assign_date</code> (YYYY-MM-DD), <code>exam_name</code></Label>
                           <Input type="file" accept=".xlsx,.xls" onChange={handleExcelFileChange} />
                            {excelRowFeedback.length > 0 && (
                              <div className="border rounded p-2 bg-gray-50 max-h-48 overflow-y-auto text-xs">
                                {excelRowFeedback.map((fb, i) => (
                                  <div key={i} className={
                                    fb.status === 'success' ? 'text-green-700' :
                                    fb.status === 'updated' ? 'text-blue-700' :
                                    'text-red-700'
                                  }>
                                    Row {fb.row}: {fb.message}
                                  </div>
                                ))}
                              </div>
                            )}
                           <Button onClick={processExcelUpload} disabled={!excelFile || processingExcel}>
                             {processingExcel ? 'Processing...' : 'Assign Daily Quiz'}
                           </Button>
                         </div>
                       </DialogContent>
                     </Dialog>
                   </div>
            {/* Exam filter dropdown */}
            <div className="mb-4 flex items-center gap-2">
            <h2 className="text-lg font-semibold">Filter by Exam ( {assignments.length} )</h2>
              <select
                id="exam-filter"
                className="border rounded px-2 py-1"
                value={filterExamId || ''}
                onChange={e => setFilterExamId(e.target.value || null)}
              >
                <option value="">All Exams</option>
                {examsCache.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.title}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
               <table className="min-w-full border text-xs">
                 <thead>
                   <tr className="bg-gray-100">
                     <th className="border px-2 py-1">Question</th>
                     <th className="border px-2 py-1">Exam</th>
                     <th className="border px-2 py-1">Date Assigned</th>
                     <th className="border px-2 py-1">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {loadingAssignments ? (
                     <tr><td colSpan={4} className="text-center p-4">Loading...</td></tr>
                   ) : (assignments.length === 0 ? (
                     <tr><td colSpan={4} className="text-center p-4">No assignments found</td></tr>
                   ) : assignments.map((a, idx) => (
                     <tr key={a.id}>
                       <td className="border px-2 py-1">{a.questions?.question_text || ''}</td>
                       <td className="border px-2 py-1">{a.exams?.title || ''}</td>
                       <td className="border px-2 py-1">{a.date_assigned}</td>
                       <td className="border px-2 py-1 flex gap-2">
                         <Button size="sm" variant="outline" onClick={() => { setCrudDialogOpen(true); setEditingAssignment(a); setCrudForm({question_text:a.questions?.question_text||'', assign_date:a.date_assigned, exam_id:a.questions?.exam||''}); }}><Pencil className="w-4 h-4" /></Button>
                         <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleCrudDelete(a.id)}><Trash2Icon className="w-4 h-4" /></Button>
                       </td>
                     </tr>
                   )))}
                 </tbody>
               </table>
             </div>
            <Dialog open={crudDialogOpen} onOpenChange={setCrudDialogOpen}>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>{editingAssignment ? 'Edit' : 'Add'} Assignment</DialogTitle>
                </DialogHeader>
                <form className="space-y-2" onSubmit={handleCrudSubmit}>
                <Label>Question Text</Label>
                <Input value={crudForm.question_text} onChange={e => setCrudForm(f => ({...f,question_text:e.target.value}))} required />
                <Label>Exam</Label>
                <select className="w-full border rounded p-1" value={crudForm.exam_id} onChange={e => setCrudForm(f => ({...f, exam_id:e.target.value}))} required>
                    <option value="">Select Exam</option>
                    {examsCache.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                </select>
                <Label>Date Assigned</Label>
                <Input type="date" value={crudForm.assign_date} onChange={e => setCrudForm(f => ({...f, assign_date:e.target.value}))} required />
                <DialogFooter>
                    <Button type="submit">{editingAssignment ? 'Update' : 'Create'}</Button>
                </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        </div>
    );
};

export default DailyQuiz;