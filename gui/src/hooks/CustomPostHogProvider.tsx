import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import React, { PropsWithChildren, useEffect } from "react";
import { useAppSelector } from "../redux/hooks";

const CustomPostHogProvider = ({ children }: PropsWithChildren) => {
  const allowAnonymousTelemetry = useAppSelector(
    (store) => store?.config?.config?.allowAnonymousTelemetry,
  );
  const [client, setClient] = React.useState<any>(undefined);
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
      setClient(client);
    } else {
      setClient(undefined);
    }
  }, [allowAnonymousTelemetry]);

  return allowAnonymousTelemetry ? (
    <PostHogProvider client={client}>{children}</PostHogProvider>
  ) : (
    <>{children}</>
  );
};

export default CustomPostHogProvider;
