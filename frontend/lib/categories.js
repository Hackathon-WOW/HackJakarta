export const CATEGORIES = [
  "Food and Beverages",
  "Fashion",
  "Beauty",
  "Services",
  "Creative",
  "Agriculture",
  "Farms",
  "Furnitures",
  "Health Care",
  "Education",
];

export const CATEGORY_FILTERS = ["All", ...CATEGORIES];

// emoji glyph per category for lightweight, friendly visuals
export const CATEGORY_ICON = {
  "Food and Beverages": "☕",
  Fashion: "🧵",
  Beauty: "🌿",
  Services: "🛠️",
  Creative: "🎨",
  Agriculture: "🌾",
  Farms: "🐄",
  Furnitures: "🪑",
  "Health Care": "🩺",
  Education: "📚",
};

export function categoryIcon(cat) {
  return CATEGORY_ICON[cat] || "🏪";
}
