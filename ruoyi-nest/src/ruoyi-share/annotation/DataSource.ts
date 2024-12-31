import { SetMetadata } from '@nestjs/common';
import { DataSourceType } from '../enums/DataSourceType';

/**
 * 自定义多数据源切换注解
 *
 * 优先级：先方法，后类，如果方法覆盖了类上的数据源类型，以方法的为准，否则以类上的为准
 *
 * @author ruoyi
 */
export const DATA_SOURCE_KEY = 'data_source';

export const DataSource = (dataSource: DataSourceType = DataSourceType.MASTER) => SetMetadata(DATA_SOURCE_KEY, dataSource);