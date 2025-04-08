import { Component } from '@angular/core';
import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule, FormlyForm } from '@ngx-formly/core';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { FormlyMaterialModule } from '@ngx-formly/material';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [NgFor, NgIf, 
    FormlyMaterialModule,
    DragDropModule,
    FormlyModule, FormsModule, ReactiveFormsModule, DragDropModule, JsonPipe],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.css'
})
export class FormBuilderComponent {
  form = new FormGroup({});
  model: any = {};
  // Holds the current form definition as an array of Formly fields.
  fields: FormlyFieldConfig[] = [];

  // Available control types with a variety of field examples.
  //{"type":"input","templateOptions":{"required":false,"label":"Please enter a value","placeholder":"","focus":false,"disabled":false},"conditionalRendering":"no","key":"input1","isTrigger":null}
  availableControls = [
    { 
      type: 'input', 
      label: 'Input', 
      defaultOptions: { templateOptions: { label: 'Input Field', placeholder: 'Enter text' } }
    },
    { 
      type: 'textarea', 
      label: 'Textarea', 
      defaultOptions: { templateOptions: { label: 'Textarea Field', placeholder: 'Enter text', rows: 5 } }
    },
    { 
      type: 'number', 
      label: 'Number', 
      defaultOptions: { templateOptions: { label: 'Number Field', placeholder: 'Enter number' } }
    },
    { 
      type: 'input', 
      label: 'Email', 
      defaultOptions: { templateOptions: { type: 'email', label: 'Email Field', placeholder: 'Enter email' } }
    },
    { 
      type: 'input', 
      label: 'Password', 
      defaultOptions: { templateOptions: { type: 'password', label: 'Password Field', placeholder: 'Enter password' } }
    },
    { 
      type: 'input', 
      label: 'Date', 
      defaultOptions: { templateOptions: { type: 'date', label: 'Date Field', placeholder: 'Select date' } }
    },
    { 
      type: 'select', 
      label: 'Select', 
      defaultOptions: { templateOptions: { 
        label: 'Select Field', 
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' }
        ]
      } }
    },
    { 
      type: 'radio', 
      label: 'Radio', 
      defaultOptions: { templateOptions: { 
        label: 'Radio Field', 
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' }
        ]
      } }
    },
    { 
      type: 'checkbox', 
      label: 'Checkbox', 
      defaultOptions: { templateOptions: { label: 'Checkbox Field' } }
    },
    { 
      type: 'multicheckbox', 
      label: 'MultiCheckbox', 
      defaultOptions: { templateOptions: { 
        label: 'MultiCheckbox Field', 
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' }
        ]
      } }
    },
    { 
      type: 'slider', 
      label: 'Slider', 
      defaultOptions: { templateOptions: { label: 'Slider Field', min: 0, max: 100 } }
    },
    { 
      type: 'toggle', 
      label: 'Toggle', 
      defaultOptions: { templateOptions: { label: 'Toggle Field' } }
    },
    { 
      type: 'rating', 
      label: 'Rating', 
      defaultOptions: { templateOptions: { label: 'Rating Field', max: 5 } }
    },
    { 
      type: 'autocomplete', 
      label: 'Autocomplete', 
      defaultOptions: { templateOptions: { 
        label: 'Autocomplete Field', 
        placeholder: 'Start typing',
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' }
        ]
      } }
    },
  ];

  // Available layout types to create containers for nesting fields.
  availableLayouts = [
    { 
      type: 'fieldGroup', 
      label: 'Field Group', 
      defaultOptions: { fieldGroup: [] }
    },
    { 
      type: 'panel', 
      label: 'Panel Layout', 
      defaultOptions: { wrappers: ['panel'], fieldGroup: [] } 
    },
    { 
      type: 'accordion', 
      label: 'Accordion Layout', 
      defaultOptions: { wrappers: ['accordion'], fieldGroup: [] } 
    },
    // Extend with additional layouts (e.g., tabs, stepper) if desired.
  ];

  // Add a new control field to the form definition.
  addControlField(fieldType: string) {
    const control = this.availableControls.find(ctrl => ctrl.type === fieldType);
    if (control) {
      const newField: FormlyFieldConfig = {
        key: `field_${this.fields.length + 1}`,
        type: control.type,
        ...control.defaultOptions
      };
      if (!newField.key) {
        newField.key = `field_${this.fields.length + 1}`;
      }
      this.fields.push(newField);
    }
  }

  // Add a layout container to the form definition.
  addLayoutField(layoutType: string) {
    const layout = this.availableLayouts.find(lay => lay.type === layoutType);
    if (layout) {
      const newField: FormlyFieldConfig = {
        key: `layout_${this.fields.length + 1}`,
        type: layout.type,
        ...layout.defaultOptions
      };
      if (!newField.fieldGroup) {
        newField.fieldGroup = [];
      }
      this.fields.push(newField);
    }
  }

  // Remove a field from the form definition.
  removeField(index: number) {
    this.fields.splice(index, 1);
  }

  // Handler for the drag drop event to reorder the fields array.
  drop(event: CdkDragDrop<FormlyFieldConfig[]>) {
    moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
  }

  // A constrain function that snaps drag positions to a grid.
  constrainPosition = (point: { x: number, y: number }, dragRef: any) => {
    const gridSize = 50; // adjust grid size as needed (in pixels)
    const x = Math.round(point.x / gridSize) * gridSize;
    const y = Math.round(point.y / gridSize) * gridSize;
    return { x, y };
  }

  // Export the form definition as formatted JSON.
  exportDefinition(): string {
    return JSON.stringify(this.fields, null, 2);
  }

  // Import a JSON definition.
  importDefinition(json: string) {
    try {
      const importedFields = JSON.parse(json);
      if (Array.isArray(importedFields)) {
        this.fields = importedFields;
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
