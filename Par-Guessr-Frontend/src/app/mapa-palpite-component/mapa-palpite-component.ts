import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { PontoMapa } from '../models/Rodada';

/**
 * VERSÃO PROVISÓRIA: uma área clicável no lugar da planta.
 * Quando o Leaflet entrar, troque só o interior; a interface
 * (input `desabilitado`, output `escolher`) permanece igual.
 */
@Component({
  selector: 'app-mapa-palpite-component',
  imports: [],
  templateUrl: './mapa-palpite-component.html',
  styleUrl: './mapa-palpite-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaPalpiteComponent {
  readonly desabilitado = input(false);
  readonly escolher = output<PontoMapa>();

  readonly marcador = signal<PontoMapa | null>(null);

  clicar(event: MouseEvent): void {
    if (this.desabilitado()) {
      return;
    }
    const area = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const ponto: PontoMapa = {
      x: this.limitar((event.clientX - area.left) / area.width),
      y: this.limitar((event.clientY - area.top) / area.height),
    };
    this.marcador.set(ponto);
    this.escolher.emit(ponto);
  }

  private limitar(valor: number): number {
    return Math.min(1, Math.max(0, valor));
  }
}