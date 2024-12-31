import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, Res, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SysPostService } from '~/ruoyi-system/sys-post/sys-post.service';
import { TableDataInfo } from '~/ruoyi-share/response/table-data-info';
import { AjaxResult } from '~/ruoyi-share/response/ajax-result';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { SysPost } from '~/ruoyi-system/sys-post/entities/sys-post.entity';
import { ExcelUtils } from '~/ruoyi-share/utils/excel.utils';
import { PreAuthorize } from '~/ruoyi-share/annotation/PreAuthorize';
import { Log } from '~/ruoyi-share/annotation/Log';
import { BusinessType } from '~/ruoyi-share/enums/BusinessType';

@ApiTags('岗位管理')
@Controller('system/post')
export class SysPostController extends BaseController  {
  constructor(
    private readonly postService: SysPostService, 
    private readonly excelUtils: ExcelUtils
  ) {
    super();
  }

  @PreAuthorize('hasPermi("system:post:list")')
  @ApiOperation({ summary: '获取岗位列表' })
  @ApiResponse({ status: 200, type: TableDataInfo })
  @Get('list')
  async list(@Query() query: SysPost): Promise<TableDataInfo> {
    this.startPage(query);
    const [list, total] = await this.postService.selectPostList(query);
    return this.getDataTable(list, total);
  }

  @PreAuthorize('hasPermi("system:post:export")')
  @Log({ title: '岗位管理', businessType: BusinessType.EXPORT })
  @ApiOperation({ summary: '导出岗位' })
  @Post('export')
  async export(@Res() res, @Body() post: SysPost): Promise<void> {
    const [list, _total] = await this.postService.selectPostList(post);
    await this.excelUtils.exportExcel(res, list, '岗位数据', SysPost);
  }

  @PreAuthorize('hasPermi("system:post:query")')
  @ApiOperation({ summary: '根据岗位编号获取详细信息' })
  @ApiResponse({ status: 200, type: AjaxResult })
  @Get(':postId')
  async getInfo(@Param('postId', new DefaultValuePipe(0), ParseIntPipe) postId: number): Promise<AjaxResult> {
    const data = await this.postService.selectPostById(postId);
    return AjaxResult.success(data);
  }

  @PreAuthorize('hasPermi("system:post:add")')
  @Log({ title: '岗位管理', businessType: BusinessType.INSERT })
  @ApiOperation({ summary: '新增岗位' })
  @ApiResponse({ status: 200, type: AjaxResult })
  @Post()
  async add(@Body() post: SysPost): Promise<AjaxResult> {
    if (!await this.postService.checkPostNameUnique(post)) {
      return AjaxResult.error(`新增岗位'${post.postName}'失败，岗位名称已存在`);
    }
    if (!await this.postService.checkPostCodeUnique(post)) {
      return AjaxResult.error(`新增岗位'${post.postName}'失败，岗位编码已存在`);
    }
    const result = await this.postService.insertPost(post);
    return AjaxResult.success(result);
  }

  @PreAuthorize('hasPermi("system:post:edit")')
  @Log({ title: '岗位管理', businessType: BusinessType.UPDATE })
  @ApiOperation({ summary: '修改岗位' })
  @ApiResponse({ status: 200, type: AjaxResult })
  @Put()
  async edit(@Body() post: SysPost): Promise<AjaxResult> {
    if (!await this.postService.checkPostNameUnique(post)) {
      return AjaxResult.error(`修改岗位'${post.postName}'失败，岗位名称已存在`);
    }
    if (!await this.postService.checkPostCodeUnique(post)) {
      return AjaxResult.error(`修改岗位'${post.postName}'失败，岗位编码已存在`);
    }
    const result = await this.postService.updatePost(post);
    return AjaxResult.success(result);
  }

  @PreAuthorize('hasPermi("system:post:remove")')
  @Log({ title: '岗位管理', businessType: BusinessType.DELETE })
  @ApiOperation({ summary: '删除岗位' })
  @ApiResponse({ status: 200, type: AjaxResult })
  @Delete(':postIds')
  async remove(@Param('postIds') postIds: string): Promise<AjaxResult> {
    const result = await this.postService.deletePostByIds(postIds.split(',').map(id => +id));
    return AjaxResult.success(result);
  }

  @ApiOperation({ summary: '获取岗位选择框列表' })
  @ApiResponse({ status: 200, type: AjaxResult })
  @Get('optionselect')
  async optionselect(): Promise<AjaxResult> {
    const posts = await this.postService.selectPostAll();
    return AjaxResult.success(posts);
  }
}
