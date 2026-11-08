
class Item: CustomStringConvertible {
    var weight: Int
    var value: Int
    init(_ weight: Int, _ value: Int) { self.weight = weight; self.value = value }
    init(weight: Int, value: Int) { self.weight = weight; self.value = value }
    var description: String { return "Item(weight: \(weight), value: \(value))" }
}

extension Item: __HIn, __HOut {
    static func __from(_ j: __J) throws -> Self {
        guard let weight = j["weight"], let value = j["value"] else { throw __H.bad("Item {weight, value}", j) }
        return Item(try Int.__from(weight), try Int.__from(value)) as! Self
    }

    func __json() -> __J { return .obj([("weight", .int(weight)), ("value", .int(value))]) }
}
