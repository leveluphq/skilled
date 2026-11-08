public class ListNode : global::__Skilled.IJson {
    public int data;
    public ListNode next;
    public ListNode(int data = 0, ListNode next = null) { this.data = data; this.next = next; }
    public override string ToString() { return global::__Skilled.HList.Debug(this); }
    // A list is reported as its values, from this node on
    void global::__Skilled.IJson.WriteJson(global::System.Text.StringBuilder sb) { global::__Skilled.H.Write(sb, global::__Skilled.HList.From(this)); }
}

namespace __Skilled {
using global::System;
using global::System.Collections.Generic;
using global::System.Text;

static class HList {
    // int[], or {"values": int[], "cycleIndex": n} to link the tail back to node n
    public static global::ListNode To(object o) {
        bool isObject = o is Dictionary<string, object>;
        object values = isObject ? H.Field(o, "values") : o;
        object cycle = isObject ? H.Field(o, "cycleIndex") : null;
        List<object> a = H.List(values, "ListNode (int[])");
        int cycleIndex = cycle == null ? -1 : H.ToInt(cycle);
        global::ListNode dummy = new global::ListNode(0), tail = dummy, target = null;
        for (int k = 0; k < a.Count; k++) {
            tail.next = new global::ListNode(H.ToInt(a[k]));
            tail = tail.next;
            if (k == cycleIndex) target = tail;
        }
        if (target != null) tail.next = target;
        return dummy.next;
    }
    public static List<object> From(global::ListNode head) {
        var output = new List<object>();
        var seen = new HashSet<global::ListNode>(ReferenceEqualityComparer.Instance);
        for (global::ListNode n = head; n != null; n = n.next) {
            if (!seen.Add(n)) throw new InvalidOperationException("The returned list never ends (it has a cycle)");
            output.Add(n.data);
        }
        return output;
    }
    public static string Debug(global::ListNode head) {
        var sb = new StringBuilder();
        int k = 0;
        for (global::ListNode n = head; n != null; n = n.next, k++) {
            if (k == 50) { sb.Append(" -> ..."); break; }
            if (k > 0) sb.Append(" -> ");
            sb.Append(n.data.ToString(H.Inv));
        }
        return sb.ToString();
    }
}
}
