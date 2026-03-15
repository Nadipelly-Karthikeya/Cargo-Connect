import { FaRocket, FaHandshake, FaChartLine, FaBalanceScale, FaLightbulb, FaHospital, FaUmbrellaBeach, FaLaptop, FaGraduationCap, FaBuilding } from 'react-icons/fa';
import { FaPizzaSlice, FaBullseye } from 'react-icons/fa';
import { FaMapMarkerAlt, FaMoneyBillWave, FaBirthdayCake } from 'react-icons/fa';
import { Link } from 'react-router-dom'
import { Button } from '../components/FormElements'

const Careers = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Link to="/" className="text-primary-200 hover:text-white mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl text-primary-200 max-w-3xl">
            Build the future of Indian logistics with us. We're always looking for talented individuals who want to make an impact.
          </p>
        </div>
      </div>

      {/* Culture */}
      <div id="culture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Our Culture</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <FaRocket />,
              title: 'Innovation First',
              desc: 'We encourage bold ideas and give you the freedom to experiment with new technologies and approaches.'
            },
            {
              icon: <FaHandshake />,
              title: 'Collaborative',
              desc: 'Work alongside talented professionals from diverse backgrounds in a supportive, team-oriented environment.'
            },
            {
              icon: <FaChartLine />,
              title: 'Growth Mindset',
              desc: 'We invest in your professional development through training, mentorship, and learning opportunities.'
            },
            {
              icon: <FaBalanceScale />,
              title: 'Work-Life Balance',
              desc: 'Flexible work arrangements, competitive time-off policies, and a culture that respects your personal time.'
            },
            {
              icon: <FaLightbulb />,
              title: 'Impact Driven',
              desc: 'Your work directly affects millions of transactions and thousands of livelihoods across India.'
            },
            {
              icon: <FaBullseye />,
              title: 'Transparency',
              desc: 'Open communication, regular feedback, and clear career progression paths for all team members.'
            }
          ].map((value) => (
            <div key={value.title} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="text-5xl mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-700">{value.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Perks & Benefits */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Perks & Benefits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <FaMoneyBillWave />, title: 'Competitive Salary', desc: 'Market-leading compensation packages' },
              { icon: <FaHospital />, title: 'Health Insurance', desc: 'Comprehensive medical coverage for you and family' },
              { icon: <FaUmbrellaBeach />, title: 'Paid Time Off', desc: '25 days annual leave + public holidays' },
              { icon: <FaLaptop />, title: 'Latest Tech', desc: 'MacBook/PC of your choice + equipment allowance' },
              { icon: <FaGraduationCap />, title: 'Learning Budget', desc: '₹50,000 annual budget for courses & conferences' },
              { icon: <FaPizzaSlice />, title: 'Free Lunch', desc: 'Catered meals & unlimited snacks' },
              { icon: <FaBuilding />, title: 'Modern Office', desc: 'State-of-the-art workspace in prime location' },
              { icon: <FaBirthdayCake />, title: 'Team Events', desc: 'Regular offsites, celebrations & activities' }
            ].map((perk) => (
              <div key={perk.title} className="text-center p-4">
                <div className="text-4xl mb-3">{perk.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{perk.title}</h3>
                <p className="text-sm text-gray-600">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Open Positions</h2>
        <div className="space-y-4 max-w-4xl mx-auto">
          {[
            {
              title: 'Senior Full Stack Developer',
              department: 'Engineering',
              location: 'Bangalore / Remote',
              type: 'Full-time'
            },
            {
              title: 'Product Manager',
              department: 'Product',
              location: 'Mumbai / Hybrid',
              type: 'Full-time'
            },
            {
              title: 'UI/UX Designer',
              department: 'Design',
              location: 'Bangalore / Remote',
              type: 'Full-time'
            },
            {
              title: 'Operations Manager',
              department: 'Operations',
              location: 'Delhi NCR',
              type: 'Full-time'
            },
            {
              title: 'Customer Success Specialist',
              department: 'Customer Success',
              location: 'Multiple locations',
              type: 'Full-time'
            },
            {
              title: 'Data Analyst',
              department: 'Analytics',
              location: 'Pune / Remote',
              type: 'Full-time'
            }
          ].map((job) => (
            <div key={job.title} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <span><FaBuilding className="inline mb-1" /></span> {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <span><FaMapMarkerAlt className="inline mb-1" /></span> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>⏰</span> {job.type}
                    </span>
                  </div>
                </div>
                <Button variant="secondary" className="whitespace-nowrap">
                  Apply Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Process */}
      <div className="bg-primary-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Our Hiring Process</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Apply Online', desc: 'Submit your application through our portal' },
              { step: '2', title: 'Initial Screening', desc: 'HR review and phone screening (30 mins)' },
              { step: '3', title: 'Technical Rounds', desc: '2-3 rounds with team members' },
              { step: '4', title: 'Offer', desc: 'Final discussion and offer letter' }
            ].map((stage) => (
              <div key={stage.step} className="text-center">
                <div className="w-16 h-16 bg-primary-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {stage.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{stage.title}</h3>
                <p className="text-sm text-gray-600">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Don't See Your Role?</h2>
          <p className="text-xl text-primary-200 mb-8">
            We're always on the lookout for exceptional talent. Send us your resume and let's talk!
          </p>
          <Link to="/contact">
            <Button className="bg-white text-primary-900 hover:bg-gray-100 px-8 py-3">
              Get in Touch
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Careers
