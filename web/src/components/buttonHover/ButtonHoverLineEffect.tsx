'use client';

import type { ReactNode } from 'react';

export default function ButtonHoverLineEffect({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="group relative inline-flex cursor-pointer overflow-hidden">
      {children}

      {/* Bottom line */}
      <span className="absolute bottom-0 left-0 h-[1px] w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100" />

      {/* Top line */}
      <span className="absolute top-0 right-0 h-[1px] w-full origin-right scale-x-0 bg-current transition-transform delay-75 duration-300 ease-out group-hover:scale-x-100" />
    </div>
  );
}
