import dieOgg from './assets/audio/die.ogg';
import hitOgg from './assets/audio/hit.ogg';
import pointOgg from './assets/audio/point.ogg';
import swooshOgg from './assets/audio/swooshing.ogg';
import tantiAuguriOgg from './assets/audio/tanti_auguri.ogg';
import wingOgg from './assets/audio/wing.ogg';

import dieM4a from './assets/audio/die.m4a';
import hitM4a from './assets/audio/hit.m4a';
import pointM4a from './assets/audio/point.m4a';
import swooshM4a from './assets/audio/swooshing.m4a';
import tantiAuguriM4a from './assets/audio/tanti_auguri.m4a';
import wingM4a from './assets/audio/wing.m4a';

const supportsM4a = (): boolean => {
  if (typeof Audio === 'undefined') return false;

  const testAudio = new Audio();
  const canPlay = testAudio.canPlayType('audio/mp4; codecs="mp4a.40.2"');

  return canPlay === 'probably' || canPlay === 'maybe';
};

const preferM4a = supportsM4a();

export const AUDIO_SOURCES = {
  die: preferM4a ? dieM4a : dieOgg,
  hit: preferM4a ? hitM4a : hitOgg,
  point: preferM4a ? pointM4a : pointOgg,
  swoosh: preferM4a ? swooshM4a : swooshOgg,
  tantiAuguri: preferM4a ? tantiAuguriM4a : tantiAuguriOgg,
  wing: preferM4a ? wingM4a : wingOgg
};
