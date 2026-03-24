import { rescaleDim } from '../utils';

import ParentObject from '../abstracts/parent-class';
import SparkModel from './spark';
import SpriteDestructor from '../lib/sprite-destructor';
import { Fly, BounceIn, TimingEvent } from '../lib/animation';
import Storage from '../lib/storage';
import ButtonsHandler from '../buttons';
import Sfx from './sfx';
import { PASSWORD_TARGET_SCORE, SECRET_PASSWORD, getDifficulty } from '../game-config';

export default class ScoreBoard extends ParentObject {
  private static readonly FLAG_SHOW_BANNER = 0b0001;
  private static readonly FLAG_SHOW_SCOREBOARD = 0b0010;
  private static readonly FLAG_SHOW_BUTTONS = 0b0100;
  private static readonly FLAG_NEW_HIGH_SCORE = 0b1000;

  private flags: number;

  private images: Map<string, HTMLImageElement>;

  private FlyInAnim: Fly;
  private BounceInAnim: BounceIn;
  private currentScore: number;
  private currentGeneratedNumber: number;
  private currentHighScore: number;
  private rewardUnlocked: boolean;
  private TimingEventAnim: TimingEvent;
  private spark: SparkModel;

  buttonHandler: ButtonsHandler;

  constructor() {
    super();
    this.flags = 0;
    this.images = new Map<string, HTMLImageElement>();

    this.buttonHandler = new ButtonsHandler();

    this.spark = new SparkModel();
    this.currentHighScore = 0;
    this.currentGeneratedNumber = 0;
    this.currentScore = 0;
    this.rewardUnlocked = false;
    this.FlyInAnim = new Fly({
      duration: 500,
      from: {
        x: 0.5,
        y: 1.5
      },
      to: {
        x: 0.5,
        y: 0.438
      },
      transition: 'easeOutExpo'
    });
    this.TimingEventAnim = new TimingEvent({ diff: 30 });
    this.BounceInAnim = new BounceIn({
      durations: {
        bounce: 300,
        fading: 100
      }
    });
  }

