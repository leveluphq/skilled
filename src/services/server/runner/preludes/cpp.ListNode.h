struct ListNode {
    int data;
    ListNode* next;
    ListNode() : data(0), next(nullptr) {}
    ListNode(int x) : data(x), next(nullptr) {}
    ListNode(int x, ListNode* next) : data(x), next(next) {}
};

namespace __skh {
template <> struct Conv<ListNode*> {
    // int[], or {"values": int[], "cycleIndex": n} to link the tail back to
    // node n; null or [] for no list
    static ListNode* from(const JVal& v) {
        if (v.k == JVal::NUL) return nullptr;
        const JVal* values = v.k == JVal::OBJ ? field(v, "values") : &v;
        const JVal* cycle = v.k == JVal::OBJ ? field(v, "cycleIndex") : nullptr;
        if (!values || values->k != JVal::ARR) throw bad("ListNode (int[])", values ? *values : JVal());
        long long cycleIndex = cycle && cycle->k != JVal::NUL ? Conv<int>::from(*cycle) : -1;
        ListNode dummy;
        ListNode* tail = &dummy;
        ListNode* target = nullptr;
        for (std::size_t k = 0; k < values->size(); ++k) {
            tail->next = new ListNode(Conv<int>::from((*values)[k]));
            tail = tail->next;
            if ((long long) k == cycleIndex) target = tail;
        }
        if (target) tail->next = target;
        return dummy.next;
    }
    // A list is reported as its values, from this node on; an empty one as []
    static void to(std::string& o, const ListNode* head) {
        std::unordered_set<const ListNode*> seen;
        o += '[';
        for (const ListNode* n = head; n; n = n->next) {
            if (!seen.insert(n).second) throw std::runtime_error("The returned list never ends (it has a cycle)");
            if (n != head) o += ',';
            w_int(o, n->data);
        }
        o += ']';
    }
};
}  // namespace __skh
