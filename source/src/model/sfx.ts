import WebSfx from '../lib/web-sfx';
import { AUDIO_SOURCES } from '../audio-sources';

export default class Sfx {
  public static currentVolume = 1;

  public static async init() {
    await WebSfx.init();
  }

  public static volume(num: number): void {
    Sfx.currentVolume = num;
  }

  public static die(): void {
    WebSfx.volume(Sfx.currentVolume);
    WebSfx.play(AUDIO_SOURCES.die);
  }

  public static point(): void {
    WebSfx.volume(Sfx.currentVolume);
    WebSfx.play(AUDIO_SOURCES.point);
  }

  public static hit(cb: IEmptyFunction): void {
    WebSfx.volume(Sfx.currentVolume);
    WebSfx.play(AUDIO_SOURCES.hit, cb);
  }

  public static swoosh(): void {
    WebSfx.volume(Sfx.currentVolume);
    WebSfx.play(AUDIO_SOURCES.swoosh);
  }

  public static wing(): void {
    WebSfx.volume(Sfx.currentVolume);
    WebSfx.play(AUDIO_SOURCES.wing);
  }

  public static tantiAuguri(): void {
    WebSfx.volume(Math.min(1, Sfx.currentVolume));
    WebSfx.play(AUDIO_SOURCES.tantiAuguri);
  }
}
