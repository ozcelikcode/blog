import type { APIContext } from "astro";

import type { FlashMessage } from "@/features/admin/types";

const FLASH_SESSION_KEY = "flashMessage";

export async function getFlashMessage(context: APIContext): Promise<FlashMessage | undefined> {
  const flashMessage = await context.session?.get<FlashMessage>(FLASH_SESSION_KEY);

  if (!flashMessage) {
    return undefined;
  }

  context.session?.delete(FLASH_SESSION_KEY);
  return flashMessage;
}

export function setFlashMessage(context: Pick<APIContext, "session">, message: FlashMessage): void {
  context.session?.set(FLASH_SESSION_KEY, message);
}
