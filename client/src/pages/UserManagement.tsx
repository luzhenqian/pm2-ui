import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, X, Trash2, Moon, Sun, Users, Shield, Key } from 'lucide-react';
import { format } from 'date-fns';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; userId: string; username: string }>({
    open: false,
    userId: '',
    username: '',
  });
  const [newPassword, setNewPassword] = useState('');

  // Get active tab from URL or default to 'pending'
  const activeTab = searchParams.get('tab') || 'pending';

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (currentUser?.role !== 'super_admin' && currentUser?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadUsers();
  }, [currentUser, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [allUsersRes, pendingUsersRes] = await Promise.all([
        axios.get('/api/auth/users'),
        axios.get('/api/auth/users/pending'),
      ]);
      setUsers(allUsersRes.data);
      setPendingUsers(pendingUsersRes.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      await axios.post(`/api/auth/users/${userId}/approve`);
      toast({
        title: 'Success',
        description: 'User approved successfully',
      });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve user',
        variant: 'destructive',
      });
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      await axios.post(`/api/auth/users/${userId}/reject`);
      toast({
        title: 'Success',
        description: 'User rejected',
      });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject user',
        variant: 'destructive',
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`/api/auth/users/${userId}`);
      toast({
        title: 'Success',
        description: 'User deleted',
      });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      await axios.post(`/api/auth/users/${userId}/role`, { role });
      toast({
        title: 'Success',
        description: 'User role updated',
      });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      await axios.post(`/api/auth/users/${userId}/status`, { status });
      toast({
        title: 'Success',
        description: 'User status updated',
      });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    try {
      await axios.post(`/api/auth/users/${resetPasswordDialog.userId}/reset-password`, {
        newPassword,
      });
      toast({
        title: 'Success',
        description: 'Password reset successfully',
      });
      setResetPasswordDialog({ open: false, userId: '', username: '' });
      setNewPassword('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset password',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      super_admin: { variant: 'destructive', label: 'Super Admin', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
      admin: { variant: 'default', label: 'Admin', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      user: { variant: 'secondary', label: 'User', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
      viewer: { variant: 'outline', label: 'Viewer', className: 'bg-gray-600/20 text-gray-300 border-gray-600/30' },
    };
    const config = variants[role] || variants.user;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="flex items-center justify-between px-6 py-4 bg-card border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">User Management</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        <div className="flex-1 p-6 space-y-6">

          <Tabs
            value={activeTab}
            onValueChange={(value) => setSearchParams({ tab: value })}
            className="space-y-4"
          >
            <TabsList className="bg-card">
              <TabsTrigger value="pending">
                Pending Approval ({pendingUsers.length})
              </TabsTrigger>
              <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Pending User Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mb-4 opacity-50" />
                      <p>No pending users</p>
                    </div>
                  ) : (
                    <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.username}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {format(new Date(user.createdAt), 'MMM dd, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => approveUser(user.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectUser(user.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

            <TabsContent value="all">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    All Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.username}
                          {user.id === currentUser?.id && (
                            <Badge variant="outline" className="ml-2">
                              You
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.role === 'super_admin' ? (
                            getRoleBadge(user.role)
                          ) : (
                            <Select
                              value={user.role}
                              onValueChange={(value) => updateUserRole(user.id, value)}
                              disabled={currentUser?.role !== 'super_admin'}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.status}
                            onValueChange={(value) => updateUserStatus(user.id, value)}
                            disabled={user.id === currentUser?.id || user.role === 'super_admin'}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="approved">Approved</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {user.id !== currentUser?.id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setResetPasswordDialog({
                                    open: true,
                                    userId: user.id,
                                    username: user.username,
                                  })
                                }
                                title="Reset Password"
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                            )}
                            {currentUser?.role === 'super_admin' &&
                              user.role !== 'super_admin' &&
                              user.id !== currentUser?.id && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteUser(user.id)}
                                  title="Delete User"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </div>

        {/* Reset Password Dialog */}
        <Dialog open={resetPasswordDialog.open} onOpenChange={(open) => {
          setResetPasswordDialog({ ...resetPasswordDialog, open });
          if (!open) setNewPassword('');
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Reset password for user: <span className="font-semibold">{resetPasswordDialog.username}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      resetPassword();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setResetPasswordDialog({ open: false, userId: '', username: '' });
                  setNewPassword('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={resetPassword}>
                Reset Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    </TooltipProvider>
  );
};