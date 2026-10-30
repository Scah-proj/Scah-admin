
"use client";

import { Provider } from "react-redux";
import { Toaster } from "sonner";

import { store } from "./store";

export default function Providers({ children })
{
  return (
    <Provider store={store}>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        visibleToasts={4}
        toastOptions={{
          duration: 4000,
          classNames: {
            toast: "!rounded-xl !shadow-lg",
            title: "!font-semibold",
            description: "!text-sm",
          },
        }}
      />
    </Provider>
  );
}
