import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const AnalyticsCharts = ({ analyticsData }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  // Default data if analyticsData is not provided
  const defaultData = {
    loadsPerDay: [
      { date: '2024-01-01', loads: 12 },
      { date: '2024-01-02', loads: 15 },
      { date: '2024-01-03', loads: 8 },
      { date: '2024-01-04', loads: 20 },
      { date: '2024-01-05', loads: 18 },
      { date: '2024-01-06', loads: 22 },
      { date: '2024-01-07', loads: 16 }
    ],
    revenueByMonth: [
      { month: 'Jan', revenue: 45000 },
      { month: 'Feb', revenue: 52000 },
      { month: 'Mar', revenue: 48000 },
      { month: 'Apr', revenue: 61000 },
      { month: 'May', revenue: 55000 },
      { month: 'Jun', revenue: 67000 }
    ],
    userDistribution: [
      { name: 'Company Owners', value: 45 },
      { name: 'Lorry Owners', value: 85 }
    ],
    topTransporters: [
      { name: 'Rajesh Transport', loads: 156 },
      { name: 'Mumbai Logistics', loads: 142 },
      { name: 'Delhi Carriers', loads: 128 },
      { name: 'Chennai Express', loads: 115 },
      { name: 'Kolkata Freight', loads: 98 },
      { name: 'Pune Movers', loads: 87 },
      { name: 'Bangalore Trucks', loads: 76 },
      { name: 'Hyderabad Logistics', loads: 65 },
      { name: 'Jaipur Transport', loads: 54 },
      { name: 'Ahmedabad Carriers', loads: 48 }
    ]
  }

  const data = analyticsData || defaultData

  return (
    <div className="space-y-6">
      {/* Loads Per Day - Line Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Loads Posted Per Day (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.loadsPerDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN')}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="loads" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Loads Posted"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue By Month - Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill="#10B981" 
                name="Revenue (₹)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution - Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.userDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.userDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Transporters - Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Transporters by Completed Loads</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.topTransporters} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={150}
            />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="loads" 
              fill="#F59E0B" 
              name="Completed Loads"
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AnalyticsCharts
