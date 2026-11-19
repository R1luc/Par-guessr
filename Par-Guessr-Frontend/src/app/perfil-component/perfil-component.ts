import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../navbar-component/navbar-component';
import { Auth } from '../core/services/auth';

@Component({
  selector: 'app-perfil-component',
  imports: [NavbarComponent, ReactiveFormsModule],
  templateUrl: './perfil-component.html',
  styleUrl: './perfil-component.scss',
})
export class PerfilComponent {
  readonly auth = inject(Auth);
  readonly profileForm = new FormGroup({
    nick: new FormControl(this.auth.user()?.nick ?? '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  readonly passwordForm = new FormGroup({
    currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    newPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  showPasswordForm = false;
  editingNick = false;
  message = '';
  errorMessage = '';

  updateProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.auth.updateProfile(this.profileForm.controls.nick.value, this.auth.user()?.photo ?? '');
    this.message = 'Perfil atualizado.';
    this.errorMessage = '';
    this.editingNick = false;
  }

  cancelNickEdit(): void {
    this.profileForm.controls.nick.setValue(this.auth.user()?.nick ?? '');
    this.editingNick = false;
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    if (!this.auth.changePassword(currentPassword, newPassword)) {
      this.errorMessage = 'A senha atual está incorreta.';
      this.message = '';
      return;
    }

    this.passwordForm.reset();
    this.showPasswordForm = false;
    this.message = 'Senha alterada.';
    this.errorMessage = '';
  }

  changePhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        this.auth.updateProfile(this.auth.user()?.nick ?? '', reader.result);
        this.message = 'Foto atualizada.';
        this.errorMessage = '';
      }
    };
    reader.readAsDataURL(file);
  }
}
