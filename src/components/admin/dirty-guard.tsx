"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Guard = {
  setDirty: (key: string, dirty: boolean) => void;
  /** Called from a link's onNavigate: stops it and asks, when anything is unsaved. */
  intercept: (href: string, event: { preventDefault: () => void }) => void;
};

const GuardContext = createContext<Guard | null>(null);

/**
 * Keeps unsaved admin work from vanishing on a stray click. Forms report
 * whether they hold unsaved edits (useDirtyGuard); while any does,
 * closing or reloading the tab triggers the browser's own prompt, and
 * admin links (GuardedLink) ask before leaving. Navigation was silent
 * before: a click on 预览 or the sidebar discarded an essay in progress.
 */
export function DirtyGuardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dirty = useRef(new Set<string>());
  const [leavingTo, setLeavingTo] = useState<string | null>(null);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty.current.size === 0) return;
      event.preventDefault();
      // Older browsers need returnValue set to show the prompt.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const guard = useMemo<Guard>(
    () => ({
      setDirty(key, isDirty) {
        if (isDirty) dirty.current.add(key);
        else dirty.current.delete(key);
      },
      intercept(href, event) {
        if (dirty.current.size === 0) return;
        event.preventDefault();
        setLeavingTo(href);
      },
    }),
    [],
  );

  return (
    <GuardContext.Provider value={guard}>
      {children}
      <AlertDialog open={leavingTo !== null} onOpenChange={(open) => !open && setLeavingTo(null)}>
        <AlertDialogContent className="font-sans">
          <AlertDialogHeader>
            <AlertDialogTitle>有未保存的修改</AlertDialogTitle>
            <AlertDialogDescription>离开这个页面，尚未保存的修改就会丢失。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>继续编辑</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const href = leavingTo;
                dirty.current.clear();
                setLeavingTo(null);
                if (href) router.push(href);
              }}
            >
              放弃修改并离开
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </GuardContext.Provider>
  );
}

/** Reports whether this form holds unsaved edits (keyed, so several can coexist). */
export function useDirtyGuard(key: string, isDirty: boolean) {
  const guard = useContext(GuardContext);
  useEffect(() => {
    guard?.setDirty(key, isDirty);
    return () => guard?.setDirty(key, false);
  }, [guard, key, isDirty]);
}

/** An admin link that asks before leaving unsaved work. */
export function GuardedLink({
  onNavigate,
  ...props
}: ComponentProps<typeof Link> & { href: string }) {
  const guard = useContext(GuardContext);
  return (
    <Link
      {...props}
      onNavigate={(event) => {
        onNavigate?.(event);
        guard?.intercept(props.href, event);
      }}
    />
  );
}
