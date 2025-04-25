import { Controller, Query, Sse, Param, Post, Get, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Point, GeneticAlgorithmParams } from '@my-workspace/shared';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'tsp-solver-api',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  @Get('health')
  getHealthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}

@Controller('tsp')
export class TSPController {
  constructor(private readonly appService: AppService) {}

  @Get('solve')
  @Sse()
  solveTSP(
    @Query('points') pointsJson: string,
    @Query('params') paramsJson: string,
    @Query('sessionId') sessionId: string,
  ): Observable<MessageEvent> {
    const points = JSON.parse(pointsJson) as Point[];
    const params = JSON.parse(paramsJson) as GeneticAlgorithmParams;

    return this.appService.solveTSP(points, params, sessionId).pipe(
      map(event => ({
        data: event.data,
        id: new Date().getTime().toString(),
        retry: 15000,
        type: 'message'
      }))
    );
  }

  @Post('stop/:sessionId')
  stopTSP(@Param('sessionId') sessionId: string) {
    this.appService.stopCalculation(sessionId);
    return { status: 'stopped' };
  }
}
