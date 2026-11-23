import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-dicas-component',
  imports: [],
  templateUrl: './dicas-component.html',
  styleUrl: './dicas-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DicasComponent {
  readonly dicasUsadas = input(0);
  readonly maxDicas = input(0);
  readonly multiplicadorAtual = input(1);
  /** null quando não há mais dicas */
  readonly multiplicadorProximaDica = input<number | null>(null);
  readonly desabilitado = input(false);

  readonly pedir = output<void>();

  /** Quanto a próxima dica reduz a pontuação, em %. null se não há mais dicas. */
  readonly custoPct = computed(() => {
    const proxima = this.multiplicadorProximaDica();
    return proxima === null ? null : Math.round((this.multiplicadorAtual() - proxima) * 100);
  });
}