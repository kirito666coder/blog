import { SpanBox } from './components/SpanBox';

export default function About() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="border-foreground/50 flex h-[95%] w-[95%] border-2">
        <div className="h-full w-1/2">
          <div className="relative ml-6 uppercase">
            <SpanBox className="mt-10 ml-4 text-9xl">a</SpanBox>
            <SpanBox className="mt-40 text-8xl">b</SpanBox>
            <SpanBox className="mt-60 ml-20 text-8xl">o</SpanBox>
            <SpanBox className="mt-80 text-7xl">u</SpanBox>
            <SpanBox className="mt-100 text-9xl">t</SpanBox>
          </div>
        </div>
        <div className="flex h-full w-1/2 justify-end">
          <div className="font-ops flex h-full w-50 items-center justify-center text-9xl">
            <span className="rotate-90">KIRITO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
