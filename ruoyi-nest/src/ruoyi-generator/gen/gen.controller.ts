import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  Query, 
  Body,
  Res, 
  UseGuards, 
  UseInterceptors, 
  ParseIntPipe, 
  DefaultValuePipe,
  Request,
  ValidationPipe,
  Put,
  ParseArrayPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, PartialType } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { AjaxResult } from '~/ruoyi-share/response/ajax-result';
import { TableDataInfo } from '~/ruoyi-share/response/table-data-info';
import { ExcelUtils } from '~/ruoyi-share/utils/excel.utils';
import { FileUploadUtils } from '~/ruoyi-share/utils/file-upload.utils';  
import { MimeTypeUtils } from '~/ruoyi-share/utils/mime-type.utils';
import { RuoYiConfigService } from '~/ruoyi-share/config/ruoyi-config.service';
import { JwtAuthService } from '~/ruoyi-framework/auth/jwt/jwt-auth-service';
import { SecurityUtils } from '~/ruoyi-share/utils/security.utils';
import { PreAuthorize } from '~/ruoyi-share/annotation/PreAuthorize';
import { Log } from '~/ruoyi-share/annotation/Log';
import { BusinessType } from '~/ruoyi-share/enums/BusinessType';
import { GenTable } from '~/ruoyi-generator/gen-table/entities/gen-table.entity';   
import { GenTableColumn } from '~/ruoyi-generator/gen-table-column/entities/gen-table-column.entity';
import { GenTableService } from '~/ruoyi-generator/gen-table/gen-table.service';
import { GenTableColumnService } from '~/ruoyi-generator/gen-table-column/gen-table-column.service';
import { SqlUtils } from '~/ruoyi-share/utils/sql.utils';
import { FileUtils } from '~/ruoyi-share/utils/file.utils';

@ApiTags('代码生成')
@Controller('tool/gen')
export class GenController extends BaseController {
  
  constructor(
    private readonly genTableService: GenTableService,
    private readonly genTableColumnService: GenTableColumnService,
    private readonly fileUtils: FileUtils,
    private readonly ruoYiConfigService: RuoYiConfigService
  ) {
    super();
  }

  @PreAuthorize('hasPermi("tool:gen:list")')
  @Get('list')
  @ApiOperation({ summary: '获取代码生成列表' })
  async genList(@Query() genTable: GenTable) {
    this.startPage(genTable);
    const [list, total] = await this.genTableService.selectGenTableList(genTable);
    return this.getDataTable(list, total);
  }

  
  @PreAuthorize('hasPermi("tool:gen:code")')
  @Log({ title: '代码生成', businessType: BusinessType.GENCODE })
  @Get("genCode/:tableName")
  public genCode(@Param('tableName') tableName: string, @Request() req)
  {
    this.genTableService.generatorCode(tableName);
    return this.success();
  }
  
  @PreAuthorize('hasPermi("tool:gen:code")')
  @Log({ title: '代码生成', businessType: BusinessType.GENCODE })
  @Get("batchGenCode")
  public async batchGenCode(@Res() res, @Query('tables') tables: string) {
    const tableNames = tables.split(',');
    const data = await this.genTableService.downloadCode(tableNames);

    this._genCode(res, data);
  }

  private async _genCode(response, data) {

    response.setHeader('Content-Type', 'application/zip');
    response.setHeader('Content-Disposition', 'attachment; filename=ruoyi.zip');
    response.send(data);

  }

  @PreAuthorize('hasPermi("tool:gen:query")')
  @Get(':tableId')
  @ApiOperation({ summary: '根据表ID获取表信息' })
  async getInfo(@Param('tableId', ParseIntPipe) tableId: number, @Request() req) {
    const table = await this.genTableService.selectGenTableById(tableId);
    const tables = await this.genTableService.selectGenTableAll();
    const [list, total] = await this.genTableColumnService.selectGenTableColumnListByTableId(tableId);
    const map = {
      info: table,
      rows: list,
      tables: tables
    };
    return this.success(map);
  }

  @PreAuthorize('hasPermi("tool:gen:list")')
  @Get('db/list')
  @ApiOperation({ summary: '获取数据库表列表' })
  async dataList(@Query() genTable: GenTable, @Request() req) {
    this.startPage(genTable);
    const [list, total] = await this.genTableService.selectDbTableList(genTable);
    return this.getDataTable(list, total);
  }

