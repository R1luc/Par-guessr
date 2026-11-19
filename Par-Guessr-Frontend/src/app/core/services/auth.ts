import { Injectable, signal } from '@angular/core';
import { Usuario } from '../../models/Usuario';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly sessionKey = 'par-guessr-user';
  private readonly accountsKey = 'par-guessr-accounts';
  readonly user = signal<Usuario | null>(this.readSession());

  isAuthenticated(): boolean {
    return this.user() !== null;
  }

  login(email: string, password: string): boolean {
    const account = this.readAccounts().find(
      (user) => user.email === this.normalizeEmail(email) && user.password === password,
    );

    if (!account) {
      return false;
    }

    this.user.set(account);
    localStorage.setItem(this.sessionKey, JSON.stringify(account));
    return true;
  }

  register(nick: string, email: string, password: string): boolean {
    const normalizedEmail = this.normalizeEmail(email);
    const accounts = this.readAccounts();

    if (accounts.some((user) => user.email === normalizedEmail)) {
      return false;
    }

    const user: Usuario = {
      nick: nick.trim(),
      email: normalizedEmail,
      password,
      photo: this.defaultPhoto,
    };
    localStorage.setItem(this.accountsKey, JSON.stringify([...accounts, user]));
    this.user.set(user);
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
    return true;
  }

  updateProfile(nick: string, photo: string): void {
    const currentUser = this.user();
    if (!currentUser) {
      return;
    }

    const updatedUser = { ...currentUser, nick: nick.trim(), photo };
    this.saveUser(updatedUser);
  }

  changePassword(currentPassword: string, newPassword: string): boolean {
    const currentUser = this.user();
    if (!currentUser || currentUser.password !== currentPassword) {
      return false;
    }

    this.saveUser({ ...currentUser, password: newPassword });
    return true;
  }

  logout(): void {
    this.user.set(null);
    localStorage.removeItem(this.sessionKey);
  }

  private readAccounts(): Usuario[] {
    const accounts = localStorage.getItem(this.accountsKey);
    if (!accounts) {
      return [];
    }

    try {
      const parsed = JSON.parse(accounts);
      return Array.isArray(parsed)
        ? parsed
            .filter((user) => user?.email && user?.password)
            .map((user) => ({
              nick: user.nick ?? user.name ?? user.email,
              email: this.normalizeEmail(user.email),
              password: user.password,
              photo: user.photo ?? this.defaultPhoto,
            }))
        : [];
    } catch (error) {
      if (error instanceof SyntaxError) {
        return [];
      }
      throw error;
    }
  }

  private readSession(): Usuario | null {
    const session = localStorage.getItem(this.sessionKey);
    if (!session) {
      return null;
    }

    try {
      const parsed = JSON.parse(session);
      return parsed?.email && parsed?.password
        ? {
            nick: parsed.nick ?? parsed.name ?? parsed.email,
            email: this.normalizeEmail(parsed.email),
            password: parsed.password,
            photo: parsed.photo ?? this.defaultPhoto,
          }
        : null;
    } catch (error) {
      if (error instanceof SyntaxError) {
        return null;
      }
      throw error;
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private saveUser(user: Usuario): void {
    const accounts = this.readAccounts().map((account) =>
      account.email === user.email ? user : account,
    );
    localStorage.setItem(this.accountsKey, JSON.stringify(accounts));
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
    this.user.set(user);
  }

  private readonly defaultPhoto =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect width='96' height='96' fill='%23ddd'/%3E%3Ccircle cx='48' cy='35' r='18' fill='%23999'/%3E%3Cpath d='M18 88c2-24 58-24 60 0' fill='%23999'/%3E%3C/svg%3E";
}
