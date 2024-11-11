import { Test, TestingModule } from '@nestjs/testing';
import { GroupChatGateway } from './group-chat.gateway';

describe('GroupChatGateway', () => {
  let gateway: GroupChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupChatGateway],
    }).compile();

    gateway = module.get<GroupChatGateway>(GroupChatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
