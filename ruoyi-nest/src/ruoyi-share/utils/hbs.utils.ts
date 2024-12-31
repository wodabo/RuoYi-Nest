import { Injectable } from "@nestjs/common";
import { StringUtils } from "./string.utils";
import { GenTable } from "~/ruoyi-generator/gen-table/entities/gen-table.entity";
import * as daysjs from "dayjs";
import { GenConstants } from "~/ruoyi-share/constant/GenConstants"; 
import { GenTableColumn } from "~/ruoyi-generator/gen-table-column/entities/gen-table-column.entity";
import { GenTableRepository } from "~/ruoyi-generator/gen-table/repositories/gen-table.repository";
import { GenTableColumnRepository } from "~/ruoyi-generator/gen-table-column/repositories/gen-table-column.repository";
import { GenTableEntityUtils } from "./gen-table-entity.utils";
import { HbsRepositoryRenderUtils } from "~/ruoyi-share/utils/hbs-repository-render.utils";
import { HbsEntityRenderUtils } from "./hbs-entity-render.utils";
import { HbsServiceRenderUtils } from "./hbs-service-render.utils";
import { HbsControllerRenderUtils } from "./hbs-controller-render.utils";
import { HbsModuleRenderUtils } from "./hbs-module-render.utils";
import { HbsSqlRenderUtils } from "./hbs.sql-render.utils";
import { GenTableColumnEntityUtils } from "./gen-table-column-entity.utils";

const fs = require('fs');
const path = require('path');

const handlebars = require('handlebars');

@Injectable()
export class HbsUtils {
    /**
     * 渲染文件方法
     * @param filePath 文件路径
     * @param data 渲染数据
     * @returns Promise<string> 渲染后的文件内容
     */
    async renderFile(filePath: string, data: any): Promise<string> {
        const resolvePath = path.resolve(__dirname,'../../ruoyi-generator/resources/', filePath)
        console.log(resolvePath,'resolvePath')
        const fileContent = fs.readFileSync(resolvePath, 'utf8');
        const hbs = handlebars.create();

        hbs.registerHelper('hbs_eq', function(a, b){
            return a === b;
        });

        // 渲染Repository头部
        hbs.registerHelper('hbs_render_repository_header', function(){
            return HbsRepositoryRenderUtils.renderHeader(this)
        });

        // 渲染Repository构造函数
        hbs.registerHelper('hbs_render_repository_constructor', function(){
            return HbsRepositoryRenderUtils.renderConstructor(this)
        });

        // 渲染RepositoryVO
        hbs.registerHelper('hbs_render_repository_select_vo', function(){
            return HbsRepositoryRenderUtils.renderSelectVo(this)
        });

        // 渲染Repository查询
        hbs.registerHelper('hbs_render_repository_select_by_id', function(){
            return HbsRepositoryRenderUtils.renderSelectById(this)
        });

        // 渲染Repository插入
        hbs.registerHelper('hbs_render_repository_insert', function(){
            return HbsRepositoryRenderUtils.renderInsert(this)
        });

        // 渲染Repository更新
        hbs.registerHelper('hbs_render_repository_update', function(){
            return HbsRepositoryRenderUtils.renderUpdate(this)
        });  

        // 渲染Repository查询列表
        hbs.registerHelper('hbs_render_repository_select_list',function(){
            return HbsRepositoryRenderUtils.renderSelectList(this)
        });

        // 渲染Repository删除
        hbs.registerHelper('hbs_render_repository_delete_by_ids',function(){
            return HbsRepositoryRenderUtils.renderDeleteByIds(this)
        });

        // 渲染Entity头部
        hbs.registerHelper('hbs_render_entity_header',function(){
            return HbsEntityRenderUtils.renderHeader(this)
        });

        // 渲染Entity类
        hbs.registerHelper('hbs_render_entity_class',function(){
            return HbsEntityRenderUtils.renderClass(this)
        });

        // 渲染Service头部
        hbs.registerHelper('hbs_render_service_header',function(){
            return HbsServiceRenderUtils.renderHeader(this)
        });

        // 渲染Service类
        hbs.registerHelper('hbs_render_service_class',function(){
            return HbsServiceRenderUtils.renderClass(this)
        });

        // 渲染Controller头部
        hbs.registerHelper('hbs_render_controller_header',function(){
            return HbsControllerRenderUtils.renderHeader(this)
        });

        // 渲染Controller类
        hbs.registerHelper('hbs_render_controller_class',function(){
            return HbsControllerRenderUtils.renderClass(this)
        });


        // 渲染Module头部
        hbs.registerHelper('hbs_render_module_header',function(){
            return HbsModuleRenderUtils.renderHeader(this)
        });

        // 渲染Module类
        hbs.registerHelper('hbs_render_module_class',function(){
            return HbsModuleRenderUtils.renderClass(this)
        });

        // 渲染sql
        hbs.registerHelper('hbs_render_sql',function(){
            return HbsSqlRenderUtils.renderSql(this)
        });

        const template = hbs.compile(fileContent);
        return template(data);
    }



