
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Plus, Edit, Trash2, Search, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';

interface Exam {
  id: string;
  title: string;
  short_name: string;
  description: string;
  category: string;
  total_questions: number;
  questions_count?: number;
  free_questions_count?: number;
  premium_questions_count?: number;
  passing_score: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export default function ExamManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [load, isload] = useState(true)
  const [newExam, setNewExam] = useState({
    title: '',
    short_name: '',
    description: '',
    category: '',
    total_questions: 0,
    passing_score: 70,
    duration_minutes: 90,
    is_active: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch exams
  const { data: exams, isLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      isload(true)
      const { data, error } = await supabase
        .from('exams')
        .select('*, questions(is_premium)')
        .order('created_at', { ascending: false });
      isload(false);
      if (error) throw error;
      return data.map(exam => {
        const questions = exam.questions as any[];
        const total = questions.length;
        const premium = questions.filter((q: any) => q.is_premium).length;
        const free = total - premium;

        return {
          ...exam,
          questions_count: total,
          free_questions_count: free,
          premium_questions_count: premium
        };
      }) as Exam[];
    },
  });

  // Create/Update exam mutation
  const examMutation = useMutation({
    mutationFn: async (examData: any) => {
      if (editingExam) {
        const { error } = await supabase
          .from('exams')
          .update(examData)
          .eq('id', editingExam.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('exams')
          .insert([examData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setIsDialogOpen(false);
      setEditingExam(null);
      setNewExam({
        title: '',
        short_name: '',
        description: '',
        category: '',
        total_questions: 0,
        passing_score: 70,
        duration_minutes: 90,
        is_active: true
      });
      toast({
        title: "Success",
        description: `Exam ${editingExam ? 'updated' : 'created'} successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editingExam ? 'update' : 'create'} exam: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete exam mutation
  const deleteMutation = useMutation({
    mutationFn: async (examId: string) => {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast({
        title: "Success",
        description: "Exam deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete exam: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    examMutation.mutate(newExam);
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setNewExam({
      title: exam.title,
      short_name: exam.short_name,
      description: exam.description,
      category: exam.category,
      total_questions: exam.total_questions,
      passing_score: exam.passing_score,
      duration_minutes: exam.duration_minutes,
      is_active: exam.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (examId: string) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      deleteMutation.mutate(examId);
    }
  };

  const filteredExams = exams?.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading || load) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Exam</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingExam ? 'Edit Exam' : 'Add New Exam'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newExam.title}
                        onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="short_name">Short Name</Label>
                      <Input
                        id="short_name"
                        value={newExam.short_name}
                        onChange={(e) => setNewExam({ ...newExam, short_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newExam.description}
                      onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newExam.category}
                      onChange={(e) => setNewExam({ ...newExam, category: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="passing_score">Passing Score (%)</Label>
                      <Input
                        id="passing_score"
                        type="number"
                        value={newExam.passing_score}
                        onChange={(e) => setNewExam({ ...newExam, passing_score: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newExam.duration_minutes}
                        onChange={(e) => setNewExam({ ...newExam, duration_minutes: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={newExam.is_active}
                      onCheckedChange={(checked) => setNewExam({ ...newExam, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingExam ? 'Update Exam' : 'Create Exam'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Exams ({filteredExams.length})</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Passing Score</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.title}</TableCell>
                      <TableCell>{exam.category}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="font-semibold">{exam.questions_count} Total</span>
                          <span className="text-green-600">{exam.free_questions_count} Free</span>
                          <span className="text-yellow-600">{exam.premium_questions_count} Premium</span>
                        </div>
                      </TableCell>
                      <TableCell>{exam.passing_score}%</TableCell>
                      <TableCell>{exam.duration_minutes} min</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${exam.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {exam.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(exam)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(exam.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/questions?exam=${exam.id}`)}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
