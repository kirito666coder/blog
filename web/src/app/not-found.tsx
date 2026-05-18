'use client';
import FluidText from '../components/FluidText';
import { useBreakpoint } from '@/hooks/useBreakPoint';

export default function NotFound() {
  const { isBigScreen } = useBreakpoint();
  return (
    <>
      {isBigScreen ? (
        <FluidText text="404 Page Not Found" />
      ) : (
        <div className="font-display flex h-screen items-center justify-center text-center text-6xl font-bold text-white">
          404 Page Not Found
        </div>
      )}
    </>
  );
}
