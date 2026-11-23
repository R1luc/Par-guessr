import { Injectable, signal } from '@angular/core';
import { UsuarioAutenticado } from '../../models/Usuario';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly sessionKey = 'par-guessr-user';
  private readonly accountsKey = 'par-guessr-accounts';
  readonly user = signal<UsuarioAutenticado | null>(this.readSession());

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

    const nickTrimmed = nick.trim();
    const user: UsuarioAutenticado = {
      id: Date.now(),
      nome: nickTrimmed,
      fotoUrl: this.defaultPhoto,
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

    const nickTrimmed = nick.trim();
    const updatedUser: UsuarioAutenticado = {
      ...currentUser,
      nome: nickTrimmed,
      fotoUrl: photo || null,
      nick: nickTrimmed,
      photo,
    };
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

  private readAccounts(): UsuarioAutenticado[] {
    const accounts = localStorage.getItem(this.accountsKey);
    if (!accounts) {
      return [];
    }

    try {
      const parsed = JSON.parse(accounts);
      return Array.isArray(parsed)
        ? parsed
            .filter((user) => user?.email && user?.password)
            .map((user, index) => {
              const nick = user.nick ?? user.nome ?? user.name ?? user.email;
              const photo = user.photo ?? user.fotoUrl ?? this.defaultPhoto;
              return {
                id: typeof user.id === 'number' ? user.id : index + 1,
                nome: user.nome ?? nick,
                fotoUrl: user.fotoUrl ?? photo,
                nick,
                email: this.normalizeEmail(user.email),
                password: user.password,
                photo,
              };
            })
        : [];
    } catch (error) {
      if (error instanceof SyntaxError) {
        return [];
      }
      throw error;
    }
  }

  private readSession(): UsuarioAutenticado | null {
    const session = localStorage.getItem(this.sessionKey);
    if (!session) {
      return null;
    }

    try {
      const parsed = JSON.parse(session);
      return parsed?.email && parsed?.password
        ? (() => {
            const nick = parsed.nick ?? parsed.nome ?? parsed.name ?? parsed.email;
            const photo = parsed.photo ?? parsed.fotoUrl ?? this.defaultPhoto;
            return {
              id: typeof parsed.id === 'number' ? parsed.id : 1,
              nome: parsed.nome ?? nick,
              fotoUrl: parsed.fotoUrl ?? photo,
              nick,
              email: this.normalizeEmail(parsed.email),
              password: parsed.password,
              photo,
            };
          })()
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

  private saveUser(user: UsuarioAutenticado): void {
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
