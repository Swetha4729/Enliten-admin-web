import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormField,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
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
import { format } from 'date-fns';

const PLATFORMS = ['all', 'android', 'ios'] as const;
type Platform = typeof PLATFORMS[number];

type Notification = {
    id: string;
    title: string;
    message: string;
    target_platform: Platform;
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
};

type FormValues = {
    title: string;
    message: string;
    target_platform: Platform;
    is_active: boolean;
    expires_at: string;
};

const defaultValues: FormValues = {
    title: '',
    message: '',
    target_platform: 'all',
    is_active: true,
    expires_at: '',
};

export default function NotificationManager() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<Platform>('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const form = useForm<FormValues>({ defaultValues });

    const fetchNotifications = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('notifications' as any)
            .select('*')
            .order('created_at', { ascending: false });
        if (!error && data) setNotifications(data as unknown as Notification[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notifications' },
                () => fetchNotifications()
            )
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const onSubmit = async (values: FormValues) => {
        let formattedExpiresAt: string | null = null;
        if (values.expires_at) {
            formattedExpiresAt = new Date(values.expires_at).toISOString();
        }

        const payload = {
            title: values.title,
            message: values.message,
            target_platform: activeTab,
            is_active: values.is_active,
            expires_at: formattedExpiresAt
        };

        if (editingId) {
            const { error } = await supabase
                .from('notifications' as any)
                .update(payload)
                .eq('id', editingId);
            if (!error) {
                toast.success('Notification updated successfully!');
                setEditingId(null);
                form.reset(defaultValues);
                fetchNotifications();
            } else {
                toast.error('Failed to update notification.');
            }
        } else {
            const { error } = await supabase.from('notifications' as any).insert([payload]);
            if (!error) {
                toast.success('Notification added successfully!');
                form.reset(defaultValues);
                fetchNotifications();
            } else {
                toast.error('Failed to add notification.');
            }
        }
    };

    const handleEdit = (notification: Notification) => {
        setEditingId(notification.id);
        let expiresAtLocal = '';
        if (notification.expires_at) {
            const d = new Date(notification.expires_at);
            expiresAtLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        }
        form.reset({
            title: notification.title,
            message: notification.message,
            target_platform: notification.target_platform,
            is_active: notification.is_active,
            expires_at: expiresAtLocal,
        });
        setActiveTab(notification.target_platform);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('notifications' as any).delete().eq('id', id);
        if (!error) {
            toast.success('Notification deleted successfully!');
            fetchNotifications();
        } else {
            toast.error('Failed to delete notification.');
        }
    };

    const filteredNotifications = notifications.filter(n => n.target_platform === activeTab);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto py-10">
                    <h2 className="text-2xl font-bold mb-6">Notification Manager</h2>
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
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            rules={{ required: true, minLength: 1 }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Title</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Notification Title" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="message"
                                            rules={{ required: true, minLength: 1 }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Message</FormLabel>
                                                    <FormControl>
                                                        <Textarea rows={3} {...field} placeholder="Notification Content" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="expires_at"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Expires At (optional)</FormLabel>
                                                    <FormControl>
                                                        <Input type="datetime-local" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="is_active"
                                            render={({ field }) => (
                                                <FormItem style={{ alignItems: 'baseline', justifyContent: 'start', gap: '1rem', display: 'flex' }}>
                                                    <FormLabel style={{ fontSize: '0.9rem' }}>Is Active</FormLabel>
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" disabled={loading}>
                                            {editingId ? 'Update Notification' : 'Add Notification'}
                                        </Button>
                                        {editingId && (
                                            <Button type="button" variant="outline" onClick={() => { setEditingId(null); form.reset(defaultValues); }} className="ml-2">
                                                Cancel Edit
                                            </Button>
                                        )}
                                    </form>
                                </Form>
                                <div className="bg-white rounded-lg shadow p-6 max-w-full overflow-x-auto">
                                    <Table>
                                        <TableCaption>Notification history for {platform.charAt(0).toUpperCase() + platform.slice(1)}</TableCaption>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Message</TableHead>
                                                <TableHead>Is Active</TableHead>
                                                <TableHead>Created At</TableHead>
                                                <TableHead>Expires At</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredNotifications.map(n => (
                                                <TableRow key={n.id}>
                                                    <TableCell className="max-w-xs">{n.title}</TableCell>
                                                    <TableCell className="max-w-xs">{n.message}</TableCell>
                                                    <TableCell>{n.is_active ? 'Yes' : 'No'}</TableCell>
                                                    <TableCell>{format(new Date(n.created_at), 'PP p')}</TableCell>
                                                    <TableCell>{n.expires_at ? format(new Date(n.expires_at), 'PP p') : 'Never'}</TableCell>
                                                    <TableCell className='flex gap-3'>
                                                        <Button size="sm" variant="outline" onClick={() => handleEdit(n)}>
                                                            Edit
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button size="sm" variant="destructive" className="ml-2">
                                                                    Delete
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Notification?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete this notification? This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(n.id)}>
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {filteredNotifications.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                        No notifications found for this platform.
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
