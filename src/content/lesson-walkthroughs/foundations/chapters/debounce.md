## Trace the latest pending call

With a wait of 100 ms, calls at 0 and 80 ms produce one callback at 180 ms if the event loop can run it then. The second call replaces both the deadline and the retained arguments and receiver. The ordinary wrapper call returns undefined; it cannot synchronously return work that will happen later.

Cancel clears the timer and discards the pending call. Flush clears the timer and invokes that pending call immediately, returning its result. A second flush with no pending call does nothing. Releasing the pending state before invoking the callback allows a callback to schedule another debounced call without having its new state erased afterward.

## Test a deadline without sleeping in real time

Use a fake clock to advance to one millisecond before the deadline, then to the deadline. Check a single call, a burst, a long pause, cancellation, flushing, and a callback that calls the wrapper again. Include zero, false, and undefined arguments; pending state is tracked separately from payload truthiness.

The wrapper retains one argument tuple and receiver plus a timer handle. Those references can keep a large object graph alive even though the wrapper has a fixed number of fields. Delay is validated against the supported timer range. A zero delay still schedules future timer work. Actual execution may occur later when other tasks occupy the event loop; the wrapper does not promise exact wall-clock delivery.
