import { redirect } from "next/navigation";

/**
 * Root route (/) — redirects immediately to the Workspace Hub.
 * The workspace is the entry point; there is no marketing landing page.
 */
export default function RootPage() {
  redirect("/today");
}
