import { GAME_SPEED, PIPE_HOLL_SIZE } from '../constants';
import ParentClass from '../abstracts/parent-class';
import SceneGenerator from './scene-generator';

export interface IPipePairPosition {
  top: ICoordinate;
  bottom: ICoordinate;
}

export interface IPipeScaled {
  top: IDimension;
  bottom: IDimension;
}

export type IPipeColor = 'ecb' | 'japan';
export type IPipeRecords = Map<string, HTMLCanvasElement>;

interface IAlphaMask {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

interface ICollisionRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const SPRITE_DIMENSION = {
  width: 180,
  height: 420
} as const;

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function createFlippedSprite(image: CanvasImageSource, width: number, height: number): HTMLCanvasElement {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d')!;
  context.translate(0, height);
  context.scale(1, -1);
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

function clipPolygon(
  context: CanvasRenderingContext2D,
  points: [number, number][],
  callback: IEmptyFunction
): void {
  context.save();
  context.beginPath();
  context.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index++) {
    context.lineTo(points[index][0], points[index][1]);
  }
  context.closePath();
  context.clip();
  callback();
  context.restore();
}

function drawWindowGrid(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  cols: number,
  rows: number,
  color: string
): void {
  const stepX = width / cols;
  const stepY = height / rows;
  context.fillStyle = color;

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      context.fillRect(x + col * stepX + 1, y + row * stepY + 1, Math.max(2, stepX - 3), 2);
    }
  }
}

function drawEuroFlag(context: CanvasRenderingContext2D, x: number, y: number): void {
  context.fillStyle = '#2f5ca9';
  context.fillRect(x, y, 30, 20);
  context.strokeStyle = '#1c3764';
  context.lineWidth = 1;
  context.strokeRect(x, y, 30, 20);
  context.fillStyle = '#f3cf4b';

  for (let index = 0; index < 8; index++) {
    const angle = (Math.PI * 2 * index) / 8;
    const px = x + 15 + Math.cos(angle) * 6.4;
    const py = y + 10 + Math.sin(angle) * 6.4;
    context.beginPath();
    context.arc(px, py, 1.3, 0, Math.PI * 2);
    context.fill();
  }
}

function createEcbSprite(): HTMLCanvasElement {
  const canvas = createCanvas(SPRITE_DIMENSION.width, SPRITE_DIMENSION.height);
  const context = canvas.getContext('2d')!;
  const leftTower: [number, number][] = [
    [18, 54],
    [96, 36],
    [100, 382],
    [12, 405]
  ];
  const rightTower: [number, number][] = [
    [96, 46],
    [158, 78],
    [166, 402],
    [88, 375]
  ];
  const atrium: [number, number][] = [
    [94, 68],
    [116, 52],
    [126, 378],
    [96, 392]
  ];

  context.shadowColor = 'rgba(8, 14, 24, 0.18)';
  context.shadowBlur = 10;
  context.shadowOffsetY = 4;

  const leftGradient = context.createLinearGradient(0, 0, 0, SPRITE_DIMENSION.height);
  leftGradient.addColorStop(0, '#dceaf6');
  leftGradient.addColorStop(0.45, '#98b5ce');
  leftGradient.addColorStop(1, '#6e8ca8');
  context.fillStyle = leftGradient;
  context.beginPath();
  context.moveTo(leftTower[0][0], leftTower[0][1]);
  leftTower.slice(1).forEach(([x, y]) => context.lineTo(x, y));
  context.closePath();
  context.fill();

  const rightGradient = context.createLinearGradient(0, 0, 0, SPRITE_DIMENSION.height);
  rightGradient.addColorStop(0, '#9eb4ca');
  rightGradient.addColorStop(0.55, '#617a95');
  rightGradient.addColorStop(1, '#42546c');
  context.fillStyle = rightGradient;
  context.beginPath();
  context.moveTo(rightTower[0][0], rightTower[0][1]);
  rightTower.slice(1).forEach(([x, y]) => context.lineTo(x, y));
  context.closePath();
  context.fill();

  context.shadowBlur = 0;

  clipPolygon(context, leftTower, () => {
    drawWindowGrid(context, 16, 56, 90, 330, 8, 24, 'rgba(255, 255, 255, 0.28)');
    context.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    context.lineWidth = 1;
    for (let x = 18; x < 102; x += 10) {
      context.beginPath();
      context.moveTo(x, 42);
      context.lineTo(x + 4, 396);
      context.stroke();
    }
  });

  clipPolygon(context, rightTower, () => {
    drawWindowGrid(context, 94, 70, 72, 318, 5, 22, 'rgba(194, 224, 255, 0.22)');
    context.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    context.lineWidth = 1;
    for (let y = 90; y < 390; y += 16) {
      context.beginPath();
      context.moveTo(100, y);
      context.lineTo(162, y);
      context.stroke();
    }
  });

  const atriumGradient = context.createLinearGradient(0, 0, 0, SPRITE_DIMENSION.height);
  atriumGradient.addColorStop(0, '#35506c');
  atriumGradient.addColorStop(1, '#203449');
  context.fillStyle = atriumGradient;
  context.beginPath();
  context.moveTo(atrium[0][0], atrium[0][1]);
  atrium.slice(1).forEach(([x, y]) => context.lineTo(x, y));
  context.closePath();
  context.fill();

  context.strokeStyle = 'rgba(173, 220, 255, 0.4)';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(103, 72);
  context.lineTo(120, 376);
  context.stroke();

  context.fillStyle = '#d9dee7';
  context.beginPath();
  context.moveTo(8, 370);
  context.lineTo(76, 356);
  context.lineTo(116, 356);
  context.lineTo(156, 380);
  context.lineTo(172, 380);
  context.lineTo(172, 408);
  context.lineTo(8, 408);
  context.closePath();
  context.fill();

  context.strokeStyle = 'rgba(54, 76, 99, 0.55)';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(52, 114);
  context.lineTo(52, 152);
  context.stroke();
  drawEuroFlag(context, 54, 116);

  return canvas;
}

