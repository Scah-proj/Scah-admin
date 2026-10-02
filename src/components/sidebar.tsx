"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  CircleDot,
  LayoutGrid,
  LogOut,
  Settings,
  Trophy,
  Users,
} from "lucide-react";
import { useLogoutMutation } from "@/app/redux/api/authApi";
import { baseApi } from "@/app/redux/api/baseurl";
import { logout } from "@/app/redux/features/auth/authSlice";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/registrations", label: "Registrations", icon: Users },
  { href: "/athletes", label: "Athletes", icon: CircleDot },
  { href: "/scouts", label: "Scouts", icon: Trophy },
];

type AdminProfile = {
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
};

const subscribeToStoredUser = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("scah:admin-user-changed", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("scah:admin-user-changed", callback);
  };
};

const getStoredUserSnapshot = () => localStorage.getItem("user") ?? "";
const getServerUserSnapshot = () => "";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const storedUserJson = useSyncExternalStore(
    subscribeToStoredUser,
    getStoredUserSnapshot,
    getServerUserSnapshot,
  );
  const storedUser = useMemo(
    () => parseAdminUser(storedUserJson),
    [storedUserJson],
  );
  const adminUser = storedUser;
  const [requestLogout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    try {
      await requestLogout(undefined).unwrap();
    } catch (error) {
      console.error("The server logout request failed.", error);
    } finally {
      dispatch({ type: logout.type });
      dispatch(baseApi.util.resetApiState());
      window.dispatchEvent(new Event("scah:admin-user-changed"));
      router.replace("/");
    }
  };

  const adminName =
    adminUser?.name?.trim() ||
    adminUser?.fullName?.trim() ||
    [adminUser?.firstName, adminUser?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    adminUser?.username?.trim() ||
    adminUser?.email?.split("@")[0] ||
    "Admin";
  const adminInitials = adminName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-white/[0.07] px-3.5 py-5 md:sticky md:top-0 md:h-screen md:w-[240px] md:border-b-0 md:border-r">
      <div className="flex items-center gap-2.5 px-2 pb-6">
        <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-[#f26b3a] text-[15px] font-bold text-white">
          S
        </span>
        <span className="text-[19px] font-bold tracking-tight">SCAH Admin</span>
      </div>

      <nav
        aria-label="Main"
        className="flex gap-1.5 overflow-x-auto md:flex-col"
      >
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f26b3a] ${
                active
                  ? "bg-white/[0.09] text-[#f2f4f7]"
                  : "text-[#a3acba] hover:bg-white/5 hover:text-[#f2f4f7]"
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 border-t border-white/[0.07] pt-4 md:mt-auto">
        <div className="mb-3 flex min-w-0 items-center gap-3 px-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#f26b3a]/25 bg-[#f26b3a]/10 text-xs font-bold tracking-wide text-[#ffad8c]">
            {adminInitials || "A"}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-[#f2f4f7]">
              {adminName}
            </span>
            <span className="mt-0.5 block truncate text-xs text-[#8e98a7]">
              Administrator
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-medium text-[#a3acba] transition-colors hover:bg-[#ff5a3c]/10 hover:text-[#ff806b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f26b3a]"
        >
          <LogOut size={18} strokeWidth={2} />
          <span>{isLoggingOut ? "Logging out…" : "Log out"}</span>
        </button>
      </div>
    </aside>
  );
}

function parseAdminUser(value: string): AdminProfile | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object"
      ? (parsed as AdminProfile)
      : null;
  } catch (error) {
    console.error("Could not read the signed-in admin profile.", error);
    return null;
  }
}
