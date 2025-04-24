import { Point, Route } from '@my-workspace/shared';
import styles from './app.module.scss';

interface CityMapProps {
  points: Point[];
  routes?: Route[];
  bestRoute?: Route;
  onAddPoint: (x: number, y: number) => void;
  width?: number;
  height?: number;
}

export const CityMap = ({
  points,
  routes = [],
  bestRoute,
  onAddPoint,
  width = 800,
  height = 600,
}: CityMapProps) => {
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onAddPoint(x, y);
  };

  return (
    <div className={styles['city-map-container']}>
      <svg
        width={width}
        height={height}
        onClick={handleClick}
        className={styles['city-map']}
      >
        {routes.map((route, id) => (
          <g key={`route-${id}`}>
            <path
              d={getPathData(points, route.path)}
              fill="none"
              stroke="#ccc"
              strokeWidth="1"
            />
          </g>
        ))}

        {bestRoute && (
          <path
            d={getPathData(points, bestRoute.path)}
            fill="none"
            stroke="#ff5722"
            strokeWidth="2"
          />
        )}

        {points.map((point) => (
          <circle
            key={`point-${point.id}`}
            cx={point.x}
            cy={point.y}
            r="5"
            fill="#3f51b5"
          />
        ))}
      </svg>

      <div className={styles['map-controls']}>
        <div>{points.length} points placed</div>
      </div>
    </div>
  );
};

const getPathData = (points: Point[], path: number[]): string => {
  if (path.length === 0) return '';

  const startPoint = points.find(p => p.id === path[0]);
  if (!startPoint) {
    throw new Error(`Start point with id ${path[0]} not found`);
  }
  let d = `M ${startPoint.x} ${startPoint.y}`;

  for (let i = 1; i < path.length; i++) {
    const point = points.find(p => p.id === path[i]);
    if (!point) {
      throw new Error(`Point with id ${path[i]} not found`);
    }
    d += ` L ${point.x} ${point.y}`;
  }

  d += ` L ${startPoint.x} ${startPoint.y}`;

  return d;
};
