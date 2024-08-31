"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useConvex } from "convex/react";

type UseNonReactiveQuery = typeof useQuery;

export const useNonReactiveQuery: UseNonReactiveQuery = (query, ...args) => {
  // TODO: we might need to adjust this function as there mightb be bug
  // but this is ideally the way to run convex query without subscribing to updates
  const convex = useConvex();
  const [value, setValue] = useState(undefined);

  const fetchQuery = useCallback(async () => {
    const result = await convex.query(query, ...args);
    setValue(result);
  }, [query, args, convex]);

  useEffect(() => {
    fetchQuery();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return value;
};