  public init(): void {
    this.images.set('banner-gameover', SpriteDestructor.asset('banner-game-over'));
    this.images.set('score-board', SpriteDestructor.asset('score-board'));
    this.images.set('coin-10', SpriteDestructor.asset('coin-dull-bronze'));
    this.images.set('coin-20', SpriteDestructor.asset('coin-dull-metal'));
    this.images.set('coin-30', SpriteDestructor.asset('coin-shine-gold'));
    this.images.set('coin-40', SpriteDestructor.asset('coin-shine-silver'));
    this.images.set('new-icon', SpriteDestructor.asset('toast-new'));

    for (let i = 0; i < 10; ++i) {
      this.images.set(`number-${i}`, SpriteDestructor.asset(`number-md-${i}`));
    }

    for (const btn of ButtonsHandler.btns) {
      btn.init();
      btn.active = false;
    }

    this.spark.init();

    /**
     * We need to make sure about this
     * else may throw any error during
     * image retrieval
     * */
    const prevScore = Storage.get('highscore') as number | undefined;
    this.currentHighScore = typeof prevScore === 'number' ? prevScore : 0;
  }

  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });
    this.spark.resize(this.canvasSize);

    for (const btn of ButtonsHandler.btns) {
      btn.resize(this.canvasSize);
    }
  }

  public Update(dt: number): void {
    this.spark.Update(dt);

    for (const btn of ButtonsHandler.btns) {
      btn.Update();
    }
  }

  public Display(context: CanvasRenderingContext2D): void {
    if ((this.flags & ScoreBoard.FLAG_SHOW_BANNER) !== 0) {
      const bgoScaled = rescaleDim(
        {
          width: this.images.get('banner-gameover')!.width,
          height: this.images.get('banner-gameover')!.height
        },
        { width: this.canvasSize.width * 0.7 }
      );
      const anim = this.BounceInAnim.value;
      const yPos = this.canvasSize.height * 0.225 - bgoScaled.height / 2;

      context.globalAlpha = anim.opacity;
      context.drawImage(
        this.images.get('banner-gameover')!,
        this.canvasSize.width * 0.5 - bgoScaled.width / 2,
        yPos + anim.value * (this.canvasSize.height * 0.015),
        bgoScaled.width,
        bgoScaled.height
      );
      context.globalAlpha = 1;
    }

    if ((this.flags & ScoreBoard.FLAG_SHOW_SCOREBOARD) !== 0) {
      const sbScaled = rescaleDim(
        {
          width: this.images.get('score-board')!.width,
          height: this.images.get('score-board')!.height
        },
        { width: this.canvasSize.width * 0.85 }
      );

      // Need to clone
      const anim = Object.assign({}, this.FlyInAnim.value);
      anim.x = this.canvasSize.width * anim.x - sbScaled.width / 2;
      anim.y = this.canvasSize.height * anim.y - sbScaled.height / 2;

      context.drawImage(this.images.get('score-board')!, anim.x, anim.y, sbScaled.width, sbScaled.height);

      if (this.TimingEventAnim.value && this.currentScore > this.currentGeneratedNumber) {
        this.currentGeneratedNumber++;
      }

      /**
       * Only show the buttons, medal, Update high score if possible
       * and 'new' icon after counting
       * */
      if (this.TimingEventAnim.status.complete && !this.TimingEventAnim.status.running) {
        if (this.currentGeneratedNumber > this.currentHighScore) {
          this.setHighScore(this.currentGeneratedNumber);
          this.flags |= ScoreBoard.FLAG_NEW_HIGH_SCORE;
        }

        this.addMedal(context, anim, sbScaled);
        this.showButtons();
      }

      this.displayScore(context, anim, sbScaled);
      this.displayBestScore(context, anim, sbScaled, (this.flags & ScoreBoard.FLAG_NEW_HIGH_SCORE) !== 0);
      this.displayReward(context, anim, sbScaled);

      if (this.FlyInAnim.status.complete && !this.FlyInAnim.status.running) {
        this.TimingEventAnim.start();

        if (this.currentGeneratedNumber === this.currentScore) {
          this.TimingEventAnim.stop();
        }
      }
    }

    if ((this.flags & ScoreBoard.FLAG_SHOW_BUTTONS) !== 0) {
      for (const btn of ButtonsHandler.btns) {
        btn.Display(context);
      }
    }
  }

  public showBanner(): void {
    this.flags |= ScoreBoard.FLAG_SHOW_BANNER;
    this.BounceInAnim.start();
  }

  public showBoard(): void {
    this.flags |= ScoreBoard.FLAG_SHOW_SCOREBOARD;
    this.FlyInAnim.start();
    this.spark.doSpark();
    if (this.rewardUnlocked) {
      Sfx.tantiAuguri();
    }
  }

  public showButtons(): void {
    this.flags |= ScoreBoard.FLAG_SHOW_BUTTONS;

    for (const btn of ButtonsHandler.btns) {
      btn.active = true;
    }
  }

  private setHighScore(num: number): void {
    Storage.save('highscore', num);
    this.currentHighScore = num;
  }

  public setScore(num: number): void {
    this.currentScore = num;
    this.rewardUnlocked = num >= PASSWORD_TARGET_SCORE;
  }

  private addMedal(context: CanvasRenderingContext2D, coord: ICoordinate, parentSize: IDimension): void {
    if (this.currentScore < 10) return; // So sad having a no medal :)
    let medal: HTMLImageElement | undefined;

    if (this.currentScore >= 10 && this.currentScore < 20) {
      medal = this.images.get('coin-10');
    } else if (this.currentScore >= 20 && this.currentScore < 30) {
      medal = this.images.get('coin-20');
    } else {
      if (Math.floor(this.currentScore / 10) % 2 === 0) {
        medal = this.images.get('coin-40');
      } else {
        medal = this.images.get('coin-30');
      }
    }

    const scaled = rescaleDim(
      {
        width: medal!.width,
        height: medal!.height
      },
      { width: parentSize.width * 0.1878 }
    );
    const pos = {
      x: (coord.x + parentSize.width / 2) * 0.36,
      y: (coord.y + parentSize.height / 2) * 0.9196
    };

    context.drawImage(medal!, pos.x, pos.y, scaled.width, scaled.height);

    this.spark.move(pos, scaled);
    this.spark.Display(context);
  }

  private displayScore(context: CanvasRenderingContext2D, coord: ICoordinate, parentSize: IDimension): void {
    const numSize = rescaleDim(
      {
        width: this.images.get('number-1')!.width,
        height: this.images.get('number-1')!.height
      },
      { width: parentSize.width * 0.05 }
    );

    coord = Object.assign({}, coord);
    coord.x = (coord.x + parentSize.width / 2) * 1.565;
    coord.y = (coord.y + parentSize.height / 2) * 0.864;

    const numArr: string[] = String(this.currentGeneratedNumber).split('');

    numArr.reverse().forEach((c: string, index: number) => {
      context.drawImage(
        this.images.get(`number-${c}`)!,
        coord.x - index * (numSize.width + 5),
        coord.y,
        numSize.width,
        numSize.height
      );
    });
  }

  private displayBestScore(context: CanvasRenderingContext2D, coord: ICoordinate, parentSize: IDimension, _p0: boolean): void {
    const numSize = rescaleDim(
      {
        width: this.images.get('number-1')!.width,
        height: this.images.get('number-1')!.height
      },
      { width: parentSize.width * 0.05 }
    );

    coord = Object.assign({}, coord);

    coord.x = (coord.x + parentSize.width / 2) * 1.565;
    coord.y = (coord.y + parentSize.height / 2) * 1.074;

    const numArr: string[] = String(this.currentHighScore).split('');

    numArr.reverse().forEach((c: string, index: number) => {
      context.drawImage(
        this.images.get(`number-${c}`)!,
        coord.x - index * (numSize.width + 5),
        coord.y,
        numSize.width,
        numSize.height
      );
    });

    if ((this.flags & ScoreBoard.FLAG_NEW_HIGH_SCORE) === 0) return;

    const toastSize = rescaleDim(
      {
        width: this.images.get('new-icon')!.width,
        height: this.images.get('new-icon')!.height
      },
      { width: parentSize.width * 0.14 }
    );

    context.drawImage(this.images.get('new-icon')!, coord.x * 0.73, coord.y * 0.922, toastSize.width, toastSize.height);
  }

  private displayReward(context: CanvasRenderingContext2D, coord: ICoordinate, parentSize: IDimension): void {
    if (!this.rewardUnlocked) return;

    const hardMode = getDifficulty() === 'hard';
    const boxWidth = parentSize.width * 0.95;
    const boxHeight = hardMode ? parentSize.height * 0.42 : parentSize.height * 0.58;
    const x = coord.x + parentSize.width / 2 - boxWidth / 2;
    const y = coord.y + parentSize.height * 0.98;

    context.save();
    context.fillStyle = 'rgba(28, 18, 18, 0.88)';
    context.fillRect(x, y, boxWidth, boxHeight);
    context.strokeStyle = '#f3cf4b';
    context.lineWidth = 3;
    context.strokeRect(x, y, boxWidth, boxHeight);
    context.textAlign = 'center';
    context.fillStyle = '#fff4cf';
    context.font = `bold ${Math.max(13, parentSize.width * 0.052)}px sans-serif`;
    context.fillText('You made it!! :)', x + boxWidth / 2, y + boxHeight * 0.12);
    if (hardMode) {
      context.font = `${Math.max(10, parentSize.width * 0.04)}px sans-serif`;
      context.fillText(`You reached ${PASSWORD_TARGET_SCORE}+ points in Hard mode.`, x + boxWidth / 2, y + boxHeight * 0.42);
      context.font = `bold ${Math.max(11, parentSize.width * 0.045)}px sans-serif`;
      context.fillStyle = '#ffdf73';
      context.fillText('Wow, you really took up the challenge!!!', x + boxWidth / 2, y + boxHeight * 0.64);
      context.fillText('Fine, you got an Iced Coffee on me. :) Well done!', x + boxWidth / 2, y + boxHeight * 0.82);
    } else {
      context.font = `${Math.max(10, parentSize.width * 0.038)}px sans-serif`;
      context.fillText(`You reached ${PASSWORD_TARGET_SCORE}+ points. Secret password:`, x + boxWidth / 2, y + boxHeight * 0.29);
      context.font = `bold ${Math.max(12, parentSize.width * 0.06)}px monospace`;
      context.fillStyle = '#ffdf73';
      context.fillText(SECRET_PASSWORD, x + boxWidth / 2, y + boxHeight * 0.45);
      context.fillStyle = '#fff4cf';
      context.font = `${Math.max(10, parentSize.width * 0.036)}px sans-serif`;
      context.fillText('Wishing you the happiest of birthdays,', x + boxWidth / 2, y + boxHeight * 0.64);
      context.fillText('and congratulations again for signing the new contract :)', x + boxWidth / 2, y + boxHeight * 0.77);
      context.fillText('Enjoy!', x + boxWidth / 2, y + boxHeight * 0.89);
    }
    context.restore();
  }

  /**
   * Hide all at once
   * */
  public hide(): void {
    this.flags = 0;

    for (const btn of ButtonsHandler.btns) {
      btn.active = false;
    }

    this.currentGeneratedNumber = 0;
    this.rewardUnlocked = false;
    this.FlyInAnim.reset();
    this.BounceInAnim.reset();
    this.TimingEventAnim.reset();
    this.spark.stop();
  }

  public onRestart(cb: IEmptyFunction): void {
    ButtonsHandler.play.onClick(cb);
    ButtonsHandler.play.active = true;

  }

  public onShowRanks(_cb: IEmptyFunction): void {
    /**
     * I don't know what to do on ranking?
     *
     * Should i create API for this?
     * */
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

  public triggerPlayATKeyboardEvent(): void {
    if ((this.flags & ScoreBoard.FLAG_SHOW_BUTTONS) !== 0) ButtonsHandler.play.click();
  }
}
