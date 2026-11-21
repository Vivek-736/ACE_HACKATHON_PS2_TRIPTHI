/**
 * Google Maps styling tokens aligned with Tripti's warm ivory canvas and forest/leaf palette.
 * Keeps map elements clean, readable, and non-distracting while highlighting roads and green spaces.
 */
export const TRIPTI_MAP_STYLES: google.maps.MapTypeStyle[] = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ saturation: -15 }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#d6e5dd" }], // Gentle soft sage water
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#2d523f" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry.fill",
    stylers: [{ color: "#f8f7f2" }], // Warm ivory canvas
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#e1ede5" }], // Soft leaf green for parks
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#eed8b3" }], // Harvest amber hue for arterial highways
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#dfc79b" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "transit",
    elementType: "all",
    stylers: [{ visibility: "simplified" }],
  },
];

export const MAP_CENTER_DEFAULT = {
  lat: 17.4483,
  lng: 78.3815, // Cyber Pearl, Madhapur, Hyderabad
};

export const ROLE_MARKER_COLORS = {
  donor: {
    bg: "#1b4d3e", // Forest Green primary
    border: "#d97706", // Amber ring
    icon: "🍽️",
    label: "Surplus Food Donor",
  },
  receiver: {
    bg: "#059669", // Emerald / Leaf Green
    border: "#10b981",
    icon: "🏠",
    label: "Receiver Community Kitchen",
  },
  volunteer: {
    available: {
      bg: "#10b981", // Green
      border: "#059669",
      icon: "🚴",
      label: "Available Volunteer",
    },
    busy: {
      bg: "#2563eb", // Blue
      border: "#1d4ed8",
      icon: "📦",
      label: "On Active Mission",
    },
    offline: {
      bg: "#6b7280", // Gray
      border: "#4b5563",
      icon: "💤",
      label: "Offline Volunteer",
    },
  },
};
