import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { FormlyMatDatepickerModule } from '@ngx-formly/material/datepicker';
import { inject } from '@angular/core';
import { ProductForm } from '../../../models/product-form';

@Component({
  selector: 'app-readonly-form-viewer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    FormlyModule,
    FormlyMaterialModule,
    FormlyMatDatepickerModule
  ],
  templateUrl: './readonly-form-viewer.component.html',
  styleUrl: './readonly-form-viewer.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ReadonlyFormViewerComponent implements OnInit {
  dialogRef = inject(MatDialogRef<ReadonlyFormViewerComponent>);
  data = inject(MAT_DIALOG_DATA);

  orderItem: any;
  form = new FormGroup({});
  model: any = {};
  fields: FormlyFieldConfig[] = [];

  ngOnInit() {
    this.orderItem = this.data.orderItem;
   
    
    // Load the form configuration and make it readonly
    this.loadFormConfiguration();
    this.model = this.orderItem?.FormData ? { ...this.orderItem.FormData } : {};

    // Add delay and patch form values (similar to product component)
    setTimeout(() => {
      if (this.model && Object.keys(this.model).length > 0) {
        this.form.patchValue(this.model);
      }
    }, 1000);
  }

  private loadFormConfiguration() {
    try {
      const formConfig = new ProductForm().getForm(this.orderItem.FormType);
      if (formConfig) {
        
        // If this is a package that references another form, load that form's fields
        let fieldsToUse = formConfig.fields;
        if ((formConfig as any).formType) {
          const referencedForm = new ProductForm().getForm((formConfig as any).formType);
          if (referencedForm && Array.isArray(referencedForm.fields)) {
            fieldsToUse = referencedForm.fields;
          }
        }
        
        if (Array.isArray(fieldsToUse)) {
          // Make all fields readonly by cloning and modifying them
          this.fields = this.makeFieldsReadonly(fieldsToUse);
        }
      }
    } catch (error) {
      console.error('Error loading form configuration:', error);
    }
  }

  private makeFieldsReadonly(fields: FormlyFieldConfig[]): FormlyFieldConfig[] {
    return fields.map(field => this.makeFieldReadonly({ ...field }));
  }

  private makeFieldReadonly(field: FormlyFieldConfig): FormlyFieldConfig {
    // Clone the field to avoid modifying the original
    const readonlyField = { ...field };
    
    // Set readonly properties
    if (!readonlyField.props) {
      readonlyField.props = {};
    }
    
    readonlyField.props.readonly = true;
    readonlyField.props.disabled = true;
    
    // Remove hints and descriptions
    readonlyField.props.description = undefined;
    readonlyField.props['hint'] = undefined;
    
    // Remove validation and hide validation messages
    readonlyField.validation = undefined;
    readonlyField.validators = undefined;
    readonlyField.asyncValidators = undefined;
    
    // Add CSS class for styling
    if (!readonlyField.className) {
      readonlyField.className = '';
    }
    readonlyField.className += ' readonly-field';
    
    // Recursively handle field groups
    if (field.fieldGroup) {
      readonlyField.fieldGroup = this.makeFieldsReadonly(field.fieldGroup);
    }
    
    return readonlyField;
  }


  close() {
    this.dialogRef.close();
  }
}