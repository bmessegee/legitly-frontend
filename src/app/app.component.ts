import { Component } from '@angular/core';
import { AppNavigationComponent } from "./app-navigation/app-navigation.component";


@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [AppNavigationComponent],
})
export class AppComponent {
  title = 'legitly';
}
