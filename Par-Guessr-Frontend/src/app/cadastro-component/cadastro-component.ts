import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../core/services/auth';

@Component({
  selector: 'app-cadastro-component',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro-component.html',
  styleUrl: './cadastro-component.scss',
})
export class CadastroComponent {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly registerForm = new FormGroup({
    nick: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  submitted = false;
  errorMessage = '';

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';

    const { nick, email, password, confirmPassword } = this.registerForm.getRawValue();
    if (this.registerForm.invalid) {
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage = 'As senhas precisam ser iguais.';
      return;
    }

    if (!this.auth.register(nick, email, password)) {
      this.errorMessage = 'Este e-mail já está cadastrado.';
      return;
    }

    this.router.navigateByUrl('/home');
  }
}
