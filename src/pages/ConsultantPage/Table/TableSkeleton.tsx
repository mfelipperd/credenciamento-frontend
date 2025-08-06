import { TableRow, TableCell } from "@/components/ui/table";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton = ({ rows = 5, columns = 8 }: TableSkeletonProps) => {
  const getRandomWidth = (baseWidth: string) => {
    const widths = [
      baseWidth,
      baseWidth.replace(/w-(\d+)/, (_, num) => `w-${Math.max(8, parseInt(num) - 4)}`),
      baseWidth.replace(/w-(\d+)/, (_, num) => `w-${parseInt(num) + 4}`),
    ];
    return widths[Math.floor(Math.random() * widths.length)];
  };

  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex} className="py-4">
              <div className="flex items-center space-x-2">
                <div 
                  className={`h-4 bg-gray-200 rounded animate-pulse ${
                    colIndex === 0 ? getRandomWidth('w-16') :
                    colIndex === 1 ? getRandomWidth('w-32') :
                    colIndex === 2 ? getRandomWidth('w-28') :
                    colIndex === 3 ? getRandomWidth('w-40') :
                    colIndex === 4 ? getRandomWidth('w-24') :
                    colIndex === 5 ? getRandomWidth('w-28') :
                    colIndex === 6 ? getRandomWidth('w-20') : getRandomWidth('w-16')
                  }`}
                  style={{
                    animationDelay: `${rowIndex * 0.1 + colIndex * 0.05}s`
                  }}
                />
              </div>
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};
