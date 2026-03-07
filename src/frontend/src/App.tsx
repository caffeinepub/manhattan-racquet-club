import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import PublicLayout from "./components/PublicLayout";
import { useActor } from "./hooks/useActor";
import { useAllContent, useInitDefaultContent } from "./hooks/useQueries";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import ContactPage from "./pages/ContactPage";
import LandingPage from "./pages/LandingPage";
import MembershipPage from "./pages/MembershipPage";

// ─── Content Initializer ───────────────────────────────────────────────────
function ContentInitializer() {
  const { actor, isFetching } = useActor();
  const { data: allContent, isSuccess } = useAllContent();
  const initMutation = useInitDefaultContent();

  const { mutate } = initMutation;
  useEffect(() => {
    if (actor && !isFetching && isSuccess && allContent?.length === 0) {
      mutate();
    }
  }, [actor, isFetching, isSuccess, allContent?.length, mutate]);

  return null;
}

// ─── Routes ────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <>
      <ContentInitializer />
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public",
  component: PublicLayout,
});

const landingRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/",
  component: LandingPage,
});

const aboutRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/about",
  component: AboutPage,
});

const membershipRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/membership",
  component: MembershipPage,
});

const contactRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/contact",
  component: ContactPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    landingRoute,
    aboutRoute,
    membershipRoute,
    contactRoute,
  ]),
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
