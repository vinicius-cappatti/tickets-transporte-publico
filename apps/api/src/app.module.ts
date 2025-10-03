import { Module, ValidationPipe } from '@nestjs/common'
import { APP_PIPE } from '@nestjs/core'
import { AppController } from './app.controller'
import { PrismaService } from './prisma.service'
import { UsersModule } from './users/users.module'
import { CategoriesModule } from './categories/categories.module'
import { LocationsModule } from './locations/locations.module'
import { ReportsModule } from './reports/reports.module'

@Module({
  imports: [UsersModule, CategoriesModule, LocationsModule, ReportsModule],
  controllers: [AppController],
  providers: [
    PrismaService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
