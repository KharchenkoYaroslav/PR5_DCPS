import React from 'react';
import { ResultsViewerProps } from '@my-workspace/shared';
import styles from './app.module.scss';

export const ResultsViewer = ({
  generations,
  currentGeneration,
  onGenerationChange,
  progress,
}: ResultsViewerProps) => {
  if (!generations.length) return null;

  const currentGen = generations[currentGeneration];
  if (!currentGen?.overallBestRoute) return null;

  const currentDistance = currentGen.overallBestRoute.distance;
  const isLastGeneration = currentGeneration === generations.length - 1;

  return (
    <div className={styles['results-viewer']}>
      <h2>Results</h2>

      <div className={styles['generation-info']}>
        <div>Generation: {currentGeneration} / {generations.length - 1}</div>
        <div>Best distance: {Number.isFinite(currentDistance) ? currentDistance.toFixed(2) : 'N/A'}</div>
        <div>Progress: {progress.toFixed(1)}%</div>
      </div>

      <div className={styles['generation-navigation']}>
        <button
          onClick={() => onGenerationChange(0)}
          disabled={currentGeneration === 0}
        >
          First
        </button>
        <button
          onClick={() => onGenerationChange(currentGeneration - 1)}
          disabled={currentGeneration === 0}
        >
          Previous
        </button>

        <input
          type="range"
          min="0"
          max={generations.length - 1}
          value={currentGeneration}
          onChange={(e) => onGenerationChange(Number(e.target.value))}
        />

        <button
          onClick={() => onGenerationChange(currentGeneration + 1)}
          disabled={isLastGeneration}
        >
          Next
        </button>
        <button
          onClick={() => onGenerationChange(generations.length - 1)}
          disabled={isLastGeneration}
        >
          Last
        </button>
      </div>

      <div className={styles['populations-container']}>
        {currentGen.populations.map((population) => (
          <div key={population.id} className={styles.population}>
            <h3>Population #{population.id + 1}</h3>
            <div className={styles.routes}>
              {population.routes.map((route, idx) => (
                <div
                  key={idx}
                  className={
                    styles.route +
                    (idx === 0 ? ' ' + styles['best-in-population'] : '') +
                    (Math.abs(route.distance - currentGen.overallBestRoute.distance) < 1e-6 ? ' ' + styles['overall-best'] : '')
                  }
                >
                  <span>Route #{idx + 1}:</span>
                  <span>{route.distance.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
