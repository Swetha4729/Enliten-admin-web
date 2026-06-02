import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Sector } from 'recharts';
import Navbar from '@/components/Navbar';

// --- Simple Inline SVG Icons (to replace lucide-react) ---
const IconWrapper = ({ children }) => <div className="h-6 w-6 text-white">{children}</div>;
const BarChart3 = () => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></svg></IconWrapper>;
const Users = ({ className }) => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></IconWrapper>;
const Crown = ({ className }) => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg></IconWrapper>;
const Target = ({ className }) => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg></IconWrapper>;
const Award = ({ className }) => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg></IconWrapper>;
const Clock = ({ className }) => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></IconWrapper>;
const Activity = ({ className }) => <IconWrapper><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg></IconWrapper>;

// --- Placeholder Navbar (to replace external import) ---
// const Navbar = () => (
//     <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-white/10 p-4 sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto flex justify-between items-center">
//         <span className="text-xl font-bold text-white">Dashboard</span>
//         <div className="text-sm text-gray-300">Welcome, Admin</div>
//       </div>
//     </nav>
// );

// --- Reusable UI Components (self-contained) ---
const MetricCard = ({ title, value, icon, subtext, link }) => {
  const content = (
    <div className="p-6 pt-0">
      <div className="flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <div className="text-3xl font-bold text-white">{value}</div>
          <p className="text-xs text-gray-400">{subtext}</p>
        </div>
        <div className="p-3 bg-white/10 rounded-lg">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800/20 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg hover:border-white/20 transition-all duration-300">
      <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
        <h3 className="text-sm font-medium text-gray-300">{title}</h3>
      </div>
      {link ? <a href={link}>{content}</a> : content}
    </div>
  );
};


const ChartCard = ({ title, children, filter, onFilterChange, filterOptions, filterPlaceholder }) => (
  <div className="bg-gray-800/20 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 min-h-[400px]">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
      <h3 className="text-lg font-semibold text-white mb-3 sm:mb-0">{title}</h3>
      {filter !== undefined && (
        <select value={filter} onChange={(e) => onFilterChange(e.target.value)} className="w-full sm:w-48 bg-gray-700 border-gray-600 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {filterOptions}
        </select>
      )}
    </div>
    {children}
  </div>
);

const AnalyticsSkeleton = () => (
  <div className="min-h-screen bg-gray-900 p-6 animate-pulse">
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="h-8 w-1/3 bg-gray-700 rounded"></div>
        <div className="h-10 w-48 bg-gray-700 rounded"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-800/50 rounded-xl"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="h-96 bg-gray-800/50 rounded-xl lg:col-span-3"></div>
        <div className="h-96 bg-gray-800/50 rounded-xl lg:col-span-2"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-96 bg-gray-800/50 rounded-xl col-span-2"></div>
        <div className="h-96 bg-gray-800/50 rounded-xl"></div>
      </div>
    </div>
  </div>
);

