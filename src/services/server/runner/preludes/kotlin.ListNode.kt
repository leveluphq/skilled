
class ListNode(var data: Int = 0, var next: ListNode? = null) : __H.Json {
    override fun toString(): kotlin.String = __HList.debug(this)
    // A list is reported as its values, from this node on
    override fun __json(sb: java.lang.StringBuilder) { __H.write(sb, __HList.from(this)) }
}

object __HList {
    // int[], or {"values": int[], "cycleIndex": n} to link the tail back to node n
    fun to(o: Any?): ListNode? {
        val values = if (o is kotlin.collections.Map<*, *>) __H.field(o, "values") else o
        val cycle = if (o is kotlin.collections.Map<*, *>) __H.field(o, "cycleIndex") else null
        val a = __H.list(values, "ListNode (int[])")
        val cycleIndex = if (cycle == null) -1 else __H.toInt(cycle)
        val dummy = ListNode(0)
        var tail = dummy
        var target: ListNode? = null
        for (k in 0 until a.size) {
            val node = ListNode(__H.toInt(a[k]))
            tail.next = node
            tail = node
            if (k == cycleIndex) target = node
        }
        if (target != null) tail.next = target
        return dummy.next
    }
    fun from(head: ListNode?): kotlin.collections.List<Any?> {
        val out = java.util.ArrayList<Any?>()
        val seen = java.util.IdentityHashMap<ListNode, Boolean>()
        var n = head
        while (n != null) {
            if (seen.put(n, true) != null) throw java.lang.IllegalStateException("The returned list never ends (it has a cycle)")
            out.add(n.data)
            n = n.next
        }
        return out
    }
    fun debug(head: ListNode?): kotlin.String {
        val sb = java.lang.StringBuilder()
        var k = 0
        var n = head
        while (n != null) {
            if (k == 50) { sb.append(" -> ..."); break }
            if (k > 0) sb.append(" -> ")
            sb.append(n.data)
            n = n.next
            k++
        }
        return sb.toString()
    }
}
