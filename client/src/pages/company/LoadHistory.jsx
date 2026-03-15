import { FaInbox, FaSync } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa';
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LoadStatusBadge } from '../../components/Badge'
import { Button, Input, Select } from '../../components/FormElements'
import { PageLoader } from '../../components/Loader'
import { loadAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'

const LoadHistory = () => {
  const { user } = useAuth()
  const [loads, setLoads] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'Delivered',
    search: '',
    startDate: '',
    endDate: '',
    goodsType: ''
  })
  const [stats, setStats] = useState({
    totalDelivered: 0,
    totalSpent: 0,
    avgRating: 0
  })

  useEffect(() => {
    if (user) {
      fetchLoadHistory()
    }
  }, [filters, user])

  const fetchLoadHistory = async () => {
    try {
      const response = await loadAPI.getMyLoads({ ...filters })
      const deliveredLoads = response.data.loads.filter(load => load.status === 'Delivered')
      setLoads(deliveredLoads)
      
      // Calculate stats
      const totalSpent = deliveredLoads.reduce((sum, load) => sum + (load.estimatedCost || 0), 0)
      setStats({
        totalDelivered: deliveredLoads.length,
        totalSpent,
        avgRating: user?.ratingAverage || 0
      })
    } catch (error) {
      console.error('Failed to fetch load history:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async (loadId) => {
    try {
      const response = await loadAPI.downloadInvoice(loadId)
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `load_${loadId}_invoice.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (error) {
      console.error('Failed to download PDF:', error)
    }
  }

  const downloadAllPDF = () => {
    // In production, this would generate a consolidated PDF
    alert('Generating consolidated PDF report...')
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Load History</h1>
          <p className="text-gray-600 mt-1">Archive of all completed shipments</p>
        </div>
        <Button onClick={downloadAllPDF}>
          <FaInbox className="inline mb-1" /> Download All as PDF
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Delivered</div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalDelivered}</div>
          <div className="text-xs text-green-600 mt-1"><FaCheck className="inline mb-1" /> Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Spent</div>
          <div className="text-3xl font-bold text-gray-900">₹{stats.totalSpent.toLocaleString('en-IN')}</div>
          <div className="text-xs text-gray-500 mt-1">All-time</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">Average Rating</div>
          <div className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            {user?.ratingCount > 0 ? stats.avgRating.toFixed(1) : 'N/A'}
            {user?.ratingCount > 0 && <span className="text-yellow-500 text-2xl"><FaStar className="inline mb-1" /></span>}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {user?.ratingCount > 0 ? `Based on ${user.ratingCount} rating${user.ratingCount !== 1 ? 's' : ''}` : 'No ratings yet'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search by ID, city, or goods..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Input
            type="date"
            label="From Date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <Input
            type="date"
            label="To Date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
          <Select
            value={filters.goodsType}
            onChange={(e) => setFilters({ ...filters, goodsType: e.target.value })}
            options={[
              { value: '', label: 'All Goods Types' },
              { value: 'Electronics', label: 'Electronics' },
              { value: 'Furniture', label: 'Furniture' },
              { value: 'Food', label: 'Food' },
              { value: 'Chemicals', label: 'Chemicals' }
            ]}
          />
        </div>
      </div>

      {/* Loads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Load ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Goods
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Delivery Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loads.length > 0 ? (
                loads.map((load) => (
                  <tr key={load._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/company/loads/${load._id}`}
                        className="text-primary-800 hover:underline font-medium"
                      >
                        #{load._id.slice(-6).toUpperCase()}
                      </Link>
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
                      {new Date(load.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{load.estimatedCost.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Link to={`/company/loads/${load._id}`}>
                          <Button variant="secondary" size="sm">
                            View
                          </Button>
                        </Link>
                        <Button variant="secondary" size="sm" onClick={() => downloadPDF(load._id)}>
                          <FaInbox className="inline mb-1" /> PDF
                        </Button>
                        <Button size="sm" onClick={() => handleRepeatLoad(load)}>
                          <FaSync className="inline mb-1" /> Repeat
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="font-medium">No delivered loads found</p>
                      <p className="text-sm mt-1">Your completed shipments will appear here</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LoadHistory
