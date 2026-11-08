
#[allow(unknown_lints, renamed_and_removed_lints, warnings, dead_code, unused, unused_qualifications, unused_results, unused_lifetimes, unused_import_braces, unused_extern_crates, unused_macro_rules, unsafe_code, unsafe_op_in_unsafe_fn, non_snake_case, non_camel_case_types, non_upper_case_globals, nonstandard_style, missing_docs, missing_debug_implementations, missing_copy_implementations, unreachable_pub, single_use_lifetimes, trivial_casts, trivial_numeric_casts, elided_lifetimes_in_paths, let_underscore_drop, variant_size_differences, rust_2018_idioms, rust_2021_compatibility, rust_2024_compatibility, future_incompatible, keyword_idents, meta_variable_misuse, missing_abi, unit_bindings, deprecated, unreachable_code, unreachable_patterns, clippy::all)]
mod __hitem {
    use super::__harness::{self as h, FromJson, Json, ToJson};

    #[derive(::std::fmt::Debug, ::std::clone::Clone, ::std::marker::Copy, ::std::cmp::PartialEq, ::std::cmp::Eq, ::std::hash::Hash, ::std::default::Default)]
    pub struct Item {
        pub weight: i32,
        pub value: i32,
    }

    impl Item {
        #[inline]
        pub fn new(weight: i32, value: i32) -> Self {
            Item { weight, value }
        }
    }

    impl FromJson for Item {
        fn from_json(j: &Json) -> Self {
            match (j, h::field(j, "weight"), h::field(j, "value")) {
                (Json::Obj(_), Some(weight), Some(value)) => Item::new(i32::from_json(weight), i32::from_json(value)),
                _ => h::bad("Item {weight, value}", j),
            }
        }
    }

    impl ToJson for Item {
        fn to_json(&self, out: &mut String) {
            out.push_str("{\"weight\":");
            self.weight.to_json(out);
            out.push_str(",\"value\":");
            self.value.to_json(out);
            out.push('}');
        }
    }
}

#[allow(unused_imports)]
pub use __hitem::Item;
