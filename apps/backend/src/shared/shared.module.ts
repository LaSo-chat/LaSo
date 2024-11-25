import { Module } from '@nestjs/common';
import { SocketService } from './services/socket/socket.service';

@Module({
  providers: [SocketService],

})
export class SharedModule {}
