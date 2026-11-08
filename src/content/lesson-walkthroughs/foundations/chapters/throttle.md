## Follow leading and trailing windows

The standalone throttle enables both leading and trailing behavior. With a 100 ms wait, a call at 0 runs immediately. Calls at 20 and 80 replace the pending call, and the latest one runs at 100 if the timer can execute then. Those intervening calls do not move that deadline to 180.

After the trailing invocation, another cooldown begins. If no further call arrives, its timer merely clears the cooldown and does not repeat the previous callback. A single input therefore produces a single output. Cancel ends the cooldown and discards a pending call; a subsequent call can run immediately.

## Preserve reentry and falsy payloads

The timer is installed before the wrapped callback runs. If that callback invokes the wrapper again, the nested call becomes pending instead of recursively triggering another immediate leading call. Pending arguments use a null marker, so false, zero, and undefined remain valid payloads. The latest caller's receiver is retained with its arguments.

Use a fake clock for single events, bursts, continuing activity, exact boundaries, cancellation, and callback reentry. Due timers run before later test input at the same simulated timestamp in the accompanying checks. Real event-loop execution can be delayed. This contract uses timer windows and does not offer maxWait or configurable edges. The wrapper uses a fixed number of retained references, while callback work and the objects reachable through arguments have their own costs.
