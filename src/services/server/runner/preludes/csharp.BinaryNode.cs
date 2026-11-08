public class BinaryNode : global::__Skilled.IJson {
    public int data;
    public BinaryNode left;
    public BinaryNode right;
    public BinaryNode(int data = 0, BinaryNode left = null, BinaryNode right = null) { this.data = data; this.left = left; this.right = right; }
    public override string ToString() { return "BinaryNode(" + data.ToString(global::__Skilled.H.Inv) + ")"; }
    // A tree is reported in level order, from this node down
    void global::__Skilled.IJson.WriteJson(global::System.Text.StringBuilder sb) { global::__Skilled.H.Write(sb, global::__Skilled.HTree.From(this)); }
}

namespace __Skilled {
using global::System;
using global::System.Collections.Generic;

static class HTree {
    // Level order, with null for a missing child
    public static global::BinaryNode To(object o) {
        List<object> a = H.List(o, "BinaryNode (level-order int?[])");
        if (a.Count == 0 || a[0] == null) return null;
        var root = new global::BinaryNode(H.ToInt(a[0]));
        var q = new Queue<global::BinaryNode>();
        q.Enqueue(root);
        int k = 1;
        while (k < a.Count && q.Count > 0) {
            global::BinaryNode cur = q.Dequeue();
            object l = a[k++];
            if (l != null) { cur.left = new global::BinaryNode(H.ToInt(l)); q.Enqueue(cur.left); }
            if (k < a.Count) {
                object r = a[k++];
                if (r != null) { cur.right = new global::BinaryNode(H.ToInt(r)); q.Enqueue(cur.right); }
            }
        }
        return root;
    }
    public static List<object> From(global::BinaryNode root) {
        var output = new List<object>();
        if (root == null) return output;
        var seen = new HashSet<global::BinaryNode>(ReferenceEqualityComparer.Instance);
        var q = new List<global::BinaryNode> { root };
        for (int h = 0; h < q.Count; h++) {
            global::BinaryNode n = q[h];
            if (n == null) { output.Add(null); continue; }
            if (!seen.Add(n)) throw new InvalidOperationException("The returned tree has a cycle or a node in two places");
            output.Add(n.data);
            q.Add(n.left);
            q.Add(n.right);
        }
        int end = output.Count;
        while (end > 0 && output[end - 1] == null) end--;
        output.RemoveRange(end, output.Count - end);
        return output;
    }
    // A node of the input tree, reported as its data
    public static object Ref(global::BinaryNode node) { return node == null ? null : (object)node.data; }
}
}
