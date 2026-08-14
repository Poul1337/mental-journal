import 'dotenv/config';

import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { CatchAllExceptionFilter } from './common/exceptions/filters/catch-all-exception.filter';
import { DomainExceptionFilter } from './common/exceptions/filters/domain-exception.filter';
import { HttpExceptionFilter } from './common/exceptions/filters/http-exception.filter';
import { mapValidationErrors } from './common/exceptions/utils/validation-errors.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(
    new CatchAllExceptionFilter(),
    new HttpExceptionFilter(),
    new DomainExceptionFilter(),
  );

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  app.setGlobalPrefix('v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          message: 'Validation failed',
          fieldErrors: mapValidationErrors(errors),
        }),
    }),
  );

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Mental Journal API')
      .setDescription('API for the Mental Journal app')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
