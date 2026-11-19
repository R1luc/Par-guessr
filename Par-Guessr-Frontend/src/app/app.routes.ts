import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { CadastroComponent } from './cadastro-component/cadastro-component';
import { HomeComponent } from './home-component/home-component';
import { LoginComponent } from './login-component/login-component';
import { NovaPartidaComponent } from './nova-partida-component/nova-partida-component';
import { PerfilComponent } from './perfil-component/perfil-component';
import { RankingComponent } from './ranking-component/ranking-component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'ranking',
    component: RankingComponent,
    canActivate: [authGuard],
  },
  {
    path: 'jogar',
    component: NovaPartidaComponent,
    canActivate: [authGuard],
  },
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'home' },
];
