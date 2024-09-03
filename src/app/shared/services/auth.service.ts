import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Registration } from '../models/register.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://your-api-url.com'; // Замените на URL вашего API
  private token = signal<string | null>(null);

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {
    this.token.set(this.getToken());
  }

  signUp(registration: Registration): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, registration);
  }

  signIn(email: string, password: string): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.token);
        this.token.set(response.token);
      })
    );
  }

  signOut(): void {
    localStorage.removeItem('access_token');
    this.token.set(null);
  }

  isAuthenticated(): boolean {
    const token = this.token();
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
