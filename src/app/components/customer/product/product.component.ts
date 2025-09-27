import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf, DecimalPipe, CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ProductForm } from '../../../models/product-form';
import { FormlyMatDatepickerModule }from '@ngx-formly/material/datepicker';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../models/order.model';
import { businessNameValidator } from '../../../validators/business-name.validator';
import { AuthService } from '../../../services/auth.service';
import { CustomerService } from '../../../services/customer.service';
import { ApiService } from '../../../services/api.service';
import { filter, take, debounceTime, distinctUntilChanged, timeout, catchError } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

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
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule
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
  currentOrderItem: any = null; // Track the specific order item for this product
  currentOrderItemIndex: number = -1; // Track the index of the current order item in the order
  autoSaveTimeoutId: any = null;
  hasFormChanged = false;
  isCreatingOrder = false;
  isLoadingOrder = false; // Add loading state
  showComparison = false;
  llcPackages: any[] = [];
  
  // Business name lookup properties
  businessNameLookup = '';
  isCheckingName = false;
  nameCheckResult: {isAvailable: boolean, businessName: string, existingBusinesses: number, totalResults: number} | null = null;
  nameCheckError: string | null = null;
  
  // Proper debounce implementation
  private formChangeSubject = new Subject<any>();
  
  // Make validator available as component property
  businessNameValidator = businessNameValidator();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private customerService: CustomerService,
    private apiService: ApiService
  ) {
    this.route.queryParamMap
      .subscribe((p: any) => {
        const params = p['params'];
        console.log("The params: " + params['query']);
        this.selectedForm = params['query'] ? params.query : "";
        
        // Bob 9/14/25 to keep it simple, we will only load data for the active order if any - so the process is the same as coming
        // Directly into the product page - we may support reloading 
        // Check for orderId parameter to load existing order
        const orderId = params['orderId'];
       // if (orderId) {
       //   this.loadOrderData(orderId);
       // } else 
          if (this.selectedForm) { 
          console.log('Loading form for:', this.selectedForm);
          this.loadForm(this.selectedForm);
          // Initialize LLC packages for comparison
          this.initializeLLCPackages();
          // Start the proper loading sequence: customer → orders → form processing
          setTimeout(() => {
            console.log('Starting sequential loading process for form:', this.selectedForm);
            this.initializeWithProperSequence();
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
        // Form change detection will be set up after order loads
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
    console.log('Setting up form change detection with proper debouncing');
    
    // Set up the debounced auto-save stream
    this.formChangeSubject.pipe(
      debounceTime(2000), // Wait 2 seconds after the last emission
      distinctUntilChanged(), // Only emit when the value actually changes
      filter(() => {
        // Only proceed if conditions are met
        const hasData = this.model && Object.keys(this.model).length > 0;
        const shouldAutoSave = this.isPackage(); // Only auto-save packages
        
        console.log('Auto-save filter check:', {
          hasData,
          shouldAutoSave,
          hasFormChanged: this.hasFormChanged
        });
        
        return hasData && shouldAutoSave && this.hasFormChanged;
      })
    ).subscribe({
      next: () => {
        console.log('Auto-save triggered via debounced stream');
        this.autoSaveOrder();
      },
      error: (error) => {
        console.error('Error in auto-save stream:', error);
      }
    });

    // Watch for form value changes and emit to the subject
    this.form.valueChanges.subscribe((formValue) => {
      this.hasFormChanged = true;
      this.model = { ...formValue }; // Update model with current form values
      console.log('Form changed, updating model and emitting to debounce subject', formValue);
      this.formChangeSubject.next(formValue);
    });
  }

  private autoSaveOrder() {
    if (!this.authService.isAuthenticated() || !this.authService.bearerToken) {
      console.log('Auto-save skipped: Not authenticated or no token available');
      return;
    }

    // Only auto-save for package forms (not ala carte services)
    if (!this.isPackage()) {
      console.log('Auto-save skipped: Ala carte service does not auto-save');
      return;
    }

    // Check if user has actually entered any meaningful data
    if (!this.model || Object.keys(this.model).length === 0) {
      console.log('Auto-save skipped: No form data to save');
      return;
    }

    // If no order exists, create one (this will happen when user first starts typing)
    if (!this.currentOrder) {
      console.log('Creating new order for first-time form input');
      this.createOrderForFirstInput();
      return;
    }

    console.log('Auto-saving form data to order:', this.currentOrder.OrderId);
    this.addOrUpdateOrderItem();
    this.hasFormChanged = false;
  }

  private createOrderForFirstInput() {
    // Create order via cart service when user first starts entering data
    this.cartService.createOrGetCartOrder().subscribe({
      next: (newOrder) => {
        console.log('Created new order for first input:', newOrder.OrderId);
        this.currentOrder = newOrder;
        this.currentOrderItem = null; // Will be created in addOrUpdateOrderItem
        // Now save the form data
        this.addOrUpdateOrderItem();
        this.hasFormChanged = false;
      },
      error: (error) => {
        console.error('Error creating order for first input:', error);
      }
    });
  }

  private addOrUpdateOrderItem() {
    if (!this.currentOrder || !this.formConfig) {
      console.error('Cannot add/update order item: missing order or form config');
      return;
    }

    // Create or update the order item
    if (this.currentOrderItem && this.currentOrderItemIndex >= 0) {
      // Update existing item and ensure it's updated in the order's items array
      this.currentOrderItem.FormData = { ...this.model };
      this.currentOrderItem.FormSummary = this.generateFormSummary();
      // For auto-save, keep current validation state - don't override if already valid
      if (this.currentOrderItem.IsValid === undefined) {
        this.currentOrderItem.IsValid = false; // Not valid until explicitly validated
      }
      
      // Ensure the order's items array is updated with the reference
      if (this.currentOrder && this.currentOrder.OrderItems) {
        this.currentOrder.OrderItems[this.currentOrderItemIndex] = this.currentOrderItem;
      }
      console.log('Updating existing order item:', this.currentOrderItem.ProductId);
    } else {
      // Create new item
      const newItem = {
        ProductId: this.selectedForm,
        ProductName: this.formConfig.title,
        Description: this.formConfig.instructions,
        Price: this.formConfig.cost,
        Quantity: 1,
        LineTotal: this.formConfig.cost,
        FormData: { ...this.model },
        FormType: this.selectedForm,
        FormTitle: this.formConfig.title,
        FormSummary: this.generateFormSummary(),
        IsExpandable: true,
        IsValid: false // Initially not valid until form is completed
      };

      // Add to order items
      if (!this.currentOrder.OrderItems) {
        this.currentOrder.OrderItems = [];
      }
      this.currentOrder.OrderItems.push(newItem);
      this.currentOrderItemIndex = this.currentOrder.OrderItems.length - 1; // Track the index of the new item
      this.currentOrderItem = newItem;
      console.log('Created new order item:', newItem.ProductId);
    }

    // Recalculate order total
    this.currentOrder.TotalAmount = this.calculateOrderTotal(this.currentOrder.OrderItems);

    // Save the updated order to backend using OrderService directly
    if (this.currentOrder.OrderId) {
      this.orderService.updateOrder(this.currentOrder).subscribe({
        next: (updatedOrder) => {
          this.currentOrder = updatedOrder;
          console.log('Order item auto-saved successfully');
        },
        error: (error) => {
          console.error('Error auto-saving order item:', error);
        }
      });
    }
  }

  private calculateOrderTotal(orderItems: any[]): number {
    return orderItems.reduce((sum, item) => {
      const price = Number(item.Price) || 0;
      const quantity = Number(item.Quantity) || 0;
      return sum + (price * quantity);
    }, 0);
  }

  private generateFormSummary(): string {
    if (this.selectedForm === 'llc-formation2' && this.model?.companyInformation?.llcName) {
      return `LLC: ${this.model.companyInformation.llcName}`;
    }
    if (this.model && Object.keys(this.model).length > 0) {
      return 'Form data saved';
    }
    return '';
  }


  private initializeWithProperSequence() {
    console.log('Starting proper initialization sequence...');
    
    if (!this.authService.isAuthenticated() || !this.authService.bearerToken) {
      console.log('Skipping initialization: Not authenticated or no token available');
      this.setupFormChangeDetection(); // Still set up form change detection
      return;
    }

    this.isLoadingOrder = true;

    // Step 1: Ensure customer is loaded
    this.ensureCustomerLoaded()
      .then(() => {
        console.log('Customer loading complete, proceeding to orders...');
        // Step 2: Ensure orders are loaded for this customer
        return this.ensureOrdersLoaded();
      })
      .then(() => {
        console.log('Orders loading complete, processing existing order...');
        // Step 3: Process any existing order for this product
        this.processExistingOrder();
      })
      .catch((error) => {
        console.error('Error in initialization sequence:', error);
        // Still try to proceed even if there are errors
        this.processExistingOrder();
      });
  }

  private ensureCustomerLoaded(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Ensuring customer is loaded...');
      
      const customer = this.customerService.getCurrentUserAsCustomer();
      if (customer) {
        console.log('Customer already loaded:', customer.Name);
        resolve();
        return;
      }

      // Customer not loaded, explicitly load it
      console.log('Customer not loaded, loading explicitly...');
      
      // Subscribe to customer observable and trigger loading
      const subscription = this.customerService.customer$.subscribe({
        next: (loadedCustomer) => {
          if (loadedCustomer) {
            console.log('Customer loaded successfully:', loadedCustomer.Name);
            subscription.unsubscribe(); // Clean up subscription
            resolve();
          }
        },
        error: (error) => {
          console.error('Error in customer observable:', error);
          subscription.unsubscribe();
          reject(error);
        }
      });

      // Trigger the loading
      this.customerService.getCustomerForUser();
      
      // Add timeout fallback
      setTimeout(() => {
        const currentCustomer = this.customerService.getCurrentUserAsCustomer();
        if (currentCustomer) {
          console.log('Customer eventually loaded via timeout check');
          subscription.unsubscribe();
          resolve();
        } else {
          console.warn('Customer loading timed out, proceeding anyway');
          subscription.unsubscribe();
          resolve(); // Don't reject, just proceed
        }
      }, 5000);
    });
  }

  private ensureOrdersLoaded(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Ensuring orders are loaded...');
      
      // Check if cart service has orders loaded
      const currentOrder = this.cartService.getCurrentOrder();
      if (currentOrder) {
        console.log('Orders already loaded via cart service');
        resolve();
        return;
      }

      // Orders not loaded, explicitly load them
      console.log('Orders not loaded, loading explicitly via cart service...');
      this.cartService.refreshCart().subscribe({
        next: () => {
          console.log('Cart/orders refreshed successfully');
          resolve();
        },
        error: (error) => {
          console.error('Error refreshing cart/orders:', error);
          // Don't reject here - we can still proceed without existing orders
          resolve();
        }
      });
    });
  }

  private processExistingOrder() {
    console.log('Processing existing order after ensuring all dependencies are loaded...');
    
    // At this point, we know customer and orders are properly loaded
    const activeOrder = this.cartService.getCurrentOrder();
        
    if (activeOrder) {
      console.log('Found existing active order:', activeOrder.OrderId);
      this.currentOrder = activeOrder;

      // Check if this order already has an item for the current product
      const existingItemIndex = activeOrder.OrderItems?.findIndex(item => 
        item.ProductId === this.selectedForm || item.FormType === this.selectedForm
      );

      if (existingItemIndex !== undefined && existingItemIndex >= 0) {
        const existingItem = activeOrder.OrderItems![existingItemIndex];
        console.log('Found existing order item for product:', existingItem.ProductId);
        console.log('Order item data:', existingItem.FormData);
        
        this.currentOrderItemIndex = existingItemIndex;
        this.currentOrderItem = existingItem;
        this.loadOrderItemIntoForm(existingItem);
        this.snackBar.open('Loaded your in-progress form', 'Dismiss', { duration: 3000 });
      } else {
        console.log('No existing item found for this product, will create new item when user starts filling form');
        this.currentOrderItemIndex = -1;
        this.currentOrderItem = null;
      }
    } else {
      console.log('No active order found, will create one when user starts filling form');
      this.currentOrder = null;
      this.currentOrderItem = null;
      this.currentOrderItemIndex = -1;
    }

    this.isLoadingOrder = false;
    
    // Set up auto-save after order processing is complete
    console.log('Setting up form change detection after order processing...');
    this.setupFormChangeDetection();
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

      // Ensure we have an order and the form data is saved
      if (!this.currentOrder) {
        // Create order if it doesn't exist (user didn't trigger auto-save)
        this.createOrderForFirstInput();
        // Wait and try checkout again
        setTimeout(() => this.onCheckout(), 1000);
        return;
      }

      if (this.currentOrder && this.currentOrder.OrderId) {
        // Make sure current form data is saved to the order item
        if (this.hasFormChanged) {
          this.addOrUpdateOrderItem();
        }

        // Mark the current order item as valid since form passed validation
        if (this.currentOrderItem && this.currentOrderItemIndex >= 0) {
          this.currentOrderItem.IsValid = true;
          this.currentOrderItem.FormData = { ...this.model }; // Ensure latest data is saved
          this.currentOrderItem.FormSummary = this.generateFormSummary();
          
          // Ensure the order's items array is updated with the reference
          if (this.currentOrder && this.currentOrder.OrderItems) {
            this.currentOrder.OrderItems[this.currentOrderItemIndex] = this.currentOrderItem;
          }
          
          console.log('Marked order item as valid:', this.currentOrderItem.ProductId);
        }

        // Save the validation update to backend
        this.orderService.updateOrder(this.currentOrder).subscribe({
          next: (updatedOrder) => {
            this.currentOrder = updatedOrder;
            console.log('Order item validation saved to backend');
            
            console.log('Proceeding to checkout with order:', this.currentOrder.OrderId);
            
            // Navigate to checkout - the order is already in the cart via cart service
            this.snackBar.open(
              `${this.formConfig.title} ready for checkout!`,
              'View Cart',
              {
                duration: 3000,
                horizontalPosition: 'right',
                verticalPosition: 'top'
              }
            ).onAction().subscribe(() => {
              this.router.navigate(['/cart']);
            });
            
            // Navigate to cart automatically
            setTimeout(() => {
              this.router.navigate(['/cart']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error saving order item validation:', error);
            // Continue to checkout even if validation update fails
            this.snackBar.open('Form completed successfully!', 'View Cart', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            }).onAction().subscribe(() => {
              this.router.navigate(['/cart']);
            });
          }
        });
      } else {
        this.snackBar.open('Unable to process order. Please try again.', 'Close', { duration: 3000 });
      }
    } else {
      // Form is not valid - show validation errors
      this.snackBar.open('Please complete all required fields before proceeding to checkout.', 'Close', { 
        duration: 4000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      console.log('Checkout blocked: Form is not valid');
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

  private loadOrderItemIntoForm(orderItem: any) {
    // Populate the form with saved data from the order item
    if (orderItem.FormData) {
      setTimeout(() => {
        this.model = { ...orderItem.FormData };
        // Trigger form update if form exists
        if (this.form && this.formConfig) {
          this.form.patchValue(this.model);
        }
        console.log('Loaded form data from order item:', orderItem.ProductId);
      }, 250);
    }
  }

  // Legacy method for backward compatibility - redirects to single item loading
  private loadOrderIntoForm(order: Order) {
    const relevantItemIndex = order.OrderItems?.findIndex(item => 
      item.ProductId === this.selectedForm || item.FormType === this.selectedForm
    );
    
    if (relevantItemIndex !== undefined && relevantItemIndex >= 0) {
      this.currentOrderItemIndex = relevantItemIndex;
      this.currentOrderItem = order.OrderItems![relevantItemIndex];
      this.loadOrderItemIntoForm(this.currentOrderItem);
    } else {
      this.currentOrderItemIndex = -1;
      this.currentOrderItem = null;
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

  // Business name lookup methods
  onBusinessNameLookupChange() {
    // Clear previous results when user types
    this.nameCheckResult = null;
    this.nameCheckError = null;
  }

  checkBusinessName() {
    if (!this.businessNameLookup || this.businessNameLookup.trim().length === 0) {
      return;
    }

    const businessName = this.businessNameLookup.trim();

    this.isCheckingName = true;
    this.nameCheckError = null;
    this.nameCheckResult = null;

    this.apiService.get<{isAvailable: boolean, businessName: string, existingBusinesses: number, totalResults: number}>(`business-name/check?name=${encodeURIComponent(businessName)}`)
      .subscribe({
        next: (response) => {
          this.isCheckingName = false;
          this.nameCheckResult = response;
          this.nameCheckError = null;
        },
        error: (error) => {
          this.isCheckingName = false;
          this.nameCheckResult = null;
          this.nameCheckError = 'Unable to verify name availability. Please check your connection and try again.';
          console.error('Business name check error:', error);
        }
      });
  }


  ngOnDestroy() {
    // Clean up auto-save timeout
    if (this.autoSaveTimeoutId) {
      clearTimeout(this.autoSaveTimeoutId);
    }
    
    // Clean up debounce subject
    if (this.formChangeSubject) {
      this.formChangeSubject.complete();
    }
  }
}
