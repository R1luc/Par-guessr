import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ResultadoRodada } from '../models/ResultadoRodada';

@Component({
  selector: 'app-resultado-rodada-component',
  imports: [],
  templateUrl: './resultado-rodada-component.html',
  styleUrl: './resultado-rodada-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultadoRodadaComponent {
  readonly resultado = input<ResultadoRodada | null>(null);
  readonly proxima = output<void>();
}