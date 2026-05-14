export const IMAGE_FALLBACKS = {
  moviePoster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=85',
  movieHero: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1400&q=85',
  eventPoster: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85',
  bus: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=85',
  train: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=85',
  flight: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=85',
  airline: 'https://images.unsplash.com/photo-1521727857535-28d2047314ac?auto=format&fit=crop&w=400&q=85',
  car: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85',
  premiumCar: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=85',
  booking: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=85',
};

export const getImage = (value, fallbackKey = 'booking') => {
  if (value && typeof value === 'string' && value.trim()) return value;
  return IMAGE_FALLBACKS[fallbackKey] || IMAGE_FALLBACKS.booking;
};

export const applyImageFallback = (event, fallbackKey = 'booking') => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = IMAGE_FALLBACKS[fallbackKey] || IMAGE_FALLBACKS.booking;
};
