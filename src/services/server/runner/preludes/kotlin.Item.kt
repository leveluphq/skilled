
data class Item(var weight: Int = 0, var value: Int = 0) : __H.Json {
    override fun __json(sb: java.lang.StringBuilder) {
        sb.append("{\"weight\":").append(weight).append(",\"value\":").append(value).append('}')
    }
}

object __HItem {
    fun to(o: Any?): Item {
        if (o !is kotlin.collections.Map<*, *>) throw __H.bad("Item {weight, value}", o)
        return Item(__H.toInt(__H.field(o, "weight")), __H.toInt(__H.field(o, "value")))
    }
}
