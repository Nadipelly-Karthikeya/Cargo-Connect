import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { StatsCard } from '../../components/Card'
import { LoadStatusBadge } from '../../components/Badge'
import { Button } from '../../components/FormElements'
import { PageLoader } from '../../components/Loader'
import { loadAPI, lorryAPI } from '../../api'

const LorryDashboard = () => {
  const [stats, setStats] = useState({ totalLorries: 0, activeLoads: 0, completedLoads: 0, totalEarnings: 0 })
  const [lorries, setLorries] = useState([])
  const [activeLoads, setActiveLoads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [lorriesData, loadsData] = await Promise.all([
        lorryAPI.getMyLorries(),
        loadAPI.getMyAcceptedLoads({ page: 1, limit: 5 })
      ])
      
      // API returns { success, count, lorries }
      const lorryList = lorriesData.data.lorries || []
      setLorries(lorryList)
      setActiveLoads(loadsData.data.loads || [])
      
      const completedCount = loadsData.data.loads?.filter(l => l.status === 'delivered').length || 0
      const earnings = loadsData.data.loads?.reduce((sum, l) => l.status === 'delivered' ? sum + l.estimatedCost : sum, 0) || 0
      
      setStats({
        totalLorries: lorryList.length,
        activeLoads: loadsData.data.loads?.filter(l => ['accepted', 'in-transit'].includes(l.status)).length || 0,
        completedLoads: completedCount,
        totalEarnings: earnings
      })
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
          <p className="text-gray-600 mt-1">Manage your vehicles and loads</p>
        </div>
        <Link to="/lorry/vehicles/add">
          <Button>Add Vehicle</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Vehicles"
          value={stats.totalLorries}
          variant="primary"
        />
        <StatsCard
          title="Active Loads"
          value={stats.activeLoads}
          variant="warning"
        />
        <StatsCard
          title="Completed Loads"
          value={stats.completedLoads}
        />
        <StatsCard
          title="Total Earnings"
          value={`₹${stats.totalEarnings.toLocaleString('en-IN')}`}
          variant="success"
        />
      </div>

      {/* Active Loads */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Active Loads</h2>
            <Link to="/lorry/loads/available" className="text-primary-800 hover:underline text-sm font-medium">
              Browse Available Loads
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeLoads.length > 0 ? (
                activeLoads.map((load) => (
                  <tr key={load._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{load._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{load.pickupLocation.city}</div>
                      <div className="text-xs text-gray-400">↓</div>
                      <div>{load.dropLocation.city}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{load.goodsType}</div>
                      <div className="text-xs text-gray-400">{load.weight} tons</div>
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
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="font-medium">No active loads</p>
                      <p className="text-sm mt-1">Browse available loads to start earning</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Vehicles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">My Vehicles</h2>
          <Link to="/lorry/vehicles" className="text-primary-800 hover:underline text-sm font-medium">
            Manage All
          </Link>
        </div>

        {lorries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lorries.slice(0, 3).map((lorry) => (
              <div key={lorry._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{lorry.vehicleNumber}</h3>
                    <p className="text-sm text-gray-600 capitalize">{lorry.vehicleType}</p>
                  </div>
                  {lorry.isVerified ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Verified</span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">Pending</span>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{lorry.capacity} tons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${lorry.isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                      {lorry.isAvailable ? 'Available' : 'In Use'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            <p className="font-medium">No vehicles added</p>
            <p className="text-sm mt-1">Add your first vehicle to start accepting loads</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/lorry/loads/available" className="block">
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Browse Loads</h3>
            <p className="text-sm text-gray-600">Find available shipments</p>
          </div>
        </Link>

        <Link to="/lorry/vehicles/add" className="block">
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Add Vehicle</h3>
            <p className="text-sm text-gray-600">Register a new vehicle</p>
          </div>
        </Link>

        <Link to="/lorry/loads/my-loads" className="block">
          <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-primary-500 transition-colors p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">My Loads</h3>
            <p className="text-sm text-gray-600">Manage accepted loads</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default LorryDashboard
