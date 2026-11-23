import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar-component/navbar-component';
import { DicasComponent } from '../dicas-component/dicas-component';
import { ImagemLocalComponent } from '../imagem-local-component/imagem-local-component';
import { MapaPalpiteComponent } from '../mapa-palpite-component/mapa-palpite-component';
import { ResultadoRodadaComponent } from '../resultado-rodada-component/resultado-rodada-component';
import { PartidaService } from '../core/services/partida-service';
import { RodadaService } from '../core/services/rodada-service';
import { PontoMapa, Rodada } from '../models/Rodada';
import { ResultadoRodada } from '../models/ResultadoRodada';

@Component({
  selector: 'app-partida-component',
  imports: [
    RouterLink,
    NavbarComponent,
    ImagemLocalComponent,
    DicasComponent,
    MapaPalpiteComponent,
    ResultadoRodadaComponent,
  ],
  templateUrl: './partida-component.html',
  styleUrl: './partida-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartidaComponent implements OnInit {
  private readonly partidas = inject(PartidaService);
  private readonly rodadas = inject(RodadaService);
  private readonly router = inject(Router);
  private readonly partidaId = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  readonly rodada = signal<Rodada | null>(null);
  readonly resultado = signal<ResultadoRodada | null>(null);
  readonly palpite = signal<PontoMapa | null>(null);
  readonly ocupado = signal(false);
  readonly erro = signal('');
  readonly naoEncontrada = signal(false);

  ngOnInit(): void {
    this.carregarRodada();
  }

  carregarRodada(): void {
    this.erro.set('');
    this.naoEncontrada.set(false);
    this.ocupado.set(true);
    this.partidas.rodadaAtual(this.partidaId).subscribe({
      next: (rodada) => {
        this.rodada.set(rodada);
        this.resultado.set(null);
        this.palpite.set(null);
        this.ocupado.set(false);
      },
      error: (e: unknown) => {
        if (this.codigoErro(e) === 'PARTIDA_FINALIZADA') {
          this.irParaResumo();
          return;
        }
        if (this.codigoErro(e) === 'NAO_ENCONTRADO') {
          this.naoEncontrada.set(true);
          this.falhar('Esta partida não existe mais.');
          return;
        }
        this.falhar('Não foi possível carregar a rodada.');
      },
    });
  }

  pedirDica(): void {
    const rodada = this.rodada();
    if (!rodada || this.ocupado()) {
      return;
    }
    this.ocupado.set(true);
    this.rodadas.pedirDica(rodada.rodadaId).subscribe({
      next: (estado) => {
        this.rodada.update((r) => (r ? { ...r, ...estado } : r));
        this.ocupado.set(false);
      },
      error: () => this.falhar('Não foi possível pedir a dica.'),
    });
  }

  enviarPalpite(): void {
    const rodada = this.rodada();
    const palpite = this.palpite();
    if (!rodada || !palpite || this.ocupado()) {
      return;
    }
    this.ocupado.set(true);
    this.rodadas.enviarPalpite(rodada.rodadaId, palpite).subscribe({
      next: (resultado) => {
        this.resultado.set(resultado);
        this.ocupado.set(false);
      },
      error: () => this.falhar('Não foi possível enviar o palpite.'),
    });
  }

  proxima(): void {
    if (this.resultado()?.ultimaRodada) {
      this.irParaResumo();
    } else {
      this.carregarRodada();
    }
  }

  private irParaResumo(): void {
    this.router.navigate(['/partida', this.partidaId, 'resumo']);
  }

  private falhar(mensagem: string): void {
    this.erro.set(mensagem);
    this.ocupado.set(false);
  }

  /** Lê o código de erro do fake ({ erro }) ou do HttpClient (e.error.erro). */
  private codigoErro(e: unknown): string {
    const obj = e as { erro?: string; error?: { erro?: string } } | null;
    return obj?.erro ?? obj?.error?.erro ?? '';
  }
}