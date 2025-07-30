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
  
  // Make validator available as component property
  businessNameValidator = businessNameValidator();
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {
    this.route.queryParamMap
      .subscribe((p: any) => {
        const params = p['params'];
        console.log("The params: " + params['query']);
        this.selectedForm = params['query'] ? params.query : "";
        if (this.selectedForm) { this.loadForm(this.selectedForm); }
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
      llcNameField.asyncValidators = {
        businessName: businessNameValidator()
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

  // Handle form submission.
  onSubmit() {
    if (this.form.valid) {
      console.log('Form Submitted', this.model);
      alert('Form Submitted!\n' + JSON.stringify(this.model, null, 2));
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
}
