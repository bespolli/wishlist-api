import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArtsearchModule } from './artsearch/artsearch.module';
import { LoggerMiddleware } from './common/logger.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { WishModule } from './wish/wish.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ArtsearchModule,
    PrismaModule,
    WishModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');  // FOR ALL ROUTES
  }
}