export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 rounded-full border-4 border-solid border-gray-200"></div>
          {/* Spinning ring */}
          <div className="w-16 h-16 rounded-full animate-spin absolute top-0 left-0 border-4 border-solid border-primary border-t-transparent"></div>
          {/* Inner dot */}
          <div className="w-4 h-4 rounded-full bg-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        {/* Loading text with animation */}
        <div className="flex gap-1">
          <span className="text-primary font-medium">Loading</span>
          <span className="animate-bounce">.</span>
          <span className="animate-bounce delay-100">.</span>
          <span className="animate-bounce delay-200">.</span>
        </div>
      </div>
    </div>
  );
} 