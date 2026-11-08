
#[allow(unknown_lints, renamed_and_removed_lints, warnings, dead_code, unused, unused_qualifications, unused_results, unused_lifetimes, unused_import_braces, unused_extern_crates, unused_macro_rules, unsafe_code, unsafe_op_in_unsafe_fn, non_snake_case, non_camel_case_types, non_upper_case_globals, nonstandard_style, missing_docs, missing_debug_implementations, missing_copy_implementations, unreachable_pub, single_use_lifetimes, trivial_casts, trivial_numeric_casts, elided_lifetimes_in_paths, let_underscore_drop, variant_size_differences, rust_2018_idioms, rust_2021_compatibility, rust_2024_compatibility, future_incompatible, keyword_idents, meta_variable_misuse, missing_abi, unit_bindings, deprecated, unreachable_code, unreachable_patterns, clippy::all)]
mod __hlist {
    use super::__harness::{self as h, FromJson, Json, ToJson};

    #[derive(::std::cmp::PartialEq, ::std::cmp::Eq, ::std::clone::Clone)]
    pub struct ListNode {
        pub data: i32,
        pub next: Option<Box<ListNode>>,
    }

    impl ListNode {
        #[inline]
        pub fn new(data: i32) -> Self {
            ListNode { next: None, data }
        }
    }

    // "1 -> 2 -> 3", from this node on, stopping after 50 nodes so a list with
    // a loop still prints
    impl ::std::fmt::Debug for ListNode {
        fn fmt(&self, f: &mut ::std::fmt::Formatter<'_>) -> ::std::fmt::Result {
            let mut node = Some(self);
            let mut k = 0;
            while let Some(n) = node {
                if k == 50 {
                    return f.write_str(" -> ...");
                }
                if k > 0 {
                    f.write_str(" -> ")?;
                }
                ::std::write!(f, "{}", n.data)?;
                node = n.next.as_deref();
                k += 1;
            }
            Ok(())
        }
    }

    // int[], or {"values": int[], "cycleIndex": n} with no loop (n is null)
    fn parts(j: &Json) -> (&[Json], Option<usize>) {
        let (values, cycle) = match j {
            Json::Obj(_) => (h::field(j, "values").unwrap_or(&Json::Null), h::field(j, "cycleIndex")),
            _ => (j, None),
        };
        let values = match values {
            Json::Arr(values) => values.as_slice(),
            other => h::bad("ListNode (int[])", other),
        };
        let cycle = match cycle {
            None | Some(Json::Null) => None,
            Some(index) => Some(<i32 as FromJson>::from_json(index) as usize),
        };
        (values, cycle)
    }

    fn build(values: &[Json]) -> Option<Box<ListNode>> {
        let mut head = None;
        for value in values.iter().rev() {
            head = Some(Box::new(ListNode { data: i32::from_json(value), next: head }));
        }
        head
    }

    impl FromJson for Box<ListNode> {
        fn from_json(j: &Json) -> Self {
            match Self::from_json_opt(j) {
                Some(head) => head,
                None => h::bad("non-empty ListNode (int[])", j),
            }
        }
        fn from_json_opt(j: &Json) -> Option<Self> {
            if let Json::Null = j {
                return None;
            }
            match parts(j) {
                (values, None) => build(values),
                (_, Some(_)) => h::input_error("A list with a loop can only be passed by reference".to_string()),
            }
        }
    }

    // A list whose tail may link back to node n. Two boxes then own that node,
    // so the driver passes it by reference and never drops it.
    pub fn with_loop(j: &Json) -> ::std::mem::ManuallyDrop<Option<Box<ListNode>>> {
        let (values, cycle) = match j {
            Json::Null => return ::std::mem::ManuallyDrop::new(None),
            _ => parts(j),
        };
        let mut head = build(values);
        if let Some(index) = cycle {
            if index >= values.len() {
                h::input_error(::std::format!("cycleIndex {} is past the end of the list", index));
            }
            let mut target: *mut ListNode = ::std::ptr::null_mut();
            let mut tail: *mut ListNode = ::std::ptr::null_mut();
            let mut node = head.as_deref_mut().map(|n| n as *mut ListNode);
            let mut k = 0;
            while let Some(p) = node {
                if k == index {
                    target = p;
                }
                tail = p;
                node = unsafe { (*p).next.as_deref_mut().map(|n| n as *mut ListNode) };
                k += 1;
            }
            unsafe { (*tail).next = Some(Box::from_raw(target)) };
        }
        ::std::mem::ManuallyDrop::new(head)
    }

    // A list is reported as its values, from this node on
    impl ToJson for ListNode {
        fn to_json(&self, out: &mut String) {
            let mut seen = ::std::collections::HashSet::new();
            out.push('[');
            let mut node = Some(self);
            while let Some(n) = node {
                if !seen.insert(n as *const ListNode) {
                    h::answer_error("The returned list never ends (it has a loop)");
                }
                if seen.len() > 1 {
                    out.push(',');
                }
                n.data.to_json(out);
                h::check_size(out);
                node = n.next.as_deref();
            }
            out.push(']');
        }
        fn none_json(out: &mut String) {
            out.push_str("[]");
        }
    }
}

#[allow(unused_imports)]
pub use __hlist::ListNode;
