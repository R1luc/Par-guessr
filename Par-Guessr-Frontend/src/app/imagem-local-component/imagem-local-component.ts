import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-imagem-local-component',
  imports: [],
  templateUrl: './imagem-local-component.html',
  styleUrl: './imagem-local-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImagemLocalComponent {
  readonly imagemUrl = input('');
}