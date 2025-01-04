import { StringUtils } from '../utils/string.utils';

/**
 * 路由显示信息
 *
 * @author ruoyi
 */
export class MetaVo {
  /**
   * 设置该路由在侧边栏和面包屑中展示的名字
   */
  public title: string;

  /**
   * 设置该路由的图标，对应路径src/assets/icons/svg
   */
  icon: string;

  /**
   * 设置为true，则不会被 <keep-alive>缓存
   */
  noCache: boolean;

  /**
   * 内链地址（http(s)://开头）
   */
  link: string;

  constructor(private readonly stringUtils: StringUtils) {}

  public setLink(link: string): void {
    if (this.stringUtils.isHttp(link)) {
      this.link = link;
    } else {
      this.link = null;
    }
  }
}
