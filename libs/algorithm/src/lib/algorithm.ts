import { Point, Route, GeneticAlgorithmParams, Population, Generation } from '@my-workspace/shared';

export class TSPSolver {
  private points: Point[];
  private params: GeneticAlgorithmParams;
  private lastGeneration: Generation | null = null;

  constructor(points: Point[], params: GeneticAlgorithmParams) {
    this.points = points;
    this.params = params;
  }

  // Ініціалізація популяції
  private initializePopulation(): Population[] {
    return Array.from({ length: this.params.numberOfPopulations || 1 }, (_, popId) => {
      const routes = Array.from({ length: this.params.populationSize }, () => {
        const path = generateRandomPath(this.points);
        return {
          path,
          distance: calculateDistance(this.points, path)
        };
      }).sort((a, b) => a.distance - b.distance);

      return {
        id: popId,
        routes,
        bestRoute: { ...routes[0] }
      };
    });
  }

  // Оцінка придатності
  protected evaluateFitness(routes: Route[]): Route[] {
    return routes.map(route => ({
      ...route,
      distance: calculateDistance(this.points, route.path)
    })).sort((a, b) => a.distance - b.distance);
  }

  // Вибір батьків
  protected selectParents(population: Population): Route[] {
    const sortedRoutes = this.evaluateFitness(population.routes);
    const elite = sortedRoutes.slice(0, this.params.eliteSize);
    return elite;
  }

  // Створення нащадків
  protected createOffspring(parents: Route[]): Route[] {
    const offspring: Route[] = [];
    const requiredOffspring = this.params.populationSize - this.params.eliteSize;

    while (offspring.length < requiredOffspring) {
      const parent1 = parents[Math.floor(Math.random() * parents.length)];
      const parent2 = parents[Math.floor(Math.random() * parents.length)];

      let childPath = this.crossover(parent1.path, parent2.path);
      childPath = this.mutate(childPath, this.params.mutationRate);

      offspring.push({
        path: childPath,
        distance: calculateDistance(this.points, childPath)
      });
    }
    return offspring;
  }

  // Вибір для наступної популяції
  protected selectNextGeneration(currentPopulation: Population): Population {
    const parents = this.selectParents(currentPopulation);
    const offspring = this.createOffspring(parents);

    const newRoutes = [...parents, ...offspring].sort((a, b) => a.distance - b.distance);

    return {
      id: currentPopulation.id,
      routes: newRoutes,
      bestRoute: { ...newRoutes[0] }
    };
  }

  // Перевірка умови зупинки
  protected shouldStop(populations: Population[], currentGen: number): boolean {
    const MAX_GENERATIONS = 1000;

    if (this.params.generations === 'untilLastAlive' && currentGen > 0) {
      return this.hasConverged(populations) || currentGen >= MAX_GENERATIONS;
    }
    return typeof this.params.generations === 'number' && currentGen >= this.params.generations;
  }

  // Умова зупинки для випадку 'untilLastAlive'
  protected hasConverged(populations: Population[]): boolean {
    const border = 0.5;
    return populations.every(pop => {
      const distanceCounts: Record<number, number> = {};
      pop.routes.forEach(route => {
        const roundedDistance = Math.round(route.distance * 100) / 100;
        distanceCounts[roundedDistance] = (distanceCounts[roundedDistance] || 0) + 1;
      });
      const maxCount = Math.max(...Object.values(distanceCounts));
      return maxCount / pop.routes.length >= border;
    });
  }

  // Допоміжні методи для генетичних операцій
  protected crossover(parent1: number[], parent2: number[]): number[] {
    const start = Math.floor(Math.random() * parent1.length);
    const end = Math.floor(Math.random() * (parent1.length - start)) + start;

    const child = new Array(parent1.length).fill(-1);

    for (let i = start; i <= end; i++) {
      child[i] = parent1[i];
    }

    let parentIndex = 0;
    for (let i = 0; i < child.length; i++) {
      if (i >= start && i <= end) continue;

      while (child.includes(parent2[parentIndex])) {
        parentIndex++;
      }
      child[i] = parent2[parentIndex];
      parentIndex++;
    }

    return child;
  }

  protected mutate(path: number[], mutationRate: number): number[] {
    if (Math.random() > mutationRate) return path;

    const newPath = [...path];
    const index1 = Math.floor(Math.random() * newPath.length);
    let index2 = Math.floor(Math.random() * newPath.length);
    while (index2 === index1) {
      index2 = Math.floor(Math.random() * newPath.length);
    }

    [newPath[index1], newPath[index2]] = [newPath[index2], newPath[index1]];
    return newPath;
  }

  // Основний метод виконання алгоритму
  *solve(): Generator<Generation> {
    let populations = this.initializePopulation();
    let currentGen = 0;

    while (!this.shouldStop(populations, currentGen)) {
      populations = populations.map(population => {
        return this.selectNextGeneration(population);
      });

      const newOverallBest = [...populations]
        .sort((a, b) => a.bestRoute.distance - b.bestRoute.distance)[0]
        .bestRoute;

      const newGeneration = {
        id: currentGen,
        populations: [...populations],
        overallBestRoute: { ...newOverallBest }
      };

      this.lastGeneration = newGeneration;
      yield newGeneration;
      currentGen++;
    }
  }
}

// Допоміжні функції

const calculateDistance = (points: Point[], path: number[]): number => {
  let distance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const pointA = points.find(p => p.id === path[i]);
    const pointB = points.find(p => p.id === path[i + 1]);
    if (!pointA || !pointB) {
      throw new Error('Point not found in the provided points array.');
    }
    distance += Math.sqrt(
      Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2)
    );
  }

  const firstPoint = points.find(p => p.id === path[0]);
  const lastPoint = points.find(p => p.id === path[path.length - 1]);
  if (!firstPoint || !lastPoint) {
    throw new Error('Point not found in the provided points array.');
  }
  distance += Math.sqrt(
    Math.pow(firstPoint.x - lastPoint.x, 2) + Math.pow(firstPoint.y - lastPoint.y, 2)
  );
  return distance;
};

const generateRandomPath = (points: Point[]): number[] => {
  const path = points.map(p => p.id);
  for (let i = path.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [path[i], path[j]] = [path[j], path[i]];
  }
  return path;
};