    constructor(
    ) {}

    /** mybatis空间路径 */
    private readonly RESPOSITORY_PATH: string = "/repositories";                
  
    /** 默认上级菜单，系统工具 */
    private readonly DEFAULT_PARENT_MENU_ID: string = "3";
  
    /**
     * 设置模板变量信息
     *
     * @return 模板列表
     */
    public prepareContext(genTable: GenTable): any
    {
        const moduleName: string = genTable.moduleName;
        const businessName: string = genTable.businessName;
        const packageName: string = genTable.packageName;
        const tplCategory: string = genTable.tplCategory;
        const functionName: string = genTable.functionName;
  
        const hbsContext: any = {};
        hbsContext.tplCategory = genTable.tplCategory;
        hbsContext.tableName = genTable.tableName;
        hbsContext.functionName = functionName ? functionName : "【请填写功能名称】";
        hbsContext.ClassName = StringUtils.capitalize(genTable.className);
        hbsContext.className = StringUtils.uncapitalize(genTable.className);
        hbsContext.moduleName = genTable.moduleName;
        hbsContext.BusinessName = StringUtils.capitalize(genTable.businessName);
        hbsContext.businessName = genTable.businessName;
        hbsContext.basePackage = this.getPackagePrefix(packageName);
        hbsContext.packageName = packageName;
        hbsContext.author = genTable.functionAuthor;
        hbsContext.datetime = daysjs().format('YYYY-MM-DD');
        hbsContext.pkColumn = genTable.pkColumn;
        hbsContext.importList = this.getImportList(genTable);
        hbsContext.permissionPrefix = this.getPermissionPrefix(moduleName, businessName);
        hbsContext.columns = genTable.columns;
        hbsContext.table = genTable;
        hbsContext.dicts = this.getDicts(genTable);    
        this.setMenuHbsContext(hbsContext, genTable);
        if (GenConstants.TPL_TREE === tplCategory)
        {
            this.setTreeHbsContext(hbsContext, genTable);
        }
        if (GenConstants.TPL_SUB === tplCategory)
        {
            this.setSubHbsContext(hbsContext, genTable);
        }
        return hbsContext;
    }
  
    public setMenuHbsContext(context: any, genTable: GenTable): void
    {
        const options: string = genTable.options;
        const paramsObj = JSON.parse(options);
        const parentMenuId: string = this.getParentMenuId(paramsObj);
        context.parentMenuId = parentMenuId;
    }
  
    public setTreeHbsContext(context: any, genTable: GenTable): void
    {
        const options: string = genTable.options;
        const paramsObj = JSON.parse(options);
        const treeCode: string = this.getTreecode(paramsObj);
        const treeParentCode: string = this.getTreeParentCode(paramsObj);
        const treeName: string = this.getTreeName(paramsObj);
  
        context.treeCode = treeCode;
        context.treeParentCode = treeParentCode;
        context.treeName = treeName;
        context.expandColumn = this.getExpandColumn(genTable);
        if (paramsObj.hasOwnProperty(GenConstants.TREE_PARENT_CODE))
        {
            context.tree_parent_code = paramsObj[GenConstants.TREE_PARENT_CODE];
        }
        if (paramsObj.hasOwnProperty(GenConstants.TREE_NAME))
        {
            context.tree_name = paramsObj[GenConstants.TREE_NAME];
        }
    }
  
    public setSubHbsContext(context: any, genTable: GenTable): void
    {
        const subTable: GenTable = genTable.subTable;
        const subTableName: string = genTable.subTableName;
        const subTableFkName: string = genTable.subTableFkName;
        const subClassName: string = genTable.subTable.className;
        const subTableFkClassName: string = StringUtils.toCamelCase(subTableFkName);
  
        context.subTable = subTable;
        context.subTableName = subTableName;
        context.subTableFkName = subTableFkName;
        context.subTableFkClassName = subTableFkClassName;
        context.subTableFkclassName = StringUtils.uncapitalize(subTableFkClassName);
        context.subClassName = subClassName;
        context.subclassName = StringUtils.uncapitalize(subClassName);
        context.subImportList = this.getImportList(genTable.subTable);
    }
  
