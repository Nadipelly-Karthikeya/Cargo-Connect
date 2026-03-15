// Calculate distance between two coordinates using Haversine formula
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance);
};

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Calculate estimated cost based on distance, vehicle type, and weight
exports.calculateEstimatedCost = (distance, vehicleType, weight) => {
  // Base rate per km based on vehicle type
  const baseRates = {
    'Mini Truck': 15,
    'Small Truck': 18,
    'Medium Truck': 22,
    'Large Truck': 28,
    'Container 20ft': 35,
    'Container 40ft': 45,
    'Trailer': 40,
    'Tanker': 38,
  };

  // Weight multiplier (per ton)
  const weightMultiplier = 1 + (weight * 0.05);

  // Base cost calculation
  const baseRate = baseRates[vehicleType] || 20;
  let cost = distance * baseRate * weightMultiplier;

  // Add toll and other charges (estimated 10% of base cost)
  cost += cost * 0.10;

  // Add GST (18%)
  cost += cost * 0.18;

  // Round to nearest 10
  cost = Math.round(cost / 10) * 10;

  return cost;
};

// Estimate delivery time based on distance
exports.estimateDeliveryTime = (distance) => {
  // Average speed: 50 km/hr including breaks
  const avgSpeed = 50;
  const hours = distance / avgSpeed;
  
  // Add buffer time (20%)
  const totalHours = hours * 1.2;
  
  const deliveryDate = new Date();
  deliveryDate.setHours(deliveryDate.getHours() + totalHours);
  
  return deliveryDate;
};

// Generate delivery OTP
exports.generateDeliveryOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Recommend best lorries based on load requirements
exports.recommendLorries = (availableLorries, requiredType, weight, pickupLocation) => {
  // Filter by vehicle type and capacity
  let recommendations = availableLorries.filter(lorry => 
    lorry.vehicleType === requiredType && 
    lorry.capacity >= weight &&
    lorry.isVerified &&
    lorry.isAvailable
  );

  // Sort by rating and proximity (for now just by rating)
  recommendations.sort((a, b) => {
    // Get owner ratings (would need to be joined in actual query)
    return (b.ownerRating || 0) - (a.ownerRating || 0);
  });

  return recommendations.slice(0, 5); // Return top 5
};
