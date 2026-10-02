export type AdminUser = {
  id: string | number;
  name: string;
  email: string;
  role: "scout" | "athlete";
  createdAt: string;
};

type AdminUsersResponse = {
  users?: AdminUser[];
  data?: AdminUser[] | { users?: AdminUser[] };
  message?: string;
  error?: string;
};

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (!baseUrl) throw new Error("The API URL is not configured.");

  const token = localStorage.getItem("token");
  const response = await fetch(`${baseUrl}/api/admin/users`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const body = (await response.json().catch(() => ({}))) as
    | AdminUser[]
    | AdminUsersResponse;

  if (!response.ok) {
    const errorBody = Array.isArray(body) ? {} : body;
    throw new Error(
      errorBody.message ||
        errorBody.error ||
        `Could not load users (${response.status}). Please try again.`,
    );
  }

  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (body.data && !Array.isArray(body.data) && Array.isArray(body.data.users)) {
    return body.data.users;
  }
  return body.users ?? [];
}
