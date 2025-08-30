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
    id: 'llc-essentials',
    cols: 1,
    rows: 1,
    title: 'New Business Essentials Package',
    description: 'Solid Legal Ground for a Simple Startup. Perfect for solopreneurs and small teams looking for fast, affordable business formation.',
    icon: 'business_center',
    displayRoles: ['Customer'],
    actionDisplay: 'Starting at $999',
    actionLink: '/customer/product',
    actionQuery: 'llc-essentials',
    isNav: false
  },
  {
    id: 'llc-complete',
    cols: 1,
    rows: 1,
    title: 'New Business Complete Package',
    description: 'Everything in Essentials—With Added Structure, Licensing, and Legal Precision. Get up and running fast with customized documents.',
    icon: 'verified_user',
    displayRoles: ['Customer'],
    actionDisplay: 'Starting at $1,299',
    actionLink: '/customer/product',
    actionQuery: 'llc-complete',
    isNav: false
  },
  {
    id: 'llc-executive',
    cols: 1,
    rows: 1,
    title: 'New Business Executive Package',
    description: 'Our Most Comprehensive Package—With Built-In Compliance & Legal Strategy. White-glove legal setup and full first-year compliance.',
    icon: 'star',
    displayRoles: ['Customer'],
    actionDisplay: 'Starting at $1,799',
    actionLink: '/customer/product',
    actionQuery: 'llc-executive',
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
    id: 'tenant-messages-inbox',
    cols: 2,
    rows: 1,
    title: 'Messages Inbox',
    description: 'View all customer messages and conversations',
    icon: 'inbox',
    displayRoles: ['Tenant', 'Admin'],
    actionDisplay: 'View Inbox',
    actionLink: '/tenant/messages-inbox',
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