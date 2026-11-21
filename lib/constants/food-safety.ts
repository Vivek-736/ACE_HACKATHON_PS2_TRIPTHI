/**
 * Non-negotiable Food Safety Guidelines & Disclaimers as defined in AGENTS.md §2
 *
 * Requirements:
 * - "The platform connects people; it does not certify food as safe."
 * - "Show clear handling guidance and time limits. Never imply that the platform inspected, approved or guaranteed food safety."
 * - "Do not promise tax deductions, legal benefits or regulatory exemptions to donors."
 */

export const FOOD_SAFETY_DISCLAIMER =
  "Tripti coordinates communication and transport between registered food donors, community receivers, and rescue volunteers. The platform does not inspect, test, prepare, or certify the safety of any food item. Donors are solely responsible for ensuring surplus food was prepared under hygienic conditions, kept within temperature thresholds, and packed cleanly.";

export const FOOD_SAFETY_SHORT_NOTICE =
  "Platform does not certify food safety. Donors and receivers must verify condition and adhere to storage guidelines.";

export const ALLERGEN_OPTIONS = [
  { id: "none", label: "No common allergens declared" },
  { id: "dairy", label: "Dairy / Milk (Paneer, Ghee, Cream)" },
  { id: "gluten", label: "Gluten / Wheat (Roti, Bread, Maida)" },
  { id: "nuts", label: "Nuts / Peanuts" },
  { id: "soy", label: "Soy / Soya" },
  { id: "eggs", label: "Eggs" },
  { id: "mustard", label: "Mustard" },
  { id: "sesame", label: "Sesame (Til)" },
] as const;

export const STORAGE_PRESETS = [
  {
    id: "hot_holding",
    label: "Hot Holding (Maintain ≥ 65°C)",
    description: "Kept hot in chafing dishes or thermal carriers",
  },
  {
    id: "refrigerated",
    label: "Refrigerated (Maintain ≤ 4°C)",
    description: "Chilled promptly after cooking",
  },
  {
    id: "room_temperature",
    label: "Room Temperature (Dry / Ambient)",
    description: "Bakery, dry snacks, breads, or fresh produce",
  },
  {
    id: "frozen",
    label: "Deep Frozen (Maintain ≤ -18°C)",
    description: "Packed and placed in commercial freezer",
  },
] as const;

export const CATEGORY_PRESETS = [
  { id: "cooked_meals", label: "Cooked Meals (Curries, Rice, Biryani)" },
  { id: "bakery", label: "Bakery & Breads (Bread, Buns, Pastries)" },
  { id: "produce", label: "Fresh Produce (Vegetables, Fruits)" },
  { id: "packaged_groceries", label: "Packaged Groceries (Unopened)" },
  { id: "dairy", label: "Dairy (Milk, Curd, Paneer)" },
  { id: "beverages", label: "Beverages & Juices" },
  { id: "other", label: "Other Edible Food" },
] as const;

export const DIET_PRESETS = [
  { id: "vegetarian", label: "Vegetarian (No meat, eggs)" },
  { id: "vegan", label: "100% Plant-Based (Vegan)" },
  { id: "non_vegetarian", label: "Non-Vegetarian (Chicken, Mutton, Fish)" },
  { id: "halal", label: "Halal Certified" },
  { id: "jain", label: "Jain Vegetarian (No root veggies)" },
  { id: "eggetarian", label: "Eggetarian (Vegetarian with eggs)" },
] as const;
