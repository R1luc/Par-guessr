import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { DIMENSOES_PLANTA, PontoMapa } from '../models/Rodada';

const PLANTA_URL = 'planta-campus.webp';
const LIMITES = L.latLngBounds(
  [0, 0],
  [DIMENSOES_PLANTA.altura, DIMENSOES_PLANTA.largura],
);

/**
 * Mapa da planta do campus com Leaflet (CRS.Simple, sem tiles).
 * As posições continuam normalizadas de 0 a 1 (origem: canto superior esquerdo),
 * igual ao resto do app. A conversão para o sistema do Leaflet fica só aqui.
 *
 * Modo palpite: clique (ou Enter, para quem usa teclado) marca o ponto e emite `escolher`.
 * Modo resultado: passe `resposta` (e `palpiteFinal`) para mostrar os dois pontos e a linha.
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
  /** Posição do palpite, usada no modo resultado. */
  readonly palpiteFinal = input<PontoMapa | null>(null);
  /** Quando informada, o mapa revela a resposta correta. */
  readonly resposta = input<PontoMapa | null>(null);
  readonly escolher = output<PontoMapa>();

  readonly marcador = signal<PontoMapa | null>(null);
  /** Mapa em tela cheia (útil no celular). */
  readonly ampliado = signal(false);

  private readonly alvo = viewChild.required<ElementRef<HTMLDivElement>>('mapa');
  private readonly pronto = signal(false);
  private mapa: L.Map | null = null;
  private camada = L.layerGroup();

  /** O que aparece como "seu palpite": o escolhido agora ou o que veio do resultado. */
  private readonly exibido = computed(() => this.palpiteFinal() ?? this.marcador());

  constructor() {
    afterNextRender(() => this.iniciar());
    inject(DestroyRef).onDestroy(() => this.mapa?.remove());

    effect(() => {
      if (!this.pronto()) {
        return;
      }
      this.desenhar(this.exibido(), this.resposta());
    });
  }

  alternarAmpliado(): void {
    this.ampliado.update((v) => !v);
    // espera o CSS aplicar o novo tamanho antes de recalcular o mapa
    setTimeout(() => this.reajustar());
  }

  fecharAmpliado(): void {
    if (this.ampliado()) {
      this.alternarAmpliado();
    }
  }

  /** Atalho de teclado: marca o centro da área visível. */
  marcarCentro(): void {
    if (this.mapa) {
      this.escolherPonto(this.mapa.getCenter());
    }
  }

  private iniciar(): void {
    const el = this.alvo().nativeElement;
    const mapa = L.map(el, {
      crs: L.CRS.Simple,
      minZoom: -4,
      maxZoom: 1,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      attributionControl: false,
      maxBoundsViscosity: 1,
    });
    L.imageOverlay(PLANTA_URL, LIMITES).addTo(mapa);
    mapa.setMaxBounds(LIMITES.pad(0.05));
    mapa.setView(LIMITES.getCenter(), -2);
    if (el.clientWidth > 0) {
      mapa.fitBounds(LIMITES);
      mapa.setMinZoom(mapa.getZoom());
    }
    this.camada.addTo(mapa);
    mapa.on('click', (e: L.LeafletMouseEvent) => this.escolherPonto(e.latlng));

    this.mapa = mapa;
    this.pronto.set(true);
  }

  private reajustar(): void {
    const mapa = this.mapa;
    if (!mapa) {
      return;
    }
    mapa.invalidateSize();
    if (mapa.getSize().x === 0) {
      return;
    }
    mapa.setMinZoom(-4);
    mapa.fitBounds(LIMITES);
    mapa.setMinZoom(mapa.getZoom());
    this.desenhar(this.exibido(), this.resposta());
  }

  private escolherPonto(latlng: L.LatLng): void {
    if (this.desabilitado() || this.resposta()) {
      return;
    }
    const ponto = this.paraPonto(latlng);
    this.marcador.set(ponto);
    this.escolher.emit(ponto);
  }

  private desenhar(palpite: PontoMapa | null, resposta: PontoMapa | null): void {
    this.camada.clearLayers();
    const pontos: L.LatLng[] = [];

    if (palpite) {
      const p = this.paraLatLng(palpite);
      pontos.push(p);
      L.circleMarker(p, { radius: 10, color: '#fff', weight: 3, fillColor: '#d92d20', fillOpacity: 1 })
        .bindTooltip('Seu palpite')
        .addTo(this.camada);
    }
    if (resposta) {
      const r = this.paraLatLng(resposta);
      pontos.push(r);
      L.circleMarker(r, { radius: 10, color: '#fff', weight: 3, fillColor: '#067647', fillOpacity: 1 })
        .bindTooltip('Resposta', { permanent: true, direction: 'top' })
        .addTo(this.camada);
      if (palpite) {
        L.polyline(pontos, { color: '#263449', weight: 3, dashArray: '6 8' }).addTo(this.camada);
      }
    }

    if (resposta && this.mapa && this.mapa.getSize().x > 0) {
      this.mapa.fitBounds(L.latLngBounds(pontos).pad(0.6), { maxZoom: 0 });
    }
  }

  private paraLatLng(p: PontoMapa): L.LatLng {
    return L.latLng(
      (1 - p.y) * DIMENSOES_PLANTA.altura,
      p.x * DIMENSOES_PLANTA.largura,
    );
  }

  private paraPonto(ll: L.LatLng): PontoMapa {
    return {
      x: this.limitar(ll.lng / DIMENSOES_PLANTA.largura),
      y: this.limitar(1 - ll.lat / DIMENSOES_PLANTA.altura),
    };
  }

  private limitar(v: number): number {
    return Math.min(1, Math.max(0, v));
  }
}