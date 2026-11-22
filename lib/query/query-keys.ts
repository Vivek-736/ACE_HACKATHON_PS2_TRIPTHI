export const queryKeys = {
  orders: {
    all: ["rescue-orders"] as const,
    list: (status?: string) => ["rescue-orders", "list", { status }] as const,
    detail: (id: string) => ["rescue-orders", "detail", id] as const,
  },
  volunteers: {
    availability: () => ["volunteer", "availability"] as const,
    profile: () => ["volunteer", "profile"] as const,
    opportunities: () => ["volunteer", "opportunities"] as const,
  },
  map: {
    all: ["map"] as const,
    markers: (roles?: string) => ["map", "markers", { roles }] as const,
    nearby: (lat: number, lng: number, radiusKm: number) =>
      ["locations", "nearby", { lat, lng, radiusKm }] as const,
  },
  listings: {
    all: ["food-listings"] as const,
    list: (status?: string, category?: string) =>
      ["food-listings", "list", { status, category }] as const,
    detail: (id: string) => ["food-listings", "detail", id] as const,
  },
  receiver: {
    profile: () => ["receiver", "profile"] as const,
    requests: () => ["receiver", "requests"] as const,
  },
} as const;