function createJapanSprite(): HTMLCanvasElement {
  const canvas = createCanvas(SPRITE_DIMENSION.width, SPRITE_DIMENSION.height);
  const context = canvas.getContext('2d')!;

  context.shadowColor = 'rgba(18, 12, 10, 0.22)';
  context.shadowBlur = 8;
  context.shadowOffsetY = 4;

  const bodyGradient = context.createLinearGradient(0, 0, 0, SPRITE_DIMENSION.height);
  bodyGradient.addColorStop(0, '#8d5d49');
  bodyGradient.addColorStop(0.45, '#744a3c');
  bodyGradient.addColorStop(1, '#513127');
  context.fillStyle = bodyGradient;
  context.fillRect(34, 118, 112, 286);

  context.fillStyle = '#3f2c25';
  context.fillRect(42, 338, 96, 52);

  context.fillStyle = '#5a3a30';
  context.fillRect(52, 70, 76, 36);

  context.fillStyle = '#d6d3ce';
  context.beginPath();
  context.moveTo(24, 92);
  context.lineTo(156, 92);
  context.lineTo(146, 102);
  context.lineTo(34, 102);
  context.closePath();
  context.fill();

  context.fillStyle = '#6e4a3d';
  context.fillRect(30, 102, 120, 16);

  context.fillStyle = '#a26e58';
  for (let x = 44; x <= 128; x += 21) {
    context.fillRect(x, 120, 5, 216);
  }

  context.fillStyle = '#b78b78';
  context.fillRect(40, 144, 100, 50);

  context.fillStyle = '#4b5965';
  context.fillRect(46, 150, 88, 38);

  context.fillStyle = '#6d747c';
  for (let x = 46; x <= 126; x += 14) {
    context.fillRect(x, 150, 3, 38);
  }

  context.fillStyle = '#34383e';
  for (let y = 126; y <= 326; y += 22) {
    context.fillRect(44, y, 92, 2);
  }

  context.shadowBlur = 0;
  context.fillStyle = '#49505a';
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 4; col++) {
      context.fillRect(58 + col * 17, 206 + row * 16, 10, 10);
      context.fillStyle = '#8ca0b0';
      context.fillRect(60 + col * 17, 208 + row * 16, 6, 5);
      context.fillStyle = '#49505a';
    }
  }

  context.fillStyle = '#4b5259';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      context.fillRect(60 + col * 22, 132 + row * 14, 12, 9);
      context.fillStyle = '#93a7b7';
      context.fillRect(62 + col * 22, 134 + row * 14, 7, 4);
      context.fillStyle = '#4b5259';
    }
  }

  context.fillStyle = '#35312f';
  for (let col = 0; col < 6; col++) {
    context.fillRect(42 + col * 16, 344, 10, 40);
  }

  context.fillStyle = '#d6d3ce';
  context.fillRect(44, 62, 92, 4);
  context.fillRect(50, 66, 80, 3);

  context.fillStyle = '#26282c';
  context.fillRect(62, 48, 56, 18);
  context.fillStyle = '#c7c4bc';
  context.fillRect(70, 53, 14, 4);
  context.fillRect(90, 53, 10, 4);
  context.fillRect(104, 52, 6, 7);

  context.strokeStyle = 'rgba(255, 224, 147, 0.35)';
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(30, 104);
  context.lineTo(150, 104);
  context.moveTo(42, 118);
  context.lineTo(138, 118);
  context.stroke();

  return canvas;
}

