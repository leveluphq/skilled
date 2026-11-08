
class ListNode implements __H.Json {
    public int data;
    public ListNode next;
    public ListNode() {}
    public ListNode(int data) { this.data = data; }
    public ListNode(int data, ListNode next) { this.data = data; this.next = next; }
    @Override public String toString() { return __HList.debug(this); }
    // A list is reported as its values, from this node on
    public void __json(StringBuilder sb) { __H.write(sb, __HList.from(this)); }
}

final class __HList {
    private __HList() {}
    // int[], or {"values": int[], "cycleIndex": n} to link the tail back to node n
    static ListNode to(Object o) {
        Object values = o instanceof java.util.Map ? __H.field(o, "values") : o;
        Object cycle = o instanceof java.util.Map ? __H.field(o, "cycleIndex") : null;
        java.util.List<Object> a = __H.list(values, "ListNode (int[])");
        int cycleIndex = cycle == null ? -1 : __H.toInt(cycle);
        ListNode dummy = new ListNode(0), tail = dummy, target = null;
        for (int k = 0; k < a.size(); k++) {
            tail.next = new ListNode(__H.toInt(a.get(k)));
            tail = tail.next;
            if (k == cycleIndex) target = tail;
        }
        if (target != null) tail.next = target;
        return dummy.next;
    }
    static java.util.List<Object> from(ListNode head) {
        java.util.ArrayList<Object> out = new java.util.ArrayList<>();
        java.util.IdentityHashMap<ListNode, Boolean> seen = new java.util.IdentityHashMap<>();
        for (ListNode n = head; n != null; n = n.next) {
            if (seen.put(n, Boolean.TRUE) != null) throw new IllegalStateException("The returned list never ends (it has a cycle)");
            out.add(n.data);
        }
        return out;
    }
    static String debug(ListNode head) {
        StringBuilder sb = new StringBuilder();
        int k = 0;
        for (ListNode n = head; n != null; n = n.next, k++) {
            if (k == 50) { sb.append(" -> ..."); break; }
            if (k > 0) sb.append(" -> ");
            sb.append(n.data);
        }
        return sb.toString();
    }
}
