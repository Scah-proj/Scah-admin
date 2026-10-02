import toast from "react-hot-toast";

const OFFLINE_MESSAGE = "You're offline. Check your internet connection.";
const ONLINE_MESSAGE = "You're back online.";

// Tracks whether the network is currently available. Defaults to true when
// running in a browser (navigator.onLine), otherwise false-safe guard.
const isBrowser = () => typeof window !== "undefined" && typeof navigator !== "undefined";

let wasOfflineToastShown = false;
let listenersAttached = false;

/**
 * Returns true if the user currently has a network connection.
 * Uses the browser's navigator.onLine as the primary signal.
 */
export const isNetworkAvailable = () => {
  if (!isBrowser()) return true; // SSR / non-browser: assume online
  return navigator.onLine;
};

/**
 * Shows an "offline" toast. Guards against showing duplicate toasts
 * repeatedly while the user remains offline during multiple requests.
 */
export const showOfflineToast = () => {
  if (wasOfflineToastShown) return;
  wasOfflineToastShown = true;
  toast.error(OFFLINE_MESSAGE, { id: "offline-toast", duration: 4000 });
};

/**
 * Shows a "back online" toast (once per reconnection).
 */
const showOnlineToast = () => {
  if (!wasOfflineToastShown) return;
  wasOfflineToastShown = false;
  toast.success(ONLINE_MESSAGE, { id: "online-toast", duration: 3000 });
};

/**
 * Attaches browser `online` / `offline` listeners so the app shows a toast
 * immediately when connectivity changes, even without an explicit API call.
 * Safe to call anywhere (idempotent).
 */
export const initNetworkListeners = () => {
  if (!isBrowser() || listenersAttached) return;
  listenersAttached = true;

  window.addEventListener("online", showOnlineToast);
  window.addEventListener("offline", () => {
    wasOfflineToastShown = true; // suppress duplicate toast from a soon-to-fail request
    toast.error(OFFLINE_MESSAGE, { id: "offline-toast", duration: 4000 });
  });
};

