import { z } from "zod";

export const newsletterEmailSchema = z.email().transform((value) => value.trim().toLowerCase());
