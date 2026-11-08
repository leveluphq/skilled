type Interval struct {
	Start float64
	End   float64
}

func (x Interval) __json(b *__strings.Builder) {
	b.WriteString("{\"start\":")
	__writeFloat(b, x.Start, 64)
	b.WriteString(",\"end\":")
	__writeFloat(b, x.End, 64)
	b.WriteByte('}')
}

func __jInterval(v any) Interval {
	m, ok := v.(map[string]any)
	if !ok {
		panic(__bad("Interval {start, end}", v))
	}
	return Interval{Start: __jDouble(m["start"]), End: __jDouble(m["end"])}
}
