import { DefinedObject } from "@/lib/types";
import { allDefined } from "@/lib/utils";
import { useMemo } from "react";

interface WaitProps<T extends object> {
  data: T;
  fallback?: React.ReactNode;
  children: (data: DefinedObject<T>) => React.ReactNode;
}

/**
 * Wait component that renders children only when all data is defined.
 *
 * @template T - The type of the data object
 * @param {Object} props - The component props
 * @param {T} props.data - The data object to check for defined values
 * @param {React.ReactNode} [props.fallback] - Optional fallback content to render when data is not fully defined
 * @param {(data: DefinedObject<T>) => React.ReactNode} props.children - Function to render when all data is defined
 * @returns {React.ReactNode} The rendered content
 *
 * @example
 * <Wait data={someData} fallback={<Loading />}>
 *   {(definedData) => <DataDisplay data={definedData} />}
 * </Wait>
 */
export const Wait = <T extends object>({ data, fallback, children }: WaitProps<T>) => {
  const renderedResult = useMemo(() => {
    if (allDefined(data)) return children(data);

    return fallback ?? null;
  }, [data, fallback, children]);

  return renderedResult;
};
