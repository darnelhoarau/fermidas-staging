import { cn } from '@/lib/cn';

interface Feature {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface FeatureListProps {
  features: Feature[];
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function FeatureList({
  features,
  className = '',
  columns = 3,
}: FeatureListProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-8', gridCols[columns], className)}>
      {features.map((feature, index) => (
        <div key={index} className='space-y-4'>
          {feature.icon && (
            <div className='w-12 h-12 rounded-xl bg-leaf-100 flex items-center justify-center'>
              {feature.icon}
            </div>
          )}
          <h3 className='font-display text-lg font-semibold text-brand'>
            {feature.title}
          </h3>
          <p className='text-leaf-700 leading-relaxed'>{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
