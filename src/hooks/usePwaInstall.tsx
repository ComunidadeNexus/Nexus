import { useCallback, useEffect, useState } from "react";
import {
  consumeInstallPrompt,
  detectPwaPlatform,
  getDeferredInstallPrompt,
  getPwaInstalled,
  isIosSafari,
  isStandalonePwa,
  subscribePwaInstall,
  type BeforeInstallPromptEvent,
} from "@/lib/pwaInstall";

export const usePwaInstall = () => {
  const [canPrompt, setCanPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => getPwaInstalled() || isStandalonePwa());
  const [platform] = useState(() => detectPwaPlatform());
  const [iosSafari] = useState(() => isIosSafari());

  useEffect(() => {
    const sync = () => {
      setCanPrompt(Boolean(getDeferredInstallPrompt()));
      setIsInstalled(getPwaInstalled() || isStandalonePwa());
    };
    sync();
    return subscribePwaInstall(sync);
  }, []);

  const install = useCallback(async () => {
    const outcome = await consumeInstallPrompt();
    return outcome === "accepted";
  }, []);

  const promptEvent: BeforeInstallPromptEvent | null = canPrompt ? getDeferredInstallPrompt() : null;

  return {
    platform,
    isInstalled,
    canPrompt,
    iosSafari,
    install,
    promptEvent,
  };
};
