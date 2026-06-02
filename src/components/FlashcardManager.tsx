import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Pencil } from 'lucide-react';
import { Trash2Icon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import * as XLSX from 'xlsx';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';

const FlashcardManager = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedExamId = params.get('exam');
    const [examTitle, setExamTitle] = useState<string>('');
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // CRUD State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        question_text: '',
        answer_text: '',
        difficulty_tier: 1,
        exam_id: '',
        p_value_realized: 0
    });

    // Data State
    const [flashcards, setFlashcards] = useState<any[]>([]);
    const [examsCache, setExamsCache] = useState<{ id: string, title: string, short_name: string }[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // To manually trigger refresh

    // Excel State
    const [excelDialogOpen, setExcelDialogOpen] = useState(false);
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const [processingExcel, setProcessingExcel] = useState(false);
    const [excelRowFeedback, setExcelRowFeedback] = useState<{ row: number, status: 'success' | 'updated' | 'deleted' | 'failed', message: string }[]>([]);

    // Fetch Exam Title if selected
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

    // Fetch Exams for dropdown
    useEffect(() => {
        const fetchExams = async () => {
            const { data, error } = await supabase.from('exams').select('id, title, short_name').eq('is_active', true);
            if (!error && data) setExamsCache(data);
        };
        fetchExams();
    }, []);

    // Filter State
    const [filterExamId, setFilterExamId] = useState<string | null>(selectedExamId);

    // Fetch Flashcards
    useEffect(() => {
        const fetchFlashcards = async () => {
            setLoading(true);
            let query = supabase
                .from('adaptive_questions' as any)
                .select(`
                    id,
                    question_text,
                    answer_text,
                    difficulty_tier,
                    p_value_realized,
                    exam_id,
                    exam_id,
                    exams (title)
                `)
                .order('created_at', { ascending: false });

            if (filterExamId) {
                query = query.eq('exam_id', filterExamId);
            }

            const { data, error } = await query;
            if (error) {
                toast({
                    title: "Error fetching flashcards",
                    description: error.message,
                    variant: "destructive"
                });
            } else {
                setFlashcards(data || []);
            }
            setLoading(false);
        };
        fetchFlashcards();
    }, [filterExamId, refreshTrigger]);

    // Excel Logic
    function handleExcelFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        setExcelRowFeedback([]);
        if (e.target.files && e.target.files[0]) {
            setExcelFile(e.target.files[0]);
        } else {
            setExcelFile(null);
        }
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

            const requiredCols = ['question_text', 'answer_text'];
            const missingCols = requiredCols.filter(col =>
                !Object.keys(rows[0]).map(k => k.toLowerCase()).includes(col.toLowerCase())
            );

            // Simple check for headers presence in first row (imperfect but okay for now)
            // Or just check if columns exist in row objects (sheet_to_json does that)
            // The check above: missingCols logic tries to find if `question_text` (case insensitive) exists in keys.

            if (!selectedExamId) {
                toast({
                    title: "No Exam Selected",
                    description: "Please access this page with an exam selected in the URL or via the main page filter.",
                    variant: "destructive",
                });
                setProcessingExcel(false);
                return;
            }

            let successCount = 0;
            const errors: string[] = [];

            for (let [i, row] of rows.entries()) {
                const qText = row['question_text'] || row['Question_Text'] || row['QUESTION_TEXT'];
                const aText = row['answer_text'] || row['Answer_Text'] || row['ANSWER_TEXT'];
                const diff = row['difficulty_tier'] || row['Difficulty_Tier'] || row['DIFFICULTY_TIER'];

                if (!qText || !aText) {
                    setExcelRowFeedback(prev => [...prev, { row: i + 2, status: 'failed', message: 'Missing required fields' }]);
                    continue;
                }

                // Insert
                const { error } = await supabase.from('adaptive_questions' as any).insert({
                    question_text: qText,
                    answer_text: aText,
                    difficulty_tier: parseInt(diff) || 1,
                    domain: 'General',
                    exam_id: selectedExamId,
                    status: 'active',
                    p_value_realized: 0.0
                });

                if (error) {
                    setExcelRowFeedback(prev => [...prev, { row: i + 2, status: 'failed', message: error.message }]);
                } else {
                    setExcelRowFeedback(prev => [...prev, { row: i + 2, status: 'success', message: 'Inserted successfully' }]);
                    successCount++;
                }
            }

            if (successCount > 0) {
                toast({
                    title: "Excel Upload Success",
                    description: `Successfully added ${successCount} flashcards.`,
                });
                setRefreshTrigger(prev => prev + 1);
            }

        } catch (err: any) {
            toast({
                title: "Upload Failed",
                description: err.message,
                variant: 'destructive'
            });
        }
        setProcessingExcel(false);
    }

    // CRUD Handlers
    const openAddDialog = () => {
        setEditingId(null);
        setFormData({
            question_text: '',
            answer_text: '',
            difficulty_tier: 1,
            exam_id: selectedExamId || examsCache[0]?.id || '',
            p_value_realized: 0
        });
        setDialogOpen(true);
    };

    const openEditDialog = (item: any) => {
        setEditingId(item.id);
        setFormData({
            question_text: item.question_text,
            answer_text: item.answer_text,
            difficulty_tier: item.difficulty_tier,
            exam_id: item.exam_id || '',
            p_value_realized: item.p_value_realized || 0
        });
        setDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            question_text: formData.question_text,
            answer_text: formData.answer_text,
            difficulty_tier: Number(formData.difficulty_tier),
            exam_id: formData.exam_id,
            domain: 'General',
            status: 'active',
            // p_value_realized is not updated manually
        };

        if (editingId) {
            // Update
            const { error } = await supabase.from('adaptive_questions' as any).update(payload).eq('id', editingId);
            if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
            else {
                toast({ title: 'Updated', description: 'Flashcard updated successfully' });
                setRefreshTrigger(prev => prev + 1);
                setDialogOpen(false);
            }
        } else {
            // Create
            const { error } = await supabase.from('adaptive_questions' as any).insert(payload);
            if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
            else {
                toast({ title: 'Created', description: 'Flashcard created successfully' });
                setRefreshTrigger(prev => prev + 1);
                setDialogOpen(false);
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this flashcard?")) return;
        const { error } = await supabase.from('adaptive_questions' as any).delete().eq('id', id);
        if (error) toast({ title: 'Delete Failed', description: error.message, variant: 'destructive' });
        else {
            toast({ title: 'Deleted', description: 'Flashcard deleted' });
            setRefreshTrigger(prev => prev + 1);
        }
    };

    return (
        <div>
            {/* Header / Context */}
            <div className="mt-6 mb-8">
                {selectedExamId ? (
                    <Alert>
                        <AlertDescription>
                            <div className="flex items-center mb-2 mt-2">
                                <CheckCircle className="mr-2" size={16} />
                                <strong className="font-bold">Selected Exam: </strong> {examTitle || 'Loading...'}
                            </div>
                            <span className="text-sm text-gray-500">Flashcards will be added to this exam.</span>
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert variant="destructive">
                        <AlertDescription>
                            <strong>No Exam Selected</strong>
                            <br />
                            Select an exam in the filter above to enable bulk upload.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Excel Upload Section */}
            <div className="flex items-center justify-between mb-8 border-b pb-8">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Upload Flashcards via Excel</h3>
                    <p className="text-sm text-gray-500">
                        Upload an Excel file with columns: <code>question_text</code>, <code>answer_text</code>. Optional: <code>difficulty_tier</code>.
                    </p>
                </div>
                <Button variant="default" onClick={() => setExcelDialogOpen(true)} disabled={!selectedExamId}>
                    Upload Excel
                </Button>
            </div>

            {/* List & Filter Section */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">Flashcards ({flashcards.length})</h2>
                    <select
                        className="border rounded px-2 py-1 text-sm"
                        value={filterExamId || ''}
                        onChange={e => setFilterExamId(e.target.value || null)}
                    >
                        <option value="">All Exams</option>
                        {examsCache.map(exam => (
                            <option key={exam.id} value={exam.id}>{exam.title}</option>
                        ))}
                    </select>
                </div>
                <Button onClick={openAddDialog} size="sm">Add Flashcard</Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
                <table className="min-w-full text-xs">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Question</th>
                            <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Answer</th>
                            <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Success Rate (P-Value)</th>
                            <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Exam</th>
                            <th className="border-b px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center p-4">Loading...</td></tr>
                        ) : (flashcards.length === 0 ? (
                            <tr><td colSpan={5} className="text-center p-4">No flashcards found</td></tr>
                        ) : flashcards.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3 max-w-[200px] truncate" title={item.question_text}>{item.question_text}</td>
                                <td className="px-4 py-3 max-w-[200px] truncate" title={item.answer_text}>{item.answer_text}</td>
                                <td className="px-4 py-3">
                                    <Badge variant="outline" className={`${(item.p_value_realized || 0) >= 0.7 ? 'bg-green-100 text-green-800 border-green-200' :
                                            (item.p_value_realized || 0) >= 0.4 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                'bg-red-100 text-red-800 border-red-200'
                                        }`}>
                                        {Math.round((item.p_value_realized || 0) * 100)}%
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">{item.exams?.title || 'None'}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-blue-600" onClick={() => openEditDialog(item)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                                            <Trash2Icon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>

            {/* CRUD Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit' : 'Add'} Flashcard</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleSave}>
                        <div>
                            <Label>Question</Label>
                            <Textarea
                                value={formData.question_text}
                                onChange={e => setFormData({ ...formData, question_text: e.target.value })}
                                required
                                rows={2}
                            />
                        </div>
                        <div>
                            <Label>Answer</Label>
                            <Textarea
                                value={formData.answer_text}
                                onChange={e => setFormData({ ...formData, answer_text: e.target.value })}
                                required
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Difficulty (1-10) [Optional]</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={formData.difficulty_tier}
                                    onChange={e => setFormData({ ...formData, difficulty_tier: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                            <div>
                                <Label>Exam</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.exam_id}
                                    onChange={e => setFormData({ ...formData, exam_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select Exam</option>
                                    {examsCache.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                                </select>
                            </div>
                        </div>
                        {editingId && (
                            <div>
                                <Label>P-Value Realized (Success Rate)</Label>
                                <div className="mt-1">
                                    <Badge variant="outline" className={`${(formData.p_value_realized || 0) >= 0.7 ? 'bg-green-100 text-green-800 border-green-200' :
                                            (formData.p_value_realized || 0) >= 0.4 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                'bg-red-100 text-red-800 border-red-200'
                                        }`}>
                                        {Math.round((formData.p_value_realized || 0) * 100)}%
                                    </Badge>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Excel Dialog */}
            <Dialog open={excelDialogOpen} onOpenChange={setExcelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Excel to Assign Flashcards</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Label>Excel Format: <code>question_text</code>, <code>answer_text</code>. Optional: <code>difficulty_tier</code></Label>
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

                        <Button onClick={processExcelUpload} disabled={!excelFile || processingExcel} className="w-full">
                            {processingExcel ? 'Processing...' : 'Upload Flashcards'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FlashcardManager;
