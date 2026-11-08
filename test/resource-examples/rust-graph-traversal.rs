fn main() {
    let labels: Vec<String> = ["A","B","C"].iter().map(|s| s.to_string()).collect();
    for mask in 0_u32..512 {
        let mut graph: HashMap<String,Vec<String>>=HashMap::new();
        let mut distance=[[99_usize;3];3];
        for i in 0..3 { distance[i][i]=0;for j in 0..3 {
            if mask & (1 << (i*3+j)) != 0 {
                graph.entry(labels[i].clone()).or_default().push(labels[j].clone());
                distance[i][j]=distance[i][j].min(1);
            }
        }}
        for k in 0..3 { for i in 0..3 { for j in 0..3 {
            distance[i][j]=distance[i][j].min(distance[i][k]+distance[k][j]);
        }}}
        for i in 0..3 { for j in 0..3 {
            let result=shortest_path(&graph,&labels[i],&labels[j]);
            if distance[i][j]==99 { assert!(result.is_none()); }
            else {
                let route=result.unwrap();assert_eq!(route.len()-1,distance[i][j]);
                assert_eq!(route.first().copied(),Some(labels[i].as_str()));
                assert_eq!(route.last().copied(),Some(labels[j].as_str()));
                for pair in route.windows(2) {
                    assert!(graph.get(pair[0]).unwrap().iter().any(|neighbor| neighbor==pair[1]));
                }
            }
        }}
    }
    let mut graph=HashMap::new();graph.insert("A".to_string(),vec!["D".to_string(),"D".to_string()]);
    let start=String::from("A");let route=shortest_path(&graph,&start,"D").unwrap();
    assert_eq!(route,vec!["A","D"]);
    assert_eq!(route[0].as_ptr(),start.as_ptr());
    assert_eq!(route[1].as_ptr(),graph["A"][0].as_ptr());
    assert_eq!(shortest_path(&HashMap::new(),"X","X"),Some(vec!["X"]));
    assert!(shortest_path(&HashMap::new(),"X","Y").is_none());
}
