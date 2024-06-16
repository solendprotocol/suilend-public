import { UrlObject } from "url";

import { NextRouter } from "next/router";

export const shallowPushQuery = (
  router: NextRouter,
  query: UrlObject["query"],
) => router.push({ query }, undefined, { shallow: true });

export const shallowReplaceQuery = (
  router: NextRouter,
  query: UrlObject["query"],
) => router.replace({ query }, undefined, { shallow: true });