    /**
     * 获取模板信息
     * @param tplCategory 生成的模板
     * @param tplWebType 前端类型
     * @return 模板列表
     */
    public getTemplateList(tplCategory: string, tplWebType: string): string[]
    {
        let useWebType: string = "hbs/vue";
        if ("element-plus" === tplWebType)
        {
            useWebType = "hbs/vue/v3";
        }
        const templates: string[] = [];
        templates.push("hbs/ts/entity.ts.hbs");
        templates.push("hbs/ts/repository.ts.hbs");
        templates.push("hbs/ts/service.ts.hbs");
        templates.push("hbs/ts/controller.ts.hbs");
        templates.push("hbs/ts/module.ts.hbs");
        templates.push("hbs/sql/sql.hbs");
        templates.push("hbs/js/api.js.hbs");
        if (GenConstants.TPL_CRUD === tplCategory)
        {
            templates.push(useWebType + "/index.vue.hbs");
        }
        else if (GenConstants.TPL_TREE === tplCategory)
        {
            templates.push(useWebType + "/index-tree.vue.hbs");
        }
        else if (GenConstants.TPL_SUB === tplCategory)
        {
            templates.push(useWebType + "/index.vue.hbs");
            templates.push("hbs/ts/sub-entity.ts.hbs");
        }
        return templates;
    }
  
    /**
     * 获取文件名
     */
    public getFileName(template: string, genTable: GenTable): string
    {
        // 文件名称
        let fileName: string = "";
        // 包路径
        const packageName: string = genTable.packageName;
        // 模块名
        const moduleName: string = genTable.moduleName;
        // 大写类名
        const className: string = genTable.className;
        // 业务名称
        const businessName: string = genTable.businessName;
  
        const tsPath: string = packageName.replace(".", "/"); 
        const repositoryPath: string = this.RESPOSITORY_PATH + "/" + moduleName;
        const vuePath: string = "vue";
  
        if (template.includes("entity.ts.hbs"))   
        {
            fileName = `${tsPath}/entities/${className}.entity.ts`;       
        }
        if (template.includes("sub-entity.ts.hbs") && GenConstants.TPL_SUB === genTable.tplCategory)
        {
            fileName = `${tsPath}/entities/${genTable.subTable.className}.entity.ts`;
        }
        else if (template.includes("repository.ts.hbs"))
        {
            fileName = `${tsPath}/repositories/${className}.repository.ts`;
        }
        else if (template.includes("service.ts.hbs"))
        {
            fileName = `${tsPath}/services/${className}.service.ts`;
        }
        else if (template.includes("service.ts.hbs"))
        {
            fileName = `${tsPath}/${className}.service.ts`;
        }
        else if (template.includes("controller.ts.hbs"))
        {
            fileName = `${tsPath}/${className}.controller.ts`;
        }
        else if (template.includes("repository.ts.hbs"))
        {
            fileName = `${tsPath}/${className}.repository.ts`;
        }
        else if (template.includes("sql.hbs"))
        {
            fileName = `${businessName}Menu.sql`;
        }
        else if (template.includes("api.js.hbs"))
        {
            fileName = `${vuePath}/api/${moduleName}/${businessName}.js`;
        }
        else if (template.includes("index.vue.hbs"))
        {
            fileName = `${vuePath}/views/${moduleName}/${businessName}/index.vue`;
        }
        else if (template.includes("index-tree.vue.hbs"))
        {
            fileName = `${vuePath}/views/${moduleName}/${businessName}/index.vue`;
        }
        return fileName;
    }
  
    /**
     * 获取包前缀
     *
     * @param packageName 包名称
     * @return 包前缀名称
     */
    public getPackagePrefix(packageName: string): string
    {
        const lastIndex: number = packageName.lastIndexOf(".");
        return packageName.substring(0, lastIndex);       
    }
  
