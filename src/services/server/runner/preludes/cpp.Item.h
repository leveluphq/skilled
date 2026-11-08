struct Item {
    int weight;
    int value;
    Item() : weight(0), value(0) {}
    Item(int weight, int value) : weight(weight), value(value) {}
};

namespace __skh {
template <> struct Conv<Item> {
    static Item from(const JVal& v) {
        if (v.k != JVal::OBJ) throw bad("Item {weight, value}", v);
        const JVal* weight = field(v, "weight");
        const JVal* value = field(v, "value");
        return Item(Conv<int>::from(weight ? *weight : JVal()), Conv<int>::from(value ? *value : JVal()));
    }
    static void to(std::string& o, const Item& item) {
        o += "{\"weight\":";
        w_int(o, item.weight);
        o += ",\"value\":";
        w_int(o, item.value);
        o += '}';
    }
};
}  // namespace __skh
