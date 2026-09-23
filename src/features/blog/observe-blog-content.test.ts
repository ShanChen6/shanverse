// import assert from "node:assert/strict";
// import test from "node:test";

// import { observeBlogContent, VIEW_DWELL_MS } from "./observe-blog-content";
// import { createBlogViewSession } from "./blog-view-session";

// function rectangle(left: number, top: number, width: number, height: number): DOMRect {
//   return {
//     x: left, y: top, left, top, width, height,
//     right: left + width, bottom: top + height,
//     toJSON: () => ({ left, top, width, height }),
//   };
// }

// function viewport(width: number, height: number, withObserver = true) {
//   const instances: MockObserver[] = [];
//   let bounds = rectangle(16, height + 100, width - 32, 6000);
//   const content = { getBoundingClientRect: () => bounds } as HTMLElement;

//   class MockObserver implements IntersectionObserver {
//     root = null;
//     rootMargin = "0px";
//     thresholds = [0];
//     observed: Element | null = null;
//     disconnected = false;

//     constructor(private callback: IntersectionObserverCallback, readonly options?: IntersectionObserverInit) {
//       instances.push(this);
//     }

//     observe(target: Element) { this.observed = target; }
//     disconnect() { this.disconnected = true; }
//     unobserve() { this.observed = null; }
//     takeRecords() { return []; }

//     emit() {
//       const intersection = rectangle(
//         Math.max(0, bounds.left),
//         Math.max(0, bounds.top),
//         Math.max(0, Math.min(width, bounds.right) - Math.max(0, bounds.left)),
//         Math.max(0, Math.min(height, bounds.bottom) - Math.max(0, bounds.top)),
//       );
//       // Browsers may report isIntersecting at the viewport edge with zero area.
//       const isIntersecting = bounds.top <= height && bounds.bottom >= 0;
//       this.callback([{
//         target: content,
//         time: 0,
//         rootBounds: rectangle(0, 0, width, height),
//         boundingClientRect: bounds,
//         intersectionRect: intersection,
//         intersectionRatio: intersection.width * intersection.height / (bounds.width * bounds.height),
//         isIntersecting,
//       }], this);
//     }
//   }

//   const windowEvents = Object.assign(new EventTarget(), {
//     innerWidth: width,
//     innerHeight: height,
//     IntersectionObserver: withObserver ? MockObserver : undefined,
//   });
//   const documentEvents = Object.assign(new EventTarget(), {
//     visibilityState: "visible" as DocumentVisibilityState,
//   });
//   return {
//     content,
//     instances,
//     environment: { window: windowEvents, document: documentEvents },
//     move: (top: number, contentWidth = width - 32) => {
//       bounds = rectangle(16, top, contentWidth, 6000);
//     },
//     update: () => {
//       if (withObserver) instances.at(-1)?.emit();
//       else windowEvents.dispatchEvent(new Event("scroll"));
//     },
//   };
// }

// for (const { device, width, height } of [
//   { device: "desktop", width: 1440, height: 900 },
//   { device: "mobile", width: 390, height: 844 },
// ]) {
//   for (const withObserver of [true, false]) {
//     test(`${device} ${withObserver ? "observer" : "geometry fallback"} counts only after real content enters the viewport`, (t) => {
//       t.mock.timers.enable({ apis: ["setTimeout"] });
//       const view = viewport(width, height, withObserver);
//       let counts = 0;
//       const cleanup = observeBlogContent(view.content, () => { counts += 1; }, view.environment);
//       view.update();
//       assert.equal(counts, 0);
//       if (withObserver) {
//         assert.equal(view.instances[0].observed, view.content);
//         assert.deepEqual(view.instances[0].options, { threshold: [0, Number.EPSILON] });
//       }

//       view.move(height);
//       view.update();
//       t.mock.timers.tick(VIEW_DWELL_MS);
//       assert.equal(counts, 0, "touching the viewport edge is not visible content");
//       view.move(height - 1);
//       view.update();
//       assert.equal(counts, 0, "a view only counts after it stays visible for the dwell period");
//       t.mock.timers.tick(VIEW_DWELL_MS);
//       assert.equal(counts, 1, "even a tall article counts once its first pixels stay visible long enough");
//       view.move(100);
//       view.update();
//       view.environment.window.dispatchEvent(new Event("resize"));
//       t.mock.timers.tick(VIEW_DWELL_MS);
//       assert.equal(counts, 1);
//       cleanup();
//     });
//   }
// }

// test("a background tab defers the view until the document is visible", (t) => {
//   t.mock.timers.enable({ apis: ["setTimeout"] });
//   const view = viewport(390, 844);
//   view.move(200);
//   view.environment.document.visibilityState = "hidden";
//   let counts = 0;
//   const cleanup = observeBlogContent(view.content, () => { counts += 1; }, view.environment);
//   view.update();
//   assert.equal(counts, 0);
//   view.environment.document.visibilityState = "visible";
//   view.environment.document.dispatchEvent(new Event("visibilitychange"));
//   t.mock.timers.tick(VIEW_DWELL_MS);
//   assert.equal(counts, 1);
//   view.update();
//   t.mock.timers.tick(VIEW_DWELL_MS);
//   assert.equal(counts, 1);
//   cleanup();
// });

// test("cleanup prevents a queued observer callback from counting the previous slug", (t) => {
//   t.mock.timers.enable({ apis: ["setTimeout"] });
//   const view = viewport(1440, 900);
//   let counts = 0;
//   const cleanup = observeBlogContent(view.content, () => { counts += 1; }, view.environment);
//   cleanup();
//   assert.equal(view.instances[0].disconnected, true);
//   view.move(100);
//   view.update();
//   view.environment.document.dispatchEvent(new Event("visibilitychange"));
//   t.mock.timers.tick(VIEW_DWELL_MS);
//   assert.equal(counts, 0);
// });

// test("fallback cleanup removes scroll, resize, and visibility listeners", () => {
//   const view = viewport(390, 844, false);
//   let counts = 0;
//   const cleanup = observeBlogContent(view.content, () => { counts += 1; }, view.environment);
//   cleanup();
//   view.move(100);
//   view.environment.window.dispatchEvent(new Event("scroll"));
//   view.environment.window.dispatchEvent(new Event("resize"));
//   view.environment.document.dispatchEvent(new Event("visibilitychange"));
//   assert.equal(counts, 0);
// });

// test("a Strict Mode setup/cleanup/setup replay still submits one viewport POST", async () => {
//   const view = viewport(390, 844, false);
//   view.move(100);
//   let writes = 0;
//   const session = createBlogViewSession("post", async () => {
//     writes += 1;
//     return Response.json({ views: 9, counted: true });
//   });
//   const onVisible = () => { void session.count(); };
//   const firstCleanup = observeBlogContent(view.content, onVisible, view.environment);
//   firstCleanup();
//   const secondCleanup = observeBlogContent(view.content, onVisible, view.environment);
//   await session.count();
//   assert.equal(writes, 1);
//   assert.deepEqual(session.getSnapshot(), { views: 9, status: "ready" });
//   secondCleanup();
// });
