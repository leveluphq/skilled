## Read the standalone example's settlement contract

The TeachingPromise below stores one pending, fulfilled, or rejected state. The executor runs immediately. Its first resolve or reject call wins, and an exception thrown before settlement becomes a rejection. Observers registered before or after settlement are delivered asynchronously using timer tasks.

The observer API is named observe deliberately. It returns no new promise, does not adopt thenables, and does not implement native then chaining. An observer's returned value is ignored. An exception thrown by an observer escapes its timer callback instead of rejecting a newly created chain. Use this class to inspect settlement and observation, not as an application promise replacement.

## Trace settlement and delivery separately

Resolve with zero, attempt to reject afterward, and register two observers. Neither observer should run on the current synchronous stack. When their scheduled tasks run, both receive zero. A third observer registered later still receives that stored fulfillment in another task. Checking the settled state rather than the truthiness of its value preserves false, zero, and undefined payloads.

Retaining k observers before settlement uses O(k) space and settlement schedules O(k) deliveries. Stored callbacks are released from the waiting list once scheduled, though timer tasks retain them until execution. The native Promise resolution procedure and microtask queue have additional rules. Compare this example with the [Promise.all guide](/guides/implement-promise-all), which uses native promises and therefore has the native scheduling and adoption behavior.