  @PreAuthorize('hasPermi("tool:gen:list")')
  @Get('column/:tableId')
  @ApiOperation({ summary: '根据表ID获取表字段列表' })
  async columnList(@Param('tableId', ParseIntPipe) tableId: number, @Request() req) {
    const [list, total] = await this.genTableColumnService.selectGenTableColumnListByTableId(tableId);
    return this.getDataTable(list, total);
  }

  @PreAuthorize('hasPermi("tool:gen:import")')
  @Log({ title: '代码生成', businessType: BusinessType.IMPORT })
  @Post('importTable')
  @ApiOperation({ summary: '导入表' })
  async importTableSave(@Query('tables') tables: string, @Request() req) {
    const loginUser = req.user;
    const tableNames = tables.split(',');
    // 查询表信息
    const tableList = await this.genTableService.selectDbTableListByNames(tableNames);
    await this.genTableService.importGenTable(tableList, loginUser.getUsername());
    return this.success();
  }

  // @PreAuthorize('hasRole("admin")')
  // @Log({ title: '创建表', businessType: BusinessType.OTHER })
  // @Post('createTable')
  // @ApiOperation({ summary: '创建表' })
  // async createTableSave(@Body() sql: string, @Request() req) {
  //   try {   
  //     this.sqlUtils.filterKeyword(sql);
  //     const sqlStatements = this.sqlUtils.parseStatements(sql, DbType.mysql);
  //     const tableNames = [];
  //     for (const sqlStatement of sqlStatements) {
  //       if (sqlStatement instanceof MySqlCreateTableStatement) {
  //         const createTableStatement = sqlStatement as MySqlCreateTableStatement;
  //         if (await this.genTableService.createTable(createTableStatement.toString())) {
  //           const tableName = createTableStatement.getTableName().replaceAll('`', '');
  //           tableNames.push(tableName);
  //         }
  //       }
  //     }
  //     const tableList = await this.genTableService.selectDbTableListByNames(tableNames.toArray(new string[tableNames.size()]));
  //     const operName = this.securityUtils.getUsername(req.user);
  //     await this.genTableService.importGenTable(tableList, operName);
  //     return this.success(req);
  //   } catch (e) {
  //     this.logger.error(e.getMessage(), e);
  //     return this.error('创建表结构异常', req);
  //   }
  // }

  @PreAuthorize('hasPermi("tool:gen:edit")')
  @Log({ title: '代码生成', businessType: BusinessType.UPDATE })
  @Put()
  @ApiOperation({ summary: '编辑表' })
  async editSave(@Body() genTable: GenTable, @Request() req) {
    this.genTableService.validateEdit(genTable);
    await this.genTableService.updateGenTable(genTable);
    return this.success();
  }

  @PreAuthorize('hasPermi("tool:gen:remove")')
  @Log({ title: '代码生成', businessType: BusinessType.DELETE })
  @Delete(':tableIds')
  @ApiOperation({ summary: '删除表' })
  async remove(@Param('tableIds',new ParseArrayPipe({ items: Number, separator: ',' })) tableIds: number[], @Request() req) {
    await this.genTableService.deleteGenTableByIds(tableIds);
    return this.success();
  }

  @PreAuthorize('hasPermi("tool:gen:preview")')   
  @Get("preview/:tableId")
  @ApiOperation({ summary: '预览代码' })
  async preview(@Param('tableId', ParseIntPipe) tableId: number, @Request() req) {
    const dataMap = await this.genTableService.previewCode(tableId);
    return this.success(dataMap);
  }

  // @PreAuthorize('hasPermi("tool:gen:code")')
  // @Log({ title: '代码生成', businessType: BusinessType.GENCODE })
  // @Get("download/:tableName")
  // public void download(@Res() res, @Param('tableName') tableName: string, @Request() req) {
  //   const data = this.genTableService.downloadCode(tableName);
  //   this.genCode(res, data, req);
  // }


  @PreAuthorize('hasPermi("tool:gen:edit")')
  @Log({ title: '代码生成', businessType: BusinessType.UPDATE })
  @Get("synchDb/:tableName")
  public synchDb(@Param('tableName') tableName: string, @Request() req)
  {
    this.genTableService.synchDb(tableName);
    return this.success();
  }

}
