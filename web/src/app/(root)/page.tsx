'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { gsap, ScrollSmoother } from '@/lib/gsap';

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
// import { seedData } from '@/data/seed';

let introAlreadyPlayed = false;

export default function Home() {
  const { data: session, status } = useSession();

  const [sphereReady, setSphereReady] = useState(false);

  const [timerDone, setTimerDone] = useState(introAlreadyPlayed);

  const { homePageHover, setHomePageHover } = useAppStore();
  const [threeDModelBlur, setThreeDModelBlur] = useState<boolean>(false);

  const getClass = (id: string) =>
    `transition-all duration-500 ${
      homePageHover && homePageHover !== id
        ? 'blur-sm opacity-40'
        : 'blur-0 opacity-100'
    }`;

  useEffect(() => {
    setHomePageHover(null);
  }, []);

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

  const mainLayerRef = useRef<HTMLDivElement>(null);
  const pinWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;

    const smoother = ScrollSmoother.create({
      smooth: 3,
      effects: true,
    });

    const ctx = gsap.context(() => {
      // fully covering the screen, no clip yet
      gsap.set(mainLayerRef.current, {
        clipPath: 'inset(0% 0% 0% 0%)',
      });

      gsap.to(mainLayerRef.current, {
        // bottom inset grows to 100% — main page's visible area
        // shrinks from the bottom up, revealing section 2 beneath it
        clipPath: 'inset(0% 0% 100% 0%)',
        ease: 'none',
        scrollTrigger: {
          trigger: pinWrapRef.current,
          start: 'top top',
          end: '+=100%',
          scrub: true,
          pin: true,
        },
      });
    });

    return () => {
      ctx.revert();
      smoother.kill();
    };
  }, [loading]);

  return (
    <>
      <IntroLoader visible={loading} />

      <div id="smooth-wrapper">
        <div id="smooth-content" className="min-h-screen">
          <div ref={pinWrapRef} className="relative">
            {/* SECOND SECTION — sits behind, fixed in place, never moves */}
            <div className="bg-background absolute inset-0 z-0 flex h-screen w-screen items-center justify-center">
              {/* your next page content here */}
              <p className="text-9xl">hello world</p>
            </div>
            <div
              ref={mainLayerRef}
              className="bg-background absolute inset-0 z-10 h-screen w-screen overflow-hidden"
            >
              <main className="relative overflow-hidden">
                <div
                  className={`fixed inset-0 h-screen w-screen transition-all duration-500 ${threeDModelBlur ? 'blur-sm' : ''} opacity-100`}
                >
                  <DisplacementSphere
                    onReady={() => {
                      setSphereReady(true);
                    }}
                  />
                </div>

                {!loading && (
                  <div className="sm:text-foreground relative h-screen px-6 py-20 text-white lg:py-32">
                    <div className="absolute">
                      <div
                        onMouseEnter={() => setHomePageHover('logo')}
                        onMouseLeave={() => setHomePageHover(null)}
                        className={`${getClass('logo')} ${
                          homePageHover === 'logo' ? 'scale-110' : 'scale-100'
                        }`}
                      >
                        <Logo className="text-6xl transition-transform duration-500" />
                      </div>

                      <div className="mt-8 ml-2 flex items-center gap-5">
                        <div
                          onMouseEnter={() => setHomePageHover('blogs')}
                          onMouseLeave={() => setHomePageHover(null)}
                          className={`${getClass('blogs')} ${
                            homePageHover === 'blogs'
                              ? 'scale-110'
                              : 'scale-100'
                          }`}
                        >
                          <ButtonHoverLineEffect>
                            <TransitionLink
                              href="/blogs"
                              revealName="blogs"
                              x={0}
                            >
                              Blogs
                            </TransitionLink>
                          </ButtonHoverLineEffect>
                        </div>

                        <div
                          onMouseEnter={() => setHomePageHover('theme')}
                          onMouseLeave={() => setHomePageHover(null)}
                          className={`${getClass('theme')} ${
                            homePageHover === 'theme'
                              ? 'scale-110'
                              : 'scale-100'
                          }`}
                        >
                          <ButtonHoverLineEffect>
                            <ThemeToggleButton />
                          </ButtonHoverLineEffect>
                        </div>

                        <div
                          onMouseEnter={() => {
                            setHomePageHover('signin');
                            setThreeDModelBlur(true);
                          }}
                          onMouseLeave={() => {
                            setHomePageHover(null);
                            setThreeDModelBlur(false);
                          }}
                          className={`${getClass('signin')} ${
                            homePageHover === 'signin'
                              ? 'scale-110'
                              : 'scale-100'
                          }`}
                        >
                          <ButtonHoverLineEffect>
                            <SignIn session={session} status={status} />
                          </ButtonHoverLineEffect>
                        </div>
                      </div>
                      <div className="mt-2 flex items-end gap-5">
                        {session && (
                          <div
                            onMouseEnter={() => setHomePageHover('signin')}
                            onMouseLeave={() => setHomePageHover(null)}
                            className={`${getClass('signin')} ${
                              homePageHover === 'signin'
                                ? 'scale-110'
                                : 'scale-100'
                            }`}
                          >
                            <p className="text-background bg-foreground mt-1 ml-2 w-fit p-0.5 px-3">
                              Logged in as {session.user.name}
                            </p>
                          </div>
                        )}
                        <div
                          onMouseEnter={() => setHomePageHover('admin')}
                          onMouseLeave={() => setHomePageHover(null)}
                          className={`${getClass('admin')} ${
                            homePageHover === 'admin'
                              ? 'scale-110'
                              : 'scale-100'
                          }`}
                        >
                          {session?.user.role === 'admin' && (
                            <ButtonHoverLineEffect>
                              <TransitionLink
                                href="/admin"
                                revealName="Admin"
                                x={3000}
                              >
                                Admin
                              </TransitionLink>
                            </ButtonHoverLineEffect>
                          )}
                        </div>
                      </div>
                    </div>

                    <h1 className="absolute bottom-0 cursor-pointer">
                      <div
                        onMouseEnter={() => setHomePageHover('tech')}
                        onMouseLeave={() => setHomePageHover(null)}
                        className={`${getClass('tech')} ${
                          homePageHover === 'tech' ? 'scale-110' : 'scale-100'
                        }`}
                      >
                        <TextIntro delay={0.2}>
                          <div className="text-2xl leading-5 font-bold uppercase">
                            tech blogs 2026
                          </div>
                        </TextIntro>
                      </div>

                      <div
                        onMouseEnter={() => setHomePageHover('coding')}
                        onMouseLeave={() => setHomePageHover(null)}
                        className={`${getClass('coding')} ${
                          homePageHover === 'coding' ? 'scale-110' : 'scale-100'
                        }`}
                      >
                        <TextIntro delay={0.4}>
                          <div className="font-ops h-15 w-full text-7xl leading-18 uppercase md:h-20 md:text-8xl md:leading-24 lg:h-25 lg:text-9xl lg:leading-30">
                            Coding
                          </div>
                        </TextIntro>
                      </div>

                      <div
                        onMouseEnter={() => setHomePageHover('logs')}
                        onMouseLeave={() => setHomePageHover(null)}
                        className={`${getClass('logs')} ${
                          homePageHover === 'logs' ? 'scale-110' : 'scale-100'
                        }`}
                      >
                        <TextIntro delay={0.6}>
                          <div className="font-ops h-15 w-full text-7xl leading-12.25 uppercase md:h-19 md:text-8xl md:leading-18 lg:h-24 lg:text-9xl lg:leading-25">
                            Logs
                          </div>
                        </TextIntro>
                      </div>
                    </h1>
                  </div>
                )}
              </main>
            </div>
          </div>
          <div style={{ height: '101vh' }} />
        </div>
      </div>
    </>
  );
}
