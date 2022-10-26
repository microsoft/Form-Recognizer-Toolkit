import { createBrowserHistory } from "history";

// Create browser history to use in the Redux store
const baseUrl = document.getElementsByTagName("base")[0]?.getAttribute("href") || "";
export const history = createBrowserHistory({ basename: baseUrl });
