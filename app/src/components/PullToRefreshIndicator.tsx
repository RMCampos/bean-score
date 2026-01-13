interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

export const PullToRefreshIndicator = ({
  pullDistance,
  isRefreshing,
  threshold = 80,
}: PullToRefreshIndicatorProps) => {
  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const rotation = (pullDistance / threshold) * 360;

  if (pullDistance === 0 && !isRefreshing) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 flex items-center justify-center z-50 pointer-events-none"
      style={{
        transform: `translateY(${isRefreshing ? '60px' : `${pullDistance}px`})`,
        transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
      }}
    >
      <div className="bg-gray-800 rounded-full p-3 shadow-lg border border-gray-700">
        {isRefreshing ? (
          <svg
            className="animate-spin h-6 w-6 text-emerald-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            className="h-6 w-6 text-emerald-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.1s linear',
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        )}
        {/* Progress indicator */}
        {!isRefreshing && pullDistance > 0 && (
          <div className="absolute inset-0 rounded-full" style={{ opacity: 0.3 }}>
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-emerald-400"
                strokeDasharray={`${progress * 2.83} 283`}
                style={{ transition: 'stroke-dasharray 0.1s linear' }}
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
