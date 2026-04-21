'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type FluidTextProps = {
  text?: string;
  color?: string;
  bgColor?: string;
};

export default function FluidText({
  text = 'Text',
  color = '#ffffff',
  bgColor = '#000000',
}: FluidTextProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  const init = () => {
    const container = mountRef.current!;
    let animationId: number;
    let frame = 1;

    let width = container.clientWidth * window.devicePixelRatio;
    let height = container.clientHeight * window.devicePixelRatio;

    const scene = new THREE.Scene();
    const simScene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const mouse = new THREE.Vector2(0, 0);

    const options: THREE.RenderTargetOptions = {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false,
    };

    const createRT = () => new THREE.WebGLRenderTarget(width, height, options);

    let rtA = createRT();
    let rtB = createRT();

    const simMaterial = new THREE.ShaderMaterial({
      uniforms: {
        textureA: { value: null },
        mouse: { value: mouse },
        resolution: { value: new THREE.Vector2(width, height) },
        frame: { value: 1 },
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.0);}`,
      fragmentShader: `
        precision highp float;

        uniform sampler2D textureA;
        uniform vec2 mouse;
        uniform vec2 resolution;
        uniform int frame;

        varying vec2 vUv;

        const float delta = 1.4;

        void main() {

          vec2 uv = vUv;

          if(frame < 2){
            gl_FragColor = vec4(0.0);
            return;
          }

          vec4 data = texture2D(textureA, uv);

          float pressure = data.r;
          float pVel = data.g;

          vec2 texel = 1.0 / resolution;

          float pR = texture2D(textureA, uv + vec2(texel.x, 0.0)).r;
          float pL = texture2D(textureA, uv - vec2(texel.x, 0.0)).r;
          float pU = texture2D(textureA, uv + vec2(0.0, texel.y)).r;
          float pD = texture2D(textureA, uv - vec2(0.0, texel.y)).r;

          pVel += delta * (-2.0 * pressure + pR + pL) / 4.0;
          pVel += delta * (-2.0 * pressure + pU + pD) / 4.0;

          pressure += delta * pVel;

          pVel += -pressure * 0.02 * delta;
          pVel *= 0.96;
          pressure *= 0.94;

          vec2 mUV = mouse / resolution;

          if(mouse.x > 0.0){
            float d = distance(uv, mUV);
            if(d < 0.02){
              pressure += 4.0 * (1.0 - d / 0.02);
            }
          }

          gl_FragColor = vec4(
            pressure,
            pVel,
            (pR - pL) * 0.5,
            (pU - pD) * 0.5
          );
        }
      `,
    });

    const renderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        textureA: { value: null },
        textureB: { value: null },
      },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.0);}`,
      fragmentShader: `
        precision highp float;

        uniform sampler2D textureA;
        uniform sampler2D textureB;

        varying vec2 vUv;

        void main() {
          vec4 data = texture2D(textureA, vUv);
          vec2 distortion = 0.25 * data.zw;
          gl_FragColor = texture2D(textureB, vUv + distortion);
        }
      `,
      transparent: true,
    });

    const plane = new THREE.PlaneGeometry(2, 2);
    const simQuad = new THREE.Mesh(plane, simMaterial);
    const renderQuad = new THREE.Mesh(plane, renderMaterial);

    simScene.add(simQuad);
    scene.add(renderQuad);

    // ======================
    // TEXT (RESPONSIVE FIX)
    // ======================
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const textTexture = new THREE.CanvasTexture(canvas);

    const drawText = () => {
      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // 🔥 RESPONSIVE FONT SIZE
      const baseSize = Math.min(width, height) / 5; // responsive
      const fontPx = Math.max(80, baseSize); // minimum size

      ctx.fillStyle = color;
      ctx.font = `bold italic ${fontPx}px Poppins`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillText(text, width / 2, height / 2);

      textTexture.needsUpdate = true;
    };

    drawText();

    renderer.setRenderTarget(rtA);
    renderer.render(simScene, camera);
    renderer.setRenderTarget(null);

    const onMove = (e: MouseEvent) => {
      mouse.x = e.offsetX * window.devicePixelRatio;
      mouse.y = (container.clientHeight - e.offsetY) * window.devicePixelRatio;
    };

    renderer.domElement.addEventListener('mousemove', onMove);

    const onResize = () => {
      width = container.clientWidth * window.devicePixelRatio;
      height = container.clientHeight * window.devicePixelRatio;

      renderer.setSize(container.clientWidth, container.clientHeight);

      rtA.dispose();
      rtB.dispose();
      rtA = createRT();
      rtB = createRT();

      simMaterial.uniforms.resolution.value.set(width, height);

      drawText();
    };

    window.addEventListener('resize', onResize);

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      simMaterial.uniforms.frame.value = frame++;
      simMaterial.uniforms.textureA.value = rtA.texture;

      renderer.setRenderTarget(rtB);
      renderer.render(simScene, camera);

      renderMaterial.uniforms.textureA.value = rtB.texture;
      renderMaterial.uniforms.textureB.value = textTexture;

      renderer.setRenderTarget(null);
      renderer.render(scene, camera);

      [rtA, rtB] = [rtB, rtA];
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      container.innerHTML = '';
    };
  };

  useEffect(() => {
    if (!mountRef.current) return;

    let cleanup: (() => void) | null = null;

    const initWhenReady = () => {
      const rect = mountRef.current!.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        requestAnimationFrame(initWhenReady);
        return;
      }

      cleanup = init();
    };

    const t = setTimeout(initWhenReady, 30);

    return () => {
      clearTimeout(t);
      if (cleanup) cleanup();
    };
  }, [text, color, bgColor]);

  return <div ref={mountRef} className="fixed inset-0 z-0" />;
}
