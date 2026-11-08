public class Interval : global::__Skilled.IJson {
    public double start;
    public double end;
    public Interval(double start = 0, double end = 0) { this.start = start; this.end = end; }
    public override bool Equals(object o) { return o is Interval other && other.start.Equals(start) && other.end.Equals(end); }
    public override int GetHashCode() { return global::System.HashCode.Combine(start, end); }
    public override string ToString() { return global::__Skilled.HInterval.Debug(this); }
    void global::__Skilled.IJson.WriteJson(global::System.Text.StringBuilder sb) { global::__Skilled.HInterval.Json(sb, this); }
}

namespace __Skilled {
using global::System.Collections.Generic;
using global::System.Text;

static class HInterval {
    public static global::Interval To(object o) {
        if (!(o is Dictionary<string, object>)) throw H.Bad("Interval {start, end}", o);
        return new global::Interval(H.ToDouble(H.Field(o, "start")), H.ToDouble(H.Field(o, "end")));
    }
    public static void Json(StringBuilder sb, global::Interval interval) {
        sb.Append("{\"start\":"); H.Dbl(sb, interval.start); sb.Append(",\"end\":"); H.Dbl(sb, interval.end); sb.Append('}');
    }
    public static string Debug(global::Interval interval) {
        return "Interval(" + interval.start.ToString(H.Inv) + ", " + interval.end.ToString(H.Inv) + ")";
    }
}
}
