// 'JS/Test4.md' => 'JS/Test4'
export function githubPathToId(path: string = ''): string {
  return path.replace(/\.[^.]+$/, '');
}

export const lastModifyDate = () => {
  return new Date().toISOString().split('T')[0];
};
