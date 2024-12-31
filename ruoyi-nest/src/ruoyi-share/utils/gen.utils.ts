import { Injectable } from '@nestjs/common';
import { GenTable } from '~/ruoyi-generator/gen-table/entities/gen-table.entity';
import { GenTableColumn } from '~/ruoyi-generator/gen-table-column/entities/gen-table-column.entity';
import { GenConfigService } from '~/ruoyi-generator/gen-config/gen-config.service' ;    
import { StringUtils } from './string.utils';
import { GenConstants } from '~/ruoyi-share/constant/GenConstants';
import { GenTableColumnEntityUtils } from './gen-table-column-entity.utils';

/**
 * 代码生成器 工具类
 * 
 * @author ruoyi
 */
@Injectable()
export class GenUtils {

    constructor(private genConfigService: GenConfigService) {
    }

    /**
     * 初始化表信息
     */
    public initTable(genTable: GenTable, operName: string): void {
        // 举例 sysConfig
        genTable.className = this.convertClassName(genTable.tableName);
        // 举例 ruoyi-system
        genTable.packageName = this.genConfigService.getPackageName();
        // 举例 system
        genTable.moduleName = this.getModuleName(this.genConfigService.getPackageName());
        // 举例 config
        genTable.businessName = this.getBusinessName(genTable.tableName);
        // 举例 参数配置表
        genTable.functionName = this.replaceText(genTable.tableComment);
        // 举例 ruoyi
        genTable.functionAuthor = this.genConfigService.getAuthor();
        genTable.createBy = operName;
    }

    /**
     * 初始化列属性字段
     */
    public initColumnField(column: GenTableColumn, table: GenTable): void {
        let dataType = this.getDbType(column.columnType);
        let columnName = column.columnName;
        column.tableId = table.tableId;
        column.createBy = table.createBy;
        // 设置TypeScript字段名   
        column.tsField = StringUtils.toCamelCase(columnName);
        // 设置默认类型
        column.tsType = GenConstants.TYPE_STRING;    
        column.queryType = GenConstants.QUERY_EQ;

        if (GenConstants.COLUMNTYPE_STR.includes(dataType) || GenConstants.COLUMNTYPE_TEXT.includes(dataType)) {    
            // 字符串长度超过500设置为文本域
            let columnLength = this.getColumnLength(column.columnType); 
            let htmlType = columnLength >= 500 || GenConstants.COLUMNTYPE_TEXT.includes(dataType) ? GenConstants.HTML_TEXTAREA : GenConstants.HTML_INPUT;
            column.htmlType = htmlType;
        }
        else if (GenConstants.COLUMNTYPE_TIME.includes(dataType)) {
            column.tsType = GenConstants.TYPE_DATE;
            column.htmlType = GenConstants.HTML_DATETIME;
        }
        else if (GenConstants.COLUMNTYPE_NUMBER.includes(dataType)) {
            column.htmlType = GenConstants.HTML_INPUT;

            // 如果是浮点型 统一用BigDecimal
            let str = StringUtils.substringBetween(column.columnType, "(", ")").split(",");
            if (str != null && str.length == 2 && parseInt(str[1]) > 0) {
                column.tsType = GenConstants.TYPE_BIGDECIMAL;
            }
            // 如果是整形
            else if (str != null && str.length == 1 && parseInt(str[0]) <= 10) {
                column.tsType = GenConstants.TYPE_INTEGER;
            }
            // 长整形
            else {
                column.tsType = GenConstants.TYPE_LONG;
            }
        }

        // 插入字段（默认所有字段都需要插入）
        column.isInsert = GenConstants.REQUIRE;

        // 编辑字段
        if (!GenConstants.COLUMNNAME_NOT_EDIT.includes(columnName) && !GenTableColumnEntityUtils.isPk(column)) {   
            column.isEdit = GenConstants.REQUIRE;
        }
        // 列表字段
        if (!GenConstants.COLUMNNAME_NOT_LIST.includes(columnName) && !GenTableColumnEntityUtils.isPk(column)) {
            column.isList = GenConstants.REQUIRE;
        }
        // 查询字段
        if (!GenConstants.COLUMNNAME_NOT_QUERY.includes(columnName) && !GenTableColumnEntityUtils.isPk(column)) {
            column.isQuery = GenConstants.REQUIRE;
        }

        // 查询字段类型
        if (columnName.toLowerCase().endsWith('name')) {
            column.queryType = GenConstants.QUERY_LIKE;
        }
        // 状态字段设置单选框
        if (columnName.toLowerCase().endsWith('status')) {
            column.htmlType = GenConstants.HTML_RADIO;
        }
        // 类型&性别字段设置下拉框
        else if (columnName.toLowerCase().endsWith("type")
            || columnName.toLowerCase().endsWith("sex")) {
            column.htmlType = GenConstants.HTML_SELECT;
        }
        // 图片字段设置图片上传控件
        else if (columnName.toLowerCase().endsWith("image")) {
            column.htmlType = GenConstants.HTML_IMAGE_UPLOAD;
        }
        // 文件字段设置文件上传控件
        else if (columnName.toLowerCase().endsWith("file")) {
            column.htmlType = GenConstants.HTML_FILE_UPLOAD;
        }
        // 内容字段设置富文本控件
        else if (columnName.toLowerCase().endsWith("content")) {
            column.htmlType = GenConstants.HTML_EDITOR;
        }
    }


