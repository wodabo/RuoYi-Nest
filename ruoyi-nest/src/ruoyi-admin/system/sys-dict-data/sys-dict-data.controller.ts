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
  Res,
  Request,
  DefaultValuePipe,
  ParseIntPipe,
  ValidationPipe,
  Query,
  ParseArrayPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, PartialType } from '@nestjs/swagger';
import { SysDictDataService } from '~/ruoyi-system/sys-dict-data/sys-dict-data.service';
import { SysDictTypeService } from '~/ruoyi-system/sys-dict-type/sys-dict-type.service';
import { AjaxResult } from '~/ruoyi-share/response/ajax-result';
import { SysDictData } from '~/ruoyi-system/sys-dict-data/entities/sys-dict-data.entity';
import { Public } from '~/ruoyi-framework/auth/decorators/public.decorator';
import { PreAuthorize } from '~/ruoyi-share/annotation/PreAuthorize';
import { Log } from '~/ruoyi-share/annotation/Log';
import { BusinessType } from '~/ruoyi-share/enums/BusinessType';
import { ExcelUtils } from '~/ruoyi-share/utils/excel.utils';
import { FileUploadUtils } from '~/ruoyi-share/utils/file-upload.utils';
import { MimeTypeUtils } from '~/ruoyi-share/utils/mime-type.utils';
import { RuoYiConfigService } from '~/ruoyi-share/config/ruoyi-config.service';
import { BaseController } from '~/ruoyi-share/controller/base-controller';

@ApiTags('数据字典信息')
@Controller('/system/dict/data')
export class SysDictDataController  extends BaseController {
  constructor(
    private readonly dictDataService: SysDictDataService,
    private readonly dictTypeService: SysDictTypeService,
    private readonly excelUtils: ExcelUtils,
    private readonly fileUploadUtils: FileUploadUtils,
    private readonly mimeTypeUtils: MimeTypeUtils,
    private readonly ruoyiConfigService: RuoYiConfigService,
  ) {
    super();
  }

  @Get('/list')
  @ApiOperation({ summary: '获取字典数据列表' })
  @PreAuthorize('hasPermi("system:dict:list")')
  async list(@Query() dictData: SysDictData, @Request() req) {
    this.startPage(dictData);
    const [list, total] = await this.dictDataService.selectDictDataList(dictData);
    return this.getDataTable(list, total);
  }

  @Post('/export')
  @ApiOperation({ summary: '导出字典数据' })
  @Log({ title: '字典数据', businessType: BusinessType.EXPORT })
  @PreAuthorize('hasPermi("system:dict:export")')
  async export(@Body() dictData: SysDictData, @Res() res) {
    const list = await this.dictDataService.selectDictDataList(dictData);
    this.excelUtils.exportExcel(res, list, '字典数据', SysDictData);
  }

  @Get('/:dictCode')
  @ApiOperation({ summary: '查询字典数据详细' })
  @PreAuthorize('hasPermi("system:dict:query")')
  async getInfo(@Param('dictCode', ParseIntPipe) dictCode: number) {
    const data = await this.dictDataService.selectDictDataById(dictCode);
    if (!data) {
      throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
    }
    return AjaxResult.success(data);
  }

  @Get('/type/:dictType')
  @ApiOperation({ summary: '根据字典类型查询字典数据信息' })
  @PreAuthorize('hasPermi("system:dict:query")')
  async dictType(@Param('dictType') dictType: string) {
    const data = await this.dictTypeService.selectDictDataByType(dictType);
    return AjaxResult.success(data || []);
  }

  @Post()
  @ApiOperation({ summary: '新增字典类型' })
  @Log({ title: '字典数据', businessType: BusinessType.INSERT })
  @PreAuthorize('hasPermi("system:dict:add")')
  async add(@Body(ValidationPipe) dict: SysDictData, @Request() req) {
    dict.createBy = req.user.username; // Replace with actual user
    const result = await this.dictDataService.insertDictData(dict);
    return AjaxResult.success(result);
  }

  @Put()
  @ApiOperation({ summary: '修改保存字典类型' })
  @Log({ title: '字典数据', businessType: BusinessType.UPDATE })
  @PreAuthorize('hasPermi("system:dict:edit")')
  async edit(@Body(ValidationPipe) dict: SysDictData, @Request() req) {
    dict.updateBy = req.user.username; // Replace with actual user
    const result = await this.dictDataService.updateDictData(dict);
    return AjaxResult.success(result);
  }

  @Delete('/:dictCodes')
  @ApiOperation({ summary: '删除字典类型' })
  @Log({ title: '字典类型', businessType: BusinessType.DELETE })
  @PreAuthorize('hasPermi("system:dict:remove")')
  async remove(@Param('dictCodes',new ParseArrayPipe({ items: Number, separator: ',' })) dictCodes: number[], @Request() req) {
    await this.dictDataService.deleteDictDataByIds(dictCodes);
    return AjaxResult.success();
  }
}