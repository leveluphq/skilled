
#[allow(unknown_lints, renamed_and_removed_lints, warnings, dead_code, unused, unused_qualifications, unused_results, unused_lifetimes, unused_import_braces, unused_extern_crates, unused_macro_rules, unsafe_code, unsafe_op_in_unsafe_fn, non_snake_case, non_camel_case_types, non_upper_case_globals, nonstandard_style, missing_docs, missing_debug_implementations, missing_copy_implementations, unreachable_pub, single_use_lifetimes, trivial_casts, trivial_numeric_casts, elided_lifetimes_in_paths, let_underscore_drop, variant_size_differences, rust_2018_idioms, rust_2021_compatibility, rust_2024_compatibility, future_incompatible, keyword_idents, meta_variable_misuse, missing_abi, unit_bindings, deprecated, unreachable_code, unreachable_patterns, clippy::all)]
mod __htree {
    use super::__harness::{self as h, FromJson, Json, ToJson};
    use ::std::cell::RefCell;
    use ::std::rc::Rc;

    #[derive(::std::fmt::Debug, ::std::cmp::PartialEq, ::std::cmp::Eq)]
    pub struct BinaryNode {
        pub data: i32,
        pub left: Option<Rc<RefCell<BinaryNode>>>,
        pub right: Option<Rc<RefCell<BinaryNode>>>,
    }

    impl BinaryNode {
        #[inline]
        pub fn new(data: i32) -> Self {
            BinaryNode { data, left: None, right: None }
        }
    }

    fn node(j: &Json) -> Option<Rc<RefCell<BinaryNode>>> {
        match j {
            Json::Null => None,
            _ => Some(Rc::new(RefCell::new(BinaryNode::new(i32::from_json(j))))),
        }
    }

    // Level order, with null for a missing child
    impl FromJson for Rc<RefCell<BinaryNode>> {
        fn from_json(j: &Json) -> Self {
            match Self::from_json_opt(j) {
                Some(root) => root,
                None => h::bad("non-empty BinaryNode (level-order int?[])", j),
            }
        }
        fn from_json_opt(j: &Json) -> Option<Self> {
            let values = match j {
                Json::Null => return None,
                Json::Arr(values) => values,
                other => h::bad("BinaryNode (level-order int?[])", other),
            };
            let root = node(values.first()?)?;
            let mut queue = ::std::collections::VecDeque::new();
            queue.push_back(Rc::clone(&root));
            let mut k = 1;
            while k < values.len() {
                let current = match queue.pop_front() {
                    Some(current) => current,
                    None => break,
                };
                let left = node(&values[k]);
                k += 1;
                let right = if k < values.len() { node(&values[k]) } else { None };
                k += 1;
                let mut current = current.borrow_mut();
                if let Some(left) = left {
                    queue.push_back(Rc::clone(&left));
                    current.left = Some(left);
                }
                if let Some(right) = right {
                    queue.push_back(Rc::clone(&right));
                    current.right = Some(right);
                }
            }
            Some(root)
        }
    }

    // A tree is reported in level order, from this node down
    impl ToJson for BinaryNode {
        fn to_json(&self, out: &mut String) {
            let mut seen = ::std::collections::HashSet::new();
            seen.insert(self as *const BinaryNode);
            let mut values: Vec<Option<i32>> = ::std::vec![Some(self.data)];
            let mut queue = ::std::collections::VecDeque::new();
            queue.push_back(self.left.clone());
            queue.push_back(self.right.clone());
            while let Some(next) = queue.pop_front() {
                match next {
                    None => values.push(None),
                    Some(rc) => {
                        if !seen.insert(rc.as_ptr() as *const BinaryNode) {
                            h::answer_error("The returned tree has a cycle or a node in two places");
                        }
                        let n = match rc.try_borrow() {
                            Ok(n) => n,
                            Err(_) => h::answer_error("The answer is still borrowed (RefCell::borrow_mut)"),
                        };
                        values.push(Some(n.data));
                        queue.push_back(n.left.clone());
                        queue.push_back(n.right.clone());
                    }
                }
                if values.len() as u64 > (16 << 20) {
                    h::answer_error("Your answer is too large to report");
                }
            }
            while let Some(None) = values.last() {
                values.pop();
            }
            out.push('[');
            for (k, value) in values.iter().enumerate() {
                if k > 0 {
                    out.push(',');
                }
                match value {
                    Some(data) => data.to_json(out),
                    None => out.push_str("null"),
                }
                h::check_size(out);
            }
            out.push(']');
        }
        fn none_json(out: &mut String) {
            out.push_str("[]");
        }
    }

    // A node of the input tree, reported as its data
    pub fn node_data(node: &Option<Rc<RefCell<BinaryNode>>>) -> String {
        match node {
            Some(rc) => match rc.try_borrow() {
                Ok(n) => h::answer(&n.data),
                Err(_) => h::answer_error("The answer is still borrowed (RefCell::borrow_mut)"),
            },
            None => "null".to_string(),
        }
    }
}

#[allow(unused_imports)]
pub use __htree::BinaryNode;
