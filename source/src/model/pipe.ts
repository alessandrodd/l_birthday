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
export type IPipeRecords = Map<string, CanvasImageSource>;

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
  context.fillRect(x, y, 24, 16);
  context.strokeStyle = '#1c3764';
  context.lineWidth = 1;
  context.strokeRect(x, y, 24, 16);
  context.fillStyle = '#f3cf4b';

  for (let index = 0; index < 8; index++) {
    const angle = (Math.PI * 2 * index) / 8;
    const px = x + 12 + Math.cos(angle) * 5;
    const py = y + 8 + Math.sin(angle) * 5;
    context.beginPath();
    context.arc(px, py, 1.1, 0, Math.PI * 2);
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
  bodyGradient.addColorStop(0, '#5f4038');
  bodyGradient.addColorStop(0.35, '#4b312a');
  bodyGradient.addColorStop(1, '#321d18');

  context.fillStyle = bodyGradient;
  context.fillRect(58, 104, 64, 300);

  context.fillStyle = '#6b463b';
  context.fillRect(64, 70, 52, 44);
  context.fillRect(76, 32, 28, 32);

  context.fillStyle = '#7c5544';
  context.beginPath();
  context.moveTo(42, 64);
  context.lineTo(138, 64);
  context.lineTo(122, 84);
  context.lineTo(58, 84);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(24, 96);
  context.lineTo(156, 96);
  context.lineTo(142, 122);
  context.lineTo(38, 122);
  context.closePath();
  context.fill();

  context.beginPath();
  context.moveTo(66, 24);
  context.lineTo(114, 24);
  context.lineTo(104, 38);
  context.lineTo(76, 38);
  context.closePath();
  context.fill();

  context.shadowBlur = 0;
  context.fillStyle = '#d9b34d';
  for (let row = 0; row < 22; row++) {
    for (let col = 0; col < 3; col++) {
      context.fillRect(70 + col * 14, 126 + row * 11, 6, 6);
    }
  }

  context.fillStyle = '#f0d37d';
  context.fillRect(78, 38, 24, 24);
  context.fillStyle = '#cda33c';
  context.fillRect(86, 12, 8, 18);

  context.fillStyle = '#9d7f37';
  context.fillRect(56, 392, 68, 12);

  context.strokeStyle = 'rgba(255, 224, 147, 0.35)';
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(32, 104);
  context.lineTo(148, 104);
  context.moveTo(50, 72);
  context.lineTo(130, 72);
  context.stroke();

  context.fillStyle = '#b33b35';
  context.beginPath();
  context.arc(124, 146, 10, 0, Math.PI * 2);
  context.fill();

  return canvas;
}

export default class Pipe extends ParentClass {
  public static pipeSize: IDimension = {
    width: 0,
    height: 0
  };

  private static readonly spriteCache: IPipeRecords = new Map<string, CanvasImageSource>();

  private scaled: IPipeScaled;
  public hollSize: number;
  public pipePosition: IPipePairPosition;
  public isPassed: boolean;

  private images: IPipeRecords;
  private color: IPipeColor;

  constructor() {
    super();
    this.images = new Map<string, CanvasImageSource>();
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
      Pipe.spriteCache.set('ecb.bottom', ecb);
      Pipe.spriteCache.set('ecb.top', createFlippedSprite(ecb, ecb.width, ecb.height));
      Pipe.spriteCache.set('japan.bottom', japan);
      Pipe.spriteCache.set('japan.top', createFlippedSprite(japan, japan.width, japan.height));
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
