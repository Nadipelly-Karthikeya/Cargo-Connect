import { useState, useEffect } from 'react'
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Badge } from '../components/Badge'
import { FaChartBar, FaUsers, FaBox, FaTruck, FaMoneyBillWave, FaPlus, FaHistory, FaCog, FaSearch, FaSignOutAlt } from 'react-icons/fa'
import { notificationAPI } from '../api'

const DashboardLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications({ page: 1, limit: 5 })
      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.unreadCount || 0)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getNavigation = () => {
    if (user.role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <FaChartBar /> },
        { name: 'Users', path: '/admin/users', icon: <FaUsers /> },
        { name: 'Loads', path: '/admin/loads', icon: <FaBox /> },
        { name: 'Vehicles', path: '/admin/vehicles', icon: <FaTruck /> },
        { name: 'Transactions', path: '/admin/transactions', icon: <FaMoneyBillWave /> }
      ]
    } else if (user.role === 'company') {
      return [
        { name: 'Dashboard', path: '/company/dashboard', icon: <FaChartBar /> },
        { name: 'Post Load', path: '/company/loads/create', icon: <FaPlus /> },
        { name: 'Manage Loads', path: '/company/loads', icon: <FaBox /> },
        { name: 'Load History', path: '/company/load-history', icon: <FaHistory /> },
        { name: 'Transactions', path: '/company/transactions', icon: <FaMoneyBillWave /> },
        { name: 'Profile', path: '/company/profile', icon: <FaCog /> }
      ]
    } else {
      return [
        { name: 'Dashboard', path: '/lorry/dashboard', icon: <FaChartBar /> },
        { name: 'Browse Loads', path: '/lorry/loads/available', icon: <FaSearch /> },
        { name: 'My Loads', path: '/lorry/loads/my-loads', icon: <FaBox /> },
        { name: 'Earnings', path: '/lorry/earnings', icon: <FaMoneyBillWave /> },
        { name: 'Vehicles', path: '/lorry/vehicles', icon: <FaTruck /> },
        { name: 'Add Vehicle', path: '/lorry/vehicles/add', icon: <FaPlus /> }
      ]
    }
  }

  const navigation = getNavigation()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar - Fixed Position */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-primary-900 transition-all duration-300 fixed left-0 top-0 h-screen flex flex-col z-40`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-primary-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="text-xl font-bold text-white">Cargo Connect</h1>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-primary-800 p-2 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sidebar Navigation - Scrollable */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary-800 text-white'
                  : 'text-primary-200 hover:bg-primary-800/50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer - Always Visible */}
        <div className="p-4 border-t border-primary-800 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-primary-200 hover:bg-primary-800/50 rounded-lg w-full transition-colors"
          >
            <span className="text-xl"><FaSignOutAlt /></span>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content - With Left Margin */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 flex flex-col min-h-screen`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h2>
              <p className="text-sm text-gray-600 capitalize">{user.role} Account</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div key={notif._id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                            <p className="text-sm text-gray-900">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notif.createdAt).toLocaleString('en-IN')}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <p className="text-sm">No notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-primary-800 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  {!user.isVerified && (
                    <Badge variant="warning" size="sm">Unverified</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
