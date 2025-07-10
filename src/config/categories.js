// Standardized business categories for the directory
// These are the only allowed categories to ensure consistency and better filtering

export const BUSINESS_CATEGORIES = [
  // Professional Services
  'Accounting & Finance',
  'Legal Services',
  'Consulting',
  'Marketing & Advertising',
  'Real Estate',
  'Insurance',
  'Architecture & Engineering',
  'Human Resources',
  'Business Services',
  
  // Technology
  'Software Development',
  'IT Services',
  'Web Design',
  'Digital Marketing',
  'Cybersecurity',
  'Data Analytics',
  'Cloud Services',
  'Mobile App Development',
  
  // Healthcare & Wellness
  'Medical Services',
  'Dental Care',
  'Mental Health',
  'Fitness & Wellness',
  'Veterinary Services',
  'Pharmacy',
  'Physical Therapy',
  'Alternative Medicine',
  
  // Food & Beverage
  'Restaurants',
  'Cafes & Coffee Shops',
  'Food Delivery',
  'Catering',
  'Bakeries',
  'Bars & Nightlife',
  'Food Trucks',
  'Grocery Stores',
  
  // Retail & Shopping
  'Clothing & Fashion',
  'Electronics',
  'Home & Garden',
  'Sporting Goods',
  'Books & Media',
  'Jewelry',
  'Automotive Parts',
  'Beauty & Cosmetics',
  
  // Home & Construction
  'Construction',
  'Plumbing',
  'Electrical Services',
  'HVAC',
  'Landscaping',
  'Cleaning Services',
  'Interior Design',
  'Home Security',
  
  // Automotive
  'Auto Repair',
  'Car Dealerships',
  'Auto Insurance',
  'Car Rental',
  'Towing Services',
  'Auto Parts',
  'Car Wash',
  
  // Education & Training
  'Schools & Universities',
  'Tutoring',
  'Online Learning',
  'Professional Training',
  'Language Learning',
  'Music Lessons',
  'Art Classes',
  
  // Entertainment & Recreation
  'Event Planning',
  'Photography',
  'Music & Entertainment',
  'Sports & Recreation',
  'Travel & Tourism',
  'Hotels & Lodging',
  'Gaming',
  
  // Personal Services
  'Hair & Beauty',
  'Spa Services',
  'Pet Services',
  'Childcare',
  'Elder Care',
  'Dry Cleaning',
  'Repair Services',
  
  // Transportation & Logistics
  'Shipping & Delivery',
  'Moving Services',
  'Taxi & Rideshare',
  'Public Transportation',
  'Logistics',
  'Storage',
  
  // Manufacturing & Industrial
  'Manufacturing',
  'Wholesale',
  'Industrial Services',
  'Packaging',
  'Quality Control',
  'Supply Chain',
  
  // Non-Profit & Community
  'Non-Profit Organizations',
  'Community Services',
  'Religious Organizations',
  'Government Services',
  'Social Services',
  
  // Other
  'Other Services'
];

// Category groups for better organization in UI
export const CATEGORY_GROUPS = {
  'Professional Services': [
    'Accounting & Finance',
    'Legal Services',
    'Consulting',
    'Marketing & Advertising',
    'Real Estate',
    'Insurance',
    'Architecture & Engineering',
    'Human Resources',
    'Business Services'
  ],
  
  'Technology': [
    'Software Development',
    'IT Services',
    'Web Design',
    'Digital Marketing',
    'Cybersecurity',
    'Data Analytics',
    'Cloud Services',
    'Mobile App Development'
  ],
  
  'Healthcare & Wellness': [
    'Medical Services',
    'Dental Care',
    'Mental Health',
    'Fitness & Wellness',
    'Veterinary Services',
    'Pharmacy',
    'Physical Therapy',
    'Alternative Medicine'
  ],
  
  'Food & Beverage': [
    'Restaurants',
    'Cafes & Coffee Shops',
    'Food Delivery',
    'Catering',
    'Bakeries',
    'Bars & Nightlife',
    'Food Trucks',
    'Grocery Stores'
  ],
  
  'Retail & Shopping': [
    'Clothing & Fashion',
    'Electronics',
    'Home & Garden',
    'Sporting Goods',
    'Books & Media',
    'Jewelry',
    'Automotive Parts',
    'Beauty & Cosmetics'
  ],
  
  'Home & Construction': [
    'Construction',
    'Plumbing',
    'Electrical Services',
    'HVAC',
    'Landscaping',
    'Cleaning Services',
    'Interior Design',
    'Home Security'
  ],
  
  'Automotive': [
    'Auto Repair',
    'Car Dealerships',
    'Auto Insurance',
    'Car Rental',
    'Towing Services',
    'Auto Parts',
    'Car Wash'
  ],
  
  'Education & Training': [
    'Schools & Universities',
    'Tutoring',
    'Online Learning',
    'Professional Training',
    'Language Learning',
    'Music Lessons',
    'Art Classes'
  ],
  
  'Entertainment & Recreation': [
    'Event Planning',
    'Photography',
    'Music & Entertainment',
    'Sports & Recreation',
    'Travel & Tourism',
    'Hotels & Lodging',
    'Gaming'
  ],
  
  'Personal Services': [
    'Hair & Beauty',
    'Spa Services',
    'Pet Services',
    'Childcare',
    'Elder Care',
    'Dry Cleaning',
    'Repair Services'
  ],
  
  'Transportation & Logistics': [
    'Shipping & Delivery',
    'Moving Services',
    'Taxi & Rideshare',
    'Public Transportation',
    'Logistics',
    'Storage'
  ],
  
  'Manufacturing & Industrial': [
    'Manufacturing',
    'Wholesale',
    'Industrial Services',
    'Packaging',
    'Quality Control',
    'Supply Chain'
  ],
  
  'Community & Non-Profit': [
    'Non-Profit Organizations',
    'Community Services',
    'Religious Organizations',
    'Government Services',
    'Social Services'
  ]
};

// Helper function to validate category
export const isValidCategory = (category) => {
  return BUSINESS_CATEGORIES.includes(category);
};

// Helper function to get category suggestions based on input
export const getCategorySuggestions = (input) => {
  if (!input) return BUSINESS_CATEGORIES.slice(0, 10);
  
  const lowerInput = input.toLowerCase();
  return BUSINESS_CATEGORIES.filter(category => 
    category.toLowerCase().includes(lowerInput)
  ).slice(0, 10);
};

// Helper function to get the most common categories
export const getPopularCategories = () => {
  return [
    'Restaurants',
    'Professional Services',
    'Healthcare',
    'Technology',
    'Retail',
    'Automotive',
    'Home Services',
    'Education',
    'Entertainment',
    'Personal Services'
  ];
};