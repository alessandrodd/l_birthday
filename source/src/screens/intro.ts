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
import { GAME_TITLE, PASSWORD_TARGET_SCORE } from '../game-config';

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
    for (const btn of ButtonsHandler.btns) {
      btn.mouseEvent('up', coor);
    }
  }

  public startAtKeyBoardEvent(): void {
    ButtonsHandler.play.click();
  }
}
