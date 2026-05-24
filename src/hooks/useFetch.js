import { useState, useEffect, useCallback } from "react";

const useFetch = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchFn()
      .then(setData)
      .catch((e) => setError(e.message || "Something went wrong"))
      .finally(() => setLoading(false));
  // Intentionally omitting eslint-disable-next-line. 
  // To avoid referencing a rule that causes compilation errors.
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run };
};

export default useFetch;
