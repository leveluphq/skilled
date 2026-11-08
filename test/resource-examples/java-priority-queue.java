class JavaPriorityQueueTests {
    static void check(boolean condition) { if (!condition) throw new AssertionError(); }
    public static void main(String[] args) {
        List<List<Integer>> inputs = List.of(List.of(),List.of(3),List.of(3,3),List.of(5,1,9,3,9),
            List.of(Integer.MIN_VALUE,Integer.MAX_VALUE,0,-1));
        for (List<Integer> values : inputs) for (int k : new int[] {0,1,2,3,20,Integer.MAX_VALUE}) {
            int[] actual = JavaPriorityQueues.largestK(values,k);
            java.util.Arrays.sort(actual);
            List<Integer> sorted = new ArrayList<>(values); sorted.sort(Comparator.reverseOrder());
            int length = Math.min(k,values.size());
            check(actual.length==length);
            for (int i=0;i<length;i++) check(actual[i]==sorted.get(length-1-i));
        }
        boolean rejected=false;
        try { JavaPriorityQueues.largestK(List.of(1),-1); }
        catch (IllegalArgumentException expected) { rejected=true; }
        check(rejected);
        var a=new JavaPriorityQueues.Job("same",Integer.MAX_VALUE);
        var b=new JavaPriorityQueues.Job("same",Integer.MAX_VALUE);
        var c=new JavaPriorityQueues.Job("urgent",Integer.MIN_VALUE);
        var ordered=JavaPriorityQueues.stablePriorityOrder(List.of(a,b,c));
        check(ordered.get(0)==c && ordered.get(1)==a && ordered.get(2)==b);
        check(JavaPriorityQueues.stablePriorityOrder(List.of()).isEmpty());
    }
}
