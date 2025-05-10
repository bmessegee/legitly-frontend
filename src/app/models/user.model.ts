
// Define an interface for the user object.
export class User {
    //id: number;
    sub?: string;
    givenName?: string;
    familyName?: string;
    email?: string;
    phoneNumber?: string;
    //username: string;
    //token: string;
    // If the user is part of a tenant organization.
    tenantId?: number;
    // Roles available for tenant users. They can be 'admin' and/or 'processor'.
    tenantRoles?: Array<'admin' | 'processor'>;
    // If the user is associated with a customer.
    customerId?: number;
    // Roles available for customer users. They can be 'super' and/or 'regular'.
    customerRoles?: Array<'super' | 'regular'>;
  }