    /**
     * 获取模块名
     * 
     * @param packageName 包名
     * @return 模块名
     */
    public getModuleName(packageName: string): string {
        let lastIndex = packageName.lastIndexOf("-");
        let nameLength = packageName.length;
        return packageName.substring(lastIndex + 1, nameLength);
    }

    /**
     * 获取业务名
     * 
     * @param tableName 表名
     * @return 业务名
     */
    public getBusinessName(tableName: string): string {
        let lastIndex = tableName.lastIndexOf("_");
        let nameLength = tableName.length;
        return tableName.substring(lastIndex + 1, nameLength);
    }

    /**
     * 表名转换成TypeScript类名   
     * 
     * @param tableName 表名称
     * @return 类名
     */
    public convertClassName(tableName: string): string {
        let autoRemovePre = this.genConfigService.getAutoRemovePre();
        let tablePrefix = this.genConfigService.getTablePrefix();
        if (autoRemovePre && StringUtils.isNotEmpty(tablePrefix)) {
            let searchList = tablePrefix.split(",");
            tableName = this.replaceFirst(tableName, searchList);
        }
        return StringUtils.toCamelCase(tableName);   
    }

    /**
     * 批量替换前缀
     * 
     * @param replacementm 替换值
     * @param searchList 替换列表
     * @return
     */
    public replaceFirst(replacementm: string, searchList: string[]): string {
        let text = replacementm;
        for (let searchString of searchList) {
            if (replacementm.startsWith(searchString)) {
                text = replacementm.replace(searchString, "");
                break;
            }
        }
        return text;
    }

    /**
     * 关键字替换
     * 
     * @param text 需要被替换的名字
     * @return 替换后的名字
     */
    public replaceText(text: string): string {
        return text.replaceAll("(?:表|若依)", "");
    }

    /**
     * 获取数据库类型字段
     * 
     * @param columnType 列类型
     * @return 截取后的列类型
     */
    public getDbType(columnType: string): string {
        if (columnType.indexOf("(") > 0) {
            return StringUtils.substringBefore(columnType, "(");
        }
        else {
            return columnType;
        }
    }

    /**
     * 获取字段长度
     * 
     * @param columnType 列类型
     * @return 截取后的列类型
     */
    public getColumnLength(columnType: string): number {
        if (columnType.indexOf("(") > 0) {
            let length = StringUtils.substringBetween(columnType, "(", ")");
            return parseInt(length);
        }
        else {
            return 0;
        }
    }
}
