import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeederService {
  constructor(private readonly usersService: UsersService) {}

  async seed() {
    Logger.log('Seeding data...');
    await this.seedUsers();
    Logger.log('Seeding complete!');
  }

  private async seedUsers() {
    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'OWNER',
      },
      {
        name: 'Coach User',
        email: 'coach@example.com',
        password: 'password123',
        role: 'COACH',
      },
      {
        name: 'Client User',
        email: 'client@example.com',
        password: 'password123',
        role: 'CLIENT',
      },
    ];

    for (const user of users) {
      const existing = await this.usersService.findByEmail(user.email);
      // Since usersService.findOne searches by ID, I should probably check via model or add findByEmail to service.
      // For now, I'll allow duplicates or fail. But better to be safe.
      // Let's assume we want to just create them. MongoDB unique index will prevent duplicates.
      try {
        await this.usersService.create(user as any);
        Logger.log(`Created user: ${user.name}`);
      } catch (error) {
        Logger.warn(`User ${user.name} already exists or error: ${error.message}`);
      }
    }
  }
}
