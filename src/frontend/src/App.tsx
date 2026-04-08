import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import PublicLayout from "./components/PublicLayout";
import { useActor } from "./hooks/useActor";
import { useAllContent, useInitDefaultContent } from "./hooks/useQueries";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import BookingPage from "./pages/BookingPage";
import ContactPage from "./pages/ContactPage";
import GalleryPage from "./pages/GalleryPage";
import LandingPage from "./pages/LandingPage";
import MembershipEnquiryPage from "./pages/MembershipEnquiryPage";
import MembershipPage from "./pages/MembershipPage";
import NewsPage from "./pages/NewsPage";
import NotFoundPage from "./pages/NotFoundPage";
import StatusPage from "./pages/StatusPage";

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

const newsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/news",
  component: NewsPage,
});

const galleryRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/gallery",
  component: GalleryPage,
});

const membershipEnquiryRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/membership/enquiry",
  component: MembershipEnquiryPage,
});

const bookingRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/booking",
  component: BookingPage,
});

const statusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/status",
  component: StatusPage,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/*",
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    landingRoute,
    aboutRoute,
    membershipRoute,
    membershipEnquiryRoute,
    contactRoute,
    newsRoute,
    galleryRoute,
    bookingRoute,
  ]),
  adminRoute,
  statusRoute,
  notFoundRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
}
