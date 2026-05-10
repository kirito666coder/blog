'use client';
import FluidText from './components/FluidText';
import { useBreakpoint } from '@/hooks/useBreakPoint';

export default function ComingSoon() {
  const { isBigScreen } = useBreakpoint();
  return (
    <>
      {isBigScreen ? (
        <FluidText text="Coming soon" />
      ) : (
        <div className="font-display flex h-screen items-center justify-center text-6xl font-bold text-white">
          Coming soon...
        </div>
      )}
    </>
  );
}
