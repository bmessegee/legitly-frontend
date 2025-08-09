import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe, JsonPipe, NgFor, NgIf } from '@angular/common';
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
import { Order } from '../../../models/order.model';
import { businessNameValidator } from '../../../validators/business-name.validator';

@Component({
  selector: 'app-product',
  imports: [
    JsonPipe,
    NgIf,
    FormlyMaterialModule,
    FormlyModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyMatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    DecimalPipe
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
  formConfig: any;
  form = new FormGroup({});
  model: any = {};
  // Holds the current form definition as an array of Formly fields.
  fields: FormlyFieldConfig[] = [];

  selectedForm = "";
  currentOrder: Order | null = null;
  
  // Make validator available as component property
  businessNameValidator = businessNameValidator();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private orderService: OrderService,
    private snackBar: MatSnackBar
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
          this.loadForm(this.selectedForm); 
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

  // Handle form submission - now adds to cart instead of creating order directly
  onSubmit() {
    if (this.form.valid) {
      console.log('Form Submitted', this.model);
      
      if (!this.formConfig) {
        this.snackBar.open('No product configuration available', 'Close', { duration: 3000 });
        return;
      }

      if (this.currentOrder) {
        // Update existing order item (when editing from order)
        this.currentOrder = this.orderService.updateOrderFormData(
          this.currentOrder, 
          this.model, 
          this.selectedForm
        );
        
        this.orderService.updateOrder(this.currentOrder).subscribe({
          next: (updatedOrder) => {
            this.currentOrder = updatedOrder;
            this.snackBar.open('Order updated successfully!', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error updating order:', error);
            this.snackBar.open('Error updating order', 'Close', { duration: 3000 });
          }
        });
      } else {
        // Add form submission to cart
        const formData = {
          ProductId: this.selectedForm || 'llc-formation',
          ProductName: this.formConfig.title,
          Description: this.formConfig.instructions,
          Price: this.formConfig.cost,
          FormData: this.model,
          FormType: this.selectedForm,
          FormTitle: this.generateFormTitle()
        };

        this.cartService.addFormToCart(formData).subscribe({
          next: (cartItem) => {
            this.snackBar.open('Form added to cart successfully!', 'View Cart', { 
              duration: 4000,
              horizontalPosition: 'right',
              verticalPosition: 'top'
            }).onAction().subscribe(() => {
              this.router.navigate(['/cart']);
            });
          },
          error: (error) => {
            console.error('Error adding form to cart:', error);
            this.snackBar.open('Error adding to cart', 'Close', { duration: 3000 });
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
            // Trigger form update
            this.form.patchValue(this.model);
          }, 100);
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
}
