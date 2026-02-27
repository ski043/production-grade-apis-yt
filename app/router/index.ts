import { implement } from "@orpc/server";
import { contract } from "../contract";
import { BaseContext } from "./middleware";
import {
  createTutorial,
  deleteTutorial,
  getBySlug,
  listTutorials,
  updateTutorial,
} from "./tutorial";

const os = implement(contract).$context<BaseContext>();

export const router = os.router({
  tutorial: {
    create: createTutorial,
    update: updateTutorial,
    delete: deleteTutorial,
    getBySlug: getBySlug,
    list: listTutorials,
  },
});
