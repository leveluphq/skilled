type Item struct {
	Weight int
	Value  int
}

func (x Item) __json(b *__strings.Builder) {
	b.WriteString("{\"weight\":" + __strconv.Itoa(x.Weight) + ",\"value\":" + __strconv.Itoa(x.Value) + "}")
}

func __jItem(v any) Item {
	m, ok := v.(map[string]any)
	if !ok {
		panic(__bad("Item {weight, value}", v))
	}
	return Item{Weight: __jInt(m["weight"]), Value: __jInt(m["value"])}
}
