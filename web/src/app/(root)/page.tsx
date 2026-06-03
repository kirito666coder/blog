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
import { TextIntro } from '@/components/Animations';
import { TransitionLink } from '@/components/Navigation';

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
    }, 5500);

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
      <IntroLoader visible={loading} />

      {/* <svg className="fixed inset-0 z-[999] h-full w-full">
        <mask id="text-mask">
          <rect width="100%" height="100%" fill="white" />

          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="black"
            className="font-ops"
            fontSize="200"
            fontWeight="900"
          >
            KIRITO
          </text>
        </mask>

        <rect
          width="100%"
          height="100%"
          fill="background"
          mask="url(#text-mask)"
        />
      </svg> */}
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

            {!loading && (
              <div className="sm:text-foreground relative h-screen px-6 py-20 text-white lg:py-32">
                <div className="absolute">
                  <Logo className="text-6xl" />

                  <div className="mt-8 ml-2 flex items-center gap-5">
                    <ButtonHoverLineEffect>
                      <TransitionLink href="/blogs" revealName="blogs" x={0}>
                        Blogs
                      </TransitionLink>
                    </ButtonHoverLineEffect>
                    <ButtonHoverLineEffect>
                      <TransitionLink href="/admin" revealName="admin" x={3000}>
                        admin
                      </TransitionLink>
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
                  <TextIntro delay={0.2}>
                    <div className="text-2xl leading-5 font-bold uppercase">
                      tech blogs 2026
                    </div>
                  </TextIntro>

                  <TextIntro delay={0.4}>
                    <div className="font-ops h-15 w-full text-7xl leading-18 uppercase md:h-20 md:text-8xl md:leading-24 lg:h-25 lg:text-9xl lg:leading-30">
                      Coding
                    </div>
                  </TextIntro>
                  <TextIntro delay={0.6}>
                    <div className="font-ops h-15 w-full text-7xl leading-12.25 uppercase md:h-19 md:text-8xl md:leading-18 lg:h-24 lg:text-9xl lg:leading-25">
                      Logs
                    </div>
                  </TextIntro>
                </h1>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
