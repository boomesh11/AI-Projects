import type { User, Workspace } from "@/lib/types";

export const currentUser: User = {
  id: "user-1",
  name: "Alex Chen",
  role: "Product Lead",
  presence: "online",
};

export const currentWorkspace: Workspace = {
  id: "ws-1",
  name: "Meridian Co.",
  plan: "pro",
};
