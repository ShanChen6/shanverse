// Web worker that makes boards and finds hints, so the page stays responsive.
import { handle, type EngineRequest } from "./engine";

self.onmessage = (event: MessageEvent<EngineRequest>) => {
  self.postMessage(handle(event.data));
};
