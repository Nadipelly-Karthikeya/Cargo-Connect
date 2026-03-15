/**
 * Calculate Estimated Time of Arrival based on distance and load status
 * @param {number} distance - Distance in kilometers
 * @param {string} pickupCity - Pickup city name
 * @param {string} dropCity - Drop city name
 * @param {string} status - Load status (Posted, Accepted, Picked Up, In Transit, Delivered)
 * @param {Date} pickupDate - Expected/Actual pickup date
 * @param {number} progressPercentage - Current progress percentage (0-100)
 * @returns {Object} ETA details including date, time, countdown, and formatted strings
 */
export const calculateETA = (distance, pickupCity, dropCity, status, pickupDate, progressPercentage = 0) => {
  // Validate pickupDate
  if (!pickupDate) {
    console.warn('calculateETA: pickupDate is missing, using current date')
    pickupDate = new Date()
  }
  
  // Ensure pickupDate is a valid date
  const parsedPickupDate = new Date(pickupDate)
  if (isNaN(parsedPickupDate.getTime())) {
    console.warn('calculateETA: Invalid pickupDate provided, using current date')
    pickupDate = new Date()
  }

  // Average speeds based on route type
  const HIGHWAY_SPEED = 60 // km/h
  const CITY_SPEED = 30 // km/h
  const REST_HOURS = 8 // hours per day for driver rest

  // Determine if route is mostly highway or city
  const isMetroCity = (city) => {
    const metroCities = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad']
    return metroCities.some(metro => city.includes(metro))
  }

  // Calculate average speed based on route
  let averageSpeed = HIGHWAY_SPEED
  if (isMetroCity(pickupCity) || isMetroCity(dropCity)) {
    // If either city is metro, reduce average speed
    averageSpeed = (HIGHWAY_SPEED + CITY_SPEED) / 2
  }

  // Calculate remaining distance based on progress
  const remainingDistance = distance * (1 - progressPercentage / 100)

  // Calculate travel hours
  const travelHours = remainingDistance / averageSpeed

  // Add buffer time (10% for traffic, tolls, etc.)
  const bufferHours = travelHours * 0.1

  // Calculate total days (accounting for rest hours)
  const totalHours = travelHours + bufferHours
  const travelDays = Math.ceil(totalHours / (24 - REST_HOURS))

  // Calculate ETA based on status
  let etaDate = new Date()

  switch (status) {
    case 'Posted':
    case 'Approved':
      // For posted loads, ETA is from expected pickup date
      etaDate = new Date(pickupDate)
      etaDate.setDate(etaDate.getDate() + travelDays)
      break

    case 'Accepted':
      // Load accepted, estimate from pickup date
      etaDate = new Date(pickupDate)
      etaDate.setDate(etaDate.getDate() + travelDays)
      break

    case 'Picked Up':
    case 'In Transit':
      // Load is on the way, calculate from now
      etaDate = new Date()
      etaDate.setHours(etaDate.getHours() + totalHours)
      break

    case 'Delivered':
      // Already delivered
      return {
        etaDate: null,
        etaTime: null,
        daysRemaining: 0,
        hoursRemaining: 0,
        minutesRemaining: 0,
        formattedETA: 'Delivered',
        countdown: 'Completed',
        status: 'delivered'
      }

    default:
      etaDate.setHours(etaDate.getHours() + totalHours)
  }

  // Calculate countdown
  const now = new Date()
  const timeDiff = etaDate - now
  
  if (timeDiff < 0) {
    return {
      etaDate: etaDate.toISOString().split('T')[0],
      etaTime: etaDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      formattedETA: 'Delayed',
      countdown: 'Delivery overdue',
      status: 'delayed'
    }
  }

  const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hoursRemaining = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutesRemaining = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

  // Format countdown string
  let countdown = ''
  if (daysRemaining > 0) {
    countdown = `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''}`
  } else if (hoursRemaining > 0) {
    countdown = `${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`
  } else {
    countdown = `${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`
  }

  return {
    etaDate: etaDate.toISOString().split('T')[0],
    etaTime: etaDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    daysRemaining,
    hoursRemaining,
    minutesRemaining,
    formattedETA: etaDate.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    countdown: `Arriving in ${countdown}`,
    status: daysRemaining === 0 && hoursRemaining < 2 ? 'arriving-soon' : 'on-time'
  }
}

/**
 * Get ETA status color based on status
 * @param {string} status - ETA status (on-time, arriving-soon, delayed, delivered)
 * @returns {string} Tailwind CSS color class
 */
export const getETAStatusColor = (status) => {
  switch (status) {
    case 'on-time':
      return 'text-green-700'
    case 'arriving-soon':
      return 'text-blue-700'
    case 'delayed':
      return 'text-red-700'
    case 'delivered':
      return 'text-gray-700'
    default:
      return 'text-gray-700'
  }
}
