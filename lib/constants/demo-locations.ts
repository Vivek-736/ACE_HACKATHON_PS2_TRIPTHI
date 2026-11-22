export interface DemoLocation {
  id: string;
  name: string;
  area: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export const DEMO_LOCATIONS: DemoLocation[] = [
  // --- Andhra Pradesh: Vijayawada ---
  {
    id: "vijayawada-benz-circle",
    name: "Benz Circle Food Corridor",
    area: "Benz Circle",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    latitude: 16.5033,
    longitude: 80.6465,
  },
  {
    id: "vijayawada-mg-road",
    name: "MG Road Hospitality & Banquet Strip",
    area: "MG Road",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    latitude: 16.5085,
    longitude: 80.6382,
  },
  {
    id: "vijayawada-governorpet",
    name: "Governorpet Community Shelter Relief",
    area: "Governorpet",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    latitude: 16.5165,
    longitude: 80.6275,
  },
  {
    id: "vijayawada-bhavanipuram",
    name: "Bhavanipuram Riverside Feeding Center",
    area: "Bhavanipuram",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    latitude: 16.5255,
    longitude: 80.5985,
  },
  {
    id: "vijayawada-gandhinagar",
    name: "Gandhinagar Wholesale Market Hub",
    area: "Gandhinagar",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    latitude: 16.5192,
    longitude: 80.6324,
  },

  // --- Andhra Pradesh: Visakhapatnam (Vizag) ---
  {
    id: "vizag-siripuram",
    name: "Siripuram Commercial & Dining Hub",
    area: "Siripuram",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    latitude: 17.7215,
    longitude: 83.315,
  },
  {
    id: "vizag-jagadamba",
    name: "Jagadamba Junction Food Square",
    area: "Jagadamba",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    latitude: 17.7126,
    longitude: 83.3015,
  },
  {
    id: "vizag-mvp-colony",
    name: "MVP Colony Sector-4 Shelter Zone",
    area: "MVP Colony",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    latitude: 17.7428,
    longitude: 83.3364,
  },
  {
    id: "vizag-gajuwaka",
    name: "Gajuwaka Industrial Mess & Canteen Hub",
    area: "Gajuwaka",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    latitude: 17.6905,
    longitude: 83.2185,
  },
  {
    id: "vizag-rk-beach",
    name: "RK Beach Road Hospitality Strip",
    area: "Beach Road",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    latitude: 17.7144,
    longitude: 83.3235,
  },

  // --- Andhra Pradesh: Guntur & Tirupati ---
  {
    id: "guntur-kothapet",
    name: "Kothapet Canteen Cluster",
    area: "Kothapet",
    city: "Guntur",
    state: "Andhra Pradesh",
    latitude: 16.3067,
    longitude: 80.4365,
  },
  {
    id: "tirupati-alipiri",
    name: "Alipiri Pilgrim Food Relief Zone",
    area: "Alipiri",
    city: "Tirupati",
    state: "Andhra Pradesh",
    latitude: 13.6512,
    longitude: 79.4005,
  },

  // --- Telangana: Hyderabad ---
  {
    id: "madhapur-tech",
    name: "Cyber Pearl, Hitec City / Madhapur",
    area: "Madhapur",
    city: "Hyderabad",
    state: "Telangana",
    latitude: 17.4483,
    longitude: 78.3815,
  },
  {
    id: "gachibowli-financial",
    name: "Financial District Campus, Gachibowli",
    area: "Gachibowli",
    city: "Hyderabad",
    state: "Telangana",
    latitude: 17.4156,
    longitude: 78.3428,
  },
  {
    id: "banjara-hills",
    name: "Road No. 12 Banquet Hub, Banjara Hills",
    area: "Banjara Hills",
    city: "Hyderabad",
    state: "Telangana",
    latitude: 17.4156,
    longitude: 78.435,
  },
  {
    id: "jubilee-hills",
    name: "Check Post Dining Arcade, Jubilee Hills",
    area: "Jubilee Hills",
    city: "Hyderabad",
    state: "Telangana",
    latitude: 17.4319,
    longitude: 78.4073,
  },
  {
    id: "kondapur-botanical",
    name: "Botanical Garden Road, Kondapur",
    area: "Kondapur",
    city: "Hyderabad",
    state: "Telangana",
    latitude: 17.4615,
    longitude: 78.3582,
  },
  {
    id: "begumpet-metro",
    name: "Old Airport Road, Begumpet",
    area: "Begumpet",
    city: "Hyderabad",
    state: "Telangana",
    latitude: 17.4448,
    longitude: 78.4678,
  },
  {
    id: "secunderabad-clock",
    name: "Station Road Shelter Zone, Secunderabad",
    area: "Secunderabad",
    city: "Hyderabad",
    state: "Telangana",
    latitude: 17.4344,
    longitude: 78.5013,
  },

  // --- Karnataka: Bengaluru & Tamil Nadu: Chennai ---
  {
    id: "bangalore-koramangala",
    name: "Koramangala 5th Block Food Street",
    area: "Koramangala",
    city: "Bengaluru",
    state: "Karnataka",
    latitude: 12.9352,
    longitude: 77.6245,
  },
  {
    id: "chennai-t-nagar",
    name: "T. Nagar Annadhanam & Dining Hub",
    area: "T. Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    latitude: 13.0418,
    longitude: 80.2341,
  },
];

export const HYDERABAD_DEMO_LOCATIONS = DEMO_LOCATIONS.filter(
  (l) => l.city === "Hyderabad"
);

export const ANDHRA_PRADESH_DEMO_LOCATIONS = DEMO_LOCATIONS.filter(
  (l) => l.state === "Andhra Pradesh"
);

export const VIJAYAWADA_DEMO_LOCATIONS = DEMO_LOCATIONS.filter(
  (l) => l.city === "Vijayawada"
);

export const VIZAG_DEMO_LOCATIONS = DEMO_LOCATIONS.filter(
  (l) => l.city === "Visakhapatnam"
);
