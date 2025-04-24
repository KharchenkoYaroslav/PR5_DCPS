import { useState, useEffect } from 'react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import {
  Point,
  GeneticAlgorithmParams,
  AlgorithmProgress,
} from '@my-workspace/shared';
import { CityMap } from './Map';
import { ControlsPanel } from './ControlsPanel';
import { ResultsViewer } from './ResultsViewer';
import styles from './app.module.scss';

export function App() {
  const [points, setPoints] = useState<Point[]>([]);
  const [generations, setGenerations] = useState<AlgorithmProgress[]>([]);
  const [currentGeneration, setCurrentGeneration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleAddPoint = (x: number, y: number) => {
    setPoints((prev) => [
      ...prev,
      {
        x,
        y,
        id: prev.length > 0 ? Math.max(...prev.map((p) => p.id)) + 1 : 1,
      },
    ]);
  };

  const handleClearPoints = () => {
    setPoints([]);
    setGenerations([]);
    setCurrentGeneration(0);
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
  };

  const handleRunAlgorithm = (params: GeneticAlgorithmParams) => {
    if (points.length < 3) {
      alert('Please add at least 3 points');
      return;
    }

    if (eventSource) {
      eventSource.close();
    }

    setIsRunning(true);
    setGenerations([]);
    setCurrentGeneration(0);

    const newSessionId = Date.now().toString();
    setSessionId(newSessionId);

    const query = new URLSearchParams({
      points: JSON.stringify(points),
      params: JSON.stringify(params),
      sessionId: newSessionId,
    }).toString();

    const newEventSource = new EventSourcePolyfill(`/api/tsp/solve?${query}`);
    setEventSource(newEventSource);

    let receivedGenerations = 0;

    newEventSource.onmessage = (event) => {
      const data: AlgorithmProgress = JSON.parse(event.data);
      setGenerations((prev) => {
        const next = [...prev, data];
        return next;
      });
      receivedGenerations++;
      setCurrentGeneration(receivedGenerations - 1);

      if (data.status === 'completed' || data.status === 'stopped') {
        setIsRunning(false);
        newEventSource.close();
        setEventSource(null);
      }
    };

    newEventSource.onerror = () => {
      setIsRunning(false);
      newEventSource.close();
      setEventSource(null);
    };
  };

  const handleStopAlgorithm = async () => {
    try {
      if (!sessionId) return;

      await fetch(`/api/tsp/stop/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to stop algorithm:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  const currentGenData = generations[currentGeneration]?.generation;

  return (
    <div className={styles.app}>
      <div className={styles['main-content']}>
        <CityMap
          points={points}
          routes={
            currentGenData
              ? currentGenData.populations.flatMap((p) => p.routes)
              : []
          }
          bestRoute={currentGenData?.overallBestRoute}
          onAddPoint={handleAddPoint}
        />

        <ControlsPanel
          onRun={handleRunAlgorithm}
          onClear={handleClearPoints}
          onStop={handleStopAlgorithm}
          disabled={isRunning || points.length < 3}
          isRunning={isRunning}
        />
      </div>

      {generations.length > 0 && (
        <ResultsViewer
          generations={generations.map((g) => g.generation).filter(Boolean)}
          currentGeneration={currentGeneration}
          onGenerationChange={setCurrentGeneration}
          progress={generations[generations.length - 1]?.progress || 0}
        />
      )}
    </div>
  );
}

export default App;
