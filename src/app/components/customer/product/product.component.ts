import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf, DecimalPipe, CommonModule } from '@angular/common';
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
    NgFor,
    DecimalPipe,
    CommonModule,
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
  showComparison = false;
  llcPackages: any[] = [];
  
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
          // Initialize LLC packages for comparison
          this.initializeLLCPackages();
          // Check for existing in-progress order for this product after a short delay
          // to ensure authentication is fully loaded
          setTimeout(() => {
            console.log('Checking for existing order for form:', this.selectedForm);
            this.checkForExistingOrder();
          }, 100);
        }
      }
      );
  }

  loadForm(form: string) {
    try {
      this.formConfig = new ProductForm().getForm(form);
      
      if (!this.formConfig) {
        this.snackBar.open('Form configuration not found', 'Close', { duration: 3000 });
        return;
      }

      // If this is a package that references another form, load that form's fields
      let fieldsToUse = this.formConfig.fields;
      if (this.formConfig.formType) {
        const referencedForm = new ProductForm().getForm(this.formConfig.formType);
        if (referencedForm && Array.isArray(referencedForm.fields)) {
          fieldsToUse = referencedForm.fields;
        }
      }
      
      if (Array.isArray(fieldsToUse)) {
        this.fields = fieldsToUse;
        // Add async validator to LLC name field
        this.addBusinessNameValidator();
        // Set up form change detection for auto-save
        this.setupFormChangeDetection();
      } else {
        this.snackBar.open('Invalid form definition. Expected an array of fields.', 'Close', { duration: 3000 });
      }
    } catch (e) {
      console.error('Error loading form:', e);
      this.snackBar.open('Error loading form: ' + e, 'Close', { duration: 3000 });
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

    // First check if there's a current cart order
    const cartOrder = this.cartService.getCurrentOrder();
    if (cartOrder) {
      console.log('Found existing cart order:', cartOrder.OrderId);
      
      // Check if cart order has an item for this form type
      const existingItem = cartOrder.OrderItems?.find(item => item.FormType === this.selectedForm);
      if (existingItem) {
        console.log('Found existing form in cart order:', existingItem.FormType);
        this.currentOrder = cartOrder;
        this.loadOrderIntoForm(cartOrder);
        this.snackBar.open('Loaded your in-progress form from cart', 'Dismiss', { duration: 3000 });
        return;
      }
    }

    console.log('Fetching orders for customer:', customer.CustomerId);

    // Look for existing draft order for this specific product (not in cart)
    this.orderService.getOrdersForCustomer(customer).subscribe({
      next: (orders) => {
        console.log('Retrieved orders:', orders.length, 'orders');
        console.log('Looking for draft orders with Status Created and FormType:', this.selectedForm);
        
        // Find draft order that's not the current cart order
        const inProgressOrder = orders.find(order => 
          order.Status === OrderStatus.Created && 
          order.OrderItems.some(item => item.FormType === this.selectedForm) &&
          (!cartOrder || order.OrderId !== cartOrder.OrderId)
        );

        console.log('Found in-progress draft order:', inProgressOrder ? inProgressOrder.OrderId : 'none');

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
            
            // Add submitted package to cart
            this.addPackageToCart(updatedOrder);
            
            this.snackBar.open(
              `Order "${updatedOrder.DisplayName || updatedOrder.OrderId}" added to cart!`,
                'View Cart',
                {
                  duration: 3000,
                  horizontalPosition: 'right',
                  verticalPosition: 'top'
                }
              ).onAction().subscribe(() => {
                this.router.navigate(['/cart']);
              });
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
            
            // Add submitted package to cart
            this.addPackageToCart(createdOrder);
            
            this.snackBar.open(
              `Order "${createdOrder.DisplayName || createdOrder.OrderId}" added to cart!`,
              'View Cart',
              {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top'
              }
            ).onAction().subscribe(() => {
              this.router.navigate(['/cart']);
            });
          },
          error: (error) => {
            console.error('Error creating order:', error);
            this.snackBar.open('Error submitting order', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  // Add to cart functionality - for ala carte services only
  addToCart() {
    if (!this.formConfig) {
      this.snackBar.open('No product selected', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      return;
    }

    // Extract quantity from form data if available (for services like attorney consultation)
    let quantity = 1;
    if (this.model && this.model.consultationDetails && this.model.consultationDetails.estimatedHours) {
      const hours = this.model.consultationDetails.estimatedHours;
      if (hours !== 'custom' && !isNaN(Number(hours))) {
        quantity = Number(hours);
      }
    }

    const product = {
      ProductId: this.selectedForm || 'llc-formation',
      ProductName: this.formConfig.title,
      Description: this.formConfig.instructions,
      Price: this.formConfig.cost,
      Quantity: quantity
    };

    this.cartService.addToCart(product).subscribe({
      next: () => {
        this.snackBar.open(`${product.ProductName} added to cart!`, 'View Cart', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top'
        }).onAction().subscribe(() => {
          this.router.navigate(['/cart']);
        });
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.snackBar.open('Error adding to cart', 'Close', { duration: 3000 });
      }
    });
  }

  // Helper to determine if current form is a package (has form fields) or ala carte service
  public isPackage(): boolean {
    // Check if this is a package (requires complex form completion and checkout flow)
    // vs ala carte service (can be added directly to cart)
    if (!this.formConfig) return false;
    
    // Ala carte services are those with tier: "addon" - they can be added directly to cart
    return this.formConfig.tier !== "addon";
  }

  // Add a submitted package order to cart
  private addPackageToCart(order: Order): void {
    if (!order.OrderItems || order.OrderItems.length === 0) {
      console.error('Cannot add order to cart: no order items');
      return;
    }

    // Get the first order item (packages should have one item with form data)
    const orderItem = order.OrderItems[0];
    
    const product = {
      ProductId: orderItem.ProductId,
      ProductName: orderItem.ProductName,
      Description: orderItem.Description,
      Price: orderItem.Price,
      FormData: orderItem.FormData,
      FormType: orderItem.FormType,
      FormTitle: orderItem.FormTitle || order.DisplayName
    };

    this.cartService.addToCart(product).subscribe({
      next: (cartOrder) => {
        console.log('Package added to cart successfully:', cartOrder.OrderId);
      },
      error: (error) => {
        console.error('Error adding package to cart:', error);
      }
    });
  }

  // Go to cart
  goToCart() {
    this.router.navigate(['/cart']);
  }

  loadOrderData(orderId: string) {
    // Check if it's the current cart order
    const currentOrder = this.cartService.getCurrentOrder();
    if (currentOrder && currentOrder.OrderId === orderId) {
      this.currentOrder = currentOrder;
      this.loadOrderIntoForm(currentOrder);
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

  // Calculate dynamic pricing for hourly services
  getServiceCost(): number {
    if (this.selectedForm === 'attorney-time' && this.model?.consultationDetails?.estimatedHours) {
      const hours = parseInt(this.model.consultationDetails.estimatedHours);
      if (!isNaN(hours)) {
        return hours * 350; // $350 per hour
      }
    }
    return this.formConfig?.cost || 0;
  }

  // Check if current service is an add-on service
  isAddonService(): boolean {
    return ['attorney-time', 'registered-agent', 'annual-compliance'].includes(this.selectedForm);
  }

  // Initialize LLC packages for comparison
  initializeLLCPackages() {
    const productForm = new ProductForm();
    this.llcPackages = [
      { id: 'llc-essentials', ...productForm.getForm('llc-essentials') },
      { id: 'llc-complete', ...productForm.getForm('llc-complete') },
      { id: 'llc-executive', ...productForm.getForm('llc-executive') }
    ];
  }

  // Check if current form is an LLC package
  isLLCPackage(): boolean {
    return ['llc-essentials', 'llc-complete', 'llc-executive'].includes(this.selectedForm);
  }

  // Switch to a different package
  switchPackage(packageId: string) {
    if (packageId !== this.selectedForm) {
      console.log('Switching from', this.selectedForm, 'to', packageId);
      this.selectedForm = packageId;
      this.loadForm(packageId);
      this.showComparison = false; // Hide comparison after selection
    }
  }

  ngOnDestroy() {
    // Clean up auto-save timeout
    if (this.autoSaveTimeoutId) {
      clearTimeout(this.autoSaveTimeoutId);
    }
  }
}
