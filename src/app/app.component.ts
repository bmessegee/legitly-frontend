import { Component } from '@angular/core';
import { AppNavigationComponent } from "./components/app-navigation/app-navigation.component";
import { HeaderComponent } from "./components/header/header.component";


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
