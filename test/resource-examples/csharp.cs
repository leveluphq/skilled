static class Program
{
    static void Check(bool condition) { if (!condition) throw new Exception("Published C# example failed"); }
    static void Main()
    {
        int[][] inputs = { Array.Empty<int>(), new[] {3}, new[] {3,3}, new[] {0,2},
            new[] {-2,1,4}, new[] {int.MinValue,int.MaxValue,1,0}, new[] {int.MaxValue,int.MaxValue} };
        int[] targets = {0,2,6,9,int.MinValue,int.MaxValue,-1,-2};
        foreach (int[] values in inputs) foreach (int target in targets)
        {
            bool possible = false;
            for (int i=0;i<values.Length;i++) for (int j=i+1;j<values.Length;j++)
                if ((long)values[i]+values[j]==target) possible=true;
            var result = CSharpInterview.TwoSum(values,target);
            Check(result.HasValue==possible);
            if (result is { } pair)
            {
                Check(pair.First>=0 && pair.First<pair.Second && pair.Second<values.Length);
                Check((long)values[pair.First]+values[pair.Second]==target);
            }
        }
        var graph = new Dictionary<int,List<int>> { [1]=new() {2,3}, [2]=new() {4,1}, [3]=new() {4} };
        Check(string.Join(",",CSharpInterview.BfsOrder(graph,1))=="1,2,3,4");
        Check(string.Join(",",CSharpInterview.BfsOrder(new(),9))=="9");
        var priorities = new PriorityQueue<string,(int Priority,int Sequence)>();
        priorities.Enqueue("A",(4,0)); priorities.Enqueue("B",(4,1)); priorities.Enqueue("C",(1,2));
        Check(priorities.Dequeue()=="C" && priorities.Dequeue()=="A" && priorities.Dequeue()=="B");
    }
}
