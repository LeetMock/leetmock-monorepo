export interface TokenResult {
  identity: string;
  accessToken: string;
}

export type RunTestResult = Array<{
  caseNumber: number;
  passed: boolean;
  input: Record<string, any>;
  expected: any;
  actual: any;
  error: string | null;
}>;

export interface TestCase {
  caseNumber: number;
  passed: boolean;
  input: Record<string, any>;
  expected: any;
  actual: any;
  error: string | null;
}

export interface TestResultsProps {
  results: TestCase[];
}

export type CodeRunResult = {
  status: string;
  executionTime: number;
  stdout: string | null;
  stderr: string | null;
  isError: boolean;
  exception: string | null;
  testResults?: RunTestResult;
};