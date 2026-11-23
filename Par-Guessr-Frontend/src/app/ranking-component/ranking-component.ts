import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { NavbarComponent } from '../navbar-component/navbar-component';
import { Auth } from '../core/services/auth';
import { RankingService } from '../core/services/ranking-service';
import { RankingItem } from '../models/RankingItem';

@Component({
  selector: 'app-ranking-component',
  imports: [NavbarComponent],
  templateUrl: './ranking-component.html',
  styleUrl: './ranking-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingComponent implements OnInit {
  private readonly ranking = inject(RankingService);
  readonly auth = inject(Auth);

  readonly itens = signal<RankingItem[] | null>(null);
  readonly erro = signal('');

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.erro.set('');
    this.ranking.listar().subscribe({
      next: (itens) => this.itens.set(itens),
      error: () => this.erro.set('Não foi possível carregar o ranking.'),
    });
  }
}