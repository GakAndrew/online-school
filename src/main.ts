import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { JwtModule } from '@auth0/angular-jwt';
import { routes } from './app/app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MockAuthService } from './app/shared/services/mock-auth.service';
import { AuthService } from '/shared/services/auth.service';

export function tokenGetter() {
  return localStorage.getItem('access_token');
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([])),
    provideRouter(routes),
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter,
          allowedDomains: ['your-api-url.com'], // Замените на домен вашего API
          disallowedRoutes: ['http://your-api-url.com/login', 'http://your-api-url.com/register']
        }
      })
    ), provideAnimationsAsync(),
    { provide: AuthService, useClass: MockAuthService }, provideAnimationsAsync() // Используем MockAuthService
  ]
}).catch(err => console.error(err));
