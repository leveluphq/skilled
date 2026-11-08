type ListNode struct {
	Data int
	Next *ListNode
}

// Prints as its values, for the learner's debugging
func (n *ListNode) String() string {
	if n == nil {
		return "<nil>"
	}
	var b __strings.Builder
	k := 0
	for node := n; node != nil; node, k = node.Next, k+1 {
		if k == 50 {
			b.WriteString(" -> ...")
			break
		}
		if k > 0 {
			b.WriteString(" -> ")
		}
		b.WriteString(__strconv.Itoa(node.Data))
	}
	return b.String()
}

// A list is reported as its values, from this node on
func (n *ListNode) __json(b *__strings.Builder) {
	seen := map[*ListNode]bool{}
	b.WriteByte('[')
	for node := n; node != nil; node = node.Next {
		if seen[node] {
			panic(__answerError{"The returned list never ends (it has a cycle)"})
		}
		seen[node] = true
		if node != n {
			b.WriteByte(',')
		}
		b.WriteString(__strconv.Itoa(node.Data))
	}
	b.WriteByte(']')
}

// int[], or {"values": int[], "cycleIndex": n} to link the tail back to node n
func __jList(v any) *ListNode {
	values, cycleIndex := v, -1
	if m, ok := v.(map[string]any); ok {
		values = m["values"]
		if m["cycleIndex"] != nil {
			cycleIndex = __jInt(m["cycleIndex"])
		}
	}
	if values == nil {
		return nil
	}
	a, ok := values.([]any)
	if !ok {
		panic(__bad("ListNode (int[])", values))
	}
	dummy := &ListNode{}
	tail := dummy
	var target *ListNode
	for k, x := range a {
		tail.Next = &ListNode{Data: __jInt(x)}
		tail = tail.Next
		if k == cycleIndex {
			target = tail
		}
	}
	if target != nil {
		tail.Next = target
	}
	return dummy.Next
}
