#include <cassert>
#include <climits>
int main() {
    std::vector<std::vector<int>> inputs = {{},{2},{2,2,2},{INT_MIN,0,INT_MAX}};
    for (int size=0;size<=5;++size) {
        int combinations=1;for(int i=0;i<size;++i)combinations*=3;
        for(int code=0;code<combinations;++code) {
            std::vector<int> values;int rest=code;
            for(int i=0;i<size;++i){values.push_back(rest%3-1);rest/=3;}
            std::sort(values.begin(),values.end());inputs.push_back(values);
        }
    }
    for (const auto& values : inputs) for (int target : {INT_MIN,-2,-1,0,1,2,INT_MAX}) {
        std::size_t count=0;std::optional<int> before,after;
        for(int value:values){if(value==target)++count;if(value<target)before=value;if(value>target&&!after)after=value;}
        assert(countOccurrences(values,target)==count);
        assert(predecessor(values,target)==before);assert(successor(values,target)==after);
    }
    const std::vector<Interval> intervals={{-2,8},{0,9},{0,-1},{0,2},{4,5}};
    for(int target : {-3,-2,-1,0,1,4,5}) {
        std::size_t lower=0,upper=0;
        while(lower<intervals.size()&&intervals[lower].start<target)++lower;
        while(upper<intervals.size()&&intervals[upper].start<=target)++upper;
        assert(startRange(intervals,target)==std::make_pair(lower,upper));
    }
    assert(startRange({},0)==std::make_pair(std::size_t{0},std::size_t{0}));
}
