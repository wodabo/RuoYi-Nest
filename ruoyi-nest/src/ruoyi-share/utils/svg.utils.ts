export class SvgUtil {
    /**
     * SVG 转 Base64
     * @param svg SVG字符串
     * @returns Base64字符串
     */
    static toBase64(svg: string): string {
        // 转换为 Base64
        const base64 = Buffer.from(svg).toString('base64');
        // 返回带 Data URI 的 Base64
        return `data:image/svg+xml;base64,${base64}`;
    }

    /**
     * Base64 转 SVG
     * @param base64 Base64字符串
     * @returns SVG字符串
     */
    static fromBase64(base64: string): string {
        // 移除 Data URI 前缀
        const base64Data = base64.replace(/^data:image\/svg\+xml;base64,/, '');
        // 转换回 SVG
        return Buffer.from(base64Data, 'base64').toString('utf-8');
    }
}