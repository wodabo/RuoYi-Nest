import { StringUtils } from "./string.utils"


export class HbsModuleRenderUtils { 

    public static renderHeader(context) {
        const ClassNameWithoutSysPrefix = context.ClassName.replace(/^sys/i, '')
        const ClassNameWithoutSysPrefixAndLowerCaseFirstLetter = StringUtils.uncapitalize(ClassNameWithoutSysPrefix)
        const alias = ClassNameWithoutSysPrefixAndLowerCaseFirstLetter.charAt(0)
        const tableNameWithMiddleLine = context.tableName.replace(/_/g, '-')
        return `
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${context.ClassName}Service } from '~/${context.packageName}/${tableNameWithMiddleLine}/${tableNameWithMiddleLine}.service';
import { ${context.ClassName} } from '~/${context.packageName}/${tableNameWithMiddleLine}/entities/${tableNameWithMiddleLine}.entity';
import { ${context.ClassName}Repository } from '~/${context.packageName}/${tableNameWithMiddleLine}/repositories/${tableNameWithMiddleLine}.repository';
import { RedisModule } from '~/ruoyi-share/redis/redis.module';

/**
 * ${context.functionName}Module
 * 文件路径 ${tableNameWithMiddleLine}/${tableNameWithMiddleLine}.module.ts
 * 
 * @author ${context.author}
 * @date ${context.datetime}
 *
 */
        `
    }
    public static renderClass(context) {
        const ClassNameWithoutSysPrefix = context.ClassName.replace(/^sys/i, '')
        const ClassNameWithoutSysPrefixAndLowerCaseFirstLetter = StringUtils.uncapitalize(ClassNameWithoutSysPrefix)
        const alias = ClassNameWithoutSysPrefixAndLowerCaseFirstLetter.charAt(0)
        const tableNameWithMiddleLine = context.tableName.replace(/_/g, '-')
        const preAuthorizePrefix = `${context.moduleName}:${tableNameWithMiddleLine}:`
        return `


const providers = [${context.ClassName}Service, ${context.ClassName}Repository];

@Module({
  imports: [
    TypeOrmModule.forFeature([${context.ClassName}]),
    RedisModule
  ],
  controllers: [],
  providers,
  exports: [${context.ClassName}Service,${context.ClassName}Repository]
})
export class ${context.ClassName}Module {}

        `
    }

}