export default class Pipe extends ParentClass {
  public static pipeSize: IDimension = {
    width: 0,
    height: 0
  };

  private static readonly spriteCache = new Map<string, HTMLCanvasElement>();
  private static readonly alphaMasks: Map<string, IAlphaMask> = new Map<string, IAlphaMask>();

  private scaled: IPipeScaled;
  public hollSize: number;
  public pipePosition: IPipePairPosition;
  public isPassed: boolean;

  private images: Map<string, HTMLCanvasElement>;
  private color: IPipeColor;

  constructor() {
    super();
    this.images = new Map<string, HTMLCanvasElement>();
    this.color = 'ecb';
    this.hollSize = 0;
    this.pipePosition = {
      top: { x: 0, y: 0 },
      bottom: { x: 0, y: 0 }
    };
    this.isPassed = false;
    this.velocity.x = GAME_SPEED;
    this.scaled = {
      top: { width: 0, height: 0 },
      bottom: { width: 0, height: 0 }
    };
  }

  public init(): void {
    if (Pipe.spriteCache.size === 0) {
      const ecb = createEcbSprite();
      const japan = createJapanSprite();
      Pipe.registerSprite('ecb.bottom', ecb);
      Pipe.registerSprite('ecb.top', createFlippedSprite(ecb, ecb.width, ecb.height));
      Pipe.registerSprite('japan.bottom', japan);
      Pipe.registerSprite('japan.top', createFlippedSprite(japan, japan.width, japan.height));
    }

    this.images = Pipe.spriteCache;
    Object.assign(SceneGenerator.pipeColorList, ['ecb', 'japan']);
  }

  public setHollPosition(coordinate: ICoordinate): void {
    this.hollSize = this.canvasSize.height * PIPE_HOLL_SIZE;
    this.coordinate = coordinate;
  }

  public resize({ width, height }: IDimension): void {
    const oldX = (this.coordinate.x / this.canvasSize.width) * 100;
    const oldY = (this.coordinate.y / this.canvasSize.height) * 100;

    super.resize({ width, height });

    const min = this.canvasSize.width * 0.22;
    const targetHeight = this.canvasSize.height * 0.63;
    Pipe.pipeSize = {
      width: min,
      height: targetHeight
    };

    this.hollSize = this.canvasSize.height * PIPE_HOLL_SIZE;
    this.coordinate.x = width * (oldX / 100);
    this.coordinate.y = height * (oldY / 100);
    this.velocity.x = width * GAME_SPEED;

    this.scaled.top = {
      width: min,
      height: targetHeight
    };
    this.scaled.bottom = {
      width: min,
      height: targetHeight
    };
  }

  public isOut(): boolean {
    return this.coordinate.x + Pipe.pipeSize.width < 0;
  }

  public use(select: IPipeColor): void {
    this.color = select;
  }

  public collisionHalfWidth(): number {
    const factor = this.color === 'ecb' ? 0.5 : 0.46;
    return (Pipe.pipeSize.width * factor) / 2;
  }

