import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LoadStatusBadge } from '../../components/Badge'
import { Button, Select } from '../../components/FormElements'
import { PageLoader } from '../../components/Loader'
import { loadAPI } from '../../api'

const Earnings = () => {
  const [loads, setLoads] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('all') // all, month, week
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedLoads: 0,
    pendingPayments: 0,
    avgPerLoad: 0,
    thisMonth: 0,
    lastMonth: 0
  })

  useEffect(() => {
    fetchEarnings()
  }, [timeRange])

  const fetchEarnings = async () => {
    try {
      const response = await loadAPI.getLorryLoads({ status: 'Delivered' })
      const deliveredLoads = response.data.loads || []
      
      // Calculate earnings
      const totalEarnings = deliveredLoads.reduce((sum, load) => sum + (load.estimatedCost || 0), 0)
      const avgPerLoad = deliveredLoads.length > 0 ? totalEarnings / deliveredLoads.length : 0
      
      // Calculate this month earnings
      const now = new Date()
      const thisMonthLoads = deliveredLoads.filter(load => {
        const loadDate = new Date(load.updatedAt)
        return loadDate.getMonth() === now.getMonth() && loadDate.getFullYear() === now.getFullYear()
      })
      const thisMonth = thisMonthLoads.reduce((sum, load) => sum + (load.estimatedCost || 0), 0)
      
      // Calculate last month earnings
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthLoads = deliveredLoads.filter(load => {
        const loadDate = new Date(load.updatedAt)
        return loadDate.getMonth() === lastMonthDate.getMonth() && loadDate.getFullYear() === lastMonthDate.getFullYear()
      })
      const lastMonth = lastMonthLoads.reduce((sum, load) => sum + (load.estimatedCost || 0), 0)

      setStats({
        totalEarnings,
        completedLoads: deliveredLoads.length,
        pendingPayments: 0, // Mock
        avgPerLoad,
        thisMonth,
        lastMonth
      })
      
      setLoads(deliveredLoads)
    } catch (error) {
      console.error('Failed to fetch earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGrowthPercentage = () => {
    if (stats.lastMonth === 0) return 100
    return (((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100).toFixed(1)
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings & Analytics</h1>
          <p className="text-gray-600 mt-1">Track your income and performance</p>
        </div>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          options={[
            { value: 'all', label: 'All Time' },
            { value: 'month', label: 'This Month' },
            { value: 'week', label: 'This Week' }
          ]}
        />
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="text-sm opacity-90 mb-1">Total Earnings</div>
          <div className="text-3xl font-bold">₹{stats.totalEarnings.toLocaleString('en-IN')}</div>
          <div className="text-xs opacity-75 mt-2">All-time revenue</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">This Month</div>
          <div className="text-3xl font-bold text-gray-900">₹{stats.thisMonth.toLocaleString('en-IN')}</div>
          <div className={`text-xs mt-2 flex items-center gap-1 ${parseFloat(getGrowthPercentage()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {parseFloat(getGrowthPercentage()) >= 0 ? '↑' : '↓'}
            {Math.abs(getGrowthPercentage())}% from last month
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Completed Loads</div>
          <div className="text-3xl font-bold text-gray-900">{stats.completedLoads}</div>
          <div className="text-xs text-gray-500 mt-2">Successfully delivered</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Average Per Load</div>
          <div className="text-3xl font-bold text-gray-900">₹{Math.round(stats.avgPerLoad).toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-500 mt-2">Average earning</div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
            // Mock data for visualization
            const mockEarning = Math.round(stats.avgPerLoad * (Math.random() * 3 + 1))
            const isCurrentMonth = new Date().getMonth() === index
            
            return (
              <div key={month} className={`text-center p-3 rounded-lg ${isCurrentMonth ? 'bg-primary-50 border-2 border-primary-300' : 'bg-gray-50'}`}>
                <div className="text-xs text-gray-600 mb-1">{month}</div>
                <div className="font-semibold text-gray-900">₹{mockEarning.toLocaleString('en-IN', { notation: 'compact' })}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Earnings Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">By Vehicle Type</h2>
          <div className="space-y-3">
            {[
              { type: 'Large Truck', earnings: Math.round(stats.totalEarnings * 0.4), loads: Math.round(stats.completedLoads * 0.4) },
              { type: 'Medium Truck', earnings: Math.round(stats.totalEarnings * 0.35), loads: Math.round(stats.completedLoads * 0.35) },
              { type: 'Small Truck', earnings: Math.round(stats.totalEarnings * 0.25), loads: Math.round(stats.completedLoads * 0.25) }
            ].map((vehicle) => (
              <div key={vehicle.type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{vehicle.type}</div>
                  <div className="text-xs text-gray-600">{vehicle.loads} loads</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">₹{vehicle.earnings.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-gray-500">{((vehicle.earnings / stats.totalEarnings) * 100).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">By Route Distance</h2>
          <div className="space-y-3">
            {[
              { range: '0-100 km', earnings: Math.round(stats.totalEarnings * 0.2), loads: Math.round(stats.completedLoads * 0.2) },
              { range: '100-300 km', earnings: Math.round(stats.totalEarnings * 0.35), loads: Math.round(stats.completedLoads * 0.35) },
              { range: '300-600 km', earnings: Math.round(stats.totalEarnings * 0.3), loads: Math.round(stats.completedLoads * 0.3) },
              { range: '600+ km', earnings: Math.round(stats.totalEarnings * 0.15), loads: Math.round(stats.completedLoads * 0.15) }
            ].map((range) => (
              <div key={range.range} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{range.range}</div>
                  <div className="text-xs text-gray-600">{range.loads} loads</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">₹{range.earnings.toLocaleString('en-IN')}</div>
                  <div className="text-xs text-gray-500">{((range.earnings / stats.totalEarnings) * 100).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Earnings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Load ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Distance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Earnings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loads.slice(0, 10).map((load) => (
                <tr key={load._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(load.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/lorry/loads/${load._id}`}
                      className="text-primary-800 hover:underline font-medium text-sm"
                    >
                      #{load._id.slice(-6).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{load.pickupLocation.city} → {load.dropLocation.city}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {load.distance} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ₹{load.estimatedCost.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Earnings
