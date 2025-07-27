'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminSidebar from '@/components/AdminSidebar';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Users, BookOpen, TrendingUp, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';

export default function AdminDashboard() {
  const { admin, loading, signOut } = useAdminAuth();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !admin) {
      router.push('/admin-login');
      return;
    }

    if (admin) {
      fetchDashboardData();
    }
  }, [admin, loading, router]);

  async function fetchDashboardData() {
    try {
      setError(null);

      // 1. Total Users Count
      const { count: totalUsersCount, error: usersError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });
      if (usersError) throw usersError;

      // 2. Active Tests Count (Assuming 'tests' table has a status column)
      const { data: activeTestsData, error: activeTestsError } = await supabase
        .from('tests')
        .select('id')
        .eq('status', 'active');
      if (activeTestsError) throw activeTestsError;
      const activeTestsCount = activeTestsData.length;

      // 3. Total Revenue (Assuming 'payments' table has 'amount' column and 'status'='paid')
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount');
      if (paymentsError) throw paymentsError;
      const totalRevenue = paymentsData.reduce((sum, p) => sum + (p.amount || 0), 0);

      // 4. Tests Completed Count (Assuming 'test_attempts' table has 'completed' boolean)
      const { count: testsCompletedCount, error: attemptsError } = await supabase
        .from('test_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('completed', true);
      if (attemptsError) throw attemptsError;

      // 5. Recent Activity (latest 5 rows from a hypothetical 'activity_log' table)
      // If you don't have this, you can skip or fetch from other tables.
      const { data: recentActivityData, error: activityError } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (activityError) throw activityError;

      // 6. Popular Tests (most attempts in last month, assuming 'test_attempts' table)
      // Simplified example: count attempts per test in last 30 days
      const lastMonthDate = new Date();
      lastMonthDate.setDate(lastMonthDate.getDate() - 30);
      const { data: popularTestsData, error: popularTestsError } = await supabase.rpc('get_popular_tests', {
        since_date: lastMonthDate.toISOString()
      }); 
      // Note: 'get_popular_tests' is a Postgres function you may need to create or
      // You can replace this with your own query or fetch popular tests differently.

      // If no rpc function, fallback:
      // You can fetch tests and count attempts in JS (not efficient for large data)

      // 7. Monthly Stats: Users and Revenue by month (last 12 months)
      // You need to have tables with created_at and payment date fields
      // Example with users per month:
      const { data: monthlyUsers, error: monthlyUsersError } = await supabase.rpc('monthly_user_counts');
      const { data: monthlyRevenue, error: monthlyRevenueError } = await supabase.rpc('monthly_revenue_sums');

      if (monthlyUsersError) throw monthlyUsersError;
      if (monthlyRevenueError) throw monthlyRevenueError;

      setDashboardData({
        stats: {
          totalUsers: totalUsersCount || 0,
          activeTests: activeTestsCount || 0,
          totalRevenue: totalRevenue || 0,
          testsCompleted: testsCompletedCount || 0,
        },
        recentActivity: recentActivityData || [],
        popularTests: popularTestsData || [],
        monthlyStats: {
          users: monthlyUsers?.map((item) => item.count) || [],
          revenue: monthlyRevenue?.map((item) => item.sum) || [],
        },
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(error.message || 'Failed to load dashboard data');
    }
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin-login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar onSignOut={handleSignOut} />

      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, Admin</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800">System Online</Badge>
            </div>
          </div>
        </div>

        {error && (
          <div className="m-6 p-4 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        {!dashboardData ? (
          <div className="p-6 text-center text-gray-600">Loading data...</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dashboardData.stats.totalUsers.toLocaleString()}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Tests</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dashboardData.stats.activeTests}
                      </p>
                    </div>
                    <BookOpen className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{dashboardData.stats.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tests Completed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {dashboardData.stats.testsCompleted.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentActivity.length === 0 && (
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  )}
                  {dashboardData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.created_at ? new Date(activity.created_at).toLocaleString() : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Tests */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Popular Test Series</CardTitle>
                <CardDescription>Most attempted test series this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(!dashboardData.popularTests || dashboardData.popularTests.length === 0) && (
                    <p className="text-gray-500 text-sm">No popular tests data available</p>
                  )}
                  {dashboardData.popularTests?.map((test, index) => (
                    <div key={test.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{test.name}</p>
                          <p className="text-xs text-gray-500">{test.attempts} attempts</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">
                          ₹{test.revenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Stats Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly user registration trend</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {dashboardData.monthlyStats.users.map((value, index) => {
                      const maxUser = Math.max(...dashboardData.monthlyStats.users);
                      const height = maxUser ? (value / maxUser) * 200 : 0;
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="bg-blue-500 rounded-t"
                            style={{ height: `${height}px`, width: '20px' }}
                          />
                          <span className="text-xs text-gray-500 mt-1">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {dashboardData.monthlyStats.revenue.map((value, index) => {
                      const maxRevenue = Math.max(...dashboardData.monthlyStats.revenue);
                      const height = maxRevenue ? (value / maxRevenue) * 200 : 0;
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="bg-green-500 rounded-t"
                            style={{ height: `${height}px`, width: '20px' }}
                          />
                          <span className="text-xs text-gray-500 mt-1">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
