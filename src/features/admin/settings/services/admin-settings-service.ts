import type { APIContext } from "astro";

import { assertCanManageSettings } from "@/lib/auth/session";
import { setFlashMessage } from "@/lib/sessions/flash";
import type { AdminSessionUser } from "@/features/admin/types";
import type { AdminFormState } from "@/features/admin/utils/form-state";
import { recordAdminActivity } from "@/features/admin/activity/services/activity-service";

import { getAdminSettings, updateAdminSettings } from "../repositories/admin-settings-repository";
import type { SettingsFormValues } from "../validators/settings-form";
import { validateSettingsForm } from "../validators/settings-form";

export function getAdminSettingsPageData() {
  return {
    settings: getAdminSettings(),
  };
}

export async function saveAdminSettings(
  formData: FormData,
  actor: AdminSessionUser,
  context: Pick<APIContext, "clientAddress" | "session">,
): Promise<AdminFormState<SettingsFormValues>> {
  assertCanManageSettings(actor.role);
  const validation = validateSettingsForm(formData);

  if (!validation.ok || !validation.parsed) {
    return validation;
  }

  updateAdminSettings({
    ...validation.parsed,
    updatedAt: new Date().toISOString(),
  });

  recordAdminActivity({
    action: "settings.update",
    actor,
    entityId: "1",
    entityLabel: "Site settings",
    entityType: "site_settings",
    ipAddress: context.clientAddress,
  });

  setFlashMessage(context, {
    title: "Settings updated",
    tone: "success",
  });

  return {
    ok: true,
    redirectTo: "/admin/settings",
    values: validation.values,
  };
}
