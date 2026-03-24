/**
 * Display "Get Ready" & "Instruction"
 * Let the bird swing while waiting...
 * No Pipes
 * Wait for the tap event
 * */

import BannerInstruction from '../model/banner-instruction';
import BirdModel from '../model/bird';
import CounterModel from '../model/count';
import FlashScreen from '../model/flash-screen';
import { getGameSpeed } from '../constants';
import { IScreenChangerObject } from '../lib/screen-changer';
import MainGameController from '../game';
import ParentClass from '../abstracts/parent-class';
import PipeGenerator from '../model/pipe-generator';
import ScoreBoard from '../model/score-board';
import Sfx from '../model/sfx';

export type IGameState = 'died' | 'playing' | 'none';

type IBonusType = 'euro' | 'book' | 'vinyl';

interface IBonusItem {
  x: number;
  y: number;
  size: number;
  wobble: number;
  collected: boolean;
  type: IBonusType;
}

function createBonusCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function createEuroSprite(): HTMLCanvasElement {
  const canvas = createBonusCanvas(72);
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#ffd84a';
  context.beginPath();
  context.arc(36, 36, 28, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#c88d12';
  context.lineWidth = 4;
  context.beginPath();
  context.arc(36, 36, 24, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = '#7a5605';
  context.font = 'bold 34px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('€', 36, 39);
  return canvas;
}

function createBookSprite(): HTMLCanvasElement {
  const canvas = createBonusCanvas(72);
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#f8f1e2';
  context.fillRect(10, 10, 52, 52);
  context.strokeStyle = '#6e4d39';
  context.lineWidth = 4;
  context.strokeRect(10, 10, 52, 52);
  context.fillStyle = '#c4574a';
  context.fillRect(10, 10, 12, 52);
  context.fillStyle = '#b23f44';
  context.fillRect(16, 24, 44, 32);
  context.strokeStyle = '#7d6454';
  context.lineWidth = 2;
  context.strokeRect(16, 24, 44, 32);
  context.fillStyle = '#fff7e8';
  context.font = 'bold 11px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('MURA', 38, 35);
  context.fillText('KAMI', 38, 47);
  return canvas;
}

function createVinylSprite(): HTMLCanvasElement {
  const canvas = createBonusCanvas(72);
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#1f2230';
  context.beginPath();
  context.arc(36, 36, 28, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#4d556d';
  context.lineWidth = 3;
  context.beginPath();
  context.arc(36, 36, 20, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.arc(36, 36, 12, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = '#3c5fd1';
  context.beginPath();
  context.arc(36, 36, 9, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#ffd84a';
  context.beginPath();
  context.arc(36, 36, 3, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#ffd84a';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(18, 24);
  context.lineTo(52, 17);
  context.stroke();
  context.fillStyle = '#f4f7fb';
  context.fillRect(0, 27, 72, 18);
  context.strokeStyle = '#26354d';
  context.lineWidth = 2;
  context.strokeRect(0, 27, 72, 18);
  context.fillStyle = '#1e3f8a';
  context.font = 'bold 12px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('COLDPLAY', 36, 36.5);
  return canvas;
}

export default class GetReady extends ParentClass implements IScreenChangerObject {
  public scoreBoard: ScoreBoard;

  private bird: BirdModel;
  private pipeGenerator: PipeGenerator;
  private state: string;
  private gameState: IGameState;
  private count: CounterModel;
  private game: MainGameController;
  private bannerInstruction: BannerInstruction;
  private transition: FlashScreen;
  private hideBird: boolean;
  private flashScreen: FlashScreen;
  private showScoreBoard: boolean;
  private coins: IBonusItem[];
  private bonusSprites: Map<IBonusType, HTMLCanvasElement>;
  private nextCoinSpawn: number;
  private speedMultiplier: number;
  private survivalTime: number;

  constructor(game: MainGameController) {
    super();
    this.state = 'waiting';
    this.bird = new BirdModel();
    this.count = new CounterModel();
    this.game = game;
    this.pipeGenerator = this.game.pipeGenerator;
    this.bannerInstruction = new BannerInstruction();
    this.gameState = 'none';
    this.scoreBoard = new ScoreBoard();
    this.transition = new FlashScreen({
      interval: 500,
      strong: 1.0,
      style: 'black',
      easing: 'sineWaveHS'
    });
    this.flashScreen = new FlashScreen({
      style: 'white',
      interval: 180,
      strong: 0.7,
      easing: 'linear'
    });
    this.hideBird = false;
    this.showScoreBoard = false;
    this.coins = [];
    this.bonusSprites = new Map<IBonusType, HTMLCanvasElement>();
    this.nextCoinSpawn = .9;
    this.speedMultiplier = 1;
    this.survivalTime = 0;

    this.transition.setEvent([0.99, 1], this.reset.bind(this));
  }

  public init(): void {
    this.bird.init();
    this.count.init();
    this.bannerInstruction.init();
    this.scoreBoard.init();
    this.setButtonEvent();
    this.flashScreen.init();
    this.transition.init();
    this.bonusSprites.set('euro', createEuroSprite());
    this.bonusSprites.set('book', createBookSprite());
    this.bonusSprites.set('vinyl', createVinylSprite());
  }

  public reset(): void {
    this.gameState = 'none';
    this.state = 'waiting';
    this.game.background.reset();
    this.game.platform.reset();
    this.pipeGenerator.reset();
    this.bannerInstruction.reset();
    this.game.bgPause = false;
    this.hideBird = false;
    this.showScoreBoard = false;
    this.coins = [];
    this.nextCoinSpawn = .9;
    this.speedMultiplier = 1;
    this.survivalTime = 0;
    this.scoreBoard.hide();
    this.bird.reset();
  }

  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });

    this.bird.resize(this.canvasSize);
    this.count.resize(this.canvasSize);
    this.bannerInstruction.resize(this.canvasSize);
    this.scoreBoard.resize(this.canvasSize);
    this.flashScreen.resize(this.canvasSize);
    this.transition.resize(this.canvasSize);
  }

  public Update(dt: number): void {
    this.flashScreen.Update(dt);
    this.transition.Update(dt);
    this.scoreBoard.Update(dt);

    if (!this.bird.alive) {
      this.game.bgPause = true;
      this.bird.Update(dt);
      return;
    }

    if (this.state === 'waiting') {
      this.bird.doWave(
        {
          x: this.bird.coordinate.x,
          y: this.canvasSize.height * 0.48
        },
        1,
        6
      );
      return;
    }

    this.survivalTime += dt;
    this.speedMultiplier = Math.min(1.8, 1 + this.survivalTime * 0.035);
    this.pipeGenerator.setSpeedMultiplier(this.speedMultiplier);

    this.bannerInstruction.Update(dt);
    this.updateCoins(dt);
    this.pipeGenerator.Update(dt);
    this.bird.Update(dt);

    if (this.bird.isDead(this.pipeGenerator.pipes)) {
      this.flashScreen.reset();
      this.flashScreen.start();

      this.gameState = 'died';

      window.setTimeout(() => {
        this.scoreBoard.setScore(this.bird.score);
        this.showScoreBoard = true;
        window.setTimeout(() => {
          this.scoreBoard.showBoard();
          Sfx.swoosh();
        }, 700);
        this.scoreBoard.showBanner();
        Sfx.swoosh();
      }, 500);

      Sfx.hit(() => {
        this.bird.playDead();
      });
    }
  }

  public Display(context: CanvasRenderingContext2D): void {
    if (this.state === 'playing' || this.state === 'waiting') {
      this.bannerInstruction.Display(context);

      if (this.gameState !== 'died' || !this.showScoreBoard) {
        this.count.setNum(this.bird.score);
        this.count.Display(context);
      }

      this.displayCoins(context);

      if (!this.hideBird) this.bird.Display(context);

      this.scoreBoard.Display(context);
    }

    this.flashScreen.Display(context);
    this.transition.Display(context);
  }

  public setButtonEvent(): void {
    this.scoreBoard.onRestart(() => {
      if (this.transition.status.running) return;
      this.transition.reset();
      this.transition.start();
    });

    // this.scoreBoard.onShowRanks(() => {
    //   console.log("ranking button")
    // })
  }

  public click({ x, y }: ICoordinate): void {
    if (this.gameState === 'died') return;

    this.state = 'playing';
    this.gameState = 'playing';
    this.bannerInstruction.tap();
    this.bird.flap();
  }

  public mouseDown({ x, y }: ICoordinate): void {
    if (this.gameState !== 'died') return;

    this.scoreBoard.mouseDown({ x, y });
  }

  public mouseUp({ x, y }: ICoordinate): void {
    if (this.gameState !== 'died') return;

    this.scoreBoard.mouseUp({ x, y });
  }
  public startAtKeyBoardEvent(): void {
    if (this.gameState === 'died') this.scoreBoard.triggerPlayATKeyboardEvent();
  }

  private spawnCoin(): void {
    const size = this.canvasSize.width * 0.09;
    const roll = Math.random();
    const type: IBonusType = roll < 0.45 ? 'euro' : roll < 0.73 ? 'book' : 'vinyl';
    this.coins.push({
      x: this.canvasSize.width + size,
      y: this.canvasSize.height * (0.23 + Math.random() * 0.42),
      size,
      wobble: Math.random() * Math.PI * 2,
      collected: false,
      type
    });
  }

  private updateCoins(dt: number): void {
    if (this.state === 'playing' && this.bird.alive) {
      this.nextCoinSpawn -= dt;
      if (this.nextCoinSpawn <= 0) {
        this.spawnCoin();
        this.nextCoinSpawn = 1.25 + Math.random() * 1.4;
      }
    }

    const speed = this.canvasSize.width * getGameSpeed() * this.speedMultiplier;
    const birdX = this.bird.coordinate.x;
    const birdY = this.bird.coordinate.y;

    for (const coin of this.coins) {
      coin.x -= speed * dt;
      coin.y += Math.sin(performance.now() / 220 + coin.wobble) * 8 * dt;

      if (!coin.collected) {
        const dx = coin.x - birdX;
        const dy = coin.y - birdY;
        const hitRadius = coin.size * 0.5;
        if (dx * dx + dy * dy < hitRadius * hitRadius) {
          coin.collected = true;
          this.bird.score += 1;
          Sfx.point();
        }
      }
    }

    this.coins = this.coins.filter((coin) => !coin.collected && coin.x + coin.size > -20);
  }

  private displayCoins(context: CanvasRenderingContext2D): void {
    for (const coin of this.coins) {
      const sprite = this.bonusSprites.get(coin.type);
      if (!sprite) continue;
      const x = coin.x - coin.size / 2;
      const y = coin.y - coin.size / 2;
      context.drawImage(sprite, x, y, coin.size, coin.size);
    }
  }
}
