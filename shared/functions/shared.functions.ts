export const groupBy = (xs: any, f: any): Record<string, any> =>
  xs.reduce(
    (r: any, v: any, i: any, a: any, k = f(v)) => (
      // eslint-disable-next-line no-sequences
      (r[k] || (r[k] = [])).push(v), r
    ),
    {}
  );

export const getBidirectionalMapping = <R, T>(
  mapping: Map<R, T>
): Map<R | T, T | R> => {
  return new Map(
    [...mapping].reduce((result, [key, value]) => {
      result.push([key, value], [value, key]);

      return result;
    }, [])
  );
};

export const camelize = (str: string): string =>
  str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
