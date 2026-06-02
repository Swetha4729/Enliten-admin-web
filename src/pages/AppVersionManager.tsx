import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from '@/components/ui/form';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import Navbar from '@/components/Navbar';

const PLATFORMS = ['android', 'ios'] as const;
type Platform = typeof PLATFORMS[number];

type AppVersion = {
  id: string;
  platform: Platform;
  version_code: number;
  version_name: string;
  release_notes: string;
  force_update: boolean;
  download_url?: string;
  created_at: string;
};

type FormValues = {
  platform: Platform;
  version_code: number;
  version_name: string;
  release_notes: string;
  force_update: boolean;
  download_url?: string;
};

const defaultValues: FormValues = {
  platform: 'android',
  version_code: 1,
  version_name: '',
  release_notes: '',
  force_update: false,
  download_url: '',
};

export default function AppVersionManager() {
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Platform>('android');
  const [editingId, setEditingId] = useState<string | null>(null);
  const form = useForm<FormValues>({ defaultValues });

  // Fetch versions from Supabase
  const fetchVersions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_versions')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setVersions(data as AppVersion[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchVersions();
    // Optionally, subscribe to changes for real-time updates
    const channel = supabase
      .channel('public:app_versions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_versions' },
        () => fetchVersions()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    // Always use the activeTab as the platform
    const payload = { ...values, platform: activeTab };
    if (editingId) {
      // Edit mode
      const { error } = await supabase
        .from('app_versions')
        .update(payload)
        .eq('id', editingId);
      if (!error) {
        toast.success('App version updated successfully!');
        setEditingId(null);
        form.reset(defaultValues);
        fetchVersions();
      } else {
        toast.error('Failed to update app version.');
      }
    } else {
      // Add mode
      const { error } = await supabase.from('app_versions').insert([payload]);
      if (!error) {
        toast.success('App version added successfully!');
        form.reset(defaultValues);
        fetchVersions();
      } else {
        toast.error('Failed to add app version.');
      }
    }
  };

  // Handle edit
  const handleEdit = (version: AppVersion) => {
    setEditingId(version.id);
    form.reset({
      platform: version.platform,
      version_code: version.version_code,
      version_name: version.version_name,
      release_notes: version.release_notes,
      force_update: version.force_update,
      download_url: version.download_url || '',
    });
    setActiveTab(version.platform);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('app_versions').delete().eq('id', id);
    if (!error) {
      toast.success('App version deleted successfully!');
      fetchVersions();
    } else {
      toast.error('Failed to delete app version.');
    }
  };

  // Filter by platform
  const filteredVersions = versions.filter(v => v.platform === activeTab);

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-6">App Version Manager</h2>
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={v => setActiveTab(v as Platform)}>
        <TabsList>
          {PLATFORMS.map(p => (
            <TabsTrigger key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        {PLATFORMS.map(platform => (
          <TabsContent key={platform} value={platform}>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="bg-white rounded-lg shadow p-6 mb-8 space-y-4"
              >
                {/* <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!!editingId}
                        >
                          <option value="android">Android</option>
                          <option value="ios">iOS</option>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                <FormField
                  control={form.control}
                  name="version_code"
                  rules={{ required: true, min: 1 }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version Code</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min={1} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="version_name"
                  rules={{ required: true, minLength: 1 }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="release_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Release Notes</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="force_update"
                  render={({ field }) => (
                    <FormItem style={{alignItems: 'baseline',justifyContent:'start',gap:'1rem',display:'flex'}}>
                      <FormLabel style={{fontSize:'0.9rem'}}>Force Update</FormLabel>
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="download_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Download URL (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" loading={loading}>
                  {editingId ? 'Update Version' : 'Add Version'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={() => { setEditingId(null); form.reset(defaultValues); }}>
                    Cancel Edit
                  </Button>
                )}
              </form>
            </Form>
            <div className="bg-white rounded-lg shadow p-6">
              <Table>
                <TableCaption>Version history for {platform.charAt(0).toUpperCase() + platform.slice(1)}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version Code</TableHead>
                    <TableHead>Version Name</TableHead>
                    <TableHead>Release Notes</TableHead>
                    <TableHead>Force Update</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVersions.map(v => (
                    <TableRow key={v.id}>
                      <TableCell>{v.version_code}</TableCell>
                      <TableCell>{v.version_name}</TableCell>
                      <TableCell className="max-w-xs truncate" title={v.release_notes}>{v.release_notes}</TableCell>
                      <TableCell>{v.force_update ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{new Date(v.created_at).toLocaleString()}</TableCell>
                      <TableCell className='flex gap-3'>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(v)}>
                          Edit
                        </Button>
                        {/* Delete Confirmation Dialog */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" className="ml-2">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Version?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this app version? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(v.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredVersions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No versions found for this platform.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
    </div>
  </>
  );
}
