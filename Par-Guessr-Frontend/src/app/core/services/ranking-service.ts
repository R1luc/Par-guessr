import { Injectable, inject } from '@angular/core';
import { Observable, defer, delay, of } from 'rxjs';
import { RankingItem } from '../../models/RankingItem';
import { JogoFakeStore } from './jogo-fake-store';

const LATENCIA_MS = 300;

/**
 * Hoje usa dados fake. Quando o back existir, troque por HttpClient:
 *   listar() -> GET /ranking?limite=20
 * O back devolve um item por usuário, com a melhor pontuação dele.
 */
@Injectable({
  providedIn: 'root',
})
export class RankingService {
  private readonly store = inject(JogoFakeStore);

  listar(): Observable<RankingItem[]> {
    return defer(() => of(this.store.ranking())).pipe(delay(LATENCIA_MS));
  }
}