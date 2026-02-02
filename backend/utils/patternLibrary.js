const PATTERNS = {
  ecommerce: {
    keyword: 'ecommerce|shopping|store|cart',
    tasks: [
      {
        id: 'setup',
        title: 'Setup MERN project',
        description: 'Initialize a MERN stack project with basic structure and tooling.',
        estimatedHours: 2,
        category: 'setup',
        dependencies: [],
      },
      {
        id: 'auth',
        title: 'User authentication',
        description: 'Implement user registration, login, and session handling.',
        estimatedHours: 8,
        category: 'auth',
        dependencies: ['setup'],
      },
      {
        id: 'products',
        title: 'Product catalog',
        description: 'Create product listing, details, and basic search/filtering.',
        estimatedHours: 12,
        category: 'features',
        dependencies: ['setup'],
      },
      {
        id: 'cart',
        title: 'Shopping cart',
        description: 'Implement shopping cart with add/remove/update quantity and persistence.',
        estimatedHours: 10,
        category: 'features',
        dependencies: ['setup', 'auth', 'products'],
      },
      {
        id: 'payments',
        title: 'Payment integration',
        description: 'Integrate payment gateway and handle payment workflow.',
        estimatedHours: 8,
        category: 'integration',
        dependencies: ['auth', 'cart'],
      },
      {
        id: 'orders',
        title: 'Order management',
        description: 'Handle order creation, tracking, and history.',
        estimatedHours: 6,
        category: 'features',
        dependencies: ['auth', 'payments'],
      },
      {
        id: 'admin',
        title: 'Admin dashboard',
        description: 'Create admin interface for managing products, orders, and users.',
        estimatedHours: 10,
        category: 'admin',
        dependencies: ['auth', 'products'],
      },
    ],
  },
  auth: {
    keyword: 'auth|login|signup|register|user',
    tasks: [
      {
        id: 'setup',
        title: 'Setup project',
        description: 'Initialize the base project structure and configuration.',
        estimatedHours: 1,
        category: 'setup',
        dependencies: [],
      },
      {
        id: 'backend_auth',
        title: 'Backend authentication with JWT',
        description: 'Implement backend authentication using JWT tokens.',
        estimatedHours: 6,
        category: 'auth',
        dependencies: ['setup'],
      },
      {
        id: 'frontend_auth',
        title: 'Frontend auth UI',
        description: 'Build login, signup, and related UI components on the frontend.',
        estimatedHours: 4,
        category: 'auth',
        dependencies: ['setup'],
      },
      {
        id: 'auth_integration',
        title: 'Authentication integration',
        description: 'Integrate frontend auth UI with backend JWT authentication.',
        estimatedHours: 2,
        category: 'integration',
        dependencies: ['backend_auth', 'frontend_auth'],
      },
    ],
  },
  payment: {
    keyword: 'payment|checkout|stripe|paypal',
    tasks: [
      {
        id: 'setup',
        title: 'Payment gateway setup',
        description: 'Configure payment gateway accounts and basic setup.',
        estimatedHours: 2,
        category: 'setup',
        dependencies: [],
      },
      {
        id: 'payment_api',
        title: 'Payment API integration',
        description: 'Integrate payment provider APIs on the backend.',
        estimatedHours: 6,
        category: 'integration',
        dependencies: ['setup'],
      },
      {
        id: 'checkout_ui',
        title: 'Checkout UI',
        description: 'Build checkout page with payment forms and order summary.',
        estimatedHours: 4,
        category: 'features',
        dependencies: ['setup'],
      },
    ],
  },
};

const IMPLICIT_DEPENDENCIES = {
  payments: ['auth', 'cart'],
  cart: ['products', 'auth'],
  orders: ['auth', 'payments'],
  admin: ['auth'],
  checkout: ['cart', 'auth'],
};

const FEATURE_KEYWORDS = {
  'auth|login|signup': 'authentication',
  'payment|checkout|stripe': 'payments',
  'cart|shopping|basket': 'shopping_cart',
  'product|catalog|inventory': 'product_catalog',
  'admin|dashboard|manage': 'admin_panel',
  'mobile|responsive': 'mobile_responsive',
  'database|mongodb|sql': 'database_setup',
};

module.exports = {
  PATTERNS,
  IMPLICIT_DEPENDENCIES,
  FEATURE_KEYWORDS,
};