  public collidesWithRect(rect: ICollisionRect): boolean {
    const width = Pipe.pipeSize.width / 2;
    const posX = this.coordinate.x;
    const posY = this.coordinate.y;
    const radius = this.hollSize / 2;

    return (
      this.collidesWithSprite(
        `${this.color}.top`,
        rect,
        posX - width,
        -(this.scaled.top.height - Math.abs(posY - radius)),
        this.scaled.top.width,
        this.scaled.top.height
      ) ||
      this.collidesWithSprite(
        `${this.color}.bottom`,
        rect,
        posX - width,
        posY + radius,
        this.scaled.bottom.width,
        this.scaled.bottom.height
      )
    );
  }

  private collidesWithSprite(
    key: string,
    rect: ICollisionRect,
    spriteLeft: number,
    spriteTop: number,
    spriteWidth: number,
    spriteHeight: number
  ): boolean {
    const spriteRight = spriteLeft + spriteWidth;
    const spriteBottom = spriteTop + spriteHeight;
    const overlapLeft = Math.max(rect.left, spriteLeft);
    const overlapRight = Math.min(rect.right, spriteRight);
    const overlapTop = Math.max(rect.top, spriteTop);
    const overlapBottom = Math.min(rect.bottom, spriteBottom);

    if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
      return false;
    }

    const mask = Pipe.alphaMasks.get(key);
    const sprite = this.images.get(key);

    if (!mask || !sprite) {
      return false;
    }

    const sampleStep = Math.max(3, Math.min(overlapRight - overlapLeft, overlapBottom - overlapTop) / 3);

    for (let py = overlapTop; py <= overlapBottom; py += sampleStep) {
      for (let px = overlapLeft; px <= overlapRight; px += sampleStep) {
        const sx = Math.floor(((px - spriteLeft) / spriteWidth) * mask.width);
        const sy = Math.floor(((py - spriteTop) / spriteHeight) * mask.height);
        if (Pipe.maskHasAlpha(mask, sx, sy)) {
          return true;
        }
      }
    }

    return (
      Pipe.maskHasAlpha(mask, Math.floor(((overlapLeft - spriteLeft) / spriteWidth) * mask.width), Math.floor(((overlapTop - spriteTop) / spriteHeight) * mask.height)) ||
      Pipe.maskHasAlpha(mask, Math.floor(((overlapRight - spriteLeft) / spriteWidth) * mask.width), Math.floor(((overlapTop - spriteTop) / spriteHeight) * mask.height)) ||
      Pipe.maskHasAlpha(mask, Math.floor(((overlapLeft - spriteLeft) / spriteWidth) * mask.width), Math.floor(((overlapBottom - spriteTop) / spriteHeight) * mask.height)) ||
      Pipe.maskHasAlpha(mask, Math.floor(((overlapRight - spriteLeft) / spriteWidth) * mask.width), Math.floor(((overlapBottom - spriteTop) / spriteHeight) * mask.height))
    );
  }

  private static registerSprite(key: string, sprite: HTMLCanvasElement): void {
    Pipe.spriteCache.set(key, sprite);
    const context = sprite.getContext('2d')!;
    const imageData = context.getImageData(0, 0, sprite.width, sprite.height);
    Pipe.alphaMasks.set(key, {
      data: imageData.data,
      width: sprite.width,
      height: sprite.height
    });
  }

  private static maskHasAlpha(mask: IAlphaMask, x: number, y: number): boolean {
    const clampedX = Math.max(0, Math.min(mask.width - 1, x));
    const clampedY = Math.max(0, Math.min(mask.height - 1, y));
    return mask.data[(clampedY * mask.width + clampedX) * 4 + 3] > 40;
  }

  public Update(dt: number): void {
    this.coordinate.x -= this.velocity.x * dt;
  }

  public Display(context: CanvasRenderingContext2D): void {
    const width = Pipe.pipeSize.width / 2;
    const posX = this.coordinate.x;
    const posY = this.coordinate.y;
    const radius = this.hollSize / 2;

    context.drawImage(
      this.images.get(`${this.color}.top`)!,
      posX - width,
      -(this.scaled.top.height - Math.abs(posY - radius)),
      this.scaled.top.width,
      this.scaled.top.height
    );

    context.drawImage(
      this.images.get(`${this.color}.bottom`)!,
      posX - width,
      posY + radius,
      this.scaled.bottom.width,
      this.scaled.bottom.height
    );
  }
}
