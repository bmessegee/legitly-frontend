import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { ProductForm } from '../../../models/product-form';
import { FormlyMatDatepickerModule }from '@ngx-formly/material/datepicker';

@Component({
  selector: 'app-product',
  imports: [
    JsonPipe,
    NgIf,
    FormlyMaterialModule,
    FormlyModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyMatDatepickerModule
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
  constructor(private route: ActivatedRoute) {
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
      } else {
        alert('Invalid form definition JSON. Expected an array of fields.');
      }
    } catch (e) {
      alert('Error parsing JSON: ' + e);
    }
  }

  // Handle form submission.
  onSubmit() {
    if (this.form.valid) {
      console.log('Form Submitted', this.model);
      alert('Form Submitted!\n' + JSON.stringify(this.model, null, 2));
    }
  }
}
