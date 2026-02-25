import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // VALIDATION PIPE, FOR DTO TO AUTOMATICALLY VALIDATE INCOMING DATA
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // STATIC ASSETS, TO SERVE THE FRONTEND
app.useStaticAssets(join(__dirname, '..', '..', 'public'));

  // CORS, FOR FRONTEND TO BE ABLE TO CALL THE API
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
