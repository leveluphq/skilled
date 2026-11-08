
class Interval implements __H.Json {
    public double start;
    public double end;
    public Interval() {}
    public Interval(double start, double end) { this.start = start; this.end = end; }
    @Override public boolean equals(Object o) {
        return o instanceof Interval && Double.compare(((Interval) o).start, start) == 0 && Double.compare(((Interval) o).end, end) == 0;
    }
    @Override public int hashCode() { return java.util.Objects.hash(start, end); }
    @Override public String toString() { return "Interval(" + start + ", " + end + ")"; }
    public void __json(StringBuilder sb) { sb.append("{\"start\":"); __H.dbl(sb, start); sb.append(",\"end\":"); __H.dbl(sb, end); sb.append('}'); }
}

final class __HInterval {
    private __HInterval() {}
    static Interval to(Object o) {
        if (!(o instanceof java.util.Map)) throw __H.bad("Interval {start, end}", o);
        return new Interval(__H.toDouble(__H.field(o, "start")), __H.toDouble(__H.field(o, "end")));
    }
}
