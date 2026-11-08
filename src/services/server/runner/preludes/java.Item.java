
class Item implements __H.Json {
    public int weight;
    public int value;
    public Item() {}
    public Item(int weight, int value) { this.weight = weight; this.value = value; }
    @Override public String toString() { return "Item(weight=" + weight + ", value=" + value + ")"; }
    public void __json(StringBuilder sb) { sb.append("{\"weight\":").append(weight).append(",\"value\":").append(value).append('}'); }
}

final class __HItem {
    private __HItem() {}
    static Item to(Object o) {
        if (!(o instanceof java.util.Map)) throw __H.bad("Item {weight, value}", o);
        return new Item(__H.toInt(__H.field(o, "weight")), __H.toInt(__H.field(o, "value")));
    }
}
