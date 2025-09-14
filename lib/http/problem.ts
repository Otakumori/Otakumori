export type Problem = {
  type?: string;
  title: string;
  status: number;
  detail?: string;
};

export function problem(status: number, title: string, detail?: string): Problem {
  return { type: 'about:blank', title, status, ...(detail ? { detail } : {}) };
}

