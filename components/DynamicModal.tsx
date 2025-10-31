import dynamic from "next/dynamic";
import { Skeleton } from "./SkeletonLoader";

// Dynamic imports for modal components with loading states
export const DynamicDemoModal = dynamic(
  () =>
    import("./modals/DemoModal").then((mod) => ({ default: mod.DemoModal })),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh]">
          <div className="flex justify-between items-center mb-6">
            <Skeleton height="h-8" width="w-64" />
            <Skeleton height="h-6" width="w-6" className="rounded-full" />
          </div>
          <div className="space-y-6">
            <Skeleton height="h-64" width="w-full" className="rounded-lg" />
            <div className="space-y-4">
              <Skeleton height="h-32" width="w-full" className="rounded-md" />
              <Skeleton height="h-10" width="w-32" className="rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false,
  },
);

export const DynamicEnhancedTwitterDemo = dynamic(
  () =>
    import("./modals/EnhancedTwitterDemo").then((mod) => ({
      default: mod.EnhancedTwitterDemo,
    })),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh]">
          <div className="flex justify-between items-center mb-6">
            <Skeleton height="h-8" width="w-80" />
            <Skeleton height="h-6" width="w-6" className="rounded-full" />
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Skeleton height="h-6" width="w-32" />
                <Skeleton height="h-32" width="w-full" className="rounded-md" />
              </div>
              <div className="space-y-4">
                <Skeleton height="h-6" width="w-24" />
                <div className="space-y-2">
                  <Skeleton
                    height="h-8"
                    width="w-full"
                    className="rounded-md"
                  />
                  <Skeleton
                    height="h-8"
                    width="w-full"
                    className="rounded-md"
                  />
                </div>
              </div>
            </div>
            <Skeleton height="h-12" width="w-48" className="rounded-lg" />
          </div>
        </div>
      </div>
    ),
    ssr: false,
  },
);

export const DynamicTrialModal = dynamic(
  () =>
    import("./modals/TrialModal").then((mod) => ({ default: mod.TrialModal })),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center space-y-4">
            <Skeleton
              height="h-12"
              width="w-12"
              className="rounded-full mx-auto"
            />
            <Skeleton height="h-8" width="w-48" className="mx-auto" />
            <Skeleton height="h-16" width="w-full" />
            <Skeleton
              height="h-10"
              width="w-32"
              className="rounded-lg mx-auto"
            />
          </div>
        </div>
      </div>
    ),
    ssr: false,
  },
);

// Dynamic import for settings components (heavy forms)
export const DynamicSettingsClient = dynamic(
  () => import("../app/(portal)/settings/page"),
  {
    loading: () => {
      const { SettingsSkeleton } = require("./SkeletonLoader");
      return <SettingsSkeleton />;
    },
    ssr: false,
  },
);
