"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ClipboardList,
  Flag,
  CircleDot,
  LayoutGrid,
  LogOut,
  Menu,
  MessagesSquare,
  X,
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
  { href: "/auditlog", label: "Audit log", icon: ClipboardList },
  { href: "/chat-monitoring", label: "Chat monitoring", icon: MessagesSquare },
  { href: "/account-reports", label: "Account reports", icon: Flag },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    <>
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <Image src="/run.png" alt="SCAH" width={25} height={30} className="h-[30px] w-[25px] object-contain" />
          <span className="text-[18px] font-bold tracking-tight">Admin</span>
        </div>
        <button
          type="button"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="admin-navigation"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="grid h-10 w-10 place-items-center rounded-lg text-[#f2f4f7] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#f26b3a]"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}
      <aside id="admin-navigation" className={`fixed inset-y-0 left-0 z-50 flex w-[280px] shrink-0 flex-col border-r border-white/[0.07] bg-[#10151d] px-3.5 py-5 transition-transform duration-200 md:sticky md:top-0 md:h-screen md:w-[240px] md:translate-x-0 md:border-r ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
      <div className="flex items-center gap-2.5 px-2 pb-6">
        <Image
          src="/run.png"
          alt="SCAH"
          width={30}
          height={36}
          className="h-9 w-[30px] object-contain"
        />
        <span className="text-[19px] font-bold tracking-tight">Admin</span>
      </div>

      <nav
        aria-label="Main"
        className="flex flex-col gap-1.5 overflow-y-auto"
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

      <div className="mt-auto border-t border-white/[0.07] pt-4">
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
    </>
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
