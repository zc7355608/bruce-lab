// "JS/Test4.md" => "JS/Test4"
export function deleteFileExtension(path: string = ""): string {
  return path.replace(/\.[^.]+$/, "");
}
// "JS/Test4.md" => "Test4.md"
export function getFileName(path: string = "") {
  return path.split("/").pop() ?? "";
}

export const lastModifyDate = () => {
  return new Date().toISOString().split("T")[0];
};
