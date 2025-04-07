import { Component } from '@angular/core';
import { AppNavigationComponent } from "./app-navigation/app-navigation.component";
import { HeaderComponent } from "./header/header.component";


@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [AppNavigationComponent, HeaderComponent],
})
export class AppComponent {
  title = 'legitly';
}
