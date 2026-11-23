import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar-component/navbar-component';
import { PartidaService } from '../core/services/partida-service';
import { ResumoPartida } from '../models/Partida';

@Component({
  selector: 'app-resultado-partida-component',
  imports: [RouterLink, NavbarComponent],
  templateUrl: './resultado-partida-component.html',
  styleUrl: './resultado-partida-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultadoPartidaComponent implements OnInit {
  private readonly partidas = inject(PartidaService);
  private readonly router = inject(Router);
  private readonly partidaId = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  readonly resumo = signal<ResumoPartida | null>(null);
  readonly erro = signal('');
  readonly iniciando = signal(false);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.erro.set('');
    this.partidas.resumo(this.partidaId).subscribe({
      next: (resumo) => {
        if (resumo.status !== 'FINALIZADA') {
          // partida ainda em andamento: volta para o jogo
          this.router.navigate(['/partida', this.partidaId]);
          return;
        }
        this.resumo.set(resumo);
      },
      error: () => this.erro.set('Não foi possível carregar o resumo desta partida.'),
    });
  }

  jogarNovamente(): void {
    if (this.iniciando()) {
      return;
    }
    this.iniciando.set(true);
    this.partidas.iniciar().subscribe({
      next: (partida) => this.router.navigate(['/partida', partida.id]),
      error: () => {
        this.erro.set('Não foi possível iniciar uma nova partida.');
        this.iniciando.set(false);
      },
    });
  }
}