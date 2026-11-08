
data class Interval(var start: Double = 0.0, var end: Double = 0.0) : __H.Json {
    override fun __json(sb: java.lang.StringBuilder) {
        sb.append("{\"start\":"); __H.dbl(sb, start); sb.append(",\"end\":"); __H.dbl(sb, end); sb.append('}')
    }
}

object __HInterval {
    fun to(o: Any?): Interval {
        if (o !is kotlin.collections.Map<*, *>) throw __H.bad("Interval {start, end}", o)
        return Interval(__H.toDouble(__H.field(o, "start")), __H.toDouble(__H.field(o, "end")))
    }
}
