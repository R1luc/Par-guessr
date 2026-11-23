import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../core/services/auth';
import { PartidaService } from '../core/services/partida-service';
import { RankingService } from '../core/services/ranking-service';
import { RodadaService } from '../core/services/rodada-service';
import { PontoMapa } from '../models/Rodada';

describe('Ranking', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    TestBed.inject(Auth).register('Teste', 'teste@exemplo.com', '123456');
  });

  async function jogarPartida(ponto: PontoMapa) {
    const partidas = TestBed.inject(PartidaService);
    const rodadas = TestBed.inject(RodadaService);
    const partida = await firstValueFrom(partidas.iniciar());
    for (let i = 0; i < partida.qtdRodadas; i++) {
      const rodada = await firstValueFrom(partidas.rodadaAtual(partida.id));
      await firstValueFrom(rodadas.enviarPalpite(rodada.rodadaId, ponto));
    }
    return firstValueFrom(partidas.resumo(partida.id));
  }

  it('mantém uma única posição por usuário, com a maior pontuação', async () => {
    const a = await jogarPartida({ x: 0, y: 0 });
    const b = await jogarPartida({ x: 1, y: 1 });

    const lista = await firstValueFrom(TestBed.inject(RankingService).listar());
    const meuId = TestBed.inject(Auth).user()!.id;
    const meus = lista.filter((i) => i.usuarioId === meuId);

    expect(meus.length).toBe(1);
    expect(meus[0].melhorPontuacao).toBe(Math.max(a.pontuacaoTotal, b.pontuacaoTotal));
    expect(new Set(lista.map((i) => i.usuarioId)).size).toBe(lista.length);
  }, 30000);
});