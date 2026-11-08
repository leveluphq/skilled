
class BinaryNode implements __H.Json {
    public int data;
    public BinaryNode left;
    public BinaryNode right;
    public BinaryNode() {}
    public BinaryNode(int data) { this.data = data; }
    public BinaryNode(int data, BinaryNode left, BinaryNode right) { this.data = data; this.left = left; this.right = right; }
    @Override public String toString() { return "BinaryNode(" + data + ")"; }
    // A tree is reported in level order, from this node down
    public void __json(StringBuilder sb) { __H.write(sb, __HTree.from(this)); }
}

final class __HTree {
    private __HTree() {}
    // Level order, with null for a missing child
    static BinaryNode to(Object o) {
        java.util.List<Object> a = __H.list(o, "BinaryNode (level-order int?[])");
        if (a.isEmpty() || a.get(0) == null) return null;
        BinaryNode root = new BinaryNode(__H.toInt(a.get(0)));
        java.util.ArrayDeque<BinaryNode> q = new java.util.ArrayDeque<>();
        q.add(root);
        int k = 1;
        while (k < a.size() && !q.isEmpty()) {
            BinaryNode cur = q.poll();
            Object l = a.get(k++);
            if (l != null) { cur.left = new BinaryNode(__H.toInt(l)); q.add(cur.left); }
            if (k < a.size()) {
                Object r = a.get(k++);
                if (r != null) { cur.right = new BinaryNode(__H.toInt(r)); q.add(cur.right); }
            }
        }
        return root;
    }
    static java.util.List<Object> from(BinaryNode root) {
        java.util.ArrayList<Object> out = new java.util.ArrayList<>();
        if (root == null) return out;
        java.util.IdentityHashMap<BinaryNode, Boolean> seen = new java.util.IdentityHashMap<>();
        java.util.ArrayList<BinaryNode> q = new java.util.ArrayList<>();
        q.add(root);
        for (int h = 0; h < q.size(); h++) {
            BinaryNode n = q.get(h);
            if (n == null) { out.add(null); continue; }
            if (seen.put(n, Boolean.TRUE) != null) throw new IllegalStateException("The returned tree has a cycle or a node in two places");
            out.add(n.data);
            q.add(n.left);
            q.add(n.right);
        }
        int end = out.size();
        while (end > 0 && out.get(end - 1) == null) end--;
        return new java.util.ArrayList<>(out.subList(0, end));
    }
    // A node of the input tree, reported as its data
    static Object ref(BinaryNode node) { return node == null ? null : node.data; }
}
