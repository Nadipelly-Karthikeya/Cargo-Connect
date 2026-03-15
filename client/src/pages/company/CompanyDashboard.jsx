import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StatsCard } from '../../components/Card'
import { LoadStatusBadge } from '../../components/Badge'
import { Button } from '../../components/FormElements'
import { PageLoader } from '../../components/Loader'
import { loadAPI, companyAPI } from '../../api'

const CompanyDashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentLoads, setRecentLoads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsData, loadsData] = await Promise.all([
        companyAPI.getStats(),
        loadAPI.getMyLoads({ page: 1, limit: 5 })
      ])
      setStats(statsData.data)
      setRecentLoads(loadsData.data.loads)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your logistics overview</p>
        </div>
        <Link to="/company/loads/create">
          <Button>Post New Load</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Loads"
          value={stats?.totalLoads || 0}
          trend={stats?.loadsTrend}
          trendLabel="from last month"
        />
        <StatsCard
          title="Active Loads"
          value={stats?.activeLoads || 0}
          variant="primary"
        />
        <StatsCard
          title="Completed Loads"
          value={stats?.completedLoads || 0}
          trend={stats?.completedTrend}
          trendLabel="completion rate"
        />
        <StatsCard
          title="Total Spent"
          value={`₹${(stats?.totalSpent || 0).toLocaleString('en-IN')}`}
          variant="success"
        />
      </div>

      {/* Recent Loads */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Loads</h2>
            <Link to="/company/loads" className="text-primary-800 hover:underline text-sm font-medium">
              View All
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Load ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentLoads.length > 0 ? (
                recentLoads.map((load) => (
                  <tr key={load._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{load._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{load.pickupLocation.city}</div>
                      <div className="text-xs text-gray-400">↓</div>
                      <div>{load.dropLocation.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {load.goodsType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {load.weight} tons
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <LoadStatusBadge status={load.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{load.estimatedCost.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="font-medium">No loads posted yet</p>
                      <p className="text-sm mt-1">Start by posting your first load</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/company/loads/create" className="block">
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Post New Load</h3>
            <p className="text-sm text-gray-600">Create a new shipment request</p>
          </div>
        </Link>

        <Link to="/company/loads" className="block">
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Manage Loads</h3>
            <p className="text-sm text-gray-600">Track and update shipments</p>
          </div>
        </Link>

        <Link to="/company/transactions" className="block">
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Transactions</h3>
            <p className="text-sm text-gray-600">View payment history</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default CompanyDashboard
