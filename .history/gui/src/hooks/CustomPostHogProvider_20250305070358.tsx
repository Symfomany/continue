import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { PropsWithChildren, useEffect } from "react";
import { useAppSelector } from "../redux/hooks";

const CustomPostHogProvider = ({ children }: PropsWithChildren) => {
  const allowAnonymousTelemetry = useAppSelector(
    (store) => store?.config?.config?.allowAnonymousTelemetry,
  );
<<<<<<< HEAD
  const [client, setClient] = React.useState<any>(undefined);
=======

>>>>>>> upstream/main
  useEffect(() => {
    if (allowAnonymousTelemetry) {
      posthog.init("phc_AqciO8KANMzQgQ1vFxyVczxtcniokwhE9yxEpHMI1V6", {
        api_host: "https://eu.i.posthog.com",
        disable_session_recording: false,
        autocapture: false,
        capture_pageleave: false,
        capture_pageview: false,
      });
      posthog.identify(window.vscMachineId);
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }
  }, [allowAnonymousTelemetry]);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
};

export default CustomPostHogProvider;
