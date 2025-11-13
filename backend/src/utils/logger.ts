const info = (...args: any[]) => console.log("[info]", ...args);
const warn = (...args: any[]) => console.warn("[warn]", ...args);
const error = (...args: any[]) => console.error("[error]", ...args);

export default { info, warn, error };
