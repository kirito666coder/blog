'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { ScrollSmoother } from '@/lib/gsap';

import { DisplacementSphere } from '@/components/model/displacement-sphere';

import { ThemeToggleButton } from '@/components/Theme';

import { ButtonHoverLineEffect } from '@/components/buttonHover';

import { IntroLoader } from '@/components/Loader';
import { useAppStore } from '@/store/app-store';
import SignIn from '@/components/sign-in';
import { useSession } from 'next-auth/react';
import Logo from '@/components/Logo';

let introAlreadyPlayed = false;

export default function Home() {
  const { data: session, status } = useSession();

  const [sphereReady, setSphereReady] = useState(false);

  const [timerDone, setTimerDone] = useState(introAlreadyPlayed);

  const shouldRunIntro = useMemo(() => {
    return !introAlreadyPlayed;
  }, []);

  const loading = shouldRunIntro ? !(sphereReady && timerDone) : !sphereReady;

  useEffect(() => {
    if (!shouldRunIntro) return;

    const timer = setTimeout(() => {
      introAlreadyPlayed = true;

      setTimerDone(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [shouldRunIntro]);

  useEffect(() => {
    if (loading) return;

    const smoother = ScrollSmoother.create({
      smooth: 3,
      effects: true,
    });

    return () => {
      smoother.kill();
    };
  }, [loading]);

  useEffect(() => {
    useAppStore.setState({
      loading,
    });
  }, [loading]);

  return (
    <>
      {/* <IntroLoader visible={loading} /> */}

      <div id="smooth-wrapper">
        <div id="smooth-content" className="min-h-screen">
          <main className="relative overflow-hidden">
            <div className="fixed inset-0 h-screen w-screen">
              <DisplacementSphere
                onReady={() => {
                  setSphereReady(true);
                }}
              />
            </div>

            <div className="sm:text-foreground relative h-screen px-6 py-20 text-white lg:py-32">
              <div className="absolute">
                <Logo className="text-6xl" />

                <div className="mt-8 ml-2 flex items-center gap-5">
                  <ButtonHoverLineEffect>
                    <Link href="/blogs">Blogs</Link>
                  </ButtonHoverLineEffect>

                  <ButtonHoverLineEffect>
                    <Link href="/about">About</Link>
                  </ButtonHoverLineEffect>

                  <ButtonHoverLineEffect>
                    <ThemeToggleButton />
                  </ButtonHoverLineEffect>

                  <ButtonHoverLineEffect>
                    <SignIn session={session} status={status} />
                  </ButtonHoverLineEffect>
                </div>
                {session && (
                  <p className="text-background bg-foreground mt-1 ml-2 w-fit p-0.5">
                    Logged in as {session.user.name}
                  </p>
                )}
              </div>
              <h1 className="absolute bottom-0">
                <div className="text-2xl leading-20 font-bold uppercase">
                  tech blogs 2026
                </div>

                <div className="font-ops text-7xl leading-9 uppercase md:text-8xl md:leading-12 lg:text-9xl">
                  Coding
                </div>

                <div className="font-ops text-7xl uppercase md:text-8xl lg:text-9xl">
                  logs
                </div>
              </h1>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
