import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormlyMaterialModule } from '@ngx-formly/material';

export const appConfig: ApplicationConfig = {

  providers: [
    importProvidersFrom(
      BrowserAnimationsModule,
      ReactiveFormsModule,
      DragDropModule,
      FormlyModule.forRoot({
        // Optionally register custom wrappers (panel, accordion, etc.)
        wrappers: [
          // { name: 'panel', component: YourPanelWrapperComponent },
          // { name: 'accordion', component: YourAccordionWrapperComponent },
        ],
      })),
    FormlyMaterialModule,

    provideRouter(routes),
    provideAnimationsAsync(),
    provideAnimationsAsync()]
};
