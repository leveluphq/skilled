## Specify subscription identity and publication order

The standalone Dispatcher stores a unique subscription record for each subscribe call. Subscribing the same callback twice creates two deliveries. Each returned disposer removes only its own record and is safe to call again. Event names are Map keys, so names such as `__proto__` do not access object prototype properties.

Publish copies the current subscription list before invoking callbacks in registration order. Removing a subscription during publication affects later publications, while the current snapshot still delivers it. A new subscription created inside a callback likewise starts with a later publication. A synchronous listener exception stops the current loop and reaches the publisher.

## Account for retained callbacks

For k listeners on an event, publication takes O(k) time plus callback work and allocates an O(k) snapshot. Subscription appends are amortized constant time; disposal scans and may shift a list, giving O(k) work. The dispatcher retains callbacks and whatever those closures keep reachable until disposal or release of the dispatcher.

Check missing events, duplicate callback registrations, repeated disposal, subscription changes during publication, and false or zero payloads. This is an in-process synchronous dispatcher. It provides no persistence, retries, cross-process delivery, or automatic awaiting of returned promises. A UI can use the disposer during cleanup so an old component does not continue receiving events after its useful lifetime.
