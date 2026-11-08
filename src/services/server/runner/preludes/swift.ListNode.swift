
class ListNode: CustomStringConvertible {
    var data: Int
    var next: ListNode?
    init() { self.data = 0; self.next = nil }
    init(_ data: Int) { self.data = data; self.next = nil }
    init(_ data: Int, _ next: ListNode?) { self.data = data; self.next = next }
    var description: String { return __HList.debug(self) }
}

extension ListNode: __HIn, __HOut {
    // int[], or {"values": int[], "cycleIndex": n} to link the tail back to node n;
    // null or [] for no list
    static func __fromNullable(_ j: __J) throws -> Self? {
        if case .null = j { return nil }
        let values = j["values"] ?? j
        let cycle = j["cycleIndex"] ?? .null
        guard case .arr(let items) = values else { throw __H.bad("ListNode (int[])", j) }
        let cycleIndex = try Int?.__from(cycle) ?? -1
        let dummy = ListNode(0)
        var tail = dummy
        var target: ListNode? = nil
        for (k, item) in items.enumerated() {
            let node = ListNode(try Int.__from(item))
            tail.next = node
            tail = node
            if k == cycleIndex { target = node }
        }
        if let target = target { tail.next = target }
        // Kept alive, so a long list is never freed one recursive deinit at a time
        if let head = dummy.next { __HList.keep.append(head) }
        return dummy.next.map { $0 as! Self }
    }

    static func __from(_ j: __J) throws -> Self {
        guard let head = try __fromNullable(j) else { throw __H.bad("a non-empty ListNode", j) }
        return head
    }

    static var __nilJson: __J { return .arr([]) }

    // A list is reported as its values, from this node on
    func __json() throws -> __J {
        __HList.keep.append(self)
        var values: [__J] = []
        var seen = Swift.Set<ObjectIdentifier>()
        var node: ListNode? = self
        while let n = node {
            if !seen.insert(ObjectIdentifier(n)).inserted {
                throw __HAnswerError("The returned list never ends (it has a cycle)")
            }
            values.append(.int(n.data))
            node = n.next
        }
        return .arr(values)
    }
}

enum __HList {
    static var keep: [ListNode] = []

    static func debug(_ head: ListNode) -> String {
        var parts: [String] = []
        var node: ListNode? = head
        while let n = node {
            if parts.count == 50 { parts.append("..."); break }
            parts.append(String(n.data))
            node = n.next
        }
        return parts.joined(separator: " -> ")
    }
}
