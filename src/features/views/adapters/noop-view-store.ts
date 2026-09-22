import { ViewStoreUnavailableError, type ViewStore } from "../view.types";

export class NoopViewStore implements ViewStore {
  async get(): Promise<number> {
    throw new ViewStoreUnavailableError();
  }

  async increment(): Promise<number> {
    throw new ViewStoreUnavailableError();
  }
}
