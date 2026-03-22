import { randomClamp } from '../utils';
import { ITheme } from './background';
import { IBirdColor } from './bird';
import { IPipeColor } from './pipe';

export default class SceneGenerator {
  public static birdColorList: IBirdColor[] = [];
  public static bgThemeList: ITheme[] = [];
  public static pipeColorList: IPipeColor[] = [];

  public static get background(): ITheme {
    if (SceneGenerator.bgThemeList.length < 1) throw new Error('No theme available');

    return SceneGenerator.bgThemeList[randomClamp(0, SceneGenerator.bgThemeList.length)];
  }

  public static get bird(): IBirdColor {
    if (SceneGenerator.birdColorList.length < 1) throw new Error('No available bird color');

    return SceneGenerator.birdColorList[randomClamp(0, SceneGenerator.birdColorList.length)];
  }

  public static get pipe(): IPipeColor {
    if (SceneGenerator.pipeColorList.length < 1) throw new Error('No available pipe color');

    return SceneGenerator.pipeColorList[randomClamp(0, SceneGenerator.pipeColorList.length)];
  }
}
