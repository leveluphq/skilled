
#[allow(unknown_lints, renamed_and_removed_lints, warnings, dead_code, unused, unused_qualifications, unused_results, unused_lifetimes, unused_import_braces, unused_extern_crates, unused_macro_rules, unsafe_code, unsafe_op_in_unsafe_fn, non_snake_case, non_camel_case_types, non_upper_case_globals, nonstandard_style, missing_docs, missing_debug_implementations, missing_copy_implementations, unreachable_pub, single_use_lifetimes, trivial_casts, trivial_numeric_casts, elided_lifetimes_in_paths, let_underscore_drop, variant_size_differences, rust_2018_idioms, rust_2021_compatibility, rust_2024_compatibility, future_incompatible, keyword_idents, meta_variable_misuse, missing_abi, unit_bindings, deprecated, unreachable_code, unreachable_patterns, clippy::all)]
mod __hinterval {
    use super::__harness::{self as h, FromJson, Json, ToJson};

    #[derive(::std::fmt::Debug, ::std::clone::Clone, ::std::marker::Copy, ::std::cmp::PartialEq, ::std::default::Default)]
    pub struct Interval {
        pub start: f64,
        pub end: f64,
    }

    impl Interval {
        #[inline]
        pub fn new(start: f64, end: f64) -> Self {
            Interval { start, end }
        }
    }

    impl FromJson for Interval {
        fn from_json(j: &Json) -> Self {
            match (j, h::field(j, "start"), h::field(j, "end")) {
                (Json::Obj(_), Some(start), Some(end)) => Interval::new(f64::from_json(start), f64::from_json(end)),
                _ => h::bad("Interval {start, end}", j),
            }
        }
    }

    impl ToJson for Interval {
        fn to_json(&self, out: &mut String) {
            out.push_str("{\"start\":");
            h::f64_json(out, self.start);
            out.push_str(",\"end\":");
            h::f64_json(out, self.end);
            out.push('}');
        }
    }
}

#[allow(unused_imports)]
pub use __hinterval::Interval;
