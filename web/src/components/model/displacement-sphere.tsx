'use client';

import { Transition } from './transition';
import gsap from 'gsap';
import { useWindowSize } from './hooks/useWindowSize';
import { useInViewport } from './hooks/useInViewport';
import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type CanvasHTMLAttributes,
} from 'react';
import {
  AmbientLight,
  DirectionalLight,
  LinearSRGBColorSpace,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  UniformsUtils,
  Vector2,
  WebGLRenderer,
  type IUniform,
  type WebGLProgramParametersWithUniforms,
} from 'three';
import { media } from './utils/style';
import { throttle } from './utils/throttle';
import { cleanRenderer, cleanScene, removeLights } from './utils/three';
import fragmentShader from './displacement-sphere-fragment.glsl';
import vertexShader from './displacement-sphere-vertex.glsl';
import styles from './displacement-sphere.module.css';

const springConfig = {
  stiffness: 30,
  damping: 20,
  mass: 2,
};

type Uniforms = {
  time: IUniform<number>;
} & Record<string, IUniform>;

type SphereMesh = Mesh<SphereGeometry, MeshPhongMaterial> & {
  modifier?: number;
};

type DisplacementSphereProps = CanvasHTMLAttributes<HTMLCanvasElement>;

export const DisplacementSphere = (props: DisplacementSphereProps) => {
  const theme = 'light';

  const start = useRef<number>(Date.now());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const mouse = useRef<Vector2 | null>(null);

  const renderer = useRef<WebGLRenderer | null>(null);

  const camera = useRef<PerspectiveCamera | null>(null);

  const scene = useRef<Scene | null>(null);

  const lights = useRef<(DirectionalLight | AmbientLight)[] | null>(null);

  const uniforms = useRef<Uniforms | undefined>(undefined);

  const material = useRef<MeshPhongMaterial | null>(null);

  const geometry = useRef<SphereGeometry | null>(null);

  const sphere = useRef<SphereMesh | null>(null);

  const reduceMotion = false;

  const isInViewport = useInViewport(canvasRef);

  const windowSize = useWindowSize();

  const [rotation, setRotation] = useState({
    x: 0,
    y: 0,
  });

  const rotationX = useRef<number>(0);

  const rotationY = useRef<number>(0);

  useEffect(() => {
    const { innerWidth, innerHeight } = window;

    mouse.current = new Vector2(0.8, 0.5);

    renderer.current = new WebGLRenderer({
      canvas: canvasRef.current as HTMLCanvasElement,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    });

    renderer.current.setSize(innerWidth, innerHeight);

    renderer.current.setPixelRatio(1);

    renderer.current.outputColorSpace = LinearSRGBColorSpace;

    camera.current = new PerspectiveCamera(
      54,
      innerWidth / innerHeight,
      0.1,
      100
    );

    camera.current.position.z = 52;

    scene.current = new Scene();

    material.current = new MeshPhongMaterial();

    material.current.onBeforeCompile = (
      shader: WebGLProgramParametersWithUniforms
    ) => {
      uniforms.current = UniformsUtils.merge([
        shader.uniforms,
        { time: { value: 0 } },
      ]) as Uniforms;

      shader.uniforms = uniforms.current;

      shader.vertexShader = vertexShader;

      shader.fragmentShader = fragmentShader;
    };

    startTransition(() => {
      geometry.current = new SphereGeometry(32, 128, 128);

      sphere.current = new Mesh(
        geometry.current,
        material.current as MeshPhongMaterial
      ) as SphereMesh;

      sphere.current.position.z = 0;

      sphere.current.modifier = Math.random();

      scene.current?.add(sphere.current);
    });

    return () => {
      cleanScene(scene.current);

      cleanRenderer(renderer.current);
    };
  }, []);

  useEffect(() => {
    const dirLight = new DirectionalLight(
      0xffffff,
      theme === 'light' ? 1.8 : 2.0
    );

    const ambientLight = new AmbientLight(
      0xffffff,
      theme === 'light' ? 1.2 : 0.4
    );

    dirLight.position.z = 200;

    dirLight.position.x = 100;

    dirLight.position.y = 100;

    lights.current = [dirLight, ambientLight];

    lights.current.forEach((light) => scene.current?.add(light));

    return () => {
      removeLights(lights.current);
    };
  }, [theme]);

  useEffect(() => {
    const { width, height } = windowSize;

    const adjustedHeight = height + height * 0.3;

    renderer.current?.setSize(width, adjustedHeight);

    if (camera.current) {
      camera.current.aspect = width / adjustedHeight;

      camera.current.updateProjectionMatrix();
    }

    // Render a single frame on resize when not animating
    if (reduceMotion) {
      renderer.current?.render(
        scene.current as Scene,
        camera.current as PerspectiveCamera
      );
    }

    if (width <= media.mobile) {
      if (sphere.current) {
        sphere.current.position.x = 14;

        sphere.current.position.y = 10;
      }
    } else if (width <= media.tablet) {
      if (sphere.current) {
        sphere.current.position.x = 18;

        sphere.current.position.y = 14;
      }
    } else {
      if (sphere.current) {
        sphere.current.position.x = 22;

        sphere.current.position.y = 16;
      }
    }
  }, [reduceMotion, windowSize]);

  useEffect(() => {
    const onMouseMove = throttle((event: MouseEvent) => {
      const position = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      };

      gsap.to(rotationX, {
        current: position.y / 2,
        duration: springConfig.mass,
        ease: 'power3.out',
      });

      gsap.to(rotationY, {
        current: position.x / 2,
        duration: springConfig.mass,
        ease: 'power3.out',
      });

      setRotation({
        x: rotationX.current,
        y: rotationY.current,
      });
    }, 100);

    if (!reduceMotion && isInViewport) {
      window.addEventListener('mousemove', onMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [isInViewport, reduceMotion]);

  useEffect(() => {
    let animation: number;

    const animate = () => {
      animation = requestAnimationFrame(animate);

      if (uniforms.current !== undefined) {
        uniforms.current.time.value = 0.00005 * (Date.now() - start.current);
      }

      if (sphere.current) {
        sphere.current.rotation.z += 0.001;

        sphere.current.rotation.x = rotationX.current;

        sphere.current.rotation.y = rotationY.current;
      }

      renderer.current?.render(
        scene.current as Scene,
        camera.current as PerspectiveCamera
      );
    };

    if (!reduceMotion && isInViewport) {
      animate();
    } else {
      renderer.current?.render(
        scene.current as Scene,
        camera.current as PerspectiveCamera
      );
    }

    return () => {
      cancelAnimationFrame(animation);
    };
  }, [isInViewport, reduceMotion, rotation]);

  return (
    <Transition in timeout={3000} nodeRef={canvasRef}>
      {({ visible, nodeRef }) => (
        <canvas
          aria-hidden
          className={styles.canvas}
          data-visible={visible}
          ref={nodeRef}
          {...props}
        />
      )}
    </Transition>
  );
};
