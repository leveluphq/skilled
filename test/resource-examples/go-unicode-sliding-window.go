func bruteUnique(text string) int {
    values:=[]rune(text);best:=0
    for left:=range values {
        seen:=make(map[rune]bool)
        for right:=left;right<len(values);right++ {
            if seen[values[right]] { break };seen[values[right]]=true
            if right-left+1>best { best=right-left+1 }
        }
    }
    return best
}
func require(ok bool) { if !ok { panic("Published Go Unicode example failed") } }
func main() {
    alphabet:=[]rune{'a','b','🙂','é','\u0301'}
    for length:=0;length<=5;length++ {
        combinations:=1;for i:=0;i<length;i++ { combinations*=len(alphabet) }
        for code:=0;code<combinations;code++ {
            values:=make([]rune,length);rest:=code
            for i:=0;i<length;i++ { values[i]=alphabet[rest%len(alphabet)];rest/=len(alphabet) }
            text:=string(values);actual,err:=longestUniqueRunes(text)
            require(err==nil && actual==bruteUnique(text))
        }
    }
    for _,text:=range []string{"","abba","a\x00b\x00","abcabcbb"} {
        a,e:=longestUniqueRunes(text);b,f:=longestUniqueASCII(text);require(e==nil&&f==nil&&a==b)
    }
    for _,text:=range []string{string([]byte{0xff}),string([]byte{0xc0,0xaf})} {
        _,err:=longestUniqueRunes(text);require(err!=nil)
    }
    _,err:=longestUniqueASCII("🙂");require(err!=nil)
}
