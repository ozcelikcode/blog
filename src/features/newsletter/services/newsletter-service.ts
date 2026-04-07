import { ZodError } from "zod";

import {
  createSubscriber,
  findSubscriberByEmail,
  reactivateSubscriber,
} from "../repositories/newsletter-repository";
import { newsletterEmailSchema } from "../validators/newsletter-schema";

export type NewsletterSubscriptionStatus = "already-subscribed" | "invalid" | "subscribed";

export interface NewsletterSubscriptionResult {
  email?: string;
  status: NewsletterSubscriptionStatus;
}

export function subscribeToNewsletter(input: string, source = "website"): NewsletterSubscriptionResult {
  try {
    const email = newsletterEmailSchema.parse(input);
    const existingSubscriber = findSubscriberByEmail(email);

    if (existingSubscriber?.status === "active") {
      return {
        email,
        status: "already-subscribed",
      };
    }

    if (existingSubscriber?.status === "unsubscribed") {
      reactivateSubscriber(email, source);
    } else {
      createSubscriber(email, source);
    }

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
