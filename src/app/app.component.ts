import { Component, inject } from '@angular/core';
import { AppNavigationComponent } from "./components/app-navigation/app-navigation.component";
import { HeaderComponent } from "./components/header/header.component";
import { LoginComponent } from "./auth/login/login.component";
import { AuthService } from './services/auth.service';
import { Router, RouterOutlet } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [AppNavigationComponent, HeaderComponent, LoginComponent, NgIf, RouterOutlet],
})
export class AppComponent {
  title = 'legitly';
  public auth   = inject(AuthService);
  private router = inject(Router);
  
   
}
