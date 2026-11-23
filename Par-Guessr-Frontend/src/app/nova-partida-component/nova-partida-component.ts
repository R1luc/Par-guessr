import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar-component/navbar-component';
import { PartidaService } from '../core/services/partida-service';

@Component({
  selector: 'app-nova-partida-component',
  imports: [NavbarComponent],
  templateUrl: './nova-partida-component.html',
  styleUrl: './nova-partida-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NovaPartidaComponent {
  private readonly partidas = inject(PartidaService);
  private readonly router = inject(Router);

  readonly carregando = signal(false);
  readonly erro = signal('');

  comecar(): void {
    if (this.carregando()) {
      return;
    }
    this.carregando.set(true);
    this.erro.set('');

    this.partidas.iniciar().subscribe({
      next: (partida) => this.router.navigate(['/partida', partida.id]),
      error: () => {
        this.erro.set('Não foi possível iniciar a partida. Tente novamente.');
        this.carregando.set(false);
      },
    });
  }
}