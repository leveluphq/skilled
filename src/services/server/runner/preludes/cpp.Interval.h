struct Interval {
    double start;
    double end;
    Interval() : start(0), end(0) {}
    Interval(double start, double end) : start(start), end(end) {}
};

namespace __skh {
template <> struct Conv<Interval> {
    static Interval from(const JVal& v) {
        if (v.k != JVal::OBJ) throw bad("Interval {start, end}", v);
        const JVal* start = field(v, "start");
        const JVal* end = field(v, "end");
        return Interval(Conv<double>::from(start ? *start : JVal()), Conv<double>::from(end ? *end : JVal()));
    }
    static void to(std::string& o, const Interval& interval) {
        o += "{\"start\":";
        w_dbl(o, interval.start);
        o += ",\"end\":";
        w_dbl(o, interval.end);
        o += '}';
    }
};
}  // namespace __skh
