let currentDir: "ltr" | "rtl" | "auto" = "auto";

export function getDocumentDir() {
    if (typeof document === "undefined") {
        return currentDir;
    }
    return document.documentElement.dir;
}

export function setDocumentDir(dir: "ltr" | "rtl" | "auto") {
    if (typeof document === "undefined") {
        currentDir = dir;
        return;
    }
    document.documentElement.dir = dir;
}
