export interface Point {
  x: number;
  y: number;
  id: number;
}

export interface Route {
  path: number[];
  distance: number;
}

export interface Population {
  id: number;
  routes: Route[];
  bestRoute: Route;
}

export interface Generation {
  id: number;
  populations: Population[];
  overallBestRoute: Route;
}

export interface GeneticAlgorithmParams {
  populationSize: number;
  eliteSize: number;
  mutationRate: number;
  generations: number | 'untilLastAlive';
  numberOfPopulations?: number;
  dataMode?: 'full' | 'best';
}

export interface AlgorithmProgress {
  generation: Generation;
  status: 'running' | 'completed' | 'stopped' | 'error';
  progress: number;
}

export interface ResultsViewerProps {
  generations: Generation[];
  currentGeneration: number;
  onGenerationChange: (generation: number) => void;
  progress: number;
}
