import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StatsCard } from '../../components/Card'
import { PageLoader } from '../../components/Loader'
import AnalyticsCharts from '../../components/AnalyticsCharts'
import { adminAPI } from '../../api'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getAnalytics()
      setStats(response.data)
      // Mock recent activity - in production, fetch from activity log API
      setRecentActivity([])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor and manage platform operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          variant="primary"
        />
        <StatsCard
          title="Active Loads"
          value={stats?.activeLoads || 0}
          variant="warning"
        />
        <StatsCard
          title="Total Vehicles"
          value={stats?.totalVehicles || 0}
        />
        <StatsCard
          title="Platform Revenue"
          value={`₹${((stats?.totalRevenue || 0)).toLocaleString('en-IN')}`}
          variant="success"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm text-gray-600 mb-2">Pending Verifications</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Vehicles</span>
              <span className="font-semibold text-yellow-700">{stats?.pendingVehicles || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Payments</span>
              <span className="font-semibold text-yellow-700">{stats?.pendingPayments || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm text-gray-600 mb-2">User Distribution</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Companies</span>
              <span className="font-semibold">{stats?.companyUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Lorry Owners</span>
              <span className="font-semibold">{stats?.lorryUsers || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm text-gray-600 mb-2">Load Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Completed</span>
              <span className="font-semibold text-green-700">{stats?.completedLoads || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">In Transit</span>
              <span className="font-semibold text-blue-700">{stats?.inTransitLoads || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/users" className="block">
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Manage Users</h3>
            <p className="text-sm text-gray-600">View and moderate users</p>
          </div>
        </Link>

        <Link to="/admin/loads" className="block">
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Manage Loads</h3>
            <p className="text-sm text-gray-600">Monitor all shipments</p>
          </div>
        </Link>

        <Link to="/admin/vehicles" className="block">
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Verify Vehicles</h3>
            <p className="text-sm text-gray-600">Approve vehicle registrations</p>
          </div>
        </Link>

        <Link to="/admin/transactions" className="block">
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Transactions</h3>
            <p className="text-sm text-gray-600">Verify payments</p>
          </div>
        </Link>
      </div>

      {/* Pending Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Pending Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.pendingVehicles > 0 && (
              <Link to="/admin/vehicles?filter=pending" className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Vehicle Verifications</h3>
                    <p className="text-sm text-gray-600">{stats.pendingVehicles} pending approval</p>
                  </div>
                  <svg className="w-6 h-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )}

            {stats?.pendingPayments > 0 && (
              <Link to="/admin/transactions?filter=pending" className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Payment Verifications</h3>
                    <p className="text-sm text-gray-600">{stats.pendingPayments} pending verification</p>
                  </div>
                  <svg className="w-6 h-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )}
          </div>

          {stats?.pendingVehicles === 0 && stats?.pendingPayments === 0 && (
            <div className="text-center py-6 text-gray-500">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium">All caught up!</p>
              <p className="text-sm mt-1">No pending actions at the moment</p>
            </div>
          )}
        </div>

      {/* Analytics Charts */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Overview</h2>
        <AnalyticsCharts analyticsData={analyticsData} />
      </div>
      </div>
    </div>
  )
}

export default AdminDashboard
