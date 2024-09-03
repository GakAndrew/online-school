import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../shared/services/auth.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { phoneValidator } from '/shared/validators/phone-validator';
import { Registration } from '/shared/models/register.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  registerForm: FormGroup;
  registration$: Observable<void> | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, phoneValidator()]],
      course: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  register() {
    console.log('Register button clicked');
    if (this.registerForm.valid) {
      console.log('Form is valid');
      const registration: Registration = this.registerForm.value;
      this.registration$ = this.authService.signUp(registration);
      this.registration$.subscribe(
        () => {
          console.log('Registration successful');
          this.authService.signIn(registration.email, registration.password).subscribe(
            () => this.router.navigate(['/dashboard']), // Перенаправление на Dashboard
            err => console.error('Auto login error', err)
          );
        },
        err => console.error('Registration error', err)
      );
    } else {
      console.log('Form is invalid');
    }
  }
}
