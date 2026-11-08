// A typical program for the compiler to compile once while the image is
// built, so the AOT cache holds the classes a compile loads: a solution with
// the usual collections, lambdas and node classes, and a harness-like object
// reading JSON, catching errors and writing results.
import java.util.PriorityQueue

class TreeNode(var data: Int = 0, var left: TreeNode? = null, var right: TreeNode? = null)

data class Span(var start: Double = 0.0, var end: Double = 0.0)

open class Checker {
    fun isBad(version: Int): Boolean {
        return version >= limit;
    }
    companion object {
        var limit: Int = 0
    }
}

class Solution : Checker() {
    private val memo = HashMap<Int, Long>()

    fun countIslands(grid: Array<CharArray>): Int {
        var count = 0
        for (r in grid.indices) {
            for (c in grid[r].indices) {
                if (grid[r][c] == '#') {
                    count++
                    sink(grid, r, c)
                }
            }
        }
        return count
    }

    private fun sink(grid: Array<CharArray>, r: Int, c: Int) {
        if (r < 0 || c < 0 || r >= grid.size || c >= grid[0].size || grid[r][c] != '#') return
        grid[r][c] = '~'
        sink(grid, r + 1, c)
        sink(grid, r - 1, c)
        sink(grid, r, c + 1)
        sink(grid, r, c - 1)
    }

    fun firstBad(n: Int): Int {
        var lo = 1
        var hi = n
        while (lo < hi) {
            val mid = lo + (hi - lo) / 2
            if (isBad(mid)) hi = mid else lo = mid + 1
        }
        return lo
    }

    fun depth(root: TreeNode?): Int = if (root == null) 0 else 1 + maxOf(depth(root.left), depth(root.right))

    fun merge(spans: Array<Span>): List<Span> {
        val sorted = spans.sortedBy { it.start }
        val result = mutableListOf<Span>()
        for (span in sorted) {
            val last = result.lastOrNull()
            if (last != null && span.start <= last.end) last.end = maxOf(last.end, span.end) else result.add(span.copy())
        }
        return result
    }

    fun groups(words: Array<String>): List<List<String>> =
        words.groupBy { it.toCharArray().sorted().joinToString("") }.values.map { it.sorted() }

    fun ways(n: Int): Long {
        if (n <= 1) return 1L
        return memo.getOrPut(n) { ways(n - 1) + ways(n - 2) }
    }

    fun topK(nums: IntArray, k: Int): IntArray {
        val heap = PriorityQueue<Int>(compareByDescending { it })
        nums.forEach { heap.add(it) }
        return IntArray(minOf(k, nums.size)) { heap.poll() }
    }

    fun path(graph: Map<String, Array<String>>, from: String, to: String): Array<String>? {
        val previous = mutableMapOf<String, String?>(from to null)
        val queue = ArrayDeque(listOf(from))
        while (queue.isNotEmpty()) {
            val node = queue.removeFirst()
            if (node == to) return generateSequence(node) { previous[it] }.toList().reversed().toTypedArray()
            for (next in graph[node] ?: emptyArray()) {
                if (next !in previous) {
                    previous[next] = node
                    queue.addLast(next)
                }
            }
        }
        return null
    }

    fun balanced(s: String): Boolean {
        val stack = ArrayList<Char>()
        val pairs = mapOf(')' to '(', ']' to '[', '}' to '{')
        for (ch in s) {
            when (ch) {
                '(', '[', '{' -> stack.add(ch)
                ')', ']', '}' -> if (stack.isEmpty() || stack.removeAt(stack.size - 1) != pairs[ch]) return false
                else -> continue
            }
        }
        return stack.isEmpty()
    }
}

object Harness {
    private const val LIMIT: Long = 1L shl 20
    @JvmField var userLines: Int = 0
    @Volatile private var failed: Boolean = false
    private var out: java.io.PrintStream? = null

    interface Json { fun write(sb: java.lang.StringBuilder) }
    class InputError(message: kotlin.String) : java.lang.RuntimeException(message)

