"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useConvex } from "convex/react";
import { OptionalRestArgs } from "convex/server";

type UseNonReactiveQuery = typeof useQuery;

export const useNonReactiveQuery: UseNonReactiveQuery = (query, ...args) => {
  // TODO: we might need to adjust this function as there might be bug
  // but this is ideally the way to run convex query without subscribing to updates
  const convex = useConvex();
  const [value, setValue] = useState(undefined);

  const fetchQuery = useCallback(async () => {
    const result = await convex.query(query, ...(args as OptionalRestArgs<typeof query>));
    setValue(result);
  }, [query, args, convex]);

  useEffect(() => {
    fetchQuery();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return value;
};
