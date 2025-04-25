import { TSPSolver } from './algorithm';
import { Point, GeneticAlgorithmParams, Population, Route, Generation } from '@my-workspace/shared';

describe('TSPSolver', () => {
  let solver: TSPSolver;
  let mockPoints: Point[];
  let mockParams: GeneticAlgorithmParams;

  beforeEach(() => {
    mockPoints = [
      { id: 1, x: 0, y: 0 },
      { id: 2, x: 1, y: 1 },
      { id: 3, x: 2, y: 2 },
      { id: 4, x: 3, y: 3 }
    ];

    mockParams = {
      populationSize: 4,
      eliteSize: 2,
      mutationRate: 0.1,
      numberOfPopulations: 1,
      generations: 10
    };

    solver = new TSPSolver(mockPoints, mockParams);
  });

  describe('evaluateFitness', () => {
    it('should calculate and sort routes by distance', () => {
      const routes: Route[] = [
        { path: [1, 2, 3, 4], distance: 0 },
        { path: [1, 3, 2, 4], distance: 0 },
        { path: [1, 4, 2, 3], distance: 0 }
      ];

      const result = (solver as unknown as { evaluateFitness(routes: Route[]): Route[] }).evaluateFitness(routes);

      expect(result).toHaveLength(3);
      expect(result[0].distance).toBeLessThanOrEqual(result[1].distance);
      expect(result[1].distance).toBeLessThanOrEqual(result[2].distance);
    });
  });

  describe('selectParents', () => {
    it('should select elite routes based on eliteSize', () => {
      const population: Population = {
        id: 0,
        routes: [
          { path: [1, 2, 3, 4], distance: 10 },
          { path: [1, 3, 2, 4], distance: 8 },
          { path: [1, 4, 2, 3], distance: 12 },
          { path: [1, 2, 4, 3], distance: 15 }
        ],
        bestRoute: { path: [1, 3, 2, 4], distance: 8 }
      };

      const result = (solver as unknown as { selectParents(population: Population): Route[] }).selectParents(population);

      expect(result).toHaveLength(mockParams.eliteSize);
      expect(result[0].distance).toBeLessThanOrEqual(result[1].distance);
    });
  });

  describe('crossover', () => {
    it('should create valid child path from two parents', () => {
      const parent1 = [1, 2, 3, 4];
      const parent2 = [4, 3, 2, 1];

      const result = (solver as unknown as { crossover(parent1: number[], parent2: number[]): number[] }).crossover(parent1, parent2);

      expect(result).toHaveLength(4);
      expect(result.every((num: number) => [1, 2, 3, 4].includes(num))).toBe(true);
    });
  });

  describe('mutate', () => {
    it('should swap two random positions when mutation occurs', () => {
      const path = [1, 2, 3, 4];
      const mutationRate = 1;

      const result = (solver as unknown as { mutate(path: number[], mutationRate: number): number[] }).mutate(path, mutationRate);

      expect(result).toHaveLength(4);
      expect(result.every((num: number) => [1, 2, 3, 4].includes(num))).toBe(true);
      expect(result.filter((num: number, i: number) => num !== path[i]).length).toBeGreaterThanOrEqual(2);
    });

    it('should return original path when no mutation occurs', () => {
      const path = [1, 2, 3, 4];
      const mutationRate = 0;

      const result = (solver as unknown as { mutate(path: number[], mutationRate: number): number[] }).mutate(path, mutationRate);

      expect(result).toEqual(path);
    });
  });

  describe('createOffspring', () => {
    it('should create correct number of offspring', () => {
      const parents: Route[] = [
        { path: [1, 2, 3, 4], distance: 8 },
        { path: [1, 3, 2, 4], distance: 10 }
      ];

      const result = (solver as unknown as { createOffspring(parents: Route[]): Route[] }).createOffspring(parents);

      expect(result).toHaveLength(mockParams.populationSize - mockParams.eliteSize);
      result.forEach((offspring: Route) => {
        expect(offspring.path).toHaveLength(4);
        expect(new Set(offspring.path).size).toBe(4);
      });
    });
  });

  describe('selectNextGeneration', () => {
    it('should create new generation with correct size and structure', () => {
      const currentPopulation: Population = {
        id: 0,
        routes: [
          { path: [1, 2, 3, 4], distance: 10 },
          { path: [1, 3, 2, 4], distance: 8 },
          { path: [1, 4, 2, 3], distance: 12 },
          { path: [1, 2, 4, 3], distance: 15 }
        ],
        bestRoute: { path: [1, 3, 2, 4], distance: 8 }
      };

      const result = (solver as unknown as { selectNextGeneration(currentPopulation: Population): Population }).selectNextGeneration(currentPopulation);

      expect(result.routes).toHaveLength(mockParams.populationSize);
      expect(result.id).toBe(currentPopulation.id);
      expect(result.bestRoute).toBeDefined();
      expect(result.routes[0].distance).toBeLessThanOrEqual(result.routes[1].distance);
    });
  });

  describe('solve', () => {
    it('should yield generations until stopping condition', () => {
      const generator = solver.solve();
      let generationCount = 0;
      let lastGeneration: Generation | undefined;

      for (const generation of generator) {
        lastGeneration = generation;
        generationCount++;
        if (generationCount >= 10) break;
      }

      expect(generationCount).toBeGreaterThan(0);
      expect(lastGeneration).toBeDefined();
      if (lastGeneration && mockParams.numberOfPopulations !== undefined) {
        expect(lastGeneration.populations).toHaveLength(mockParams.numberOfPopulations);
        expect(lastGeneration.overallBestRoute).toBeDefined();
      }
    });
  });
});
