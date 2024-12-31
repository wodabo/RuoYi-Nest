  import { Injectable } from '@nestjs/common';

  @Injectable()
  export class ShareUtils {
    /**
     * Parse browser name from User-Agent
     */
    parseBrowser(userAgent: string): string {
      if (userAgent.includes('Firefox')) {
        return 'Firefox';
      } else if (userAgent.includes('Chrome')) {
        return 'Chrome'; 
      } else if (userAgent.includes('Safari')) {
        return 'Safari';
      } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
        return 'Internet Explorer';
      } else if (userAgent.includes('Edge')) {
        return 'Edge';
      }
      return 'Unknown';
    }

    /**
     * Parse OS name from User-Agent 
     */
    parseOS(userAgent: string): string {
      if (userAgent.includes('Windows')) {
        return 'Windows';
      } else if (userAgent.includes('Mac OS')) {
        return 'Mac OS';
      } else if (userAgent.includes('Linux')) {
        return 'Linux';
      } else if (userAgent.includes('Android')) {
        return 'Android';
      } else if (userAgent.includes('iOS')) {
        return 'iOS';
      }
      return 'Unknown';
    }
  }
