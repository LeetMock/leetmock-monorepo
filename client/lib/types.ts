export interface TokenResult {
  identity: string;
  accessToken: string;
}

export type RunCodeResult = {
  status: boolean;
  executionTime: number;
  isError: boolean;
  output: string;
};

export type RunTestResult = Array<{
  caseNumber: number;
  passed: boolean;
  input: Record<string, any>;
  expected: any;
  actual: any;
  error: string | null;
  stdout: string | null;
}>;

export interface TestCaseResult {
  caseNumber: number;
  passed: boolean;
  input: Record<string, any>;
  expected: any;
  actual: any;
  error: string | null;
  stdout: string | null;
}

export type CodeRunResult = {
  status: string;
  executionTime: number;
  stdout: string | undefined;
  stderr: string | undefined;
  isError: boolean;
  exception: string | undefined;
  testResults?: RunTestResult;
};

export type Defined<T> = T extends null | undefined ? never : T;

// type that accept an object (value can be null or undefined or another stuffs),
// return object with all properties defined
export type DefinedObject<T> = {
  [P in keyof T]: Defined<T[P]>;
};

export interface Testcase {
  input: Record<string, any>;
  expectedOutput?: any;
}
