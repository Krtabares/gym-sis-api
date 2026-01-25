import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ResultsService } from './results.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('results')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post()
  async recordResult(@Request() req: any, @Body() data: { wodId: string; score: string; isRx: boolean; notes?: string }) {
    const userId = req.user.userId;
    return this.resultsService.recordResult({ ...data, userId });
  }

  @Get('wod/:wodId')
  async findWodResults(@Param('wodId') wodId: string) {
    return this.resultsService.findWodResults(wodId);
  }

  @Get('user/:userId')
  async findUserResults(@Param('userId') userId: string) {
    return this.resultsService.findUserResults(userId);
  }

  @Get('me')
  async findMyResults(@Request() req: any) {
    const userId = req.user.userId;
    return this.resultsService.findUserResults(userId);
  }
}
