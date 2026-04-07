import { getAdminActivityFeed } from "@/features/admin/activity/services/activity-service";
import { getAdminDashboardPostSummary } from "@/features/admin/posts/services/admin-post-service";
import { getAdminSubscriberStats } from "@/features/admin/subscribers/repositories/admin-subscriber-repository";
import { countAdminMediaAssets } from "@/features/admin/media/repositories/admin-media-repository";

export function getAdminDashboardPageData() {
  return {
    activity: getAdminActivityFeed({
      limit: 6,
      page: 1,
    }).items,
    mediaCount: countAdminMediaAssets(),
    postSummary: getAdminDashboardPostSummary(),
    subscriberStats: getAdminSubscriberStats(),
  };
}
