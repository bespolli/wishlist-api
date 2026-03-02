import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],       // нужен доступ к БД
  providers: [UserService],       // регистрируем сервис
  exports: [UserService],         // ВАЖНО: экспортируем, чтобы AuthModule мог его использовать
})
export class UserModule {}
