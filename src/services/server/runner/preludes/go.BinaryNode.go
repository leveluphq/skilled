type BinaryNode struct {
	Data  int
	Left  *BinaryNode
	Right *BinaryNode
}

func (n *BinaryNode) String() string {
	if n == nil {
		return "<nil>"
	}
	return "BinaryNode(" + __strconv.Itoa(n.Data) + ")"
}

// A tree is reported in level order, from this node down, with null for a
// missing child and no nulls at the end
func (n *BinaryNode) __json(b *__strings.Builder) {
	if n == nil {
		b.WriteString("[]")
		return
	}
	seen := map[*BinaryNode]bool{}
	queue := []*BinaryNode{n}
	// The level order so far, and how much of it ends in a node
	var out __strings.Builder
	end := 0
	for h := 0; h < len(queue); h++ {
		node := queue[h]
		if h > 0 {
			out.WriteByte(',')
		}
		if node == nil {
			out.WriteString("null")
			continue
		}
		if seen[node] {
			panic(__answerError{"The returned tree has a cycle or a node in two places"})
		}
		seen[node] = true
		out.WriteString(__strconv.Itoa(node.Data))
		end = out.Len()
		queue = append(queue, node.Left, node.Right)
	}
	b.WriteByte('[')
	b.WriteString(out.String()[:end])
	b.WriteByte(']')
}

// Level order, with null for a missing child
func __jTree(v any) *BinaryNode {
	if v == nil {
		return nil
	}
	a, ok := v.([]any)
	if !ok {
		panic(__bad("BinaryNode (level-order int?[])", v))
	}
	if len(a) == 0 || a[0] == nil {
		return nil
	}
	root := &BinaryNode{Data: __jInt(a[0])}
	queue := []*BinaryNode{root}
	k := 1
	for h := 0; h < len(queue) && k < len(a); h++ {
		node := queue[h]
		if a[k] != nil {
			node.Left = &BinaryNode{Data: __jInt(a[k])}
			queue = append(queue, node.Left)
		}
		k++
		if k < len(a) {
			if a[k] != nil {
				node.Right = &BinaryNode{Data: __jInt(a[k])}
				queue = append(queue, node.Right)
			}
			k++
		}
	}
	return root
}

// A node of the input tree, reported as its data
func __ref(node *BinaryNode) any {
	if node == nil {
		return nil
	}
	return node.Data
}