    private class Parser(private val s: kotlin.String) {
        private var i: Int = 0
        fun value(): Any? {
            while (i < s.length && s[i] == ' ') i++
            return when (s[i]) {
                '[' -> {
                    i++
                    val a = java.util.ArrayList<Any?>()
                    while (s[i] != ']') { a.add(value()); if (s[i] == ',') i++ }
                    i++
                    a
                }
                '"' -> { val start = ++i; while (s[i] != '"') i++; s.substring(start, i++) }
                else -> {
                    val start = i
                    while (i < s.length && (s[i] == '-' || s[i] in '0'..'9')) i++
                    java.lang.Long.parseLong(s.substring(start, i))
                }
            }
        }
    }

    fun write(sb: java.lang.StringBuilder, v: Any?) {
        when (v) {
            null, is Unit -> sb.append("null")
            is kotlin.String -> sb.append('"').append(v).append('"')
            is Int -> sb.append(v)
            is Long -> sb.append(v)
            is Double -> sb.append(java.lang.Double.toString(v))
            is Boolean -> sb.append(if (v) "true" else "false")
            is Json -> v.write(sb)
            is kotlin.IntArray -> { sb.append('['); for (k in v.indices) { if (k > 0) sb.append(','); sb.append(v[k]) }; sb.append(']') }
            is kotlin.Array<*> -> { sb.append('['); for (k in v.indices) { if (k > 0) sb.append(','); write(sb, v[k]) }; sb.append(']') }
            is kotlin.collections.Map<*, *> -> {
                val sorted = java.util.TreeMap<kotlin.String, Any?>()
                for (e in v.entries) sorted.put(e.key.toString(), e.value)
                sb.append('{')
                for ((k, e) in sorted.entries.withIndex()) { if (k > 0) sb.append(','); sb.append('"').append(e.key).append("\":"); write(sb, e.value) }
                sb.append('}')
            }
            is kotlin.collections.Iterable<*> -> { sb.append('['); var first = true; for (x in v) { if (!first) sb.append(','); first = false; write(sb, x) }; sb.append(']') }
            is Span -> sb.append("{\"start\":").append(v.start).append(",\"end\":").append(v.end).append('}')
            else -> throw java.lang.IllegalStateException("can't report a value of type " + v.javaClass.name)
        }
    }

    inline fun <reified T> toArr(o: Any?, conv: (Any?) -> T): kotlin.Array<T> {
        val a = o as kotlin.collections.List<*>
        return kotlin.Array(a.size) { conv(a[it]) }
    }

    fun describe(e: kotlin.Throwable): kotlin.String {
        val sb = java.lang.StringBuilder(e.javaClass.name)
        if (e.message != null) sb.append(": ").append(e.message)
        for (f in e.stackTrace) {
            if ("Training.kt" == f.fileName && f.lineNumber in 1..userLines) { sb.append(" (line ").append(f.lineNumber).append(')'); break }
        }
        return if (sb.length > 500) sb.substring(0, 500) + "…" else sb.toString()
    }

    fun run(test: (kotlin.collections.List<Any?>) -> Any?) {
        val input = kotlin.text.String(java.lang.System.`in`.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8)
        @Suppress("UNCHECKED_CAST")
        val tests = Parser(input.trim()).value() as kotlin.collections.List<Any?>
        val stream = java.io.PrintStream(java.io.FileOutputStream(java.io.FileDescriptor.out), true, java.nio.charset.StandardCharsets.UTF_8)
        out = stream
        java.lang.System.setOut(stream)
        val worker = java.lang.Thread(null, {
            for (i in 0 until tests.size) {
                val sb = java.lang.StringBuilder()
                try {
                    write(sb, test(tests[i] as kotlin.collections.List<Any?>))
                } catch (e: kotlin.Throwable) {
                    sb.setLength(0)
                    sb.append(describe(e))
                }
                stream.println("$i ${sb.length} $sb")
            }
        }, "tests", LIMIT)
        worker.start()
        try { worker.join() } catch (ignored: java.lang.InterruptedException) { }
        java.lang.System.exit(if (failed) 1 else 0)
    }
}

fun main(args: kotlin.Array<kotlin.String>) {
    Harness.userLines = 120
    Harness.run { case ->
        val grid: kotlin.Array<kotlin.CharArray> = Harness.toArr(case[0]) { x -> (x as kotlin.String).toCharArray() }
        Checker.limit = 3
        val s = Solution()
        listOf(s.countIslands(grid), s.firstBad(10), s.depth(TreeNode(1, TreeNode(2))), s.ways(40), s.balanced("([]{})"))
    }
}
