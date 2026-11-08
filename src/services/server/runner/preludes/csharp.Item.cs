public class Item : global::__Skilled.IJson {
    public int weight;
    public int value;
    public Item(int weight = 0, int value = 0) { this.weight = weight; this.value = value; }
    public override string ToString() { return global::__Skilled.HItem.Debug(this); }
    void global::__Skilled.IJson.WriteJson(global::System.Text.StringBuilder sb) { global::__Skilled.HItem.Json(sb, this); }
}

namespace __Skilled {
using global::System.Collections.Generic;
using global::System.Text;

static class HItem {
    public static global::Item To(object o) {
        if (!(o is Dictionary<string, object>)) throw H.Bad("Item {weight, value}", o);
        return new global::Item(H.ToInt(H.Field(o, "weight")), H.ToInt(H.Field(o, "value")));
    }
    public static void Json(StringBuilder sb, global::Item item) {
        sb.Append("{\"weight\":").Append(item.weight.ToString(H.Inv)).Append(",\"value\":").Append(item.value.ToString(H.Inv)).Append('}');
    }
    public static string Debug(global::Item item) {
        return "Item(weight=" + item.weight.ToString(H.Inv) + ", value=" + item.value.ToString(H.Inv) + ")";
    }
}
}
