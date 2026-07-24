import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/exception/filters/http-exception.filter';
import { DomainExceptionFilter } from './common/exception/filters/domain-exception.filter';
import { CatchAllExceptionFilter } from './common/exception/filters/catch-all-exception.filter';
import { mapValidationErrors } from './common/exception/utlis/validation-errors.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(
    new CatchAllExceptionFilter(),
    new HttpExceptionFilter(),
    new DomainExceptionFilter()
  )

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })

  app.setGlobalPrefix('v1');
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => 
        new BadRequestException({
          message: "Validation failed",
          fieldErrors: mapValidationErrors(errors)
        })
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Mental Journal API')
    .setDescription('API for the Mental Journal app')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();