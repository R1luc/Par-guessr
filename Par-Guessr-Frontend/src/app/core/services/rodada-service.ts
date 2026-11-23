import { Injectable, inject } from '@angular/core';
import { Observable, defer, delay, of } from 'rxjs';
import { EstadoDicas, PalpiteRequest } from '../../models/Rodada';
import { ResultadoRodada } from '../../models/ResultadoRodada';
import { JogoFakeStore } from './jogo-fake-store';

const LATENCIA_MS = 300;

/**
 * Hoje usa dados fake. Troque por HttpClient quando o back existir:
 *   pedirDica()      -> POST /rodadas/:id/dica
 *   enviarPalpite()  -> POST /rodadas/:id/palpite
 */
@Injectable({
  providedIn: 'root',
})
export class RodadaService {
  private readonly store = inject(JogoFakeStore);

  pedirDica(rodadaId: number): Observable<EstadoDicas> {
    return defer(() => of(this.store.pedirDica(rodadaId))).pipe(delay(LATENCIA_MS));
  }

  enviarPalpite(rodadaId: number, palpite: PalpiteRequest): Observable<ResultadoRodada> {
    return defer(() => of(this.store.enviarPalpite(rodadaId, palpite))).pipe(delay(LATENCIA_MS));
  }
}