// --- Main Analytics Component ---

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedExamId, setSelectedExamId] = useState('all');
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analyticsDashboard', timeRange],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange));

      // helper for batch fetching
      const fetchAll = async (table: string, select: string, filter?: (q: any) => any) => {
        let allData: any[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;
        while (hasMore) {
          let query = supabase.from(table).select(select).range(from, from + batchSize - 1);
          if (filter) query = filter(query);
          const { data, error } = await query;
          if (error) throw error;
          if (!data || data.length === 0) {
            hasMore = false;
          } else {
            allData = [...allData, ...data];
            if (data.length < batchSize) {
              hasMore = false;
            } else {
              from += batchSize;
            }
          }
        }
        return allData;
      };

      const [
        usersResult, sessions, questionsResult,
        examsData, userProgress, incorrectAnswers
      ] = await Promise.all([
        supabase.from('users').select('id, subscription_status, created_at', { count: 'exact' }),
        fetchAll('quiz_sessions', '*', q => q.gte('created_at', startDate.toISOString())),
        supabase.from('questions').select('id, domain, difficulty', { count: 'exact' }),
        supabase.from('exams').select('id, title'),
        fetchAll('user_progress', 'study_streak'),
        fetchAll('user_answers', 'question_id, is_correct', q => q.eq('is_correct', false))
      ]);

      const users = usersResult.data || [];
      const totalUsers = usersResult.count || 0;
      const premiumUsers = users.filter(u => u.subscription_status === 'premium').length;

      const totalQuizSessions = sessions.length;
      const averageScore = totalQuizSessions > 0 ? sessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalQuizSessions : 0;
      const averageTimePerSession = totalQuizSessions > 0 ? sessions.reduce((sum, s) => sum + (s.time_taken_seconds || 0), 0) / totalQuizSessions : 0;

      const averageStudyStreak = userProgress.length > 0 ? userProgress.reduce((sum, p) => sum + (p.study_streak || 0), 0) / userProgress.length : 0;

      const quizTypePerformance = sessions.reduce((acc, session) => {
        const type = session.quiz_type;
        if (!acc[type]) acc[type] = { type, sessions: 0, totalScore: 0 };
        acc[type].sessions++;
        acc[type].totalScore += session.score || 0;
        return acc;
      }, {});

      const quizTypeData = Object.values(quizTypePerformance).map(d => ({ ...d, avgScore: d.sessions > 0 ? Math.round(d.totalScore / d.sessions) : 0 }));

      const dailyActivity = Array.from({ length: parseInt(timeRange) }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (parseInt(timeRange) - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        const daySessions = sessions.filter(s => s.created_at?.startsWith(dateStr));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          Sessions: daySessions.length,
          'Avg Score': daySessions.length > 0 ? Math.round(daySessions.reduce((sum, s) => sum + (s.score || 0), 0) / daySessions.length) : 0,
        };
      });

      const userRegistrationData = Array.from({ length: parseInt(timeRange) }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (parseInt(timeRange) - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayUsers = users.filter(u => u.created_at?.startsWith(dateStr));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          'New Users': dayUsers.length,
        };
      });

      const questions = questionsResult.data || [];
      const domainCounts = questions.reduce((acc, q) => { acc[q.domain] = (acc[q.domain] || 0) + 1; return acc; }, {});
      const topDomains = Object.entries(domainCounts).sort(([, a], [, b]) => b - a).slice(0, 10).map(([domain, questions]) => ({ domain, questions }));

      const difficultyCounts = questions.reduce((acc, q) => { acc[q.difficulty] = (acc[q.difficulty] || 0) + 1; return acc; }, { easy: 0, medium: 0, hard: 0 });
      const questionDifficulty = Object.entries(difficultyCounts).map(([name, value]) => ({ name, value }));

      const examPerformance = [];
      if (examsData?.data) {
        for (const exam of examsData.data) {
          const examSessions = sessions.filter(s => s.exam_id === exam.id);
          const avgScore = examSessions.length > 0 ? examSessions.reduce((sum, s) => sum + (s.score || 0), 0) / examSessions.length : 0;
          if (examSessions.length > 0) examPerformance.push({ examTitle: exam.title, examId: exam.id, sessions: examSessions.length, avgScore: Math.round(avgScore) });
        }
      }

      const incorrectCounts = (incorrectAnswers || []).reduce((acc, answer) => { acc[answer.question_id] = (acc[answer.question_id] || 0) + 1; return acc; }, {});
      const topIncorrectIds = Object.entries(incorrectCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([id]) => id);

      let topQuestionsText = [];
      if (topIncorrectIds.length > 0) {
        const { data } = await supabase
          .from('questions')
          .select('id, question_text')
          .in('id', topIncorrectIds);
        topQuestionsText = data || [];
      }

      const challengingQuestions = topIncorrectIds
        .map(id => ({
          id,
          text: topQuestionsText.find(q => q.id === id)?.question_text || 'Question not found',
          incorrectCount: incorrectCounts[id]
        }))
        .sort((a, b) => b.incorrectCount - a.incorrectCount);

      return {
        totalUsers, premiumUsers, totalQuizSessions,
        avgSessionsPerUser: totalUsers > 0 ? (totalQuizSessions / totalUsers).toFixed(1) : 0,
        averageScore: Math.round(averageScore),
        averageTimePerSession: Math.round(averageTimePerSession / 60),
        averageStudyStreak: Math.round(averageStudyStreak),
        dailyActivity, quizTypeData, topDomains, questionDifficulty,
        examPerformance, challengingQuestions, examsData: examsData.data,
        userRegistrationData
      };
    },
  });

  const selectedExamAnalysis = React.useMemo(() => {
    if (!selectedExamId || selectedExamId === 'all') return analytics?.examPerformance;
    return analytics?.examPerformance?.filter((exam) => exam.examId === selectedExamId);
  }, [analytics, selectedExamId]);

  const onPieEnter = (_, index) => setActiveIndex(index);

  const PIE_COLORS = ['#3b82f6', '#84cc16', '#f97316'];

  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg capitalize">{payload.name}</text>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill} />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff">{`${value} questions`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">{`(${(percent * 100).toFixed(2)}%)`}</text>
      </g>
    );
  };

  if (isLoading) {
    return (<> <Navbar /> <AnalyticsSkeleton /> </>);
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white p-6 font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="text-blue-500"><BarChart3 /></div>
              <div>
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <p className="text-gray-400">An overview of platform engagement and performance.</p>
              </div>
            </div>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="w-full md:w-48 bg-gray-700 border-gray-600 text-white rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <MetricCard title="Total Users" value={analytics?.totalUsers || 0} link="/admin/users" subtext="Registered users" icon={<Users className="text-blue-400" />} />
            <MetricCard title="Premium Users" value={analytics?.premiumUsers || 0} subtext="Subscribed members" icon={<Crown className="text-yellow-400" />} />
            <MetricCard title="Quiz Sessions" value={analytics?.totalQuizSessions || 0} subtext="Completed in period" icon={<Target className="text-green-400" />} />
            <MetricCard title="Average Score" value={`${analytics?.averageScore || 0}%`} subtext="Overall performance" icon={<Award className="text-purple-400" />} />
            <MetricCard title="Avg. Study Streak" value={`${analytics?.averageStudyStreak || 0} days`} subtext="User consistency" icon={<Activity className="text-red-400" />} />
            <MetricCard title="Avg. Session Time" value={`${analytics?.averageTimePerSession || 0} min`} subtext="Engagement duration" icon={<Clock className="text-orange-400" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
            <ChartCard title="Daily Activity">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={analytics?.dailyActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Sessions" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Avg Score" stroke="#84cc16" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
            <ChartCard title="User Registrations">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={analytics?.userRegistrationData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                  <Legend />
                  <Line type="monotone" dataKey="New Users" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} name="New Registrations" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartCard
                title="Exam Performance"
                filter={selectedExamId}
                onFilterChange={setSelectedExamId}
                filterPlaceholder="Select Exam"
                filterOptions={
                  <>
                    <option value="all">All Exams</option>
                    {analytics?.examsData?.map((exam) => (
                      <option value={exam.id} key={exam.id}>{exam.title}</option>
                    ))}
                  </>
                }
              >
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={selectedExamAnalysis || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="examTitle" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                    <Legend />
                    <Bar dataKey="sessions" fill="#3b82f6" name="Sessions" />
                    <Bar dataKey="avgScore" fill="#f97316" name="Avg Score" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <div className="flex flex-col gap-6">
              <ChartCard title="Question Difficulty">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={analytics?.questionDifficulty || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      onMouseEnter={onPieEnter}
                    >
                      {analytics?.questionDifficulty.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <ChartCard title="Top 10 Question Domains">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={analytics?.topDomains || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="domain" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                    <Bar dataKey="questions" name="No. of Questions" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
            <div>
              <div className="bg-gray-800/20 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 h-full">
                <h3 className="text-lg font-semibold text-white mb-4">Most Challenging Questions</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {analytics?.challengingQuestions.map(q => (
                    <div key={q.id} className="text-sm p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <p className="truncate text-gray-300" title={q.text}>{q.text}</p>
                      <p className="text-red-400 font-semibold">{q.incorrectCount} incorrect answers</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <ChartCard title="Performance by Quiz Type">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analytics?.quizTypeData || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                  <YAxis type="category" dataKey="type" stroke="#9ca3af" fontSize={12} width={80} tick={{ textTransform: 'capitalize' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                  <Legend />
                  <Bar dataKey="sessions" fill="#3b82f6" name="Sessions" />
                  <Bar dataKey="avgScore" fill="#84cc16" name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

        </div>
      </div>
    </>
  );
}

