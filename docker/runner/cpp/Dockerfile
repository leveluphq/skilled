# C++: GCC 16.2, with <bits/stdc++.h> precompiled, which halves the compile
# time. The header is built with the flags that change what it compiles to
# (the C++ standard, -O0 and _GLIBCXX_ASSERTIONS), which must match the
# runtime's compile command (src/services/server/runner/runtimes/cpp.ts). If
# they don't, g++ ignores it and reads the header as usual.
FROM gcc:16.2.0
RUN mkdir -p /opt/skilled/pch/bits \
  && echo '#include <bits/stdc++.h>' > /opt/skilled/pch/stdc++.h \
  && g++ -std=gnu++23 -O0 -D_GLIBCXX_ASSERTIONS -x c++-header /opt/skilled/pch/stdc++.h -o /opt/skilled/pch/bits/stdc++.h.gch
