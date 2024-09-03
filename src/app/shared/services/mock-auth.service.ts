import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Registration } from '../models/register.model';

@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  private token: string | null = null;

  constructor(private jwtHelper: JwtHelperService) {}

  signUp(registration: Registration): Observable<void> {
    console.log('Mock signUp called with:', registration);
    return of(void 0).pipe(delay(1000));
  }

  signIn(email: string, password: string): Observable<{ token: string }> {
    console.log('Mock signIn called with:', email, password);
    const mockToken = 'mock-jwt-token';
    return of({ token: mockToken }).pipe(
      delay(1000),
      tap(response => {
        localStorage.setItem('access_token', response.token);
        this.token = response.token;
      })
    );
  }

  signOut(): void {
    localStorage.removeItem('access_token');
    this.token = null;
  }

  isAuthenticated(): boolean {
    const token = this.token;
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  getToken(): string | null {
    return this.token;
  }
}
