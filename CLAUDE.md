# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Angular Commands
```bash
# Install dependencies
npm install

# Start development server (http://localhost:4200)
ng serve

# Production build
ng build

# Development build with watch mode
ng build --watch --configuration development

# Run unit tests with Karma
ng test

# Generate new component
ng generate component component-name
```

## Architecture Overview

This is an Angular 19 frontend application for a business registration and compliance platform with role-based access control.

### Authentication & Authorization
- **OIDC Integration**: Uses `angular-auth-oidc-client` for OpenID Connect authentication
- **AWS Cognito**: Backend authentication via AWS Cognito User Pool (configured in `auth.config.ts`)
- **Role-Based Access**: Three primary user types with route guards:
  - `Customer`: End users purchasing services
  - `Tenant`: Business owners/operators managing customers
  - `Admin`: System administrators with full access
- **Auth Guard**: Route protection based on user roles defined in route data

### Key Services Architecture

#### ApiService (src/app/services/api.service.ts)
- Centralized HTTP client wrapper for RESTful API calls
- Base URL: `https://sehplat8x2.execute-api.us-east-1.amazonaws.com/prod/`
- Automatic Bearer token injection via AuthService
- Built-in retry logic (2 attempts) and error handling
- Methods: `get<T>()`, `post<T>()`, `put<T>()`, `delete<T>()`

#### AuthService (src/app/services/auth.service.ts)
- Manages OIDC authentication state and user context
- Extracts Cognito groups from JWT claims
- Role checking methods: `isTenantUser()`, `isCustomerUser()`, `isTenantAdmin()`
- Reactive user state via BehaviorSubjects

### Form Architecture
- **NGX Formly**: Dynamic form generation with Material Design
- **Custom Field Types**: File upload field component
- **Custom Wrappers**: Panel wrapper for form organization
- **Form Validation**: Business name validator (currently commented out)

### Component Structure
```
src/app/components/
├── common/           # Shared components across user types
│   ├── cart/         # Shopping cart functionality
│   ├── documents/    # Document management
│   ├── messages/     # Messaging system
│   └── orders/       # Order management
├── customer/         # Customer-specific components
│   ├── checkout/     # Payment processing
│   └── product/      # Product catalog
└── tenant/           # Tenant/admin components
    ├── customers/    # Customer management
    ├── form-builder/ # Dynamic form creation
    └── messages-inbox/ # Message management
```

### Key Models
- **User Model**: Central user representation with role information
- **Customer Model**: Customer entity with tenant relationships
- **Order Model**: Business service orders
- **Message Model**: Communication system entities
- **Document Model**: File management entities

### Routing Strategy
- Role-based route protection using `AuthGuard`
- Route data specifies required roles: `data: { roles: ['Customer', 'Tenant'] }`
- Fallback routes commented out (defaults to login)

### Testing Configuration
- **Karma + Jasmine**: Unit testing framework
- **Test Files**: Co-located `.spec.ts` files alongside components
- **TypeScript Config**: Separate `tsconfig.spec.json` for test configuration
- Component-level test coverage across all major features

### Styling
- **Angular Material**: Primary UI component library
- **SCSS**: Stylesheet preprocessor
- **Component Styles**: Co-located SCSS files with components
- **Global Styles**: `src/styles.scss` for application-wide styles

### Development Environment
- **Angular CLI**: v19.2.1 for project scaffolding and builds
- **TypeScript**: Strict mode enabled with comprehensive compiler options
- **Build Optimization**: Production builds with tree-shaking and minification
- **Bundle Budgets**: Initial bundle limit 1MB, component styles 8KB max