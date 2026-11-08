let inputs: [[Int]] = [[],[3],[3,3],[0,2],[-2,1,4],[Int.min,Int.max,1,0],[Int.max,Int.max],[Int.min,2,4]]
let targets = [0,2,6,9,Int.min,Int.max,-1,-2]
for values in inputs {
    for target in targets {
        var possible = false
        for i in values.indices {
            for j in (i+1)..<values.count {
                let (sum, overflow) = values[i].addingReportingOverflow(values[j])
                if !overflow && sum == target { possible = true }
            }
        }
        let result = twoSum(values, target: target)
        precondition((result != nil) == possible)
        if let (i,j) = result {
            precondition(i >= 0 && i < j && j < values.count)
            let (sum, overflow) = values[i].addingReportingOverflow(values[j])
            precondition(!overflow && sum == target)
        }
    }
}
precondition(bfsOrder([1:[2,3],2:[4,1],3:[4]], start: 1) == [1,2,3,4])
precondition(bfsOrder([:], start: 9) == [9])
let original = [1,2]; var copied = original; copied[0] = 8; precondition(original == [1,2])
final class Box { var value = 0 }
let box = Box(); let first = [box]; let second = first; second[0].value = 9
precondition(first[0].value == 9)
precondition(Array("a🙂b").count == 3)
precondition(Array("e\u{301}").count == 1)
