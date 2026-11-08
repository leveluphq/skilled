## Distinguish shared mutation from rebinding

The example records four values: `[1, 2, 2, 9]`. An original object starts with value 1. A second reference initially points to that same object. Mutating through the second reference changes what the original reference sees to 2. Rebinding the second reference to a new object containing 9 leaves the original object at 2.

This trace is about object identity. A copied integer behaves differently because changing the copy does not mutate a shared object. The exact syntax varies by language: a pointer, a class reference, or an Rc-backed shared allocation can all express this particular example.

## Draw the references before changing the code

Use one box for the original allocation and two arrows pointing at it. The mutation changes the box. The reassignment moves only one arrow to a second box. Drawing two boxes from the beginning would incorrectly predict that the first mutation is isolated.

The example uses constant-size data and O(1) work. It deliberately avoids pointer arithmetic, unsafe memory, and borrowed references that outlive their owner. In Rust, the shared-mutation version needs an explicit ownership/interior-mutability mechanism; copying a Box or borrowing it mutably is not interchangeable with a freely shared reference. In Swift, choosing a class instead of a struct is part of making the trace work. When reviewing a larger algorithm, ask both who can reach an object and who can mutate it. Those are separate questions.
