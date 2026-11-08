import { defineEnrichments } from '../../../lib/content/enrich-schema';

const S = 'javascript/coding-round-solutions';

/** The task list reuses the solutions' enrichments, so both pages stay aligned. */
export default defineEnrichments('javascript/coding-round-questions.md', {
  'debounce--throttle': { sameAs: `${S}/debounce--throttle` },
  'promiseall--promiseallsettled--promiserace': { sameAs: `${S}/promiseall` },
  'promisify-sleepms': { sameAs: `${S}/sleep--promisify` },
  'retry-with-exponential-backoff': { sameAs: `${S}/retry-with-exponential-backoff` },
  'run-async-tasks-with-a-concurrency-limit-of-n': { sameAs: `${S}/concurrency-limit-run-n-async-tasks-at-a-time` },
  'deep-clone-objects-arrays-dates-cycles': { sameAs: `${S}/deep-clone-handles-date-arrays-cycles` },
  'flatten-a-nested-array-with-depth': { sameAs: `${S}/flatten-array-with-depth` },
  'arrayprototypemap--filter--reduce-polyfill': { sameAs: `${S}/polyfills-map-filter-reduce` },
  'functionprototypebind--call--apply-polyfill': { sameAs: `${S}/polyfills-call-apply-bind` },
  memoize: { sameAs: `${S}/memoize--once--curry` },
  'curry-sum123': { sameAs: `${S}/memoize--once--curry` },
  once: { sameAs: `${S}/memoize--once--curry` },
  'event-emitter-on-off-emit-once': { sameAs: `${S}/event-emitter` },
  'getobj-abc-default': { sameAs: `${S}/getobj-path-default` },
  'deep-equal': { sameAs: `${S}/deep-equal` },
  'lru-cache': { sameAs: `${S}/lru-cache` },
});
