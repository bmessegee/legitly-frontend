import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
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
    MatDialogModule,
    FormlyModule,
    FormlyMaterialModule
  ],
  templateUrl: './readonly-form-viewer.component.html',
  styleUrl: './readonly-form-viewer.component.scss'
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
    this.model = this.orderItem?.FormData ? { ...this.orderItem.FormData } : {};
    
    // Load the form configuration and make it readonly
    this.loadFormConfiguration();
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
    
    // Handle different field types that might need special treatment
    if (field.type === 'checkbox') {
      readonlyField.props.disabled = true;
    }
    
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