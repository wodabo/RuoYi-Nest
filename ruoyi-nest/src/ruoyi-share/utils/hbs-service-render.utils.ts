import { StringUtils } from "./string.utils"


export class HbsServiceRenderUtils { 

    public static renderHeader(context) {
        const ClassNameWithoutSysPrefix = context.ClassName.replace(/^sys/i, '')
        const ClassNameWithoutSysPrefixAndLowerCaseFirstLetter = StringUtils.uncapitalize(ClassNameWithoutSysPrefix)
        const alias = ClassNameWithoutSysPrefixAndLowerCaseFirstLetter.charAt(0)
        const tableNameWithMiddleLine = context.tableName.replace(/_/g, '-')
        return `
import { Injectable } from '@nestjs/common';
import { ${context.ClassName}Repository } from '~/${context.packageName}/${tableNameWithMiddleLine}/repositories/${tableNameWithMiddleLine}.repository';
import { ${context.ClassName} } from '~/${context.packageName}/${tableNameWithMiddleLine}/entities/${tableNameWithMiddleLine}.entity';

/**
 * ${context.functionName}Service接口
 * 文件路径 ${tableNameWithMiddleLine}/${tableNameWithMiddleLine}.service.ts
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
        return `
@Injectable()
export class ${context.ClassName}Service {
  constructor(
    private readonly ${ClassNameWithoutSysPrefixAndLowerCaseFirstLetter}Repository: ${context.ClassName}Repository,
  ) {}

  async select${ClassNameWithoutSysPrefix}ById(${context.pkColumn.tsField}: number): Promise<${context.ClassName}> {
    return this.${ClassNameWithoutSysPrefixAndLowerCaseFirstLetter}Repository.select${ClassNameWithoutSysPrefix}ById(${context.pkColumn.tsField});
  }

  async select${ClassNameWithoutSysPrefix}List(query: ${context.ClassName}): Promise<[${context.ClassName}[], number]> {  
    return this.${ClassNameWithoutSysPrefixAndLowerCaseFirstLetter}Repository.select${ClassNameWithoutSysPrefix}List(query);
  } 

  async insert${ClassNameWithoutSysPrefix}(${context.className}: ${context.ClassName}): Promise<number> {  
    return this.${ClassNameWithoutSysPrefixAndLowerCaseFirstLetter}Repository.insert${ClassNameWithoutSysPrefix}(${context.className});
  }

  async update${ClassNameWithoutSysPrefix}(${context.className}: ${context.ClassName}): Promise<boolean> {
    return this.${ClassNameWithoutSysPrefixAndLowerCaseFirstLetter}Repository.update${ClassNameWithoutSysPrefix}(${context.className});
  }

  async delete${ClassNameWithoutSysPrefix}ById(${context.pkColumn.tsField}: number): Promise<boolean> {
    return this.${ClassNameWithoutSysPrefixAndLowerCaseFirstLetter}Repository.delete${ClassNameWithoutSysPrefix}ByIds([${context.pkColumn.tsField}]);
  }

  async delete${ClassNameWithoutSysPrefix}ByIds(${context.pkColumn.tsField}s: number[]): Promise<boolean> {
    return this.${ClassNameWithoutSysPrefixAndLowerCaseFirstLetter}Repository.delete${ClassNameWithoutSysPrefix}ByIds(${context.pkColumn.tsField}s);
  }
}

        `
    }

}