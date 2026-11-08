
class BinaryNode(var data: Int = 0, var left: BinaryNode? = null, var right: BinaryNode? = null) : __H.Json {
    override fun toString(): kotlin.String = "BinaryNode(" + data + ")"
    // A tree is reported in level order, from this node down
    override fun __json(sb: java.lang.StringBuilder) { __H.write(sb, __HTree.from(this)) }
}

object __HTree {
    // Level order, with null for a missing child
    fun to(o: Any?): BinaryNode? {
        val a = __H.list(o, "BinaryNode (level-order int?[])")
        if (a.isEmpty() || a[0] == null) return null
        val root = BinaryNode(__H.toInt(a[0]))
        val q = java.util.ArrayDeque<BinaryNode>()
        q.add(root)
        var k = 1
        while (k < a.size && !q.isEmpty()) {
            val cur = q.poll()
            val l = a[k++]
            if (l != null) { val child = BinaryNode(__H.toInt(l)); cur.left = child; q.add(child) }
            if (k < a.size) {
                val r = a[k++]
                if (r != null) { val child = BinaryNode(__H.toInt(r)); cur.right = child; q.add(child) }
            }
        }
        return root
    }
    fun from(root: BinaryNode?): kotlin.collections.List<Any?> {
        val out = java.util.ArrayList<Any?>()
        if (root == null) return out
        val seen = java.util.IdentityHashMap<BinaryNode, Boolean>()
        val q = java.util.ArrayList<BinaryNode?>()
        q.add(root)
        var h = 0
        while (h < q.size) {
            val n = q[h++]
            if (n == null) { out.add(null); continue }
            if (seen.put(n, true) != null) throw java.lang.IllegalStateException("The returned tree has a cycle or a node in two places")
            out.add(n.data)
            q.add(n.left)
            q.add(n.right)
        }
        var end = out.size
        while (end > 0 && out[end - 1] == null) end--
        return java.util.ArrayList(out.subList(0, end))
    }
    // A node of the input tree, reported as its data
    fun ref(node: BinaryNode?): Any? = node?.data
}
