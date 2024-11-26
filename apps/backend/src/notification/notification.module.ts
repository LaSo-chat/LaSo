import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { FirebaseModule } from '@/firebase/firebase.module';

@Module({
  providers: [NotificationService],
  controllers: [NotificationController],
  imports: [FirebaseModule]
})
export class NotificationModule {}
