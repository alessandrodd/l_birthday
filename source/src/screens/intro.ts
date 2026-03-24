/**
 * Display "FlappyBird"
 * Display the bird close to the middle and at the center
 *
 * Display "Play", "Rate" buttons and maybe include the
 * "Ranking" button but with no function. Just to mimic the
 * original game since ranking only works if the game is
 * connected to Google Play Games or Apple Game Center
 * */

import BirdModel from '../model/bird';
import { IScreenChangerObject } from '../lib/screen-changer';
import ParentClass from '../abstracts/parent-class';
import { ENV } from '../constants';
import ButtonsHandler from '../buttons';
import { DifficultyMode, GAME_TITLE, PASSWORD_TARGET_SCORE, getDifficulty, setDifficulty } from '../game-config';

interface IDifficultyButton {
  mode: DifficultyMode;
  left: number;
  top: number;
  width: number;
  height: number;
}

export default class Introduction extends ParentClass implements IScreenChangerObject {
  public btnHandler: ButtonsHandler;

  private bird: BirdModel;

  constructor() {
    super();
    this.bird = new BirdModel();
    this.btnHandler = new ButtonsHandler();
  }

  public init(): void {
    this.bird.init();

    this.btnHandler.init();

    for (const btn of ButtonsHandler.btns) {
      btn.active = true;
    }
  }

  public resize(screen_dimension: IDimension): void {
    super.resize(screen_dimension);
    this.bird.resize(screen_dimension);

    this.btnHandler.resize(screen_dimension);
  }

  public Update(): void {
    this.bird.doWave(
      {
        x: this.canvasSize.width * 0.5,
        y: this.canvasSize.height * 0.4
      },
      1.4,
      9
    );

    this.btnHandler.Update();
  }

  public Display(context: CanvasRenderingContext2D): void {
    this.btnHandler.Display(context);

    this.bird.Display(context);

    this.drawTitle(context);
    this.drawGoalText(context);
    this.drawDifficultySwitch(context);

    this.insertAppVersion(context);
  }

  private drawTitle(context: CanvasRenderingContext2D): void {
    const size = this.canvasSize.width * 0.12;
    const x = this.canvasSize.width * 0.5;
    const y = this.canvasSize.height * 0.28;

    context.save();
    context.textAlign = 'center';
    context.lineJoin = 'round';
    context.lineWidth = this.canvasSize.width * 0.02;
    context.strokeStyle = '#62351e';
    context.fillStyle = '#f7e3ac';
    context.font = `bold ${size}px "Trebuchet MS", sans-serif`;
    context.strokeText(GAME_TITLE, x, y);
    context.fillText(GAME_TITLE, x, y);
    context.restore();
  }

  private drawGoalText(context: CanvasRenderingContext2D): void {
    const x = this.canvasSize.width * 0.5;
    const y = this.canvasSize.height * 0.565;
    const boxWidth = this.canvasSize.width * 0.78;
    const boxHeight = this.canvasSize.height * 0.14;
    const left = x - boxWidth / 2;

    context.save();
    context.fillStyle = 'rgba(32, 23, 33, 0.7)';
    context.fillRect(left, y - boxHeight / 2, boxWidth, boxHeight);
    context.strokeStyle = 'rgba(255, 240, 186, 0.38)';
    context.lineWidth = 2;
    context.strokeRect(left, y - boxHeight / 2, boxWidth, boxHeight);
    context.textAlign = 'center';
    context.fillStyle = '#f8f2df';
    context.font = `bold ${this.canvasSize.width * 0.032}px sans-serif`;
    context.fillText(`Are you ready for a challenge? :)`, x, y - 22);
    context.font = `${this.canvasSize.width * 0.028}px sans-serif`;
    context.fillText(`Reach at least ${PASSWORD_TARGET_SCORE} points`, x, y + 16);
    context.fillText(`to unlock the secret password after Game Over`, x, y + 48);
    context.restore();
  }

  private getDifficultyButtons(): IDifficultyButton[] {
    const width = this.canvasSize.width * 0.24;
    const height = this.canvasSize.height * 0.052;
    const gap = this.canvasSize.width * 0.04;
    const top = this.canvasSize.height * 0.635;
    const left = this.canvasSize.width * 0.5 - width - gap / 2;

    return [
      { mode: 'normal', left, top, width, height },
      { mode: 'hard', left: left + width + gap, top, width, height }
    ];
  }

  private drawDifficultySwitch(context: CanvasRenderingContext2D): void {
    const buttons = this.getDifficultyButtons();
    const current = getDifficulty();

    context.save();
    context.textAlign = 'center';
    context.fillStyle = '#f8f2df';
    context.font = `bold ${this.canvasSize.width * 0.03}px sans-serif`;
    context.fillText('Difficulty', this.canvasSize.width * 0.5, this.canvasSize.height * 0.615);

    for (const button of buttons) {
      const active = button.mode === current;
      context.fillStyle = active ? 'rgba(255, 173, 64, 0.95)' : 'rgba(32, 23, 33, 0.75)';
      context.fillRect(button.left, button.top, button.width, button.height);
      context.strokeStyle = active ? '#fff0b8' : 'rgba(255, 240, 186, 0.38)';
      context.lineWidth = 2;
      context.strokeRect(button.left, button.top, button.width, button.height);
      context.fillStyle = active ? '#38251f' : '#f8f2df';
      context.font = `bold ${this.canvasSize.width * 0.028}px sans-serif`;
      context.fillText(
        button.mode === 'normal' ? 'Normal' : 'Hard',
        button.left + button.width / 2,
        button.top + button.height / 2 + this.canvasSize.height * 0.008
      );
    }
    context.restore();
  }

  private insertAppVersion(context: CanvasRenderingContext2D): void {
    const fSize = this.canvasSize.width * 0.04;
    const bot = this.canvasSize.height * 0.985;
    const right = this.canvasSize.width * 0.985;

    context.font = `bold ${fSize}px monospace`;
    context.textAlign = 'center';
    context.fillStyle = '#8E8E93';
    context.fillText(`v${ENV.APP_VERSION}`, right - 2 * fSize, bot);
  }

  public mouseDown(coor: ICoordinate): void {
    for (const btn of ButtonsHandler.btns) {
      btn.mouseEvent('down', coor);
    }
  }

  public mouseUp(coor: ICoordinate): void {
    for (const button of this.getDifficultyButtons()) {
      const withinX = coor.x >= button.left && coor.x <= button.left + button.width;
      const withinY = coor.y >= button.top && coor.y <= button.top + button.height;
      if (withinX && withinY) {
        setDifficulty(button.mode);
        return;
      }
    }

    for (const btn of ButtonsHandler.btns) {
      btn.mouseEvent('up', coor);
    }
  }

  public startAtKeyBoardEvent(): void {
    ButtonsHandler.play.click();
  }
}
