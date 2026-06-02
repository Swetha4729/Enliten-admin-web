
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Edit, Trash2, Search, Crown } from 'lucide-react';
import Navbar from '@/components/Navbar';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  subscription_status: string;
  subscription_expires_at?: string;
  created_at: string;
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    role: 'user' as 'admin' | 'user',
    subscription_status: 'free'
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      let allData: User[] = [];
      let from = 0;
      const batchSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) {
          console.error('Error fetching users batch:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          hasMore = false;
        } else {
          allData = [...allData, ...data as User[]];
          if (data.length < batchSize) {
            hasMore = false;
          } else {
            from += batchSize;
          }
        }
      }

      console.log('Total users fetched:', allData.length);
      return allData;
    },
  });

  // Create/Update user mutation
  const userMutation = useMutation({
    mutationFn: async (userData: any) => {
      if (editingUser) {
        const { error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', editingUser.id);
        if (error) throw error;
      } else {
        // For new users, we'd typically use Supabase Auth
        // This is a simplified version for demonstration
        const { error } = await supabase
          .from('users')
          .insert([userData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDialogOpen(false);
      setEditingUser(null);
      setNewUser({ email: '', full_name: '', role: 'user', subscription_status: 'free' });
      toast({
        title: "Success",
        description: `User ${editingUser ? 'updated' : 'created'} successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${editingUser ? 'update' : 'create'} user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = editingUser ?
      { ...newUser } :
      { ...newUser, id: crypto.randomUUID() };
    userMutation.mutate(userData);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setNewUser({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      subscription_status: user.subscription_status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(userId);
    }
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubscription = selectedSubscription === 'all' ||
      (selectedSubscription === 'premium' && user.subscription_status === 'premium') ||
      (selectedSubscription === 'free' && user.subscription_status === 'free');

    return matchesSearch && matchesSubscription;
  }) || [];

  if (isLoading) {
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
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Add User</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={newUser.full_name}
                      onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value: 'admin' | 'user') => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subscription">Subscription Status</Label>
                    <Select value={newUser.subscription_status} onValueChange={(value) => setNewUser({ ...newUser, subscription_status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingUser ? 'Update User' : 'Create User'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <CardTitle>Users ({filteredUsers.length})</CardTitle>
                    {users && (
                      <div className="flex gap-3 text-sm">
                        <span className="px-2 py-1 rounded bg-green-100 text-green-800 font-medium">
                          Free: {users.filter(u => u.subscription_status === 'free').length}
                        </span>
                        <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-medium flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Premium: {users.filter(u => u.subscription_status === 'premium').length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Tabs value={selectedSubscription} onValueChange={setSelectedSubscription} className="w-[400px]">
                    <TabsList>
                      <TabsTrigger value="all">All Users</TabsTrigger>
                      <TabsTrigger value="premium" className="flex items-center gap-1">
                        <Crown className="h-3 w-3" /> Premium
                      </TabsTrigger>
                      <TabsTrigger value="free">Free</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Valid Till</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${user.subscription_status === 'premium' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {user.subscription_status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.subscription_expires_at
                          ? new Date(user.subscription_expires_at).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
