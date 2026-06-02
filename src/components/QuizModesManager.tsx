import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { Plus, Trash2, ArrowUp, ArrowDown, Pencil, Trash2Icon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as XLSX from 'xlsx';
import Navbar from '@/components/Navbar';

interface QuizMode {
  id: string;
  title: string;
  subtitle: string;
  num_questions: number | null;
  time_per_question: number | null;
  is_premium: boolean;
  order_index: number;
  is_active: boolean;
}

const defaultNewMode: Omit<QuizMode, 'id' | 'order_index'> = {
  title: '',
  subtitle: '',
  num_questions: null,
  time_per_question: null,
  is_premium: false,
  is_active: true,
};

export default function QuizModesManager() {
  const [modes, setModes] = useState<QuizMode[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newMode, setNewMode] = useState(defaultNewMode);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMode, setEditingMode] = useState<QuizMode | null>(null);
  const [editForm, setEditForm] = useState<Partial<QuizMode>>({});
  const { toast } = useToast();

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modeToDelete, setModeToDelete] = useState<QuizMode | null>(null);

  // State for Excel upload dialog and logic
  const [excelDialogOpen, setExcelDialogOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelErrors, setExcelErrors] = useState<string[]>([]);
  const [excelSuccess, setExcelSuccess] = useState<string | null>(null);
  const [processingExcel, setProcessingExcel] = useState(false);
  // Feedback for each Excel row
  const [excelRowFeedback, setExcelRowFeedback] = useState<{row: number, status: 'success'|'updated'|'deleted'|'failed', message: string}[]>([]);

  // Exams cache for mapping
  const [examsCache, setExamsCache] = useState<{id: string, title: string, short_name: string}[]>([]);

  useEffect(() => {
    // Fetch all active exams for mapping
    const fetchExams = async () => {
      const { data, error } = await supabase.from('exams').select('id, title, short_name').eq('is_active', true);
      if (!error && data) setExamsCache(data);
    };
    fetchExams();
  }, []);

  function handleExcelFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setExcelErrors([]);
    setExcelSuccess(null);
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0]);
    } else {
      setExcelFile(null);
    }
  }

  function excelSerialDateToISO(serial) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel starts on Dec 30, 1899
    const date = new Date(excelEpoch.getTime() + serial * 86400000);
    return date.toISOString().split('T')[0]; // returns 'YYYY-MM-DD'
  }

  async function processExcelUpload() {
    setExcelRowFeedback([]);
    setExcelErrors([]);
    setExcelSuccess(null);
    if (!excelFile) return;
    setProcessingExcel(true);
    try {
      const data = await excelFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (!rows.length) throw new Error('Excel file is empty.');
      // Validate columns
      const requiredCols = ['question_text', 'assign_date', 'exam_name'];
      const missingCols = requiredCols.filter(col => !Object.keys(rows[0]).map(k => k.toLowerCase()).includes(col));
      if (missingCols.length) {
        setExcelErrors([`Missing columns: ${missingCols.join(', ')}`]);
        setProcessingExcel(false);
        return;
      }
      // Prepare exam name to id mapping
      const examMap: Record<string, string> = {};
      examsCache.forEach(exam => {
        examMap[exam.title.trim().toLowerCase()] = exam.id;
        examMap[exam.short_name.trim().toLowerCase()] = exam.id;
      });
      const errors: string[] = [];
      let successCount = 0;
      for (let [i, row] of rows.entries()) {
        const questionText = row['question_text'] || row['Question_Text'] || row['QUESTION_TEXT'];
        const assignDate = excelSerialDateToISO(row['assign_date'] || row['Assign_Date'] || row['ASSIGN_DATE']);
        const examName = (row['exam_name'] || row['Exam_Name'] || row['EXAM_NAME'] || '').toString().trim().toLowerCase();
        if (!questionText || !assignDate || !examName) {
          errors.push(`Row ${i + 2}: Missing required fields.`);
          setExcelRowFeedback(prev => [...prev, { row: i + 2, status: 'failed', message: 'Missing required fields.' }]);
          continue;
        }
        const examId = examMap[examName];
        if (!examId) {
          errors.push(`Row ${i + 2}: Exam name "${row['exam_name']}" not found.`);
          setExcelRowFeedback(prev => [...prev, { row: i + 2, status: 'failed', message: `Exam name "${row['exam_name']}" not found.` }]);
          continue;
        }
        // Find question by text
        const { data: qData, error: qError } = await supabase.from('questions').select('id').eq('question_text', questionText).eq('exam', examId).maybeSingle();
        let questionId = qData?.id;
        console.table(qData);
        if (!questionId) {
          errors.push(`Row ${i + 2}: Question not found in database.`);
          setExcelRowFeedback(prev => [...prev, { row: i + 2, status: 'failed', message: 'Question not found in database.' }]);
          continue;
        }
        if( !examId){
          errors.push(`Row ${i + 2}: Exam not found in database.`);
          setExcelRowFeedback(prev => [...prev, { row: i + 2, status: 'failed', message: 'Exam not found in database.' }]);
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
          exam: examId
        });
        if (dqError) {
          errors.push(`Row ${i + 2}: Failed to assign daily quiz (${dqError.message}).`);
          setExcelRowFeedback(prev => [...prev, { row: i + 2, status: 'failed', message: `Failed to assign daily quiz (${dqError.message})` }]);
          continue;
        }
        setExcelRowFeedback(prev => [...prev, { row: i + 2, status: 'success', message: 'Successfully assigned.' }]);
        successCount++;
      }
      if (errors.length) setExcelErrors(errors);
      if (successCount) setExcelSuccess(`Successfully assigned ${successCount} daily quiz questions.`);
      if (!successCount && errors.length) setExcelSuccess(null);
      setExcelFile(null);
    } catch (err: any) {
      setExcelErrors([err.message || 'Failed to process file.']);
    }
    setProcessingExcel(false);
  }

  useEffect(() => {
    fetchModes();
  }, []);

  async function fetchModes() {
    setLoading(true);
    const { data, error } = await supabase
      .from('quiz_modes')
      .select('*')
      .order('order_index', { ascending: true });
    if (!error && data) setModes(data);
    setLoading(false);
  }

  async function handleAdd() {
    setAdding(true);
    const id = newMode.title.toLowerCase().replace(/\s+/g, '_');
    const { error } = await supabase.from('quiz_modes').insert({
      ...newMode,
      id,
      order_index: modes.length,
    });
    setAdding(false);
    setNewMode(defaultNewMode);
    fetchModes();
  }

  // Open confirmation dialog and set mode to delete
  function requestDelete(mode: QuizMode) {
    setModeToDelete(mode);
    setDeleteDialogOpen(true);
  }

  // Confirm delete after user confirmation
  async function confirmDelete() {
    if (!modeToDelete) return;
    await supabase.from('quiz_modes').delete().eq('id', modeToDelete.id);
    setDeleteDialogOpen(false);
    setModeToDelete(null);
    fetchModes();
  }

  function startEdit(mode: QuizMode) {
    setEditingMode(mode);
    setEditForm({ ...mode });
    setIsDialogOpen(true);
  }

  function closeDialog() {
    setIsDialogOpen(false);
    setEditingMode(null);
    setEditForm({});
  }

  async function saveEdit() {
    if (!editingMode) return;
    const { id, ...fields } = editForm;
    try {
      const { error } = await supabase.from('quiz_modes').update(fields).eq('id', editingMode.id);
      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Quiz mode updated successfully',
      });
      closeDialog();
      fetchModes();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update quiz mode',
        variant: 'destructive',
      });
    }
  }

  async function handleToggle(id: string, field: keyof QuizMode, value: boolean) {
    await supabase.from('quiz_modes').update({ [field]: value }).eq('id', id);
    fetchModes();
  }

  async function handleReorder(idx: number, dir: 'up' | 'down') {
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === modes.length - 1)) return;
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    const curr = modes[idx];
    const swap = modes[swapIdx];
    await supabase.from('quiz_modes').update({ order_index: swap.order_index }).eq('id', curr.id);
    await supabase.from('quiz_modes').update({ order_index: curr.order_index }).eq('id', swap.id);
    fetchModes();
  }

  return (
        <>
        <Navbar />
    <div className="min-h-screen bg-gray-50 p-6">
      
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Quiz Modes Management</h2>
      <Table>
        <TableCaption>Manage quiz modes</TableCaption>
        <TableHeader>
          <TableRow>
            {/* <TableHead>Order</TableHead> */}
            <TableHead>Title</TableHead>
            <TableHead>Subtitle</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Time/Q</TableHead>
            <TableHead>Premium</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modes.map((mode, idx) => (
            <TableRow key={mode.id}>
              {/* <TableCell>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleReorder(idx, 'up')} disabled={idx === 0} title="Move Up"><ArrowUp size={16} /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleReorder(idx, 'down')} disabled={idx === modes.length - 1} title="Move Down"><ArrowDown size={16} /></Button>
                </div>
              </TableCell> */}
              <TableCell>{mode.title}</TableCell>
              <TableCell>{mode.subtitle}</TableCell>
              <TableCell>{mode.num_questions ?? '--'}</TableCell>
              <TableCell>{mode.time_per_question ?? '--'}</TableCell>
              <TableCell>
                <Switch checked={mode.is_premium} onCheckedChange={v => handleToggle(mode.id, 'is_premium', v)} />
              </TableCell>
              <TableCell>
                <Switch checked={mode.is_active} onCheckedChange={v => handleToggle(mode.id, 'is_active', v)} />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => startEdit(mode)} title="Edit"><Pencil size={16} /></Button>
                  <Button size="icon" variant="destructive" onClick={() => requestDelete(mode)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {/* Add new mode row */}
          {/* <TableRow>
            <TableCell colSpan={8}>
              <Form>
                <div className="flex gap-2 items-center">
                  <Input placeholder="Title" value={newMode.title} onChange={e => setNewMode({ ...newMode, title: e.target.value })} />
                  <Input placeholder="Subtitle" value={newMode.subtitle} onChange={e => setNewMode({ ...newMode, subtitle: e.target.value })} />
                  <Input placeholder="#Q" type="number" value={newMode.num_questions ?? ''} onChange={e => setNewMode({ ...newMode, num_questions: e.target.value ? Number(e.target.value) : null })} style={{ width: 60 }} />
                  <Input placeholder="Time/Q" type="number" value={newMode.time_per_question ?? ''} onChange={e => setNewMode({ ...newMode, time_per_question: e.target.value ? Number(e.target.value) : null })} style={{ width: 80 }} />
                  <Switch checked={newMode.is_premium} onCheckedChange={v => setNewMode({ ...newMode, is_premium: v })} />
                  <Switch checked={newMode.is_active} onCheckedChange={v => setNewMode({ ...newMode, is_active: v })} />
                  <Button size="sm" onClick={handleAdd} disabled={adding || !newMode.title} variant="primary">
                    <Plus size={16} className="mr-1" /> Add
                  </Button>
                </div>
              </Form>
            </TableCell>
          </TableRow> */}
        </TableBody>
       </Table>

       {/* Assign Daily Quiz via Excel Section */}
       {/* <div className="mt-8">
         <h3 className="text-lg font-semibold mb-2">Assign Daily Quiz via Excel</h3>
         <Button variant="outline" onClick={() => setExcelDialogOpen(true)}>
           Upload Excel for Daily Quiz
         </Button>
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
                       fb.status === 'deleted' ? 'text-orange-700' :
                       'text-red-700'
                     }>
                       Row {fb.row}: {fb.message}
                     </div>
                   ))}
                 </div>
               )}
               {excelErrors.length > 0 && (
                 <Alert variant="destructive">
                   <AlertDescription>
                     {excelErrors.map((err, i) => <div key={i}>{err}</div>)}
                   </AlertDescription>
                 </Alert>
               )}
               {excelSuccess && (
                 <Alert variant="default">
                   <AlertDescription>{excelSuccess}</AlertDescription>
                 </Alert>
               )}
               <Button onClick={processExcelUpload} disabled={!excelFile || processingExcel}>
                 {processingExcel ? 'Processing...' : 'Assign Daily Quiz'}
               </Button>
             </div>
           </DialogContent>
         </Dialog>
       </div> */}

       {/* Daily Quiz Assignments CRUD Section */}
       {/* Inline DailyQuizAssignmentsCRUD Component */}

{/*        
       {(() => {
         // --- Daily Quiz CRUD Component ---
         const [assignments, setAssignments] = React.useState<any[]>([]);
         const [loadingAssignments, setLoadingAssignments] = React.useState(false);
         const [crudDialogOpen, setCrudDialogOpen] = React.useState(false);
         const [editingAssignment, setEditingAssignment] = React.useState<any|null>(null);
         const [crudForm, setCrudForm] = React.useState({
           question_text: '',
           assign_date: '',
           exam_id: '',
         });
         const [crudFeedback, setCrudFeedback] = React.useState<{type: 'success'|'error', message: string}|null>(null);
         // Fetch all assignments
         React.useEffect(() => {
           const fetchAssignments = async () => {
             setLoadingAssignments(true);
             const { data, error } = await supabase
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
           
             console.table(data);
             setAssignments(data || []);
             setLoadingAssignments(false);
           };
           fetchAssignments();
         }, []);
         // Add or update assignment
         async function handleCrudSubmit(e: React.FormEvent) {
           e.preventDefault();
           setCrudFeedback(null);
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
               setCrudFeedback({type: 'error', message: 'Failed to create/find question'}); return;
             }
           }
           if (editingAssignment) {
             // Update
             const { error } = await supabase.from('daily_questions').update({
               question_id: questionId,
               date_assigned: crudForm.assign_date
             }).eq('id', editingAssignment.id);
             if (error) setCrudFeedback({type: 'error', message: 'Update failed'});
             else setCrudFeedback({type: 'success', message: 'Updated successfully'});
           } else {
             // Insert
             const { error } = await supabase.from('daily_questions').insert({
               question_id: questionId,
               date_assigned: crudForm.assign_date
             });
             if (error) setCrudFeedback({type: 'error', message: 'Insert failed'});
             else setCrudFeedback({type: 'success', message: 'Created successfully'});
           }
           setCrudDialogOpen(false);
           setTimeout(() => setCrudFeedback(null), 3000);
         }
         // Delete assignment
         async function handleCrudDelete(id: string) {
           const { error } = await supabase.from('daily_questions').delete().eq('id', id);
           if (error) setCrudFeedback({type: 'error', message: 'Delete failed'});
           else setCrudFeedback({type: 'success', message: 'Deleted successfully'});
           setTimeout(() => setCrudFeedback(null), 3000);
         }
         return (
           <div className="mt-12">
             <h3 className="text-lg font-semibold mb-2">Daily Quiz Assignments</h3>
             {crudFeedback && (
               <Alert variant={crudFeedback.type === 'success' ? 'default' : 'destructive'}>
                 <AlertDescription>{crudFeedback.message}</AlertDescription>
               </Alert>
             )}
             <Button className="mb-2" onClick={() => { setCrudDialogOpen(true); setEditingAssignment(null); setCrudForm({question_text:'',assign_date:'',exam_id:''}); }}>Add Assignment</Button>
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
       })()} 
*/}


       {/* Edit Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quiz Mode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Title"
                value={editForm.title || ''}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-subtitle">Subtitle</Label>
              <Input
                id="edit-subtitle"
                placeholder="Subtitle"
                value={editForm.subtitle || ''}
                onChange={e => setEditForm({ ...editForm, subtitle: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-num-questions">Number of Questions</Label>
              <Input
                id="edit-num-questions"
                placeholder="Number of Questions"
                type="number"
                value={editForm.num_questions ?? ''}
                onChange={e => setEditForm({ ...editForm, num_questions: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
            <div>
              <Label htmlFor="edit-time-per-question">Time per Question</Label>
              <Input
                id="edit-time-per-question"
                placeholder="Time per Question"
                type="number"
                value={editForm.time_per_question ?? ''}
                onChange={e => setEditForm({ ...editForm, time_per_question: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
            <div className="flex items-center gap-4">
              <Label className="flex items-center gap-2" htmlFor="edit-premium">
                <span>Premium</span>
                <Switch id="edit-premium" checked={!!editForm.is_premium} onCheckedChange={v => setEditForm({ ...editForm, is_premium: v })} />
              </Label>
              <Label className="flex items-center gap-2" htmlFor="edit-active">
                <span>Active</span>
                <Switch id="edit-active" checked={!!editForm.is_active} onCheckedChange={v => setEditForm({ ...editForm, is_active: v })} />
              </Label>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={saveEdit} type="button">Save</Button>
            <DialogClose asChild>
              <Button variant="ghost" type="button" onClick={closeDialog}>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quiz Mode</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p>Are you sure you want to delete <b>{modeToDelete?.title}</b>?</p>
            <p className="text-sm text-red-600 mt-2">This mode will no longer be visible in the app and cannot be recovered.</p>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
</>
  );
}
