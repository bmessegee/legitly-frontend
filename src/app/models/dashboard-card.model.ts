export interface DashboardCard {
    id: string;
    cols: number;
    rows: number;
    title: string;
    description: string;
    icon: string;
    displayRoles: Array<string>;
    actionDisplay: string; 
    actionLink: string;
    actionQuery: string;
    isNav: boolean; // Should this be a navigation menu item
  }

  export const DASHBOARD_CARDS: DashboardCard[] = [
  {
    id: 'llc-formation',
    cols: 2,
    rows: 1,
    title: 'LLC Formation',              // You might change these numbers to strings if necessary.
    description: 'Quickly provide basic information and we will form your LLC for you!',        // For example: "LLC Formation Product"
    icon: 'domain',        // Angular Material icon for business-related products.
    displayRoles: ['Customer'],
    actionDisplay: 'Get Started',
    actionLink: '/customer/product',
    actionQuery: 'llc-formation',
    isNav: false
  },
  {
    id: 'legal-services',
    cols: 2,
    rows: 1,
    title: 'Legal Consulting Subscription',
    description: 'Legal help from real attorneys for all your business needs!',
    icon: 'gavel',
    displayRoles: ['Customer'],
    actionDisplay: 'Learn More',
    actionLink: '/customer/services',
    actionQuery: 'service=legal-subscription',
    isNav: false
  },
  {
    id: 'messages',
    cols: 1,
    rows: 1,
    title: 'Messages',
    description: 'Send, receive, and view messages',
    icon: 'message',
    displayRoles: ['Customer'],
    actionDisplay: 'View Messages',
    actionLink: '/messages',
    actionQuery: 'ref=dashboard',
    isNav: true
  },
  {
    id: 'orders',
    cols: 1,
    rows: 1,
    title: 'Orders',
    description: 'View past and pending orders',
    icon: 'shopping_cart',
    displayRoles: ['Customer'],
    actionDisplay: 'View Orders',
    actionLink: '/orders',
    actionQuery: 'ref=dashboard',
    isNav: true
  },
  {
    id: 'customers',
    cols: 2,
    rows: 1,
    title: 'Customers',
    description: 'All customers',
    icon: 'person',
    displayRoles: ['Tenant', 'Admin'],
    actionDisplay: 'View Customers',
    actionLink: '/tenant/customers',
    actionQuery: '',
    isNav: true
  },
  {
    id: 'documents',
    cols: 1,
    rows: 1,
    title: 'Documents',
    description: 'View all your documents here',
    icon: 'folder',
    displayRoles: ['Customer'],
    actionDisplay: 'View Documents',
    actionLink: '/customer/documents',
    actionQuery: 'ref=dashboard',
    isNav: true
  },
];