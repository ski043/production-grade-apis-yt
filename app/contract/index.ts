import {
  createTutorialContract,
  deleteTutorialContract,
  getBySlugContract,
  listTutorialsContract,
  updateTutorialContract,
} from "./tutorial.contract";

export const contract = {
  tutorial: {
    create: createTutorialContract,
    update: updateTutorialContract,
    delete: deleteTutorialContract,
    getBySlug: getBySlugContract,
    list: listTutorialsContract,
  },
};
