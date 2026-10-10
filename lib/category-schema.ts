import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().toLowerCase().min(1).max(90).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(1000),
});
