import { 
  Controller, 
  Get, 
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpException,
  Query,
  Res,
  ParseArrayPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SysDictTypeService } from '~/ruoyi-system/sys-dict-type/sys-dict-type.service';
import { AjaxResult } from '~/ruoyi-share/response/ajax-result';
import { SysDictType } from '~/ruoyi-system/sys-dict-type/entities/sys-dict-type.entity';
import { Public } from '~/ruoyi-framework/auth/decorators/public.decorator';
import { PreAuthorize } from '~/ruoyi-share/annotation/PreAuthorize';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { ExcelUtils } from '~/ruoyi-share/utils/excel.utils';

@ApiTags('数据字典信息')
@Controller('/system/dict/type')
export class SysDictTypeController extends BaseController   {
  constructor(
    private readonly dictTypeService: SysDictTypeService,
    private readonly excelUtils: ExcelUtils,  
  ) {
    super();
  }

  @Get('/list')
  @ApiOperation({ summary: '获取字典类型列表' })
  @PreAuthorize('hasPermi("system:dict:list")')
  async list(@Query() dictType: SysDictType) {
    const [list, total] = await this.dictTypeService.selectDictTypeList(dictType);
    return this.getDataTable(list, total);
  }

  
  @Get('/optionselect')
  @ApiOperation({ summary: '获取字典选择框列表' })
  async optionselect() {
    const dictTypes = await this.dictTypeService.selectDictTypeAll();
    return AjaxResult.success(dictTypes);
  }

  
  @Delete('/refreshCache')
  @ApiOperation({ summary: '刷新字典缓存' })
  @PreAuthorize('hasPermi("system:dict:remove")')
  async refreshCache() {
    await this.dictTypeService.resetDictCache();
    return AjaxResult.success();
  }

  @Post('/export')
  @ApiOperation({ summary: '导出字典类型' })
  @PreAuthorize('hasPermi("system:dict:export")')
  async export(@Res() res, @Body() dictType: SysDictType) {
    const [list, total] = await this.dictTypeService.selectDictTypeList(dictType);
    this.excelUtils.exportExcel(res, list, '字典类型', SysDictType);
  }

  @Get('/:dictId')
  @ApiOperation({ summary: '查询字典类型详细' })
  @PreAuthorize('hasPermi("system:dict:query")')
  async getInfo(@Param('dictId') dictId: number) {
    const data = await this.dictTypeService.selectDictTypeById(dictId);
    if (!data) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }
    return AjaxResult.success(data);
  }

  @Post()
  @ApiOperation({ summary: '新增字典类型' })
  @PreAuthorize('hasPermi("system:dict:add")')
  async add(@Body() dict: SysDictType) {
    dict.createBy = 'admin'; // Replace with actual user
    const result = await this.dictTypeService.insertDictType(dict);
    return AjaxResult.success(result);
  }

  @Put()
  @ApiOperation({ summary: '修改保存字典类型' })
  @PreAuthorize('hasPermi("system:dict:edit")')
  async edit(@Body() dict: SysDictType) {
    const result = await this.dictTypeService.updateDictType(dict);
    return AjaxResult.success(result);
  }

  @Delete('/:dictIds')
  @ApiOperation({ summary: '删除字典类型' })
  @PreAuthorize('hasPermi("system:dict:remove")')
  async remove(@Param('dictIds',new ParseArrayPipe({ items: Number, separator: ',' })) dictIds: number[]) {
    await this.dictTypeService.deleteDictTypeByIds(dictIds);
    return AjaxResult.success();
  }



}