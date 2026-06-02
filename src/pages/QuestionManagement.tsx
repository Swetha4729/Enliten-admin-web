import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import qs from 'qs';
import ReactSelect from 'react-select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FileQuestion, Plus, Edit, Trash2, Search, Upload, ClipboardList, Filter as FilterIcon, Calendar as CalendarIcon, Crown, Zap } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import BulkQuestionUpload from '@/components/BulkQuestionUpload';
import DailyQuiz from '@/components/DailyQuiz';
import FlashcardManager from '@/components/FlashcardManager';
import Navbar from '@/components/Navbar';

interface Exam {
  id: string;
  title: string;
  short_name: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  domain: string;
  explanation: string;
  difficulty: string;
  created_at: string;
  subject_id: string;
  exam?: string; // exam uuid
  exams?: { title: string }; // joined exam title for display
  options?: QuestionOption[];
  subjects?: { name: string };
  is_premium: boolean;
}

interface QuestionOption {
  id: string;
  option_letter: string;
  option_text: string;
  is_correct: boolean;
}

interface Subject {
  id: string;
  name: string;
}

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export default function QuestionManagement() {
  // Popover state for filter dropdowns
  const [domainFilterOpen, setDomainFilterOpen] = useState(false);
  const [subjectFilterOpen, setSubjectFilterOpen] = useState(false);
  const [examFilterOpen, setExamFilterOpen] = useState(false);
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const [createdFilterOpen, setCreatedFilterOpen] = useState(false);
  const [difficultyFilterOpen, setDifficultyFilterOpen] = useState(false);
  const domainFilterRef = useRef<HTMLDivElement>(null);
  const subjectFilterRef = useRef<HTMLDivElement>(null);
  const examFilterRef = useRef<HTMLDivElement>(null);
  const typeFilterRef = useRef<HTMLDivElement>(null);
  const createdFilterRef = useRef<HTMLDivElement>(null);
  const difficultyFilterRef = useRef<HTMLDivElement>(null);

  // Click outside to close filter popovers
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (domainFilterRef.current && !domainFilterRef.current.contains(event.target as Node)) {
        setDomainFilterOpen(false);
      }
      if (subjectFilterRef.current && !subjectFilterRef.current.contains(event.target as Node)) {
        setSubjectFilterOpen(false);
      }
      if (examFilterRef.current && !examFilterRef.current.contains(event.target as Node)) {
        setExamFilterOpen(false);
      }
      if (typeFilterRef.current && !typeFilterRef.current.contains(event.target as Node)) {
        setTypeFilterOpen(false);
      }
      if (createdFilterRef.current && !createdFilterRef.current.contains(event.target as Node)) {
        setCreatedFilterOpen(false);
      }
      if (difficultyFilterRef.current && !difficultyFilterRef.current.contains(event.target as Node)) {
        setDifficultyFilterOpen(false);
      }
    }
    if (domainFilterOpen || subjectFilterOpen || examFilterOpen || typeFilterOpen || createdFilterOpen || difficultyFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [domainFilterOpen, subjectFilterOpen, examFilterOpen, typeFilterOpen, createdFilterOpen, difficultyFilterOpen]);

  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  // Remove examDropdownOpen state as we're using react-select now

  // Parse filter params from URL
  const urlParams = React.useMemo(() => {
    const params = qs.parse(location.search, { ignoreQueryPrefix: true });
    return {
      exam: params.exam
        ? Array.isArray(params.exam)
          ? params.exam as string[]
          : (params.exam as string).split(',').filter(Boolean)
        : [],
      subject: params.subject
        ? Array.isArray(params.subject)
          ? params.subject as string[]
          : (params.subject as string).split(',').filter(Boolean)
        : [],
      domain: params.domain
        ? Array.isArray(params.domain)
          ? params.domain as string[]
          : (params.domain as string).split(',').filter(Boolean)
        : [],
      difficulty: params.difficulty
        ? Array.isArray(params.difficulty)
          ? params.difficulty as string[]
          : (params.difficulty as string).split(',').filter(Boolean)
        : [],
      type: params.type
        ? Array.isArray(params.type)
          ? params.type as string[]
          : (params.type as string).split(',').filter(Boolean)
        : [],
      created: params.created
        ? Array.isArray(params.created)
          ? params.created as string[]
          : (params.created as string).split(',').filter(Boolean)
        : [],
      premium: params.premium ? (params.premium as string) : 'all',
    };
  }, [location.search]);

  const [selectedExamIds, setSelectedExamIds] = useState<string[]>(urlParams.exam);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(urlParams.subject);
  const [selectedDomains, setSelectedDomains] = useState<string[]>(urlParams.domain);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(urlParams.difficulty);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(urlParams.type);
  const [domainSearchTerm, setDomainSearchTerm] = useState('');
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    urlParams.created[0] ? new Date(`${urlParams.created[0]}T00:00:00`) : undefined
  );
  const [selectedPremium, setSelectedPremium] = useState<string>(urlParams.premium);

  React.useEffect(() => {
    setSelectedExamIds(prev => arraysEqual(prev, urlParams.exam) ? prev : urlParams.exam);
    setSelectedSubjectIds(prev => arraysEqual(prev, urlParams.subject) ? prev : urlParams.subject);
    setSelectedDomains(prev => arraysEqual(prev, urlParams.domain) ? prev : urlParams.domain);
    setSelectedDifficulties(prev => arraysEqual(prev, urlParams.difficulty) ? prev : urlParams.difficulty);
    setSelectedTypes(prev => arraysEqual(prev, urlParams.type) ? prev : urlParams.type);

    const nextSelectedDate = urlParams.created[0]
      ? new Date(`${urlParams.created[0]}T00:00:00`)
      : undefined;
      
    setSelectedDate(prev => {
      const currentDateValue = prev ? format(prev, 'yyyy-MM-dd') : '';
      const nextDateValue = nextSelectedDate ? format(nextSelectedDate, 'yyyy-MM-dd') : '';
      return currentDateValue !== nextDateValue ? nextSelectedDate : prev;
    });

    setSelectedPremium(prev => prev !== urlParams.premium ? urlParams.premium : prev);
  }, [urlParams]);

  // Keep URL in sync with all filters
  React.useEffect(() => {
    const params = qs.parse(location.search, { ignoreQueryPrefix: true });
    if (selectedExamIds.length > 0) {
      params.exam = selectedExamIds.join(',');
    } else {
      delete params.exam;
    }
    if (selectedSubjectIds.length > 0) {
      params.subject = selectedSubjectIds.join(',');
    } else {
      delete params.subject;
    }
    if (selectedDomains.length > 0) {
      params.domain = selectedDomains.join(',');
    } else {
      delete params.domain;
    }
    if (selectedDifficulties.length > 0) {
      params.difficulty = selectedDifficulties.join(',');
    } else {
      delete params.difficulty;
    }
    if (selectedTypes.length > 0) {
      params.type = selectedTypes.join(',');
    } else {
      delete params.type;
    }
    if (selectedDate) {
      params.created = format(selectedDate, 'yyyy-MM-dd');
    } else {
      delete params.created;
    }
    if (selectedPremium && selectedPremium !== 'all') {
      params.premium = selectedPremium;
    } else {
      delete params.premium;
    }
    const newSearch = qs.stringify(params, { addQueryPrefix: true });
    if (location.search !== newSearch) {
      navigate({ search: newSearch }, { replace: true });
    }
  }, [selectedExamIds, selectedSubjectIds, selectedDomains, selectedDifficulties, selectedTypes, selectedDate, selectedPremium, location, navigate]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    domain: '',
    explanation: '',
    difficulty: 'medium',
    subject_id: '',
    exam: '', // exam uuid
    is_premium: true,
    options: [
      { option_letter: 'A', option_text: '', is_correct: false },
      { option_letter: 'B', option_text: '', is_correct: false },
      { option_letter: 'C', option_text: '', is_correct: false },
      { option_letter: 'D', option_text: '', is_correct: false }
    ]
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('QuestionManagement component mounted');

  // Fetch questions with options, subjects, and exam
  const { data: questions, isLoading, error } = useQuery({
    queryKey: ['questions', selectedExamIds],
    queryFn: async () => {
      console.log('Fetching questions...');
      let allData: Question[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        let query = supabase
          .from('questions')
          .select(`
            *,
            question_options (*),
            subjects (name),
            exams:exam (title)
          `)
          .order('created_at', { ascending: false })
          .range(from, from + batchSize - 1);

        if (selectedExamIds.length > 0) {
          query = query.in('exam', selectedExamIds);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching questions batch:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          hasMore = false;
        } else {
          allData = [...allData, ...data as Question[]];
          if (data.length < batchSize) {
            hasMore = false;
          } else {
            from += batchSize;
          }
        }
      }

      console.log('Total questions fetched:', allData.length);
      return allData;
    },
  });

  // Fetch subjects for dropdown
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      console.log('Fetching subjects for dropdown...');
      let allData: Subject[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('name')
          .range(from, from + batchSize - 1);

        if (error) {
          console.error('Error fetching subjects batch:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          hasMore = false;
        } else {
          allData = [...allData, ...data as Subject[]];
          if (data.length < batchSize) {
            hasMore = false;
          } else {
            from += batchSize;
          }
        }
      }

      console.log('Total subjects fetched:', allData.length);
      return allData;
    },
  });

  // Fetch exams for dropdown
  const { data: exams } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('id, title, short_name')
        .eq('is_active', true)
        .order('title');
      if (error) throw error;
      return data as Exam[];
    },
  });

  // Create/Update question mutation
  const questionMutation = useMutation({
    mutationFn: async (questionData: any) => {
      if (editingQuestion) {
        // Update question
        const { error: questionError } = await supabase
          .from('questions')
          .update({
            question_text: questionData.question_text,
            question_type: questionData.question_type,
            domain: questionData.domain,
            explanation: questionData.explanation,
            difficulty: questionData.difficulty,
            subject_id: questionData.subject_id,
            exam: questionData.exam || null,
            is_premium: questionData.is_premium
          })
          .eq('id', editingQuestion.id);
        if (questionError) throw questionError;

        // Delete existing options
        await supabase
          .from('question_options')
          .delete()
          .eq('question_id', editingQuestion.id);

        // Insert new options
        const optionsToInsert = questionData.options.map((option: any) => ({
          question_id: editingQuestion.id,
          option_letter: option.option_letter,
          option_text: option.option_text,
          is_correct: option.is_correct
        }));

        const { error: optionsError } = await supabase
          .from('question_options')
          .insert(optionsToInsert);
        if (optionsError) throw optionsError;
      } else {
        // Create new question
        const { data: questionResult, error: questionError } = await supabase
          .from('questions')
          .insert([{
            question_text: questionData.question_text,
            question_type: questionData.question_type,
            domain: questionData.domain,
            explanation: questionData.explanation,
            difficulty: questionData.difficulty,
            subject_id: questionData.subject_id,
            exam: questionData.exam || null,
            is_premium: questionData.is_premium
          }])
          .select()
          .single();
        if (questionError) throw questionError;

        // Insert options
        const optionsToInsert = questionData.options.map((option: any) => ({
          question_id: questionResult.id,
          option_letter: option.option_letter,
          option_text: option.option_text,
          is_correct: option.is_correct
        }));

        const { error: optionsError } = await supabase
          .from('question_options')
          .insert(optionsToInsert);
        if (optionsError) throw optionsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      setIsDialogOpen(false);
      setEditingQuestion(null);
      setNewQuestion({
        question_text: '',
        question_type: 'multiple_choice',
        domain: '',
        explanation: '',
        difficulty: 'medium',
        subject_id: '',
        exam: '',
        is_premium: true,
        options: [
          { option_letter: 'A', option_text: '', is_correct: false },
          { option_letter: 'B', option_text: '', is_correct: false },
          { option_letter: 'C', option_text: '', is_correct: false },
          { option_letter: 'D', option_text: '', is_correct: false }
        ]
      });
      toast({
        title: "Success",
        description: `Question ${editingQuestion ? 'updated' : 'created'} successfully`,
      });
    },
    onError: (error) => {
      console.error('Question mutation error:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingQuestion ? 'update' : 'create'} question: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete question mutation
  const deleteMutation = useMutation({
    mutationFn: async (questionId: string) => {
      // Delete options first (cascade should handle this, but being explicit)
      await supabase
        .from('question_options')
        .delete()
        .eq('question_id', questionId);

      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete question: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    questionMutation.mutate(newQuestion);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    console.log('Editing question:', question);
    console.log('Question options:', question.options);
    console.log('Question question_options:', (question as any).question_options);

    // Defensive: only set exam if it matches a valid exam id, else ''
    let validExamId = '';
    if (question.exam && exams && exams.some(e => e.id === question.exam)) {
      validExamId = question.exam;
    }

    // Handle options from either 'options' or 'question_options' field
    const questionOptions = question.options || (question as any).question_options || [];
    console.log('Using options:', questionOptions);

    setNewQuestion({
      question_text: question.question_text,
      question_type: question.question_type,
      domain: question.domain,
      explanation: question.explanation,
      difficulty: question.difficulty,
      subject_id: question.subject_id,
      exam: validExamId,
      is_premium: question.is_premium,
      options: questionOptions.length ? questionOptions.map((opt: any) => ({
        option_letter: opt.option_letter,
        option_text: opt.option_text,
        is_correct: opt.is_correct
      })) : [
        { option_letter: 'A', option_text: '', is_correct: false },
        { option_letter: 'B', option_text: '', is_correct: false },
        { option_letter: 'C', option_text: '', is_correct: false },
        { option_letter: 'D', option_text: '', is_correct: false }
      ]
    });
    setIsDialogOpen(true);
  };


  const handleDelete = (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteMutation.mutate(questionId);
    }
  };

  const updateOption = (index: number, field: string, value: any) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  // Memoize filtered lists for UI elements to prevent re-calculation on every render
  const questionsForFilterOptions = React.useMemo(() => {
    if (!questions) return [];
    return questions.filter(question => {
      const matchesExam = selectedExamIds.length === 0 || (question.exam && selectedExamIds.includes(question.exam));
      return matchesExam;
    });
  }, [questions, selectedExamIds]);

  const availableDomains = React.useMemo(() => Array.from(new Set(questionsForFilterOptions.map(q => q.domain).filter(Boolean))), [questionsForFilterOptions]);
  const examOptions = React.useMemo(() => exams?.map(exam => ({ value: exam.id, label: exam.title })) || [], [exams]);
  const availableQuestionTypes = React.useMemo(() => Array.from(new Set(questions?.map(q => q.question_type).filter(Boolean))), [questions]);

  const availableSubjects = React.useMemo(() => {
    const subjectMap = new Map<string, string>();
    questionsForFilterOptions.forEach(q => {
      if (q.subject_id && q.subjects?.name) {
        subjectMap.set(q.subject_id, q.subjects.name);
      }
    });
    return Array.from(subjectMap.entries()).map(([id, name]) => ({ id, name }));
  }, [questionsForFilterOptions]);

  const filteredSubjects = React.useMemo(() => {
    return availableSubjects.filter(subject => subject.name.toLowerCase().includes(subjectSearchTerm.toLowerCase()));
  }, [availableSubjects, subjectSearchTerm]);

  // const [domainSearchTerm, setDomainSearchTerm] = useState('');

  const filteredDomains = React.useMemo(() => {
    return availableDomains.filter(domain => domain.toLowerCase().includes(domainSearchTerm.toLowerCase()));
  }, [availableDomains, domainSearchTerm]);

  const filteredQuestions = questions?.filter(question => {
    // Filter by search
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.domain.toLowerCase().includes(searchTerm.toLowerCase());
    // Filter by selected exams if any
    const matchesExam = selectedExamIds.length === 0 || (question.exam && selectedExamIds.includes(question.exam));
    // Filter by subject
    const matchesSubject = selectedSubjectIds.length === 0 || (question.subject_id && selectedSubjectIds.includes(question.subject_id));
    // Filter by domain
    const matchesDomain = selectedDomains.length === 0 || (question.domain && selectedDomains.includes(question.domain));
    // Filter by difficulty
    const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(question.difficulty);
    // Filter by type
    const matchesType = selectedTypes.length === 0 || (question.question_type && selectedTypes.includes(question.question_type));
    const matchesDate = !selectedDate || format(new Date(question.created_at), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    // Filter by created (date string, YYYY-MM-DD)
    // Filter by premium status
    const matchesPremium = selectedPremium === 'all' ||
      (selectedPremium === 'premium' && question.is_premium) ||
      (selectedPremium === 'free' && !question.is_premium);

    return matchesSearch && matchesExam && matchesSubject && matchesDomain && matchesDifficulty && matchesType && matchesDate && matchesPremium;
  }) || [];

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedExamIds, selectedSubjectIds, selectedDomains, selectedDifficulties, selectedTypes, selectedDate, selectedPremium]);

  const paginatedQuestions = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQuestions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuestions, currentPage]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

  const renderPaginationControls = () => {
    if (totalPages <= 1) return null;
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(prev => Math.max(1, prev - 1));
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50 select-none cursor-default" : "cursor-pointer select-none"}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(pageNum);
                  }}
                  isActive={currentPage === pageNum}
                  className="cursor-pointer select-none"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink 
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(totalPages);
                  }}
                  className="cursor-pointer select-none"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext 
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
              }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50 select-none cursor-default" : "cursor-pointer select-none"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  console.log('Render state:', {
    isLoading,
    error,
    questionsCount: questions?.length,
    subjectsCount: subjects?.length,
    filteredQuestionsCount: filteredQuestions.length
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    console.error('Question query error:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error loading questions</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <FileQuestion className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
            </div>
          </div>

          <Tabs defaultValue="manage" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="manage" className="flex items-center space-x-2">
                <FileQuestion className="h-4 w-4" />
                <span>Manage Questions</span>
              </TabsTrigger>
              <TabsTrigger value="bulk-upload" className="flex items-center space-x-2" disabled={selectedExamIds.length == 1 ? false : true}>
                <Upload className="h-4 w-4" />
                <span>Bulk Upload</span>
              </TabsTrigger>
              <TabsTrigger value="daily-quiz" className="flex items-center space-x-2" disabled={selectedExamIds.length == 1 ? false : true}>
                <ClipboardList className="h-4 w-4" />
                <span>Daily Quiz</span>
              </TabsTrigger>
              <TabsTrigger value="flashcards" className="flex items-center space-x-2" disabled={selectedExamIds.length == 1 ? false : true}>
                <Zap className="h-4 w-4" />
                <span>Flashcards</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manage" className="space-y-6">
              <div className="flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Question</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="question_text">Question Text</Label>
                        <Textarea
                          id="question_text"
                          value={newQuestion.question_text}
                          onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                          required
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="domain">Domain</Label>
                          <Input
                            id="domain"
                            value={newQuestion.domain}
                            onChange={(e) => setNewQuestion({ ...newQuestion, domain: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="difficulty">Difficulty</Label>
                          <Select value={newQuestion.difficulty} onValueChange={(value) => setNewQuestion({ ...newQuestion, difficulty: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="subject_id">Subject</Label>
                        <Select
                          value={newQuestion.subject_id}
                          onValueChange={(value) => setNewQuestion({ ...newQuestion, subject_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects?.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="exam">Exam</Label>
                        <Select
                          value={newQuestion.exam || undefined}
                          onValueChange={(value) => setNewQuestion({ ...newQuestion, exam: value || '' })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an exam (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            {exams?.filter(exam => exam.id && exam.id !== '').map((exam) => (
                              <SelectItem key={exam.id} value={exam.id}>
                                {exam.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Answer Options</Label>
                        <div className="space-y-3 mt-2">
                          {newQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                              <div className="font-medium w-8">{option.option_letter}.</div>
                              <Input
                                placeholder="Option text"
                                value={option.option_text}
                                onChange={(e) => updateOption(index, 'option_text', e.target.value)}
                                className="flex-1"
                              />
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="correct_answer"
                                  checked={option.is_correct}
                                  onChange={() => {
                                    const updatedOptions = newQuestion.options.map((opt, i) => ({
                                      ...opt,
                                      is_correct: i === index
                                    }));
                                    setNewQuestion({ ...newQuestion, options: updatedOptions });
                                  }}
                                />
                                <Label className="text-sm">Correct</Label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="explanation">Explanation</Label>
                        <Textarea
                          id="explanation"
                          value={newQuestion.explanation}
                          onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is-premium"
                          checked={newQuestion.is_premium}
                          onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, is_premium: checked })}
                        />
                        <Label htmlFor="is-premium">Premium Question</Label>
                      </div>
                      <Button type="submit" className="w-full">
                        {editingQuestion ? 'Update Question' : 'Create Question'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <CardTitle>Questions ({filteredQuestions.length})</CardTitle>
                      {/* Group By Exam Multi-Select Filter */}
                      <div className="min-w-[300px]">
                        <Label className="block mb-2">Filter by Exam(s):</Label>
                        <ReactSelect
                          isMulti
                          name="examFilter"
                          options={examOptions}
                          value={exams?.filter(exam => selectedExamIds.includes(exam.id)).map(exam => ({ value: exam.id, label: exam.title })) || []}
                          onChange={(selectedOptions) => {
                            const newSelectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
                            setSelectedExamIds(newSelectedIds);
                          }}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          placeholder="Select exams to filter..."
                          isClearable
                          isSearchable
                        />
                      </div>
                    </div>
                    <div className='flex items-center gap-4'>
                      <Tabs value={selectedPremium} onValueChange={setSelectedPremium} className="hidden md:block">
                        <TabsList>
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="premium" className="flex items-center gap-1"><Crown className="w-3 h-3" /> Premium</TabsTrigger>
                          <TabsTrigger value="free">Free</TabsTrigger>
                        </TabsList>
                      </Tabs>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search questions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {totalPages > 1 && (
                    <div className="mb-4 flex justify-center">
                      {renderPaginationControls()}
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow className=''>
                        <TableHead>Question</TableHead>
                        <TableHead className="relative group">
                          <>
                            <div className='flex items-center'>

                              Domain
                              <button
                                className="ml-1 p-1 rounded hover:bg-gray-200 inline-flex items-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDomainFilterOpen((prev) => !prev);
                                }}
                                aria-label="Filter Domain"
                                type="button"
                              >
                                <FilterIcon className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                              </button>
                            </div>
                            {domainFilterOpen && (
                              <div ref={domainFilterRef} className="absolute left-0 z-20 mt-2 bg-white border rounded shadow-lg w-72 p-4">
                                <div className="font-semibold mb-2">Filter by Domain</div>
                                <Input
                                  type="text"
                                  placeholder="Search domains..."
                                  value={domainSearchTerm}
                                  onChange={(e) => setDomainSearchTerm(e.target.value)}
                                  className="mb-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                                <div className="max-h-64 overflow-y-auto">
                                  {filteredDomains.map((domain) => (
                                    <div key={domain} className="flex items-center space-x-2 mb-2">
                                      <input
                                        type="checkbox"
                                        checked={selectedDomains.includes(domain)}
                                        onChange={() => {
                                          setSelectedDomains((prev) =>
                                            prev.includes(domain)
                                              ? prev.filter(d => d !== domain)
                                              : [...prev, domain]
                                          );
                                        }}
                                        id={`domain-filter-${domain}`}
                                      />
                                      <label htmlFor={`domain-filter-${domain}`} className="text-sm cursor-pointer">{domain}</label>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  className="mt-2 text-xs text-blue-600 hover:underline"
                                  onClick={() => setSelectedDomains([])}
                                  type="button"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </>
                        </TableHead>
                        <TableHead className="relative group">
                          <>
                            <div className='flex items-center'>

                              Subject
                              <button
                                className="ml-1 p-1 rounded hover:bg-gray-200 inline-flex items-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSubjectFilterOpen((prev) => !prev);
                                }}
                                aria-label="Filter Subject"
                                type="button"
                              >
                                <FilterIcon className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                              </button>
                            </div>
                            {subjectFilterOpen && (
                              <div ref={subjectFilterRef} className="absolute left-0 z-20 mt-2 bg-white border rounded shadow-lg w-64 p-4">
                                <div className="font-semibold mb-2">Filter by Subject</div>
                                <Input
                                  type="text"
                                  placeholder="Search subjects..."
                                  value={subjectSearchTerm}
                                  onChange={(e) => setSubjectSearchTerm(e.target.value)}
                                  className="mb-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                                <div className="max-h-64 overflow-y-auto">
                                  {filteredSubjects.map((subject) => (
                                    <div key={subject.id} className="flex items-center space-x-2 mb-2">
                                      <input
                                        type="checkbox"
                                        checked={selectedSubjectIds.includes(subject.id)}
                                        onChange={() => {
                                          setSelectedSubjectIds((prev) =>
                                            prev.includes(subject.id)
                                              ? prev.filter(id => id !== subject.id)
                                              : [...prev, subject.id]
                                          );
                                        }}
                                        id={`subject-filter-${subject.id}`}
                                      />
                                      <label htmlFor={`subject-filter-${subject.id}`} className="text-sm cursor-pointer">{subject.name}</label>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  className="mt-2 text-xs text-blue-600 hover:underline"
                                  onClick={() => {
                                    setSelectedSubjectIds([]);
                                    setSubjectSearchTerm('');
                                  }}
                                  type="button"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </>
                        </TableHead>
                        <TableHead className="relative group">
                          Exam
                        </TableHead>
                        <TableHead className="relative group">
                          <>
                            <div className='flex items-center'>
                              Difficulty
                              <button
                                className="ml-1 p-1 rounded hover:bg-gray-200 inline-flex items-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDifficultyFilterOpen((prev) => !prev);
                                }}
                                aria-label="Filter Difficulty"
                                type="button"
                              >
                                <FilterIcon className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                              </button>
                            </div>
                            {difficultyFilterOpen && (
                              <div ref={difficultyFilterRef} className="absolute left-0 z-20 mt-2 bg-white border rounded shadow-lg w-48 p-2">
                                <div className="font-semibold mb-2">Filter by Difficulty</div>
                                <div className="flex flex-col space-y-1">
                                  {['easy', 'medium', 'hard'].map((level) => (
                                    <div key={level} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={selectedDifficulties.includes(level)}
                                        onChange={() => {
                                          setSelectedDifficulties((prev) =>
                                            prev.includes(level)
                                              ? prev.filter(d => d !== level)
                                              : [...prev, level]
                                          );
                                        }}
                                        id={`difficulty-filter-${level}`}
                                      />
                                      <label htmlFor={`difficulty-filter-${level}`} className="text-sm cursor-pointer capitalize">{level}</label>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  className="mt-2 text-xs text-blue-600 hover:underline"
                                  onClick={() => setSelectedDifficulties([])}
                                  type="button"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </>
                        </TableHead>
                        <TableHead className="relative group">
                          <>
                            <div className='flex items-center'>

                              Type
                              <button
                                className="ml-1 p-1 rounded hover:bg-gray-200 inline-flex items-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTypeFilterOpen((prev) => !prev);
                                }}
                                aria-label="Filter Type"
                                type="button"
                              >
                                <FilterIcon className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                              </button>
                            </div>
                            {typeFilterOpen && (
                              <div ref={typeFilterRef} className="absolute left-0 z-20 mt-2 bg-white border rounded shadow-lg w-48 p-2">
                                <div className="font-semibold mb-2">Filter by Type</div>
                                <div className="max-h-40 overflow-y-auto">
                                  {availableQuestionTypes.map((type) => (
                                    <div key={type} className="flex items-center space-x-2 mb-1">
                                      <input
                                        type="checkbox"
                                        checked={selectedTypes.includes(type)}
                                        onChange={() => {
                                          setSelectedTypes((prev) =>
                                            prev.includes(type)
                                              ? prev.filter(t => t !== type)
                                              : [...prev, type]
                                          );
                                        }}
                                        id={`type-filter-${type}`}
                                      />
                                      <label htmlFor={`type-filter-${type}`} className="text-sm cursor-pointer">{type}</label>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  className="mt-2 text-xs text-blue-600 hover:underline"
                                  onClick={() => setSelectedTypes([])}
                                  type="button"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </>
                        </TableHead>
                        <TableHead className="relative group">
                          <>
                            <div className='flex items-center'>

                              Created
                              <button
                                className="ml-1 p-1 rounded hover:bg-gray-200 inline-flex items-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCreatedFilterOpen((prev) => !prev);
                                }}
                                aria-label="Filter by date"
                                type="button"
                              >
                                <FilterIcon className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                              </button>
                            </div>
                            {createdFilterOpen && (
                              <div ref={createdFilterRef} className="absolute right-0 z-20 mt-2 bg-white border rounded shadow-lg p-2">
                                <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={setSelectedDate}
                                  initialFocus
                                />
                                <button
                                  className="mt-2 w-full text-xs text-blue-600 hover:underline"
                                  onClick={() => setSelectedDate(undefined)}
                                  type="button"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </>
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className='h-[50vh] overflow-y-auto'>
                      {paginatedQuestions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No questions found matching your criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedQuestions.map((question) => (
                          <TableRow key={question.id}>
                            <TableCell className="font-medium max-w-md">
                              <div className="flex flex-col gap-1">
                                {question.is_premium && (
                                  <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Premium
                                  </span>
                                )}
                                <span title={question.question_text}>
                                  {question.question_text.length > 100
                                    ? `${question.question_text.substring(0, 100)}...`
                                    : question.question_text}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{question.domain}</TableCell>
                            <TableCell>{question.subjects?.name || 'No subject'}</TableCell>
                            <TableCell>{question.exams?.title || 'None'}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                {question.difficulty}
                              </span>
                            </TableCell>
                            <TableCell>{question.question_type}</TableCell>
                            <TableCell>{new Date(question.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(question)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(question.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                      {renderPaginationControls()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk-upload" className="space-y-6">
              <BulkQuestionUpload />
            </TabsContent>
            <TabsContent value="daily-quiz" className="space-y-6">
              <DailyQuiz />
            </TabsContent>
            <TabsContent value="flashcards" className="space-y-6">
              <FlashcardManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
