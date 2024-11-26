import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  async sendNotification(@Body() payload: { deviceToken: string; title: string; body: string }) {
    const { deviceToken, title, body } = payload;
    await this.notificationService.sendNotification(deviceToken, title, body);
    return { message: 'Notification sent successfully!' };
  }
}
