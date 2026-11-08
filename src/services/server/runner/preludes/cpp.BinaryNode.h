struct BinaryNode {
    int data;
    BinaryNode* left;
    BinaryNode* right;
    BinaryNode() : data(0), left(nullptr), right(nullptr) {}
    BinaryNode(int x) : data(x), left(nullptr), right(nullptr) {}
    BinaryNode(int x, BinaryNode* left, BinaryNode* right) : data(x), left(left), right(right) {}
};

namespace __skh {
template <> struct Conv<BinaryNode*> {
    // Level order, with null for a missing child; null or [] for no tree
    static BinaryNode* from(const JVal& v) {
        if (v.k == JVal::NUL) return nullptr;
        if (v.k != JVal::ARR) throw bad("BinaryNode (level-order int?[])", v);
        if (v.size() == 0 || v[0].k == JVal::NUL) return nullptr;
        BinaryNode* root = new BinaryNode(Conv<int>::from(v[0]));
        std::deque<BinaryNode*> queue{root};
        std::size_t k = 1;
        while (k < v.size() && !queue.empty()) {
            BinaryNode* node = queue.front();
            queue.pop_front();
            if (v[k].k != JVal::NUL) {
                node->left = new BinaryNode(Conv<int>::from(v[k]));
                queue.push_back(node->left);
            }
            ++k;
            if (k < v.size()) {
                if (v[k].k != JVal::NUL) {
                    node->right = new BinaryNode(Conv<int>::from(v[k]));
                    queue.push_back(node->right);
                }
                ++k;
            }
        }
        return root;
    }
    // A tree is reported in level order, from this node down; an empty one as []
    static void to(std::string& o, const BinaryNode* root) {
        std::vector<const BinaryNode*> order;
        std::unordered_set<const BinaryNode*> seen;
        if (root) order.push_back(root);
        for (std::size_t k = 0; k < order.size(); ++k) {
            const BinaryNode* node = order[k];
            if (!node) continue;
            if (!seen.insert(node).second) throw std::runtime_error("The returned tree has a cycle or a node in two places");
            order.push_back(node->left);
            order.push_back(node->right);
        }
        while (!order.empty() && !order.back()) order.pop_back();
        o += '[';
        for (std::size_t k = 0; k < order.size(); ++k) {
            if (k) o += ',';
            if (order[k]) w_int(o, order[k]->data);
            else o += "null";
        }
        o += ']';
    }
};
// A node of the input tree, reported as its data
inline void put_ref(std::string& o, const BinaryNode* node) {
    if (node) w_int(o, node->data);
    else o += "null";
}
}  // namespace __skh
