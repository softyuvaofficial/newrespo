'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AdminSidebar from '@/components/AdminSidebar';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Plus, Edit, Trash2, Tags, Target, BookOpen, Zap } from 'lucide-react';

export default function AdminTabs() {
  const { admin, loading, signOut } = useAdminAuth();
  const router = useRouter();

  const [tabs, setTabs] = useState([]);
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [editingTab, setEditingTab] = useState(null);
  const [newTab, setNewTab] = useState({ name: '', description: '', type: 'mock' });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if not admin and load tabs on admin login
  useEffect(() => {
    if (!loading && !admin) {
      router.push('/admin-login');
      return;
    }
    if (admin) {
      fetchTabs();
    }
  }, [admin, loading, router]);

  // Fetch tabs from API
  async function fetchTabs() {
    setError(null);
    try {
      const res = await fetch('/api/tabs');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch tabs');
      // Assuming API response shape: { tabs: [...] }
      setTabs(data.tabs || []);
    } catch (error) {
      setError(error.message);
    }
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin-login');
  };

  // Add new tab
  const handleAddTab = async () => {
    if (!newTab.name.trim()) return alert('Tab name is required');
    setActionLoading(true);
    try {
      const res = await fetch('/api/tabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTab),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add tab');
      setTabs((prev) => [...prev, data.tab || data]); // depends on API response shape
      setNewTab({ name: '', description: '', type: 'mock' });
      setIsAddingTab(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Open edit dialog
  const handleEditTab = (tab) => {
    setEditingTab(tab);
    setNewTab({ name: tab.name, description: tab.description, type: tab.type });
  };

  // Update existing tab
  const handleUpdateTab = async () => {
    if (!editingTab || !newTab.name.trim()) return alert('Tab name is required');
    setActionLoading(true);
    try {
      const res = await fetch('/api/tabs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingTab.id, ...newTab }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update tab');
      setTabs((prev) =>
        prev.map((tab) => (tab.id === editingTab.id ? data.tab || data : tab))
      );
      setEditingTab(null);
      setNewTab({ name: '', description: '', type: 'mock' });
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete tab
  const handleDeleteTab = async (tabId) => {
    if (!confirm('Are you sure you want to delete this tab? This action cannot be undone.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tabs?id=${tabId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete tab');
      setTabs((prev) => prev.filter((tab) => tab.id !== tabId));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Icon based on tab type
  const getTabIcon = (type) => {
    switch (type) {
      case 'mock':
        return <Target className="h-5 w-5" />;
      case 'pyq':
        return <BookOpen className="h-5 w-5" />;
      case 'booster':
        return <Zap className="h-5 w-5" />;
      case 'sectional':
        return <Tags className="h-5 w-5" />;
      case 'speed':
        return <Target className="h-5 w-5" />;
      default:
        return <Tags className="h-5 w-5" />;
    }
  };

  // Color classes based on tab type
  const getTabColor = (type) => {
    switch (type) {
      case 'mock':
        return 'bg-blue-100 text-blue-800';
      case 'pyq':
        return 'bg-green-100 text-green-800';
      case 'booster':
        return 'bg-purple-100 text-purple-800';
      case 'sectional':
        return 'bg-orange-100 text-orange-800';
      case 'speed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar onSignOut={handleSignOut} />

      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test Tabs Management</h1>
            <p className="text-gray-600">Manage test tabs (Mock, PYQ, Booster, etc.)</p>
            {error && (
              <p className="mt-1 text-sm text-red-600">Error: {error}</p>
            )}
          </div>
          <Dialog open={isAddingTab} onOpenChange={setIsAddingTab}>
            <DialogTrigger asChild>
              <Button disabled={actionLoading}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tab
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Test Tab</DialogTitle>
                <DialogDescription>Create a new test tab type</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tabName">Tab Name</Label>
                  <Input
                    id="tabName"
                    value={newTab.name}
                    onChange={(e) => setNewTab({ ...newTab, name: e.target.value })}
                    placeholder="Enter tab name"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="tabDescription">Description</Label>
                  <Input
                    id="tabDescription"
                    value={newTab.description}
                    onChange={(e) => setNewTab({ ...newTab, description: e.target.value })}
                    placeholder="Enter tab description"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="tabType">Tab Type</Label>
                  <select
                    id="tabType"
                    value={newTab.type}
                    onChange={(e) => setNewTab({ ...newTab, type: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={actionLoading}
                  >
                    <option value="mock">Mock Test</option>
                    <option value="pyq">Previous Year Questions</option>
                    <option value="booster">Booster Test</option>
                    <option value="sectional">Sectional Test</option>
                    <option value="speed">Speed Test</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingTab(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddTab} disabled={actionLoading}>
                    {actionLoading ? 'Adding...' : 'Add Tab'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tabs</p>
                    <p className="text-2xl font-bold text-gray-900">{tabs.length}</p>
                  </div>
                  <Tags className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Mock Tests</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {tabs.filter((tab) => tab.type === 'mock').length}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">PYQ Tabs</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {tabs.filter((tab) => tab.type === 'pyq').length}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Booster Tabs</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {tabs.filter((tab) => tab.type === 'booster').length}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs List */}
          <Card>
            <CardHeader>
              <CardTitle>All Test Tabs</CardTitle>
              <CardDescription>Manage all test tab types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getTabColor(tab.type)}`}>
                        {getTabIcon(tab.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{tab.name}</h3>
                        <p className="text-sm text-gray-600">{tab.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge className={getTabColor(tab.type)}>{tab.type}</Badge>
                          <Badge variant="outline">{tab.testCount ?? 0} tests</Badge>
                          {tab.created_at && (
                            <span className="text-xs text-gray-500">
                              Created: {new Date(tab.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTab(tab)}
                        disabled={actionLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTab(tab.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={actionLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Edit Tab Dialog */}
          <Dialog
            open={!!editingTab}
            onOpenChange={() => {
              if (!actionLoading) setEditingTab(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Test Tab</DialogTitle>
                <DialogDescription>Update tab information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editTabName">Tab Name</Label>
                  <Input
                    id="editTabName"
                    value={newTab.name}
                    onChange={(e) => setNewTab({ ...newTab, name: e.target.value })}
                    placeholder="Enter tab name"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="editTabDescription">Description</Label>
                  <Input
                    id="editTabDescription"
                    value={newTab.description}
                    onChange={(e) => setNewTab({ ...newTab, description: e.target.value })}
                    placeholder="Enter tab description"
                    disabled={actionLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="editTabType">Tab Type</Label>
                  <select
                    id="editTabType"
                    value={newTab.type}
                    onChange={(e) => setNewTab({ ...newTab, type: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={actionLoading}
                  >
                    <option value="mock">Mock Test</option>
                    <option value="pyq">Previous Year Questions</option>
                    <option value="booster">Booster Test</option>
                    <option value="sectional">Sectional Test</option>
                    <option value="speed">Speed Test</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingTab(null)} disabled={actionLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateTab} disabled={actionLoading}>
                    {actionLoading ? 'Updating...' : 'Update Tab'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
