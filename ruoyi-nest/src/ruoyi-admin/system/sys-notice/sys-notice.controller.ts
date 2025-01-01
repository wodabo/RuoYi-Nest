import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, ParseArrayPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SysNoticeService } from '~/ruoyi-system/sys-notice/sys-notice.service';
import { BaseController } from '~/ruoyi-share/controller/base-controller';
import { PreAuthorize } from '~/ruoyi-share/annotation/PreAuthorize';
import { SysNotice } from '~/ruoyi-system/sys-notice/entities/sys-notice.entity';
import { Log } from '~/ruoyi-share/annotation/Log';
import { BusinessType } from '~/ruoyi-share/enums/BusinessType';

@ApiTags('通知公告')
@Controller('system/notice')
export class SysNoticeController extends BaseController {
  constructor(private readonly noticeService: SysNoticeService) {
    super();
  }

  @ApiOperation({ summary: '获取通知公告列表' })
  @PreAuthorize("hasPermi('system:notice:list')")
  @Get('list')
  async list(@Query() query: SysNotice) {
    const [list, total] = await this.noticeService.selectNoticeList(query);
    return this.getDataTable(list, total);
  }

  @ApiOperation({ summary: '根据编号获取通知公告详细信息' })
  @PreAuthorize('hasPermi("system:notice:query")')
  @Get(':noticeId')
  async getInfo(@Param('noticeId') noticeId: string) {
    const notice = await this.noticeService.selectNoticeById(+noticeId);
    return this.success(notice);
  }

  @ApiOperation({ summary: '新增通知公告' })
  @PreAuthorize('hasPermi("system:notice:add")')
  @Log({ title: '通知公告', businessType: BusinessType.INSERT })
  @Post()
  async add(@Body() notice: SysNotice, @Request() req) {
    const loginUser = req.user;
    notice.createBy = loginUser.getUsername();
    const result = await this.noticeService.insertNotice(notice);
    return this.toAjax(!!result);
  }

  @ApiOperation({ summary: '修改通知公告' })
  @PreAuthorize('hasPermi("system:notice:edit")')
  @Log({ title: '通知公告', businessType: BusinessType.UPDATE })
  @Put()
  async edit(@Body() notice: SysNotice, @Request() req) {
    const loginUser = req.user;
    notice.updateBy = loginUser.getUsername();   
    const result = await this.noticeService.updateNotice(notice);
    return this.toAjax(result);
  }

  @ApiOperation({ summary: '删除通知公告' })
  @PreAuthorize('hasPermi("system:notice:remove")')
  @Log({ title: '通知公告', businessType: BusinessType.DELETE })
  @Delete(':noticeIds')
  async remove(@Param('noticeIds',new ParseArrayPipe({ items: Number, separator: ',' })) noticeIds: number[]) {
    const result = await this.noticeService.deleteNoticeByIds(noticeIds);
    return this.toAjax(result);
  }
}
