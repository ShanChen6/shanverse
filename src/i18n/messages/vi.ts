import common from "./vi/common"; import navigation from "./vi/navigation"; import home from "./vi/home"; import blog from "./vi/blog"; import projects from "./vi/projects"; import about from "./vi/about"; import contact from "./vi/contact"; import footer from "./vi/footer"; import errors from "./vi/errors"; import metadata from "./vi/metadata"; import search from "./vi/search"; import type { MessageTree } from "./types";
const vi = { common, navigation, home, blog, projects, about, contact, footer, errors, metadata, search } as const satisfies MessageTree;
export default vi;
