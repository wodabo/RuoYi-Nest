import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as fs from 'fs'; // 用于调试保存文件

@Injectable()
export class GifUtils {
  private readonly GIF_HEADER = 'GIF89a';
  private readonly COLORS = [
    0xFF, 0xFF, 0xFF, // 白色
    0x00, 0x00, 0x00, // 黑色
    0x80, 0x80, 0x80, // 灰色
    0xFF, 0x00, 0x00, // 红色（填充到4种颜色，2的幂次方）
  ];

  /**
   * 文本转GIF
   */
  async generate(options: {
    text: string;
    width?: number;
    height?: number;
    fontSize?: number;
    style?: number;
  }) {
    const {
      text,
      width = 200,
      height = 70,
      fontSize = 30,
      style = 0,
    } = options;

    // 1. 创建图像缓冲区并初始化为白色背景
    const imageData = Buffer.alloc(width * height, 0); // 默认白色背景

    // 2. 渲染文本到图像缓冲区
    await this.renderText(text, imageData, width, height, fontSize);

    // 3. 添加干扰效果
    await this.addNoise(imageData, width, height);

    // 4. 计算GIF大小并创建GIF缓冲区
    const gifSize = this.calculateGifSize(width, height);
    const gif = Buffer.alloc(gifSize);

    // 5. 生成GIF文件
    this.makeGif(imageData, gif, width, height, style);

    // 6. 添加GIF结束标记
    gif[gifSize - 1] = 0x3B; // 文件终止符

    // 调试：保存生成的GIF到本地
    fs.writeFileSync('output.gif', gif);

    return gif;
  }

  /**
   * 渲染文本
   */
  private async renderText(
    text: string,
    imageData: Buffer,
    width: number,
    height: number,
    fontSize: number
  ) {
    const charWidth = Math.floor(fontSize * 0.6);
    const startX = Math.floor((width - text.length * charWidth) / 2);
    const startY = Math.floor((height - fontSize) / 2);

    for (let i = 0; i < text.length; i++) {
      const x = startX + i * charWidth;
      const y = startY + this.randomInt(-5, 5); // 随机上下偏移

      // 确保字符在边界内渲染
      if (x >= 0 && y >= 0 && x + charWidth < width && y + fontSize < height) {
        this.drawChar(text[i], imageData, x, y, width, fontSize);
      }
    }
  }

  /**
   * 绘制字符
   */
  private drawChar(
    char: string,
    imageData: Buffer,
    x: number,
    y: number,
    width: number,
    size: number
  ) {
    // 简单的点阵模拟渲染，使用黑色(索引1)
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const pos = (y + i) * width + (x + j);
        if (pos >= 0 && pos < imageData.length) {
          imageData[pos] = 1; // 黑色
        }
      }
    }
  }

  /**
   * 添加噪点
   */
  private async addNoise(
    imageData: Buffer,
    width: number,
    height: number
  ) {
    const noiseCount = Math.floor(width * height * 0.1); // 10%的噪点
    const noise = await this.getRandomBytes(noiseCount);

    for (let i = 0; i < noiseCount; i++) {
      const pos = noise[i] % (width * height);
      imageData[pos] = 2; // 使用灰色(索引2)作为噪点
    }
  }

  /**
   * 生成GIF
   */
  private makeGif(
    imageData: Buffer,
    gif: Buffer,
    width: number,
    height: number,
    style: number
  ) {
    let offset = 0;

    // 1. 写入GIF头
    offset += gif.write(this.GIF_HEADER, offset);

    // 2. 写入逻辑屏幕描述符
    gif.writeUInt16LE(width, offset);
    gif.writeUInt16LE(height, offset + 2);
    gif[offset + 4] = 0x87; // 全局颜色表标志 + 颜色深度
    gif[offset + 5] = 0x00; // 背景色索引
    gif[offset + 6] = 0x00; // 像素宽高比
    offset += 7;

    // 3. 写入全局颜色表
    gif.set(this.COLORS, offset);
    offset += this.COLORS.length;

    // 4. 写入图像描述符
    gif[offset++] = 0x2C; // 图像分隔符
    gif.writeUInt16LE(0, offset); // 左边距
    gif.writeUInt16LE(0, offset + 2); // 上边距
    gif.writeUInt16LE(width, offset + 4);
    gif.writeUInt16LE(height, offset + 6);
    gif[offset + 8] = 0x00; // 局部图像标志
    offset += 9;

    // 5. 写入图像数据
    gif[offset++] = 0x08; // LZW最小码长度
    this.writeImageData(imageData, gif, offset);
  }

  /**
   * 写入图像数据
   */
  private writeImageData(
    imageData: Buffer,
    gif: Buffer,
    offset: number
  ) {
    // 简单的无压缩方式
    const dataBlock = Buffer.alloc(imageData.length + Math.ceil(imageData.length / 255) + 1);
    let blockOffset = 0;
    let remaining = imageData.length;

    while (remaining > 0) {
      const blockSize = Math.min(remaining, 255);
      dataBlock[blockOffset++] = blockSize;
      imageData.copy(dataBlock, blockOffset, imageData.length - remaining, imageData.length - remaining + blockSize);
      blockOffset += blockSize;
      remaining -= blockSize;
    }

    dataBlock[blockOffset++] = 0x00; // 块终止符
    gif.set(dataBlock.subarray(0, blockOffset), offset);
  }

  /**
   * 生成随机字节
   */
  private getRandomBytes(size: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      randomBytes(size, (err, buf) => {
        err ? reject(err) : resolve(buf);
      });
    });
  }

  /**
   * 生成随机整数
   */
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 计算GIF文件大小
   */
  private calculateGifSize(width: number, height: number): number {
    return (
      13 + // GIF头部
      4 * 4 + // 颜色表 (4色*3字节)
      10 + // 图像描述符
      2 + // LZW最小码长度 + 块终止符
      width * height + Math.ceil(width * height / 255) + // 图像数据和块大小字节
      1 // 文件终止符
    );
  }
}
