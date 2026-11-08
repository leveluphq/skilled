# Kotlin: kotlinc 2.4.21 (the JVM compiler only) on the Temurin 25 JDK, which
# also runs the programs, with the Kotlin standard library on the classpath
FROM eclipse-temurin:25.0.4.1_1-jdk-noble AS download
ARG KOTLIN_VERSION=2.4.21
ARG KOTLIN_SHA256=7cc140e76daf416a0424a5557f99afd7ca89ebd463ea1101261e3e01c33e75cd
ADD https://github.com/JetBrains/kotlin/releases/download/v${KOTLIN_VERSION}/kotlin-compiler-${KOTLIN_VERSION}.zip /tmp/kotlin.zip
# The checksum is checked here rather than with ADD --checksum, which the
# classic builder ignores. Only the compiler, the libraries on its manifest's
# classpath and the license are kept.
RUN echo "${KOTLIN_SHA256}  /tmp/kotlin.zip" | sha256sum --check --strict \
    && cd /opt \
    && jar xf /tmp/kotlin.zip \
    && cd /opt/kotlinc/lib \
    && find . -type f ! -name kotlin-compiler.jar ! -name kotlin-stdlib.jar ! -name kotlin-reflect.jar \
        ! -name kotlin-script-runtime.jar ! -name kotlinx-coroutines-core-jvm.jar ! -name annotations-13.0.jar \
        -delete \
    && rm -rf /opt/kotlinc/bin

FROM eclipse-temurin:25.0.4.1_1-jdk-noble
COPY --from=download /opt/kotlinc /opt/kotlinc
COPY kotlinc-aot /usr/local/bin/kotlinc-aot
COPY Training.kt /tmp/training/Training.kt
# Compiles a typical program once, recording the classes the compiler loads
# and links in an AOT cache (JEP 483), which takes a compile from about 2 s
# to 1.3 s. The cache only works with the flags in kotlinc-aot, so it's made
# by running kotlinc-aot itself, then checked by compiling again with
# AOTMode=on, which fails if the cache can't be used.
RUN chmod 755 /usr/local/bin/kotlinc-aot \
    && cd /tmp/training \
    && KOTLINC_AOT="-XX:AOTCacheOutput=/opt/kotlinc/kotlinc.aot -Xlog:aot*=off -Xlog:cds*=off" kotlinc-aot \
        -nowarn -no-reflect -Xdisable-default-scripting-plugin -d /tmp/training Training.kt \
    && chmod -R a+rX /opt/kotlinc \
    && KOTLINC_AOT="-XX:AOTCache=/opt/kotlinc/kotlinc.aot -XX:AOTMode=on" kotlinc-aot \
        -nowarn -no-reflect -Xdisable-default-scripting-plugin -d /tmp/training Training.kt \
    && rm -rf /tmp/training
