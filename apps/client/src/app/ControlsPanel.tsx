import { useState } from 'react';
import { GeneticAlgorithmParams } from '@my-workspace/shared';
import styles from './app.module.scss';

interface ControlsPanelProps {
  onRun: (params: GeneticAlgorithmParams) => void;
  onClear: () => void;
  onStop: () => void;
  disabled: boolean;
  isRunning: boolean;
}

export const ControlsPanel = ({
  onRun,
  onClear,
  onStop,
  disabled,
  isRunning
}: ControlsPanelProps) => {
  const [params, setParams] = useState<GeneticAlgorithmParams>({
    populationSize: 500,
    eliteSize: 50,
    mutationRate: 0.2,
    generations: 'untilLastAlive',
    numberOfPopulations: 10,
    dataMode: 'full',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: name === 'generations' && value === 'untilLastAlive'
        ? value
        : name === 'dataMode'
        ? value
        : Number(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRun(params);
  };

  return (
    <div className={styles['controls-panel']}>
      <h2>Algorithm Parameters</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles['form-group']}>
          <label>
            Population Size:
            <input
              type="number"
              name="populationSize"
              min="10"
              max="1000"
              value={params.populationSize}
              onChange={handleInputChange}
            />
          </label>
        </div>

        <div className={styles['form-group']}>
          <label>
            Elite Size:
            <input
              type="number"
              name="eliteSize"
              min="1"
              max={params.populationSize - 1}
              value={params.eliteSize}
              onChange={handleInputChange}
            />
          </label>
        </div>

        <div className={styles['form-group']}>
          <label>
            Mutation Rate:
            <input
              type="number"
              name="mutationRate"
              min="0"
              max="1"
              step="0.01"
              value={params.mutationRate}
              onChange={handleInputChange}
            />
          </label>
        </div>

        <div className={styles['form-group']}>
          <label>
            Number of Populations:
            <input
              type="number"
              name="numberOfPopulations"
              min="1"
              max="10"
              value={params.numberOfPopulations || 1}
              onChange={handleInputChange}
            />
          </label>
        </div>

        <div className={styles['form-group']}>
          <label>
            Generations:
            <select
              name="generations"
              value={params.generations}
              onChange={handleInputChange}
            >
              <option value="100">100</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
              <option value="untilLastAlive">Until Last Alive</option>
            </select>
          </label>
        </div>

        <div className={styles['form-group']}>
          <label>
            Data Mode:
            <select
              name="dataMode"
              value={params.dataMode}
              onChange={handleInputChange}
            >
              <option value="full">Full Data</option>
              <option value="best">Best Routes Only</option>
            </select>
          </label>
        </div>

        <div className={styles.buttons}>
          {!isRunning ? (
            <>
              <button type="submit" disabled={disabled}>Run Algorithm</button>
              <button type="button" onClick={onClear} disabled={disabled}>
                Clear
              </button>
            </>
          ) : (
            <button type="button" onClick={onStop} className={styles.stopButton}>
              Stop
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
