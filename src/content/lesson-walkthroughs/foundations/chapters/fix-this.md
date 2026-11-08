## Repair two independent callback failures

The example binds a presenter's regular method before returning it as a callback. Calling that saved function later still reads the intended presenter. Because the bound function retains the object rather than copying its name, changing the presenter's name before invocation changes the result it reads.

The seating callbacks use a let binding for each loop iteration. With names Lin and Grace, invoking them later gives `Seat 1: Lin` and `Seat 2: Grace`. A single function-scoped var index would instead be read after the loop has advanced beyond the final valid position.

## Check lifetime as well as the first result

Binding creates a new function identity and retains its receiver. If a subscription API requires that exact function for removal, save the bound function instead of binding again during cleanup. The second bind call would create another function object.

Creating n seating callbacks takes O(n) time and O(n) returned function storage. The callbacks retain access to the names array and their position bindings; they do not clone every name. Treat the input as unchanged while these callbacks are in use, or explicitly copy it if snapshot behavior is needed. Check no names, two names, a changed presenter name, and invocation after the construction function has returned. These cases verify both binding decisions without relying on arbitrary timer delays.
