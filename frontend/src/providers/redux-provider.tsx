"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/stores/store";
import { hydrate } from "@/lib/stores/auth-slice";

function Hydrator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(hydrate());
  }, []);
  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <Hydrator>{children}</Hydrator>
    </Provider>
  );
}
