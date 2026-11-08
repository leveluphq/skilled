
class BinaryNode: CustomStringConvertible {
    var data: Int
    var left: BinaryNode?
    var right: BinaryNode?
    init() { self.data = 0; self.left = nil; self.right = nil }
    init(_ data: Int) { self.data = data; self.left = nil; self.right = nil }
    init(_ data: Int, _ left: BinaryNode?, _ right: BinaryNode?) { self.data = data; self.left = left; self.right = right }
    var description: String { return "BinaryNode(\(data))" }
}

extension BinaryNode: __HIn, __HOut {
    // Level order, with null for a missing child; null or [] for no tree
    static func __fromNullable(_ j: __J) throws -> Self? {
        if case .null = j { return nil }
        guard case .arr(let items) = j else { throw __H.bad("BinaryNode (level-order int?[])", j) }
        guard let first = items.first else { return nil }
        if case .null = first { return nil }
        let root = BinaryNode(try Int.__from(first))
        var queue = [root]
        var head = 0
        var k = 1
        while k < items.count && head < queue.count {
            let node = queue[head]
            head += 1
            if case .null = items[k] {} else {
                node.left = BinaryNode(try Int.__from(items[k]))
                queue.append(node.left!)
            }
            k += 1
            if k < items.count {
                if case .null = items[k] {} else {
                    node.right = BinaryNode(try Int.__from(items[k]))
                    queue.append(node.right!)
                }
                k += 1
            }
        }
        // Kept alive, so a deep tree is never freed one recursive deinit at a time
        __HTree.keep.append(root)
        return (root as! Self)
    }

    static func __from(_ j: __J) throws -> Self {
        guard let root = try __fromNullable(j) else { throw __H.bad("a non-empty BinaryNode", j) }
        return root
    }

    static var __nilJson: __J { return .arr([]) }

    // A tree is reported in level order, from this node down
    func __json() throws -> __J {
        __HTree.keep.append(self)
        var out: [__J] = []
        var seen = Swift.Set<ObjectIdentifier>()
        var queue: [BinaryNode?] = [self]
        var head = 0
        while head < queue.count {
            let node = queue[head]
            head += 1
            guard let n = node else { out.append(.null); continue }
            if !seen.insert(ObjectIdentifier(n)).inserted {
                throw __HAnswerError("The returned tree has a cycle or a node in two places")
            }
            out.append(.int(n.data))
            queue.append(n.left)
            queue.append(n.right)
        }
        while let last = out.last, case .null = last { out.removeLast() }
        return .arr(out)
    }
}

enum __HTree {
    static var keep: [BinaryNode] = []
}

// A node of the input tree, reported as its data
func __ref(_ node: BinaryNode?) -> __J {
    guard let node = node else { return .null }
    return .int(node.data)
}
