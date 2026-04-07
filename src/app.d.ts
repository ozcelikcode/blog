/// <reference path="./env.d.ts" />

import type { AdminSessionUser, FlashMessage } from "@/features/admin/types";

declare global {
  namespace App {
    interface Locals {
      adminUser?: AdminSessionUser;
      flashMessage?: FlashMessage;
    }

    interface SessionData {
      adminAuth?: AdminSessionUser;
      flashMessage?: FlashMessage;
    }
  }
}
