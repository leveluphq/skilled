REMOVED THIS FROM THE BIG O:
You may see the nested loops and think it's <BigO.n2 />, but this isn't the case based on how the data is constructed.
Let's look at the two extreme cases where the ages are the same or all the ages are unique.

1. Ages are the same: We iterate through all the possible age buckets once.
  After we compute sum all the age counts, we add it to the output array `n` times.
  So really we are performing one <BigO.n /> operation in the outer loop and one <BigO.n /> operation in the inner loop which is <BigO.n letter="2n" /> which is just a change by a constant and is not quadratic.
2. Ages are all unique: The outer loop is still <BigO.n /> and the inner loop will always be `1` item which is constant.