    /**
     * 根据列类型获取导入包
     * 
     * @param genTable 业务表对象
     * @return 返回需要导入的包列表
     */
    public getImportList(genTable: GenTable): Set<string>
    {
        const columns: GenTableColumn[] = genTable.columns;
        const subGenTable: GenTable = genTable.subTable;
        const importList: Set<string> = new Set<string>();
        if (StringUtils.isNotNull(subGenTable))
        {
            importList.add("java.util.List");
        }
        for (const column of columns)
        {
            if (!GenTableColumnEntityUtils.isSuperColumn(column) && GenConstants.TYPE_DATE === column.tsType)
            {
                importList.add("java.util.Date");
                importList.add("com.fasterxml.jackson.annotation.JsonFormat");
            }
            else if (!GenTableColumnEntityUtils.isSuperColumn(column) && GenConstants.TYPE_BIGDECIMAL === column.tsType)
            {
                importList.add("java.math.BigDecimal");
            }
        }
        return importList;
    }
  
    /**
     * 根据列类型获取字典组
     * 
     * @param genTable 业务表对象
     * @return 返回字典组
     */
    public getDicts(genTable: GenTable): string
    {
        const columns: GenTableColumn[] = genTable.columns;
        const dicts: Set<string> = new Set<string>();
        this.addDicts(dicts, columns);
        if (StringUtils.isNotNull(genTable.subTable))
        {
            const subColumns: GenTableColumn[] = genTable.subTable.columns;
            this.addDicts(dicts, subColumns);
        }
        return Array.from(dicts).join(", ");
    }
  
    /**
     * 添加字典列表
     * 
     * @param dicts 字典列表
     * @param columns 列集合
     */
    public addDicts(dicts: Set<string>, columns: GenTableColumn[]): void
    {
        for (const column of columns)
        {
            if (!GenTableColumnEntityUtils.isSuperColumn(column) && StringUtils.isNotEmpty(column.dictType) && [ GenConstants.HTML_SELECT, GenConstants.HTML_RADIO, GenConstants.HTML_CHECKBOX ].some(type => type === column.htmlType))
            {
                dicts.add("'" + column.dictType + "'");
            }
        }
    }
  
    /**
     * 获取权限前缀
     *
     * @param moduleName 模块名称
     * @param businessName 业务名称
     * @return 返回权限前缀
     */
    public getPermissionPrefix(moduleName: string, businessName: string): string
    {
          return `${moduleName}:${businessName}`;
    }
  
    /**
     * 获取上级菜单ID字段
     *
     * @param paramsObj 生成其他选项
     * @return 上级菜单ID字段
     */
    public getParentMenuId(paramsObj): string
    {
        if (StringUtils.isNotEmpty(paramsObj) && paramsObj.hasOwnProperty(GenConstants.PARENT_MENU_ID)
                && StringUtils.isNotEmpty(paramsObj[GenConstants.PARENT_MENU_ID]))
        {
            return paramsObj[GenConstants.PARENT_MENU_ID];
        }
        return this.DEFAULT_PARENT_MENU_ID;
    }
  
    /**
     * 获取树编码
     *
     * @param paramsObj 生成其他选项
     * @return 树编码
     */
    public getTreecode(paramsObj): string
    {
        if (paramsObj.hasOwnProperty(GenConstants.TREE_CODE))
        {
            return StringUtils.toCamelCase(paramsObj[GenConstants.TREE_CODE]);
        }
        return "";
    }
  
    /**
     * 获取树父编码
     *
     * @param paramsObj 生成其他选项
     * @return 树父编码
     */
    public getTreeParentCode(paramsObj): string
    {
        if (paramsObj.hasOwnProperty(GenConstants.TREE_PARENT_CODE))
        {
            return StringUtils.toCamelCase(paramsObj[GenConstants.TREE_PARENT_CODE]);
        }
        return "";
    }
  
    /**
     * 获取树名称
     *
     * @param paramsObj 生成其他选项
     * @return 树名称
     */
    public getTreeName(paramsObj): string
    {
        if (paramsObj.hasOwnProperty(GenConstants.TREE_NAME))
        {
            return StringUtils.toCamelCase(paramsObj[GenConstants.TREE_NAME]);
        }
        return "";
    }
  
    /**
     * 获取需要在哪一列上面显示展开按钮
     *
     * @param genTable 业务表对象
     * @return 展开按钮列序号
     */
    public getExpandColumn(genTable: GenTable): number
    {
        const options: string = genTable.options;
        const paramsObj = JSON.parse(options);
        const treeName: string = paramsObj[GenConstants.TREE_NAME];
        let num: number = 0;
        for (const column of genTable.columns)
        {
            if (GenTableColumnEntityUtils.isList(column))
            {
                num++;
                const columnName: string = column.columnName;
                if (columnName === treeName)
                {
                    break;
                }
            }
        }
        return num;
    }
}
