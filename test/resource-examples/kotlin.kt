fun main() {
    val inputs = listOf(intArrayOf(),intArrayOf(3),intArrayOf(3,3),intArrayOf(0,2),
        intArrayOf(-2,1,4),intArrayOf(Int.MIN_VALUE,Int.MAX_VALUE,1,0),intArrayOf(Int.MAX_VALUE,Int.MAX_VALUE))
    val targets = intArrayOf(0,2,6,9,Int.MIN_VALUE,Int.MAX_VALUE,-1,-2)
    for (values in inputs) for (target in targets) {
        var possible=false
        for (i in values.indices) for (j in i+1 until values.size)
            if (values[i].toLong()+values[j].toLong()==target.toLong()) possible=true
        val result=twoSum(values,target)
        check((result!=null)==possible)
        if (result!=null) {
            check(result[0]>=0 && result[0]<result[1] && result[1]<values.size)
            check(values[result[0]].toLong()+values[result[1]].toLong()==target.toLong())
        }
    }
    val graph=mapOf(1 to listOf(2,3),2 to listOf(4,1),3 to listOf(4))
    check(bfsOrder(graph,1)==listOf(1,2,3,4))
    check(bfsOrder(emptyMap(),9)==listOf(9))
    val rows=Array(2) { IntArray(2) }; rows[0][0]=7; check(rows[1][0]==0)
    check(intArrayOf(1,2).contentEquals(intArrayOf(1,2)))
}
