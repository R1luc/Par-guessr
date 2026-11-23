import { Injectable, inject } from '@angular/core';
import { Observable, defer, delay, of } from 'rxjs';
import { Partida, ResumoPartida } from '../../models/Partida';
import { Rodada } from '../../models/Rodada';
import { JogoFakeStore } from './jogo-fake-store';

const LATENCIA_MS = 300;

/**
 * Hoje usa dados fake. Quando o back existir, troque o corpo dos métodos por
 * chamadas HttpClient; as assinaturas continuam iguais.
 *   iniciar()      -> POST /partidas
 *   rodadaAtual()  -> GET  /partidas/:id/rodada-atual
 *   resumo()       -> GET  /partidas/:id/resumo
 */
@Injectable({
  providedIn: 'root',
})
export class PartidaService {
  private readonly store = inject(JogoFakeStore);

  iniciar(): Observable<Partida> {
    return defer(() => of(this.store.criarPartida())).pipe(delay(LATENCIA_MS));
  }

  rodadaAtual(partidaId: number): Observable<Rodada> {
    return defer(() => of(this.store.rodadaAtual(partidaId))).pipe(delay(LATENCIA_MS));
  }

  resumo(partidaId: number): Observable<ResumoPartida> {
    return defer(() => of(this.store.resumo(partidaId))).pipe(delay(LATENCIA_MS));
  }
}