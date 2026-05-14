'use client';

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import gsap from 'gsap';

type Timeout =
  | number
  | {
      enter: number;
      exit: number;
    };

type TransitionStatus = 'entering' | 'entered' | 'exiting' | 'exited';

type TransitionChildrenArgs = {
  visible: boolean;
  status: TransitionStatus;
  nodeRef: RefObject<HTMLCanvasElement | null>;
};

type TransitionProps = {
  children: (args: TransitionChildrenArgs) => ReactNode;
  in: boolean;
  unmount?: boolean;
  initial?: boolean;
  timeout?: Timeout;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
  nodeRef?: RefObject<HTMLCanvasElement | null>;
};

type TransitionContentProps = TransitionProps & {
  enterTimeout: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  exitTimeout: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
};

export const Transition = ({
  children,
  in: show,
  unmount = false,
  initial = true,
  ...props
}: TransitionProps) => {
  const enterTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (show) {
      if (exitTimeout.current) {
        clearTimeout(exitTimeout.current);
      }
    } else {
      if (enterTimeout.current) {
        clearTimeout(enterTimeout.current);
      }
    }
  }, [show]);

  const [mounted, setMounted] = useState(show || !unmount);

  useEffect(() => {
    if (show) {
      setMounted(true);
    }
  }, [show]);

  if (!mounted && unmount) {
    return null;
  }

  return (
    <TransitionContent
      enterTimeout={enterTimeout}
      exitTimeout={exitTimeout}
      in={show}
      initial={initial}
      unmount={unmount}
      setMounted={setMounted}
      {...props}
    >
      {children}
    </TransitionContent>
  );
};

type InternalTransitionContentProps = TransitionContentProps & {
  setMounted: React.Dispatch<React.SetStateAction<boolean>>;
};

const TransitionContent = ({
  children,
  timeout = 0,
  enterTimeout,
  exitTimeout,
  onEnter,
  onEntered,
  onExit,
  onExited,
  initial,
  nodeRef: defaultNodeRef,
  in: show,
  unmount,
  setMounted,
}: InternalTransitionContentProps) => {
  const [status, setStatus] = useState<TransitionStatus>(
    initial ? 'exited' : 'entered'
  );

  const [hasEntered, setHasEntered] = useState(!initial);

  const splitTimeout = typeof timeout === 'object';

  const internalNodeRef = useRef<HTMLCanvasElement | null>(null);

  const nodeRef = defaultNodeRef || internalNodeRef;

  const visible = hasEntered && show;

  useEffect(() => {
    const node = nodeRef.current;

    if (!node) return;

    if (hasEntered || !show) return;

    const actualTimeout = splitTimeout ? timeout.enter : timeout;

    if (enterTimeout.current) {
      clearTimeout(enterTimeout.current);
    }

    if (exitTimeout.current) {
      clearTimeout(exitTimeout.current);
    }

    setHasEntered(true);
    setStatus('entering');

    onEnter?.();

    // Force reflow
    node.offsetHeight;

    gsap.killTweensOf(node);

    enterTimeout.current = setTimeout(() => {
      setStatus('entered');
      onEntered?.();
    }, actualTimeout);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  useEffect(() => {
    const node = nodeRef.current;

    if (!node) return;

    if (show) return;

    const actualTimeout = splitTimeout ? timeout.exit : timeout;

    if (enterTimeout.current) {
      clearTimeout(enterTimeout.current);
    }

    if (exitTimeout.current) {
      clearTimeout(exitTimeout.current);
    }

    setStatus('exiting');

    onExit?.();

    // Force reflow
    node.offsetHeight;

    gsap.killTweensOf(node);

    exitTimeout.current = setTimeout(() => {
      setStatus('exited');

      if (unmount) {
        setMounted(false);
      }

      onExited?.();
    }, actualTimeout);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return children({
    visible,
    status,
    nodeRef,
  });
};
