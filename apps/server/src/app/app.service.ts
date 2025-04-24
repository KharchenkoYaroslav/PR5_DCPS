import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { Point, GeneticAlgorithmParams, AlgorithmProgress, Generation } from '@my-workspace/shared';
import { TSPSolver } from '@my-workspace/algorithm';

@Injectable()
export class AppService {
  private stopSignals: Map<string, Subject<void>> = new Map();

  solveTSP(
    points: Point[],
    params: GeneticAlgorithmParams,
    sessionId: string
  ): Observable<{ data: AlgorithmProgress }> {
    const stopSignal = new Subject<void>();
    this.stopSignals.set(sessionId, stopSignal);

    return new Observable<{ data: AlgorithmProgress }>((subscriber) => {
      const solver = new TSPSolver(points, params);
      let generationCount = 0;
      let lastGeneration = null;
      let isStopped = false;

      stopSignal.subscribe(() => {
        isStopped = true;
      });

      const sendGenerations = async () => {
        try {
          for (const generation of solver.solve()) {
            if (isStopped) {
              subscriber.next({
                data: {
                  generation: lastGeneration,
                  status: 'stopped',
                  progress: this.calculateProgress(generationCount, params),
                },
              });
              break;
            }

            generationCount++;
            lastGeneration = generation;

            const filteredGeneration = this.filterGeneration(generation, params);

            subscriber.next({
              data: {
                generation: filteredGeneration,
                status: 'running',
                progress: this.calculateProgress(generationCount, params),
              },
            });

            await this.delay(50);
          }

          if (!isStopped) {
            subscriber.next({
              data: {
                generation: lastGeneration,
                status: 'completed',
                progress: 100,
              },
            });
          }

          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        } finally {
          this.stopSignals.delete(sessionId);
        }
      };

      sendGenerations().catch((error) => {
        subscriber.error(error);
      });
      
      return () => {
        this.stopSignals.delete(sessionId);
      };
    });
  }

  stopCalculation(sessionId: string): void {
    const stopSignal = this.stopSignals.get(sessionId);
    if (stopSignal) {
      stopSignal.next();
      stopSignal.complete();
      this.stopSignals.delete(sessionId);
    }
  }

  private filterGeneration(generation: Generation, params: GeneticAlgorithmParams): Generation {
    return {
      ...generation,
      populations: generation.populations.map(pop => ({
        ...pop,
        routes: params.dataMode === 'best' ? [pop.bestRoute] : pop.routes
      }))
    };
  }

  private calculateProgress(generationCount: number, params: GeneticAlgorithmParams): number {
    const maxGenerations = params.generations === 'untilLastAlive' ? 1000 : params.generations;
    return (generationCount / maxGenerations) * 100;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
