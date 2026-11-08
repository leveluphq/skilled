
class Interval: CustomStringConvertible {
    var start: Double
    var end: Double
    init(_ start: Double, _ end: Double) { self.start = start; self.end = end }
    init(start: Double, end: Double) { self.start = start; self.end = end }
    var description: String { return "Interval(\(start), \(end))" }
}

extension Interval: __HIn, __HOut {
    static func __from(_ j: __J) throws -> Self {
        guard let start = j["start"], let end = j["end"] else { throw __H.bad("Interval {start, end}", j) }
        return Interval(try Double.__from(start), try Double.__from(end)) as! Self
    }

    func __json() -> __J { return .obj([("start", .dbl(start)), ("end", .dbl(end))]) }
}
