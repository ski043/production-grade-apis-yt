import { oc } from "@orpc/contract";
import z from "zod";
import {
  CreateTutorialInput,
  DeleteTutorialInput,
  GetBySlugInput,
  ListTutorialsInput,
  TutorialListOutput,
  TutorialOutput,
  UpdateTutorialInput,
} from "../schemas/tutorial.schema";

export const base = oc.errors({
  UNAUTHORIZED: {
    status: 401,
    message: "Authentication required",
  },
  FORBIDDEN: {
    status: 403,
    message: "You do not have permission to perform this action",
  },
  NOT_FOUND: {
    status: 404,
    message: "Resource not found",
    data: z.object({
      resourceType: z.string(),
      resourceId: z.string(),
    }),
  },
  CONFLICT: {
    status: 409,
    message: "Resource conflict",
    data: z.object({
      field: z.string(),
      value: z.string(),
    }),
  },
  DOMAIN_RULE_VIOLATION: {
    status: 422,
    message: "Business rule violation",
    data: z.object({
      rule: z.string(),
    }),
  },
});

export const createTutorialContract = base
  .route({
    method: "POST",
    path: "/tutorials",
    successStatus: 201,
    summary: "Create a new tutorial",
    description:
      "Creates a tutorial in draft or published state. Requires authentication",
    tags: ["Tutorials"],
  })
  .input(CreateTutorialInput)
  .output(TutorialOutput);

export const updateTutorialContract = base
  .route({
    method: "PATCH",
    path: "/tutorials/{id}",
    summary: "Update a tutorial",
    description: "Partially updates a tutorial. Requires authentication",
    tags: ["Tutorials"],
  })
  .input(UpdateTutorialInput)
  .output(TutorialOutput);

export const deleteTutorialContract = base
  .route({
    method: "DELETE",
    path: "/tutorials/{id}",
    summary: "Delete (archive) a tutorial",
    description:
      "Soft-deletes a tutorial by setting status to archived. Idempotent.",
    tags: ["Tutorials"],
  })
  .input(DeleteTutorialInput)
  .output(TutorialOutput);

export const getBySlugContract = base
  .route({
    method: "GET",
    path: "/tutorials/{slug}",
    summary: "Get a tutorial by slug",
    description:
      "Fetches a single tutorial. Published tutorials are public; drafts are only visible to the author.",
    tags: ["Tutorials"],
  })
  .input(GetBySlugInput)
  .output(TutorialOutput);

export const listTutorialsContract = base
  .route({
    method: "GET",
    path: "/tutorials",
    summary: "List tutorials",
    description:
      "Lists tutorials with cursor-based pagination. Public users see only published tutorials.",
    tags: ["Tutorials"],
  })
  .input(ListTutorialsInput)
  .output(TutorialListOutput);
