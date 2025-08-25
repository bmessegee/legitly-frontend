import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ProductForm } from '../../../models/product-form';
import { FormlyMatDatepickerModule }from '@ngx-formly/material/datepicker';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { businessNameValidator } from '../../../validators/business-name.validator';
import { AuthService } from '../../../services/auth.service';
import { CustomerService } from '../../../services/customer.service';

@Component({
  selector: 'app-product',
  imports: [
    NgIf,
    FormlyMaterialModule,
    FormlyModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyMatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnDestroy {
  formConfig: any;
  form = new FormGroup({});
  model: any = {};
  // Holds the current form definition as an array of Formly fields.
  fields: FormlyFieldConfig[] = [];

  selectedForm = "";
  currentOrder: Order | null = null;
  autoSaveTimeoutId: any = null;
  hasFormChanged = false;
  isCreatingOrder = false;
  
  // Make validator available as component property
  businessNameValidator = businessNameValidator();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private customerService: CustomerService
  ) {
    this.route.queryParamMap
      .subscribe((p: any) => {
        const params = p['params'];
        console.log("The params: " + params['query']);
        this.selectedForm = params['query'] ? params.query : "";
        
        // Check for orderId parameter to load existing order
        const orderId = params['orderId'];
        if (orderId) {
          this.loadOrderData(orderId);
        } else if (this.selectedForm) { 
          console.log('Loading form for:', this.selectedForm);
          this.loadForm(this.selectedForm);
          // Check for existing in-progress order for this product after a short delay
          // to ensure authentication is fully loaded
          setTimeout(() => {
            console.log('Checking for existing order for form:', this.selectedForm);
            this.checkForExistingOrder();
          }, 1000);
        }
      }
      );
  }

  loadForm(form: string) {
    try {
      this.formConfig = new ProductForm().getForm(form);
      //const importedFields = JSON.parse(json);
      if (Array.isArray(this.formConfig.fields)) {
        this.fields = this.formConfig.fields;
        // Add async validator to LLC name field
        this.addBusinessNameValidator();
        // Set up form change detection for auto-save
        this.setupFormChangeDetection();
      } else {
        alert('Invalid form definition JSON. Expected an array of fields.');
      }
    } catch (e) {
      alert('Error parsing JSON: ' + e);
    }
  }

  private addBusinessNameValidator() {
    // Find the LLC name field and add the async validator
    const findField = (fields: any[]): any => {
      for (const field of fields) {
        if (field.key === 'llcName') {
          return field;
        }
        if (field.fieldGroup) {
          const found = findField(field.fieldGroup);
          if (found) return found;
        }
      }
      return null;
    };

    const llcNameField = findField(this.fields);
    if (llcNameField) {
      
      // Revert to original working approach
      llcNameField.asyncValidators = {
        //businessName: businessNameValidator()
      };
      
      // Add validation messages
      llcNameField.validation = {
        messages: {
          businessNameTaken: (error: any, field: any) => 
            error?.message || 'This business name is already taken. Please choose a different name.',
          invalidLLCName: (error: any, field: any) => 
            error?.message || 'LLC name must contain "Limited Liability Company", "Limited Liability Co.", "L.L.C.", or "LLC"',
          businessNameCheckFailed: (error: any, field: any) => 
            error?.message || 'Unable to verify name availability. Please try again.'
        }
      };
      
    }
  }

  private setupFormChangeDetection() {
    // Watch for form value changes to trigger auto-save
    this.form.valueChanges.subscribe(() => {
      this.hasFormChanged = true;
      this.scheduleAutoSave();
    });
  }

  private scheduleAutoSave() {
    // Clear existing timeout
    if (this.autoSaveTimeoutId) {
      clearTimeout(this.autoSaveTimeoutId);
    }

    // Schedule auto-save after 2 seconds of inactivity
    this.autoSaveTimeoutId = setTimeout(() => {
      if (this.hasFormChanged && this.form.valid && Object.keys(this.model).length > 0) {
        console.log('Auto-save triggered, current order exists:', !!this.currentOrder);
        this.autoSaveOrder();
      }
    }, 2000);
  }

  private autoSaveOrder() {
    if (!this.authService.isAuthenticated() || !this.authService.bearerToken) {
      console.log('Auto-save skipped: Not authenticated or no token available');
      return; // Don't auto-save if not authenticated or no token
    }

    if (!this.currentOrder) {
      // Create new order if none exists
      this.createDraftOrder();
    } else if (this.currentOrder.Status === OrderStatus.Created) {
      // Update existing draft order
      this.updateDraftOrder();
    }

    this.hasFormChanged = false;
  }

  private createDraftOrder() {
    const currentUser = this.authService.currentUser;
    if (!currentUser) return;

    const customer = this.customerService.getCurrentUserAsCustomer();
    if (!customer) return;

    // Prevent multiple simultaneous order creations
    if (this.isCreatingOrder) return;
    this.isCreatingOrder = true;

    this.currentOrder = this.orderService.createOrderFromForm(
      this.model,
      this.selectedForm,
      this.selectedForm || 'llc-formation',
      this.formConfig?.title || 'Form Submission',
      this.formConfig?.cost || 0,
      customer.CustomerId
    );

    // Set status to Created for draft
    this.currentOrder.Status = OrderStatus.Created;
    this.currentOrder.DisplayName = this.generateFormTitle();

    this.orderService.createOrder(this.currentOrder).subscribe({
      next: (createdOrder) => {
        this.currentOrder = createdOrder;
        this.isCreatingOrder = false;
        console.log('Draft order created:', createdOrder.OrderId);
      },
      error: (error) => {
        console.error('Error creating draft order:', error);
        this.isCreatingOrder = false;
        this.currentOrder = null;
      }
    });
  }

  private updateDraftOrder() {
    if (!this.currentOrder) return;

    this.currentOrder = this.orderService.updateOrderFormData(
      this.currentOrder,
      this.model,
      this.selectedForm
    );

    this.orderService.updateOrder(this.currentOrder).subscribe({
      next: (updatedOrder) => {
        this.currentOrder = updatedOrder;
        console.log('Draft order updated:', updatedOrder.OrderId);
      },
      error: (error) => {
        console.error('Error updating draft order:', error);
      }
    });
  }

  private checkForExistingOrder() {
    console.log('checkForExistingOrder called with selectedForm:', this.selectedForm);
    
    if (!this.authService.isAuthenticated() || !this.authService.bearerToken) {
      console.log('Skipping order check: Not authenticated or no token available');
      return;
    }

    const customer = this.customerService.getCurrentUserAsCustomer();
    if (!customer) {
      console.log('Skipping order check: No customer available');
      return;
    }

    console.log('Fetching orders for customer:', customer.CustomerId);

    // Look for existing in-progress order for this product
    this.orderService.getOrdersForCustomer(customer).subscribe({
      next: (orders) => {
        console.log('Retrieved orders:', orders.length, 'orders');
        console.log('Looking for orders with Status Created and FormType:', this.selectedForm);
        
        const inProgressOrder = orders.find(order => 
          order.Status === OrderStatus.Created && 
          order.OrderItems.some(item => item.FormType === this.selectedForm)
        );

        console.log('Found in-progress order:', inProgressOrder ? inProgressOrder.OrderId : 'none');

        if (inProgressOrder) {
          this.currentOrder = inProgressOrder;
          this.loadOrderIntoForm(inProgressOrder);
          this.snackBar.open('Loaded your in-progress form', 'Dismiss', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error checking for existing orders:', error);
        // Don't show error to user for this background check
      }
    });
  }

  // Handle checkout - submit order and add to cart
  onCheckout() {
    if (this.form.valid) {
      console.log('Form Submitted', this.model);
      console.log('Current order exists:', !!this.currentOrder);
      console.log('Is creating order:', this.isCreatingOrder);
      
      if (!this.formConfig) {
        this.snackBar.open('No product configuration available', 'Close', { duration: 3000 });
        return;
      }

      // If we're currently creating an order, wait for it to complete
      if (this.isCreatingOrder) {
        console.log('Waiting for order creation to complete...');
        // Wait a bit and try again
        setTimeout(() => this.onCheckout(), 500);
        return;
      }

      if (this.currentOrder && this.currentOrder.OrderId) {
        // Update existing order and mark as submitted
        console.log('Updating existing order:', this.currentOrder.OrderId);
        this.currentOrder = this.orderService.updateOrderFormData(
          this.currentOrder, 
          this.model, 
          this.selectedForm
        );
        
        // Mark order as submitted
        this.currentOrder.Status = OrderStatus.Submitted;
        
        this.orderService.updateOrder(this.currentOrder).subscribe({
          next: (updatedOrder) => {
            this.currentOrder = updatedOrder;
            console.log('Order updated successfully:', updatedOrder.OrderId, 'Status:', updatedOrder.Status);
            
            // Add order to cart
            const success = this.cartService.addOrderToCart(updatedOrder);
            
            if (success) {
              this.snackBar.open(
                `Order "${updatedOrder.DisplayName || updatedOrder.OrderId}" added to cart!`,
                'View Cart',
                {
                  duration: 3000,
                  horizontalPosition: 'right',
                  verticalPosition: 'top'
                }
              );
              // Redirect to cart
              this.router.navigate(['/cart']);
            } else {
              this.snackBar.open('Order already in cart', 'View Cart', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top'
              }).onAction().subscribe(() => {
                this.router.navigate(['/cart']);
              });
            }
          },
          error: (error) => {
            console.error('Error submitting order:', error);
            this.snackBar.open('Error submitting order', 'Close', { duration: 3000 });
          }
        });
      } else {
        // Create and submit new order directly  
        console.log('Creating new order for submission');
        const currentUser = this.authService.currentUser;
        const customer = this.customerService.getCurrentUserAsCustomer();
        
        if (!currentUser || !customer) {
          this.snackBar.open('Authentication required', 'Close', { duration: 3000 });
          return;
        }

        const newOrder = this.orderService.createOrderFromForm(
          this.model,
          this.selectedForm,
          this.selectedForm || 'llc-formation',
          this.formConfig?.title || 'Form Submission',
          this.formConfig?.cost || 0,
          customer.CustomerId
        );

        // Mark as submitted
        newOrder.Status = OrderStatus.Submitted;
        newOrder.DisplayName = this.generateFormTitle();

        this.orderService.createOrder(newOrder).subscribe({
          next: (createdOrder) => {
            this.currentOrder = createdOrder;
            console.log('Order created successfully:', createdOrder.OrderId, 'Status:', createdOrder.Status);
            
            // Add order to cart
            const success = this.cartService.addOrderToCart(createdOrder);
            
            if (success) {
              this.snackBar.open(
                `Order "${createdOrder.DisplayName || createdOrder.OrderId}" added to cart!`,
                'View Cart',
                {
                  duration: 3000,
                  horizontalPosition: 'right',
                  verticalPosition: 'top'
                }
              );
              // Redirect to cart
              this.router.navigate(['/cart']);
            } else {
              this.snackBar.open('Order already in cart', 'View Cart', {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top'
              }).onAction().subscribe(() => {
                this.router.navigate(['/cart']);
              });
            }
          },
          error: (error) => {
            console.error('Error creating order:', error);
            this.snackBar.open('Error submitting order', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  // Add to cart functionality
  addToCart() {
    if (!this.formConfig) {
      this.snackBar.open('No product selected', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      return;
    }

    const product = {
      ProductId: this.selectedForm || 'llc-formation',
      ProductName: this.formConfig.title,
      Description: this.formConfig.instructions,
      Price: this.formConfig.cost
    };

    this.cartService.addToCart(product);
    
    this.snackBar.open(`${product.ProductName} added to cart!`, 'View Cart', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    }).onAction().subscribe(() => {
      this.router.navigate(['/cart']);
    });
  }

  // Go to cart
  goToCart() {
    this.router.navigate(['/cart']);
  }

  loadOrderData(orderId: string) {
    // First try to get from cart service (local storage)
    const localOrder = this.cartService.getOrder(orderId);
    if (localOrder) {
      this.currentOrder = localOrder;
      this.loadOrderIntoForm(localOrder);
      return;
    }

    // If not found locally, fetch from server
    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.currentOrder = order;
        this.loadOrderIntoForm(order);
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.snackBar.open('Error loading order data', 'Close', { duration: 3000 });
      }
    });
  }

  private loadOrderIntoForm(order: Order) {
    if (order.OrderItems.length > 0) {
      const firstItem = order.OrderItems[0];
      
      // Set the form type and load the form structure
      if (firstItem.FormType) {
        this.selectedForm = firstItem.FormType;
        this.loadForm(this.selectedForm);
        
        // Populate the form with saved data
        if (firstItem.FormData) {
          setTimeout(() => {
            this.model = { ...firstItem.FormData };
            // Trigger form update if form exists
            if (this.form && this.formConfig) {
              this.form.patchValue(this.model);
            }
          }, 250);
        }
      }
    }
  }

  private generateFormTitle(): string {
    if (this.selectedForm === 'llc-formation' && this.model?.companyInformation?.llcName) {
      return `LLC Formation for ${this.model.companyInformation.llcName}`;
    }
    return this.formConfig?.title || 'Form Submission';
  }

  ngOnDestroy() {
    // Clean up auto-save timeout
    if (this.autoSaveTimeoutId) {
      clearTimeout(this.autoSaveTimeoutId);
    }
  }
}
