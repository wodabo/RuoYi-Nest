import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RuoYiAdminModule } from '~/ruoyi-admin/ruoyi-admin.module';
import { TransformInterceptor } from '~/ruoyi-share/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from '~/ruoyi-share/filter/global-exception-filter';
import { GlobalAuthGuard } from '~/ruoyi-framework/auth/jwt/jwt-auth.guard';
import { JwtAuthService } from '~/ruoyi-framework/auth/jwt/jwt-auth-service';
import { RedisCacheService } from './ruoyi-share/redis/redis-cache.service';
import { DictUtils } from '~/ruoyi-share/utils/dict.utils';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { join } from 'path';



/**
 * Web容器初始化
 * 
 * @author ruoyi
 */
class RuoYiServletInitializer {
  public static async bootstrap(): Promise<NestExpressApplication> {
    const app = await NestFactory.create<NestExpressApplication>(RuoYiAdminModule);
    // 确保这行代码存在
    app.useGlobalInterceptors(new ClassSerializerInterceptor(
      app.get(Reflector),
      {
        enableCircularCheck: false,
        excludeExtraneousValues: false,
        exposeUnsetFields: false,
      }
    ));
    // 全局注册转换拦截器
    app.useGlobalInterceptors(new TransformInterceptor());
    // 注册全局异常过滤器
    app.useGlobalFilters(new GlobalExceptionFilter());

    // 注册全局守卫
    // app.useGlobalGuards(new GlobalAuthGuard(app.get(JwtAuthService), app.get(Reflector)));
    app.enableCors({ origin: '*', credentials: true })



    // Swagger配置
    const config = new DocumentBuilder()
      .setTitle('RuoYi API')
      .setDescription('RuoYi后台管理系统API文档')
      .setVersion('1.0')
        // 添加服务器配置，这会在Swagger UI中显示
      .addServer('/dev-api', '开发环境')
      // 添加JWT认证
      // .addBearerAuth(
      //   {
      //     type: 'http',
      //     scheme: 'bearer',
      //     bearerFormat: 'JWT',
      //     name: 'JWT',
      //     description: '输入JWT token',
      //     in: 'header',
      //   },
      //   'authorization', // This name here is important for matching up with @ApiBearerAuth() in your controller!
      // )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // 设置swagger-ui路径
    SwaggerModule.setup('swagger-ui/index.html', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'RuoYi API Documentation',
      customfavIcon: '/favicon.ico',
      // 自定义样式
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .scheme-container { display: none }
      `,
      // 自定义JS
      customJs: '/custom.js',
      // 设置serve静态文件
      useGlobalPrefix: true,
      explorer: true,
      // 设置JSON文档路径
      jsonDocumentUrl: '/swagger-ui/api-json',
      // 设置YAML文档路径
      yamlDocumentUrl: '/swagger-ui/api-yaml'
    });

    app.setBaseViewsDir([join(__dirname, 'ruoyi-generator', 'resources', 'vm')]);
    app.setViewEngine('hbs');

    await app.listen(process.env.PORT ?? 3000);
    RuoYiAdminModule.bootstrap();
    return app;
  }
}

RuoYiServletInitializer.bootstrap();