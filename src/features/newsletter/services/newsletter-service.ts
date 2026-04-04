import { ZodError } from "zod";

import { createSubscriber, findSubscriberByEmail } from "../repositories/newsletter-repository";
import { newsletterEmailSchema } from "../validators/newsletter-schema";

export type NewsletterSubscriptionStatus = "already-subscribed" | "invalid" | "subscribed";

export interface NewsletterSubscriptionResult {
  email?: string;
  status: NewsletterSubscriptionStatus;
}

export function subscribeToNewsletter(input: string): NewsletterSubscriptionResult {
  try {
    const email = newsletterEmailSchema.parse(input);

    if (findSubscriberByEmail(email)) {
      return {
        email,
        status: "already-subscribed",
      };
    }

    createSubscriber(email);

    return {
      email,
      status: "subscribed",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        status: "invalid",
      };
    }

    throw error;
  }
}
