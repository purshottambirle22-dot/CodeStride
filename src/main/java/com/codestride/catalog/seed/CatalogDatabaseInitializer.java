package com.codestride.catalog.seed;

import com.codestride.catalog.entity.Pattern;
import com.codestride.catalog.entity.Question;
import com.codestride.catalog.entity.Topic;
import com.codestride.catalog.repository.PatternRepository;
import com.codestride.catalog.repository.QuestionRepository;
import com.codestride.catalog.repository.TopicRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;

@Component
public class CatalogDatabaseInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(CatalogDatabaseInitializer.class);

    private final TopicRepository topicRepository;
    private final PatternRepository patternRepository;
    private final QuestionRepository questionRepository;

    public CatalogDatabaseInitializer(
            TopicRepository topicRepository,
            PatternRepository patternRepository,
            QuestionRepository questionRepository
    ) {
        this.topicRepository = topicRepository;
        this.patternRepository = patternRepository;
        this.questionRepository = questionRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            seedCatalog();
        } catch (Exception ex) {
            log.warn("Catalog initialization encountered non-fatal notice (database may be in read-only or mocked during tests): {}", ex.getMessage());
        }
    }

    public synchronized Map<String, Object> seedCatalog() {
        log.info("Starting CodeStride Catalog Database Initialization...");

        Map<String, Topic> topicSlugMap = initializeTopics();
        Map<String, Pattern> patternSlugMap = initializePatterns(topicSlugMap);
        int questionsSeeded = initializeQuestions(patternSlugMap);

        log.info("CodeStride Catalog Initialized: {} topics, {} patterns, {} questions verified in MongoDB.",
                topicSlugMap.size(), patternSlugMap.size(), questionsSeeded);

        return Map.of(
                "message", "Catalog successfully synchronized with all 24 topics, 52 patterns, and starter questions.",
                "totalTopics", topicSlugMap.size(),
                "totalPatterns", patternSlugMap.size(),
                "totalQuestions", questionRepository.count()
        );
    }

    // ==========================================
    // 1. ALL 24 DSA TOPICS
    // ==========================================
    private Map<String, Topic> initializeTopics() {
        List<TopicDef> definitions = List.of(
                new TopicDef("Arrays", "arrays",
                        "Sequential collection of elements stored at contiguous memory locations.",
                        "Master constant-time index calculations, memory locality optimizations, in-place overwrites, subsegment indexing, and multi-dimensional coordinate projections.",
                        1, "grid-3x3"),
                new TopicDef("Strings", "strings",
                        "Immutable or mutable sequences of characters and textual parsing algorithms.",
                        "Covers ASCII and Unicode transformations, rolling hashes, anagram detection, string matching, palindromic expansion, and dictionary parsing.",
                        2, "code"),
                new TopicDef("Searching", "searching",
                        "Locating target items across arbitrary, partially sorted, or strictly monotonic search spaces.",
                        "Techniques span linear scanning, binary search over arrays, binary search on answers, ternary search, and exponential search.",
                        3, "search"),
                new TopicDef("Sorting", "sorting",
                        "Rearranging data into monotonic orders for rapid querying and invariant enforcement.",
                        "In-depth focus on Quicksort partitioning, Merge sort divide-and-conquer, Counting and Radix sort linear distributions, and custom comparator ordering.",
                        4, "arrow-down-up"),
                new TopicDef("Hashing", "hashing",
                        "Direct address mapping using hash tables, sets, and frequency counters.",
                        "Explores constant time O(1) expected lookups, collision resolution, hash sets for duplicate elimination, prefix frequency tables, and rolling polynomial hashing.",
                        5, "hash"),
                new TopicDef("Two Pointers", "two-pointers",
                        "Pointer manipulation moving inward, outward, or unidirectionally across linear structures.",
                        "Essential strategy for sorted pair extraction, palindrome verification, cycle identification, and in-place sequence partitioning.",
                        6, "split"),
                new TopicDef("Sliding Window", "sliding-window",
                        "Subarray and substring inspection via moving boundary window constraints.",
                        "Teaches invariant maintenance across contiguous sequences with expanding right pointers and contracting left pointers in optimal linear O(N) time.",
                        7, "sliders"),
                new TopicDef("Prefix Sum", "prefix-sum",
                        "Precomputed cumulative aggregates enabling instant O(1) subarray query evaluations.",
                        "Foundation for 1D and 2D range sum queries, difference arrays for range updates, modulo arithmetic subsegment matches, and balance tracking.",
                        8, "sigma"),
                new TopicDef("Linked List", "linked-list",
                        "Dynamic linear node chains connected via memory pointers.",
                        "Focuses on pointer rewriting, sentinel dummy nodes, fast/slow runners, list reversals, cycle detections, and interleaved merges.",
                        9, "link"),
                new TopicDef("Stack", "stack",
                        "Last-In, First-Out (LIFO) abstract data structure.",
                        "Critical for recursive state tracking, nested bracket validation, arithmetic expression evaluation, and monotonic monotonic nearest-element searches.",
                        10, "layers"),
                new TopicDef("Queue", "queue",
                        "First-In, First-Out (FIFO) buffer mechanism.",
                        "Underpins breadth-first search (BFS), sliding window maximums via double-ended queues (deque), streaming buffers, and multi-producer queues.",
                        11, "list-ordered"),
                new TopicDef("Binary Tree", "binary-tree",
                        "Hierarchical node structures where each parent maintains at most two children.",
                        "Explores preorder, inorder, and postorder traversals, level-order queues, recursion depth bounds, structural mirrors, and ancestor queries.",
                        12, "git-fork"),
                new TopicDef("Binary Search Tree", "binary-search-tree",
                        "Ordered tree where left child keys are smaller and right child keys are larger.",
                        "Covers logarithmic search, insertion, in-order sorted stream extraction, validation, balance rotations, and predecessor/successor logic.",
                        13, "binary"),
                new TopicDef("Heap / Priority Queue", "heap-priority-queue",
                        "Complete binary tree enforcing min or max parent-child dominance invariants.",
                        "Crucial for Top-K element tracking, median streaming, interval scheduling, Dijkstra shortest path, and Prim minimum spanning tree.",
                        14, "mountain"),
                new TopicDef("Greedy Algorithms", "greedy-algorithms",
                        "Iterative problem solving by committing to the locally optimal choice at each step.",
                        "Analyzes greedy-choice properties, optimal substructure, interval scheduling, jump game decisions, and fractional knapsack trade-offs.",
                        15, "gem"),
                new TopicDef("Backtracking", "backtracking",
                        "Systematic state-space exploration that prunes invalid candidate search branches.",
                        "Generates combinations, permutations, subset state spaces, N-Queens placement, and Sudoku constraint satisfaction boards.",
                        16, "rotate-ccw"),
                new TopicDef("Recursion", "recursion",
                        "Solving algorithmic problems through self-referential subproblem delegation.",
                        "Develops clean base case reasoning, recursive call stacks, divide-and-conquer trees, and mutual recursion flows.",
                        17, "repeat"),
                new TopicDef("Dynamic Programming", "dynamic-programming",
                        "Optimization strategy leveraging overlapping subproblems and optimal substructures.",
                        "Covers top-down memoization, bottom-up tabulation, space compression, 1D/2D grid transitions, knapsacks, and subsequence alignments.",
                        18, "cpu"),
                new TopicDef("Graphs", "graphs",
                        "Mathematical networks of vertices connected by directional or weighted edges.",
                        "Deep dive into adjacency representations, DFS cycles, BFS shortest hops, topological sorting, connected components, and bipartite testing.",
                        19, "network"),
                new TopicDef("Tries", "tries",
                        "Prefix retrieval tree specialized for fast string and bitwise dictionary operations.",
                        "Provides O(L) autocomplete lookups, dictionary spell checks, wildcards, and maximum XOR pair evaluations.",
                        20, "tree-deciduous"),
                new TopicDef("Bit Manipulation", "bit-manipulation",
                        "Direct binary bitwise operations manipulating individual word bits.",
                        "Explores bitwise XOR cancellations, bitmasks for subset tracking, bit shifts, two's complement arithmetic, and lowest-set-bit isolation.",
                        21, "binary-code"),
                new TopicDef("Disjoint Set Union", "disjoint-set-union",
                        "Near-constant time partition management for dynamic connectivity queries.",
                        "Implements union by rank and path compression heuristics to track equivalence classes, cycle additions, and Kruskal spanning networks.",
                        22, "split"),
                new TopicDef("Matrix", "matrix",
                        "Two-dimensional rectangular grid structures.",
                        "Master 2D coordinate traversals, spiral rotations, island flood-fills, boundary checks, and dynamic programming coordinate transforms.",
                        23, "grid-3x3"),
                new TopicDef("Advanced Data Structures", "advanced-data-structures",
                        "High-performance structures for specialized range query and update complexities.",
                        "Explores Segment Trees, Fenwick Trees (Binary Indexed Trees), Monotonic Deques, Sparse Tables, and LRU/LFU cache composite architectures.",
                        24, "sparkles")
        );

        Map<String, Topic> result = new HashMap<>();

        for (TopicDef def : definitions) {
            Topic topic = topicRepository.findBySlug(def.slug).orElseGet(Topic::new);
            topic.setName(def.name);
            topic.setSlug(def.slug);
            topic.setDescription(def.description);
            topic.setDetailedLearningDescription(def.detailedLearningDescription);
            topic.setDisplayOrder(def.displayOrder);
            topic.setIcon(def.icon);
            topic.setActive(true);
            if (topic.getCreatedAt() == null) {
                topic.setCreatedAt(Instant.now());
            }
            topic.setUpdatedAt(Instant.now());

            Topic saved = topicRepository.save(topic);
            result.put(def.slug, saved);
        }

        return result;
    }

    // ==========================================
    // 2. ALL 52 DSA PATTERNS
    // ==========================================
    private Map<String, Pattern> initializePatterns(Map<String, Topic> topics) {
        List<PatternDef> definitions = List.of(
                // Arrays and Strings (1-13)
                new PatternDef("Two Pointers", "two-pointers-pattern", "two-pointers", List.of("arrays", "strings"),
                        "Two pointers moving toward each other or in parallel to prune search spaces.",
                        "A classic technique using two indices to inspect pairs in sorted collections or detect palindromes without quadratic O(N^2) iterations.",
                        "Use when searching for pairs in sorted arrays, comparing characters from outer edges inward, or partitioning numbers around an invariant.",
                        "Look for keywords like 'pair with target sum in sorted array', 'palindrome', 'reverse', or 'in-place swap'.",
                        "Initialize left = 0 and right = n - 1. In a while loop (left < right), evaluate sum/condition. If sum < target, left++; if sum > target, right--; else record match.",
                        "O(N) single linear pass over the collection.", "O(1) auxiliary memory since manipulation is done in place.", 1),

                new PatternDef("Sliding Window", "sliding-window-pattern", "sliding-window", List.of("arrays", "strings"),
                        "Dynamic or fixed-size contiguous segment sliding across an array or string.",
                        "Avoids redundant subsegment recomputations by updating the window state when elements enter on the right or exit on the left.",
                        "Ideal for longest/shortest substring or subarray problems conforming to a constraint (e.g., at most K distinct elements, maximum sum).",
                        "Keywords: 'contiguous subarray', 'longest substring without repeats', 'maximum sum of size K', 'consecutive characters'.",
                        "Expand right boundary adding items to state. While constraint is violated, shrink left boundary removing items from state. Track global optimum.",
                        "O(N) since each element enters and leaves the window at most once.", "O(K) or O(1) space for window state hash map.", 2),

                new PatternDef("Fixed Size Sliding Window", "fixed-size-sliding-window", "sliding-window", List.of("arrays"),
                        "Sliding window where length K is constant and unchanging.",
                        "Maintains an exact window size K, subtracting the exiting item at i - K and adding the entering item at i.",
                        "Use when finding maximum/minimum aggregate metrics of fixed length K across a stream or array.",
                        "Keywords: 'of size K', 'every window of length K', 'moving average of size K'.",
                        "Compute aggregate for first K elements. Then loop from K to N, adding nums[i] and subtracting nums[i - K]. Update maximum.",
                        "O(N) time for a single pass.", "O(1) extra space.", 3),

                new PatternDef("Variable Size Sliding Window", "variable-size-sliding-window", "sliding-window", List.of("strings", "arrays"),
                        "Sliding window whose bounds dynamically expand and contract based on target conditions.",
                        "Dynamically explores maximum or minimum valid window lengths conforming to dynamic criteria.",
                        "Use for 'minimum window substring' or 'longest subarray with sum at most S'.",
                        "Phrases like 'find smallest subarray with sum >= S' or 'longest substring with at most K distinct'.",
                        "Expand right pointer until valid or invalid; then contract left pointer while keeping condition valid or until condition is restored.",
                        "O(N) amortized linear scan.", "O(min(N, alphabet_size)) auxiliary space.", 4),

                new PatternDef("Prefix Sum", "prefix-sum-pattern", "prefix-sum", List.of("arrays"),
                        "Precomputed cumulative sum array allowing instant range queries in O(1) time.",
                        "Precomputes running totals such that range sum from index i to j equals prefix[j + 1] - prefix[i].",
                        "Use whenever multiple range sum queries are required on static data or when calculating subarray sum equality.",
                        "Keywords: 'range sum query', 'subarray sum divisible by K', 'equal number of 0s and 1s'.",
                        "Build array prefix[k] = prefix[k-1] + nums[k-1]. Query range (L, R) by evaluating prefix[R+1] - prefix[L]. Combine with hash maps for target difference checks.",
                        "O(N) preprocessing time, O(1) per query.", "O(N) to store prefix table.", 5),

                new PatternDef("Difference Array", "difference-array", "prefix-sum", List.of("arrays"),
                        "Differential array for performing multiple range updates in O(1) time.",
                        "Tracks differentials between adjacent array values so range additions [L, R] by delta require only diff[L] += delta and diff[R+1] -= delta.",
                        "Use when multiple batch range updates are applied before querying final array values.",
                        "Keywords: 'increment range [L, R] by val multiple times', 'flight bookings', 'car pooling'.",
                        "Initialize diff array. For each update (L, R, val), diff[L] += val and diff[R+1] -= val. Reconstruct final array via prefix scan.",
                        "O(N + Q) where Q is number of updates.", "O(N) auxiliary array space.", 6),

                new PatternDef("Kadane's Algorithm", "kadanes-algorithm", "arrays", List.of("dynamic-programming"),
                        "Optimal dynamic programming pattern to find maximum sum contiguous subarrays.",
                        "At each index, determines whether to extend the current running subarray or start a new subarray fresh from the current element.",
                        "Use for maximum or minimum contiguous subarray sum problems.",
                        "Keywords: 'maximum contiguous subarray', 'largest sum of consecutive elements'.",
                        "Maintain currentMax and globalMax. For each num: currentMax = max(num, currentMax + num); globalMax = max(globalMax, currentMax).",
                        "O(N) single traversal.", "O(1) constant auxiliary space.", 7),

                new PatternDef("HashMap / Frequency Counting", "hashmap-frequency-counting", "hashing", List.of("arrays", "strings"),
                        "Tracking element occurrences and indices with constant-time hash table lookups.",
                        "Leverages hash maps or fixed frequency tables (e.g., int[26]) to verify counts, detect duplicates, and complement target lookups.",
                        "Use for anagram checks, Two Sum complement search, majority element detection, and frequency matching.",
                        "Keywords: 'anagram', 'frequency', 'find duplicate', 'two sum', 'most frequent'.",
                        "Iterate through input while tallying frequencies or storing (target - current) complements. Query hash map in O(1) expected time.",
                        "O(N) linear time.", "O(U) space where U is number of unique elements.", 8),

                new PatternDef("Sorting Based Techniques", "sorting-based-techniques", "sorting", List.of("arrays"),
                        "Leveraging order invariants to simplify pair matching and greedy intervals.",
                        "Sorting transforms disorganized data so greedy intervals, binary searches, or duplicate consolidations become straightforward.",
                        "Use for meeting rooms, merge intervals, three sum, and custom comparator ordering.",
                        "Keywords: 'merge intervals', 'non-overlapping intervals', 'rearrange', 'minimum difference'.",
                        "Sort the collection in O(N log N). Once ordered, compare adjacent elements or maintain interval end pointers.",
                        "O(N log N) dominated by comparison sort.", "O(1) to O(N) depending on in-place sorting algorithm.", 9),

                new PatternDef("Binary Search", "binary-search-pattern", "searching", List.of("arrays"),
                        "Logarithmic search by halving sorted or monotonic domains.",
                        "Repeatedly eliminates half of the remaining search space by comparing target against the midpoint element.",
                        "Use whenever the input array is sorted or possesses a monotonic property f(x).",
                        "Keywords: 'sorted array', 'search in O(log N)', 'rotated sorted array'.",
                        "Initialize low = 0, high = n - 1. While low <= high, compute mid = low + (high - low)/2. Adjust low or high depending on comparison.",
                        "O(log N) logarithmic iterations.", "O(1) auxiliary space.", 10),

                new PatternDef("Binary Search on Answer", "binary-search-on-answer", "searching", List.of("arrays"),
                        "Binary search over the range of possible answers rather than an input index array.",
                        "When checking if an answer X is feasible can be evaluated monotonically in O(N), search the solution space [minAnswer, maxAnswer].",
                        "Use for optimization problems asking for 'minimum maximum' or 'maximum minimum' capacity, speed, or allocation.",
                        "Keywords: 'minimum capacity', 'maximum distance', 'koko eating bananas', 'ship packages'.",
                        "Define monotonic predicate isValid(mid). Set low = min possible answer, high = max possible answer. Binary search for boundary.",
                        "O(N * log(Range)) where Range is search domain.", "O(1) space.", 11),

                new PatternDef("Dutch National Flag", "dutch-national-flag", "two-pointers", List.of("arrays", "sorting"),
                        "Three-way partitioning algorithm that segregates an array into three distinct value segments.",
                        "Uses three pointers (low, mid, high) to place 0s, 1s, and 2s into their respective segments in a single pass.",
                        "Use for 3-way partitioning problems like sorting colors or pivoting around a median.",
                        "Keywords: 'sort colors', 'three-way partition', 'segregate 0s, 1s, 2s'.",
                        "Maintain low = 0, mid = 0, high = n - 1. While mid <= high: if nums[mid] == 0 swap with low and increment both; if 1 mid++; if 2 swap with high and decrement high.",
                        "O(N) single pass.", "O(1) strictly in-place memory.", 12),

                new PatternDef("Matrix Traversal", "matrix-traversal", "matrix", List.of("arrays"),
                        "Structured coordinate iteration across two-dimensional grid layouts.",
                        "Traverses 2D matrices spirally, diagonally, or in bounded layered rings while respecting bounds.",
                        "Use for spiral matrix generation, word search grids, rotating images, and chessboard diagonals.",
                        "Keywords: 'spiral matrix', 'rotate matrix 90 degrees', 'diagonal traversal', 'grid boundary'.",
                        "Define directional delta vectors (dr, dc) or dynamic boundary limits (top, bottom, left, right). Step coordinates while inside bounds.",
                        "O(R * C) covering every cell once.", "O(1) auxiliary space.", 13),

                // Linked List (14-18)
                new PatternDef("Fast and Slow Pointers", "fast-slow-pointers", "linked-list", List.of("two-pointers"),
                        "Two pointers moving at different speeds (1 step vs 2 steps) to inspect list topology.",
                        "Also known as Floyd's cycle-finding algorithm. The faster pointer covers twice the distance per tick, guaranteeing collision in cycles.",
                        "Use to detect cycles in linked lists, find middle nodes, and verify happy numbers.",
                        "Keywords: 'has cycle', 'middle of the linked list', 'find loop start'.",
                        "Initialize slow = head, fast = head. While fast != null and fast.next != null: slow = slow.next, fast = fast.next.next. Check if slow == fast.",
                        "O(N) linear time.", "O(1) pointer space.", 14),

                new PatternDef("Linked List Reversal", "linked-list-reversal", "linked-list", List.of("recursion"),
                        "Reorienting next pointer references in reverse order in-place.",
                        "Iteratively flips next pointers using three pointer anchors (prev, curr, next) without allocating new nodes.",
                        "Use for reversing whole linked lists, reversing between subsegment indices [m, n], and palindrome lists.",
                        "Keywords: 'reverse linked list', 'reverse nodes in k-group', 'palindrome list'.",
                        "Initialize prev = null, curr = head. While curr != null: next = curr.next; curr.next = prev; prev = curr; curr = next. Return prev.",
                        "O(N) single pass.", "O(1) in-place pointers.", 15),

                new PatternDef("Merge Two Sorted Lists", "merge-two-sorted-lists", "linked-list", List.of("sorting"),
                        "Splicing two ordered node chains into a single monotonically sorted chain.",
                        "Compares heads of two lists, advancing the smaller node and splicing references using a sentinel node.",
                        "Use for list merges, merge sort on linked lists, and merging K sorted lists via divide-and-conquer.",
                        "Keywords: 'merge two sorted lists', 'merge k sorted lists'.",
                        "Create dummy node. While both lists non-null, link dummy.next to smaller value and advance that list. Append remainder.",
                        "O(N + M) where N and M are list lengths.", "O(1) auxiliary memory.", 16),

                new PatternDef("Dummy Node Technique", "dummy-node-technique", "linked-list", List.of(),
                        "Sentinel placeholder node positioned prior to list head to eliminate edge-case conditionals.",
                        "Simplifies operations where head node might be removed, swapped, or pre-pended, removing null-check branch divergence.",
                        "Use whenever deleting nodes, reordering heads, or inserting at head in linked lists.",
                        "Keywords: 'remove nth node from end', 'partition list', 'delete duplicates'.",
                        "Create dummy = new ListNode(0); dummy.next = head; perform pointer ops starting from dummy; return dummy.next.",
                        "O(N) time.", "O(1) single sentinel node allocated.", 17),

                new PatternDef("Cycle Detection", "cycle-detection", "linked-list", List.of("two-pointers"),
                        "Finding whether a graph or linked list path loops back to an earlier node.",
                        "Utilizes tortoise and hare pointer collision to determine if a node points to an ancestor in the path.",
                        "Use for cyclic paths, duplicate numbers in 1..N arrays, and state transition loops.",
                        "Keywords: 'linked list cycle II', 'find duplicate number without extra space'.",
                        "Advance slow by 1, fast by 2. When they meet, reset slow to head. Advance both by 1; their collision point is the cycle origin.",
                        "O(N) time.", "O(1) space.", 18),

                // Stack and Queue (19-23)
                new PatternDef("Monotonic Stack", "monotonic-stack", "stack", List.of("arrays"),
                        "Stack whose elements are maintained in strictly increasing or decreasing order.",
                        "Pops elements that violate monotonic order before inserting the new element, yielding nearest greater or smaller neighbors.",
                        "Use for next greater element, daily temperatures, largest rectangle in histogram, and stock span.",
                        "Keywords: 'next greater element', 'previous smaller element', 'largest rectangle', 'trapping rain water'.",
                        "Iterate through items. While stack not empty and stack.peek() <= current: pop and process nearest neighbor logic. Push current.",
                        "O(N) since each element is pushed and popped at most once.", "O(N) stack capacity.", 19),

                new PatternDef("Monotonic Queue", "monotonic-queue", "queue", List.of("sliding-window"),
                        "Double-ended queue (deque) maintaining monotonic ordering of elements within a sliding window.",
                        "Removes elements from back if they are smaller than incoming item, and removes elements from front if they leave the sliding window.",
                        "Use for finding maximum or minimum values in all sliding windows of size K in linear time.",
                        "Keywords: 'sliding window maximum', 'constrained subsequence sum'.",
                        "For each element, pop smaller elements from deque back, pop out-of-window elements from deque front. The front holds current window extremum.",
                        "O(N) linear time overall.", "O(K) deque size.", 20),

                new PatternDef("Next Greater Element", "next-greater-element", "stack", List.of("arrays"),
                        "Finding the first element to the right or left that is greater than current element.",
                        "Core application of monotonic decreasing stack where popped elements find their immediate successor.",
                        "Use for temperatures, heights, and stock span calculations.",
                        "Keywords: 'first element to the right greater than', 'warmer temperature'.",
                        "Loop backwards or forwards with monotonic stack; peek top to find answer before pushing current.",
                        "O(N) time.", "O(N) auxiliary stack.", 21),

                new PatternDef("Stack-Based Expression Processing", "stack-expression-processing", "stack", List.of("strings"),
                        "Parsing mathematical expressions, nested brackets, and directory paths via stacks.",
                        "Maintains operators, operands, or scopes on stacks to enforce correct precedence and bracket matching.",
                        "Use for valid parentheses, basic calculators, reverse Polish notation, and simplified file paths.",
                        "Keywords: 'valid parentheses', 'evaluate reverse polish notation', 'calculator', 'nested brackets'.",
                        "Push opening tokens. Upon encountering closing token, pop matching pair or evaluate top operators based on precedence rules.",
                        "O(N) string parse time.", "O(N) maximum nesting depth.", 22),

                new PatternDef("BFS / Level Order Traversal", "bfs-level-order-traversal", "queue", List.of("binary-tree", "graphs"),
                        "Queue-driven layer-by-layer traversal exploring nearest neighbors before deeper nodes.",
                        "Pushes root to queue. In while loop, consumes all nodes in current layer (queue.size()) before moving to next depth.",
                        "Use for tree level-order printing, minimum steps in unweighted grids, and shortest transformation paths.",
                        "Keywords: 'level order traversal', 'shortest path unweighted', 'nearest exit', 'zigzag traversal'.",
                        "Queue with initial node. While queue not empty, capture levelSize = queue.size(), loop levelSize times, pop and enqueue child neighbors.",
                        "O(V + E) for graphs, O(N) for trees.", "O(W) where W is maximum tree width.", 23),

                // Trees (24-29)
                new PatternDef("DFS Traversal", "dfs-traversal", "binary-tree", List.of("recursion"),
                        "Deep branch exploration visiting children before backtracking to sibling branches.",
                        "Traverses preorder (node, left, right), inorder (left, node, right), or postorder (left, right, node) using call stack or explicit stack.",
                        "Use for tree path sums, maximum depth, subtree checks, and tree serialization.",
                        "Keywords: 'path sum', 'max depth', 'same tree', 'inorder traversal'.",
                        "Base case: if node is null return. Recursively call left and right children, combining answers at parent.",
                        "O(N) visiting every node once.", "O(H) recursion stack height.", 24),

                new PatternDef("BFS Traversal", "tree-bfs-traversal", "binary-tree", List.of("queue"),
                        "Breadth-first exploration across horizontal tree levels using FIFO queues.",
                        "Processes tree nodes horizontally across layers, allowing immediate identification of shallowest solutions.",
                        "Use for minimum depth of binary tree, level averages, and right-side view.",
                        "Keywords: 'binary tree right side view', 'average of levels', 'minimum depth'.",
                        "Queue initialized with root. Process layer by layer tracking layer indices.",
                        "O(N) time.", "O(W) maximum width of tree.", 25),

                new PatternDef("Tree Recursion", "tree-recursion", "binary-tree", List.of("recursion"),
                        "Dividing tree computations into left and right subproblem return values.",
                        "Computes property of parent node directly from results computed recursively by left and right subtrees.",
                        "Use for subtree isomorphism, symmetric trees, and invert binary tree.",
                        "Keywords: 'invert binary tree', 'is symmetric', 'balanced binary tree'.",
                        "Define solve(node) -> bool or int. Return combine(solve(node.left), solve(node.right)).",
                        "O(N) time.", "O(H) stack depth.", 26),

                new PatternDef("Binary Search Tree Properties", "bst-properties", "binary-search-tree", List.of("binary-tree"),
                        "Exploiting the BST ordering invariant (left < root < right) for logarithmic queries.",
                        "In-order traversal of a BST generates a strictly ascending sorted stream.",
                        "Use for validating BST, finding Kth smallest element, and range sum in BST.",
                        "Keywords: 'validate binary search tree', 'kth smallest in BST', 'range sum BST'.",
                        "Use min/max boundary constraints in recursion: isValid(node, min, max).",
                        "O(H) expected time, O(N) worst case.", "O(H) recursion memory.", 27),

                new PatternDef("Lowest Common Ancestor", "lowest-common-ancestor", "binary-tree", List.of("binary-search-tree"),
                        "Locating the shared ancestor node positioned lowest in the tree hierarchy for two targets.",
                        "In standard tree, bubbles up non-null nodes. In BST, walks left or right based on whether p and q both lie on one side.",
                        "Use for LCA in binary tree and LCA in binary search tree.",
                        "Keywords: 'lowest common ancestor', 'LCA'.",
                        "If root is null or root == p or root == q, return root. Recurse left and right. If both return non-null, root is LCA.",
                        "O(N) for binary tree, O(H) for BST.", "O(H) call stack.", 28),

                new PatternDef("Tree Diameter", "tree-diameter", "binary-tree", List.of("dynamic-programming"),
                        "Calculating the longest path distance between any two leaf nodes in a tree.",
                        "At each node, the longest path passing through it is leftDepth + rightDepth. Updates global diameter while returning max depth to parent.",
                        "Use for diameter of binary tree and binary tree maximum path sum.",
                        "Keywords: 'diameter of binary tree', 'longest path between two nodes', 'max path sum'.",
                        "Post-order traversal computing depth: int left = depth(node.left), right = depth(node.right). maxDiameter = max(maxDiameter, left + right). Return max(left, right) + 1.",
                        "O(N) single bottom-up traversal.", "O(H) stack space.", 29),

                // Graphs (30-35)
                new PatternDef("Graph DFS", "graph-dfs", "graphs", List.of("recursion"),
                        "Deep traversal across graph vertices with visited set protection against cycles.",
                        "Explores edge chains until reaching dead ends or already visited nodes before backtracking.",
                        "Use for connected components, island counting, clone graph, and cycle detection in directed graphs.",
                        "Keywords: 'number of islands', 'connected components', 'clone graph', 'keys and rooms'.",
                        "Maintain visited set. In dfs(node): mark visited, iterate over neighbors and recursively invoke dfs if unvisited.",
                        "O(V + E) time.", "O(V) visited set and recursion stack.", 30),

                new PatternDef("Graph BFS", "graph-bfs", "graphs", List.of("queue"),
                        "Level-by-level queue traversal guaranteeing shortest path in unweighted graphs.",
                        "Expands frontier nodes simultaneously. The first time a target vertex is dequeued represents its minimum hop distance.",
                        "Use for shortest path in 0-1 or unweighted grids, word ladder, and bipartite graph check.",
                        "Keywords: 'shortest path in binary matrix', 'word ladder', 'minimum steps', 'rotting oranges'.",
                        "Queue initialized with starting vertex and visited.add(start). Dequeue, inspect neighbors, mark visited, enqueue with dist + 1.",
                        "O(V + E) time.", "O(V) queue capacity.", 31),

                new PatternDef("Topological Sorting", "topological-sorting", "graphs", List.of("queue", "stack"),
                        "Linear ordering of directed acyclic graph (DAG) vertices respecting dependency precedence.",
                        "Kahn's algorithm uses in-degree arrays with BFS queue; or DFS uses postorder stack. Detects cycles if ordering length < V.",
                        "Use for course schedule, build dependencies, and task sequencing with prerequisites.",
                        "Keywords: 'course schedule', 'prerequisites', 'build order', 'dependency graph'.",
                        "Compute in-degrees. Enqueue all 0-in-degree nodes. While queue not empty, pop u, add to result, decrement neighbors' in-degree; enqueue if neighbor becomes 0.",
                        "O(V + E) time.", "O(V) in-degree array and queue.", 32),

                new PatternDef("Shortest Path", "shortest-path", "graphs", List.of("heap-priority-queue"),
                        "Finding path of minimum total edge weight using Dijkstra or Bellman-Ford algorithms.",
                        "Dijkstra uses min-heap priority queue to greedily expand closest unvisited vertex for non-negative weighted graphs.",
                        "Use for network delay time, cheapest flights with K stops, and path with minimum effort.",
                        "Keywords: 'network delay time', 'cheapest flights', 'minimum weight path', 'dijkstra'.",
                        "Distance array initialized to infinity. PriorityQueue holding (cost, u). Pop minimum cost node, relax outgoing edges if cost + w < dist[v].",
                        "O((V + E) log V) with binary heap.", "O(V) distance table and heap.", 33),

                new PatternDef("Union Find / DSU", "union-find-dsu", "disjoint-set-union", List.of("graphs"),
                        "Near-constant time partition management with path compression and union by rank.",
                        "Maintains disjoint tree sets where find(x) flattens pointers and union(x, y) merges smaller tree into larger tree.",
                        "Use for dynamic connectivity, redundant connection, Kruskal's MST, and graph valid tree.",
                        "Keywords: 'redundant connection', 'number of connected components', 'accounts merge'.",
                        "Parent array parent[i] = i. find(i) with parent[i] = find(parent[i]). union(i, j) by attaching roots by rank.",
                        "O(alpha(N)) amortized nearly O(1) per operation.", "O(N) parent and rank arrays.", 34),

                new PatternDef("Minimum Spanning Tree", "minimum-spanning-tree", "graphs", List.of("greedy-algorithms", "disjoint-set-union"),
                        "Connecting all graph vertices with minimum possible total edge weight without cycles.",
                        "Kruskal sorts all edges and uses DSU to include lightest valid edges; Prim starts from a vertex using min-heap priority queue.",
                        "Use for min cost to connect all points and connecting cities with minimum cost.",
                        "Keywords: 'min cost to connect all points', 'minimum spanning tree', 'kruskal'.",
                        "Sort edges by weight. Iterate through edges: if find(u) != find(v), union(u, v) and add weight to MST sum.",
                        "O(E log E) due to edge sorting.", "O(V) for DSU parent structure.", 35),

                // Recursion and Backtracking (36-39)
                new PatternDef("Subsets", "subsets-pattern", "backtracking", List.of("recursion"),
                        "Generating all possible 2^N combinations or power set selections.",
                        "At each element index, decisions branch into two options: either include element in current path or exclude it.",
                        "Use for subsets, subsets II (with duplicates), and letter combinations.",
                        "Keywords: 'power set', 'all possible subsets', 'generate all combinations'.",
                        "backtrack(start, currentPath): add copy of currentPath to result; loop i from start to N: currentPath.add(nums[i]), backtrack(i+1), currentPath.removeLast().",
                        "O(N * 2^N) time.", "O(N) recursion stack.", 36),

                new PatternDef("Permutations", "permutations-pattern", "backtracking", List.of("recursion"),
                        "Generating all N! ordered arrangements of a collection.",
                        "Explores all sequences where order matters, tracking used elements via visited boolean array or in-place swapping.",
                        "Use for permutations of unique elements, permutations II with duplicate frequency checks.",
                        "Keywords: 'all permutations', 'anagram arrangements', 'order matters'.",
                        "backtrack(path, used): if path.size() == n add to res; for i = 0 to n: if used[i] continue, mark used, path.add, recurse, backtrack.",
                        "O(N * N!) time.", "O(N) stack and used array.", 37),

                new PatternDef("Combinations", "combinations-pattern", "backtracking", List.of("recursion"),
                        "Selecting K items out of N items where order does not matter.",
                        "Branches choices forward from current index to ensure combination uniqueness without duplicating permutations.",
                        "Use for combination sum, letter combinations of phone number, and combinations (N choose K).",
                        "Keywords: 'combination sum', 'candidates sum up to target', 'combinations'.",
                        "backtrack(start, remainTarget, path): if remainTarget == 0 add path; loop i from start to N: if candidate > remainTarget break, recurse with remainTarget - candidate.",
                        "O(2^N) or O(N choose K).", "O(K) path recursion space.", 38),

                new PatternDef("Backtracking with Constraints", "backtracking-constraints", "backtracking", List.of("recursion"),
                        "State-space pruning where partial solutions violating constraints are aborted immediately.",
                        "Validates constraints before descending into recursive call, avoiding exploration of exponential dead ends.",
                        "Use for N-Queens, Sudoku solver, word search, and palindrome partitioning.",
                        "Keywords: 'n queens', 'sudoku solver', 'word search in grid', 'valid board'.",
                        "Before recursing: check if isValid(board, row, col). If valid, set cell, recurse; if recursion returns true, return true; else undo cell.",
                        "Exponential bounded by pruning efficiency.", "O(N) or O(R * C) recursion depth.", 39),

                // Dynamic Programming (40-47)
                new PatternDef("1D Dynamic Programming", "1d-dynamic-programming", "dynamic-programming", List.of("arrays"),
                        "Solving linear sequential recurrence relations using a 1D array or variable state.",
                        "State dp[i] depends on a fixed window of previous states (e.g., dp[i-1] + dp[i-2]), often optimizable to O(1) space.",
                        "Use for climbing stairs, house robber, decode ways, and coin change.",
                        "Keywords: 'climbing stairs', 'house robber', 'maximum profit linear', 'decode ways'.",
                        "Identify state dp[i]. Establish transition: dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Compress variables if only previous 2 needed.",
                        "O(N) linear time.", "O(1) with variable space compression.", 40),

                new PatternDef("2D Dynamic Programming", "2d-dynamic-programming", "dynamic-programming", List.of("matrix"),
                        "State transitions indexed across two dimensions (i, j).",
                        "Represents subproblems over pairs of indices, prefixes of two strings, or two bounded constraints.",
                        "Use for unique paths, maximal square, target sum, and edit distance.",
                        "Keywords: 'unique paths in grid', 'minimum path sum', 'maximal square', 'two strings alignment'.",
                        "dp[i][j] = min/max/sum of adjacent cells dp[i-1][j], dp[i][j-1], dp[i-1][j-1] + cost.",
                        "O(M * N) time.", "O(M * N) or O(N) with rolling row compression.", 41),

                new PatternDef("Knapsack Pattern", "knapsack-pattern", "dynamic-programming", List.of("greedy-algorithms"),
                        "Optimal selection of items with weights and values bounded by capacity W.",
                        "0/1 Knapsack allows each item at most once (reverse loop iteration); Unbounded Knapsack allows infinite repetitions (forward loop).",
                        "Use for partition equal subset sum, coin change (unbounded), and ones and zeroes.",
                        "Keywords: 'partition equal subset sum', 'target capacity W', 'coin change minimum coins'.",
                        "For 0/1: dp[w] = max(dp[w], dp[w - weight[i]] + value[i]) looping w backwards from W down to weight[i].",
                        "O(N * W) pseudo-polynomial time.", "O(W) 1D array capacity.", 42),

                new PatternDef("Longest Common Subsequence", "longest-common-subsequence", "dynamic-programming", List.of("strings"),
                        "Finding the longest sequence that appears in both strings in relative order.",
                        "Compares characters at text1[i] and text2[j]. If equal, advance both (1 + dp[i-1][j-1]); else take max(dp[i-1][j], dp[i][j-1]).",
                        "Use for longest common subsequence, edit distance, and delete operation for two strings.",
                        "Keywords: 'longest common subsequence', 'edit distance', 'minimum deletions to make equal'.",
                        "dp[i][j]: if s1[i-1] == s2[j-1] -> 1 + dp[i-1][j-1]; else -> max(dp[i-1][j], dp[i][j-1]).",
                        "O(M * N) time.", "O(min(M, N)) with single row space.", 43),

                new PatternDef("Longest Increasing Subsequence", "longest-increasing-subsequence", "dynamic-programming", List.of("binary-search"),
                        "Finding the maximum length strictly increasing subsequence in an array.",
                        "Solvable in O(N^2) via standard DP, or O(N log N) via patience sorting with binary search (Arrays.binarySearch / lower_bound).",
                        "Use for longest increasing subsequence, Russian doll envelopes, and maximum height by stacking cuboids.",
                        "Keywords: 'longest increasing subsequence', 'LIS', 'non-decreasing subsequence'.",
                        "Maintain tails list. For each num, binary search position in tails: if greater than all, append; else overwrite first element >= num.",
                        "O(N log N) with binary search optimization.", "O(N) tails array space.", 44),

                new PatternDef("Grid DP", "grid-dp", "dynamic-programming", List.of("matrix"),
                        "Dynamic programming across cell transitions in 2D coordinate matrices.",
                        "Accumulates path minimums or route counts stepping only right and down.",
                        "Use for unique paths II (with obstacles), minimum path sum, and cherry pickup.",
                        "Keywords: 'grid minimum path', 'unique paths with obstacles', 'dungeon game'.",
                        "dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1]). Initialize boundaries cleanly.",
                        "O(R * C) time.", "O(C) space with single row buffer.", 45),

                new PatternDef("Partition DP", "partition-dp", "dynamic-programming", List.of("arrays"),
                        "Splitting an array into optimal subarrays where each split costs a subproblem evaluation.",
                        "Evaluates optimal cut positions k between indices i and j: dp[i][j] = min_k(dp[i][k] + dp[k+1][j] + cost).",
                        "Use for palindrome partitioning II, matrix chain multiplication, and bursting balloons.",
                        "Keywords: 'burst balloons', 'palindrome partitioning minimum cuts', 'minimum cost to cut a stick'.",
                        "Iterate by subproblem length len from 1 to N, then left index i, then partition cut k from i to j.",
                        "O(N^3) time.", "O(N^2) state table.", 46),

                new PatternDef("Memoization and Tabulation", "memoization-tabulation", "dynamic-programming", List.of("recursion"),
                        "Converting recursive solutions to cached states (memoization) or iterative loops (tabulation).",
                        "Memoization preserves natural recursive thinking with top-down cache lookup; tabulation removes recursion stack overhead via bottom-up table fills.",
                        "Use when determining the best formulation strategy for intricate DP state spaces.",
                        "Keywords: 'top down vs bottom up', 'memoization cache', 'table fill order'.",
                        "Memoization: Map<State, Res> or int[] memo. Check if key in memo before executing recursion body. Tabulation: topological loop order.",
                        "O(States * Transitions) time.", "O(States) space.", 47),

                // Other Patterns (48-52)
                new PatternDef("Greedy Strategy", "greedy-strategy", "greedy-algorithms", List.of("sorting"),
                        "Making locally optimal choices to produce a globally optimal outcome.",
                        "Proves that committing to the best current candidate without backtracking preserves global optimality.",
                        "Use for gas station, jump game, task scheduler, and candy distribution.",
                        "Keywords: 'jump game', 'gas station', 'assign cookies', 'reorganize string'.",
                        "Sort if necessary. Make immediate irrevocable greedy selection, maintaining running resources or constraints.",
                        "O(N) or O(N log N) if sorting needed.", "O(1) memory.", 48),

                new PatternDef("Bit Manipulation", "bit-manipulation-pattern", "bit-manipulation", List.of("arrays"),
                        "Using binary bitwise AND, OR, XOR, NOT, and shifts for O(1) operations.",
                        "XOR properties (x ^ x = 0, x ^ 0 = x) cancel duplicates; (n & (n - 1)) clears lowest set bit; (1 << k) checks bit k.",
                        "Use for single number, counting bits, power of two, and reverse bits.",
                        "Keywords: 'single number', 'bitwise operations', 'hamming weight', 'power of two'.",
                        "Use bitwise operators directly. Combine XOR across arrays to cancel out identical pairs in O(N) time and O(1) space.",
                        "O(1) or O(N) time.", "O(1) auxiliary space.", 49),

                new PatternDef("Trie-Based Searching", "trie-based-searching", "tries", List.of("strings"),
                        "Prefix-tree navigation for rapid string lookups and autocomplete matching.",
                        "Each node contains an array of child links for each character (e.g., TrieNode[26]), allowing O(L) prefix searches independent of dictionary size.",
                        "Use for implement trie, word search II, design add and search words, and replace words.",
                        "Keywords: 'prefix search', 'autocomplete', 'dictionary words in grid', 'trie'.",
                        "TrieNode contains children Map/Array and isEndOfWord flag. Insert string by traversing and creating nodes. Search by matching characters.",
                        "O(L) time where L is word length.", "O(Total_Characters * Alphabet_Size) memory.", 50),

                new PatternDef("Heap / Top K Elements", "heap-top-k-elements", "heap-priority-queue", List.of("sorting"),
                        "Using min-heap of size K or max-heap to track extreme elements efficiently.",
                        "Maintains a min-heap bounded at size K: when size exceeds K, the smallest element is popped, leaving the top K largest items.",
                        "Use for Kth largest element in array, top K frequent words, and find median from data stream.",
                        "Keywords: 'kth largest element', 'top k frequent', 'continuous median'.",
                        "PriorityQueue<Integer> minHeap = new PriorityQueue<>(); for each num: minHeap.offer(num); if (minHeap.size() > k) minHeap.poll(); return minHeap.peek().",
                        "O(N log K) time, vastly superior to O(N log N) full sorting when K << N.", "O(K) heap space.", 51),

                new PatternDef("Divide and Conquer", "divide-and-conquer", "recursion", List.of("sorting", "searching"),
                        "Breaking a problem into non-overlapping subproblems, solving each recursively, and combining.",
                        "Splits problem into independent halves, recurses on both, and merges results in linear or sublinear time.",
                        "Use for merge sort, merge K sorted lists, construct binary tree from preorder/inorder, and Kth largest via quickselect.",
                        "Keywords: 'merge k sorted lists', 'divide and conquer', 'quickselect'.",
                        "Divide problem into left and right halves. Recursively call solve(left), solve(right). Merge both halves into combined solution.",
                        "O(N log N) standard recurrence T(N) = 2T(N/2) + O(N).", "O(log N) recursion depth.", 52)
        );

        Map<String, Pattern> result = new HashMap<>();

        for (PatternDef def : definitions) {
            Topic primaryTopic = topics.get(def.primaryTopicSlug);
            String primaryTopicId = primaryTopic != null ? primaryTopic.getId() : "";

            List<String> relatedIds = new ArrayList<>();
            for (String relSlug : def.relatedTopicSlugs) {
                Topic relTopic = topics.get(relSlug);
                if (relTopic != null && !relTopic.getId().equals(primaryTopicId)) {
                    relatedIds.add(relTopic.getId());
                }
            }

            Pattern pattern = patternRepository.findBySlug(def.slug).orElseGet(Pattern::new);
            pattern.setName(def.name);
            pattern.setSlug(def.slug);
            pattern.setTopicId(primaryTopicId);
            pattern.setRelatedTopicIds(relatedIds);
            pattern.setDescription(def.description);
            pattern.setDetailedExplanation(def.detailedExplanation);
            pattern.setWhenToUse(def.whenToUse);
            pattern.setHowToRecognize(def.howToRecognize);
            pattern.setBasicApproach(def.basicApproach);
            pattern.setTimeComplexityOverview(def.timeComplexityOverview);
            pattern.setSpaceComplexityOverview(def.spaceComplexityOverview);
            pattern.setDisplayOrder(def.displayOrder);
            pattern.setActive(true);
            if (pattern.getCreatedAt() == null) {
                pattern.setCreatedAt(Instant.now());
            }
            pattern.setUpdatedAt(Instant.now());

            Pattern saved = patternRepository.save(pattern);
            result.put(def.slug, saved);
        }

        return result;
    }

    // ==========================================
    // 3. CURATED PRACTICE QUESTIONS
    // ==========================================
    private int initializeQuestions(Map<String, Pattern> patterns) {
        List<QuestionSeedDef> qDefs = List.of(
                // Two Pointers
                new QuestionSeedDef("two-pointers-pattern", "Valid Palindrome", "EASY", "https://leetcode.com/problems/valid-palindrome/"),
                new QuestionSeedDef("two-pointers-pattern", "Two Sum II - Input Array Is Sorted", "MEDIUM", "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/"),
                new QuestionSeedDef("two-pointers-pattern", "3Sum", "MEDIUM", "https://leetcode.com/problems/3sum/"),
                new QuestionSeedDef("two-pointers-pattern", "Container With Most Water", "MEDIUM", "https://leetcode.com/problems/container-with-most-water/"),
                new QuestionSeedDef("two-pointers-pattern", "Trapping Rain Water", "HARD", "https://leetcode.com/problems/trapping-rain-water/"),

                // Sliding Window
                new QuestionSeedDef("sliding-window-pattern", "Best Time to Buy and Sell Stock", "EASY", "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"),
                new QuestionSeedDef("sliding-window-pattern", "Longest Substring Without Repeating Characters", "MEDIUM", "https://leetcode.com/problems/longest-substring-without-repeating-characters/"),
                new QuestionSeedDef("sliding-window-pattern", "Longest Repeating Character Replacement", "MEDIUM", "https://leetcode.com/problems/longest-repeating-character-replacement/"),
                new QuestionSeedDef("sliding-window-pattern", "Minimum Window Substring", "HARD", "https://leetcode.com/problems/minimum-window-substring/"),

                // Fixed Size Sliding Window
                new QuestionSeedDef("fixed-size-sliding-window", "Maximum Average Subarray I", "EASY", "https://leetcode.com/problems/maximum-average-subarray-i/"),
                new QuestionSeedDef("fixed-size-sliding-window", "Permutation in String", "MEDIUM", "https://leetcode.com/problems/permutation-in-string/"),
                new QuestionSeedDef("fixed-size-sliding-window", "Find All Anagrams in a String", "MEDIUM", "https://leetcode.com/problems/find-all-anagrams-in-a-string/"),

                // Variable Size Sliding Window
                new QuestionSeedDef("variable-size-sliding-window", "Minimum Size Subarray Sum", "MEDIUM", "https://leetcode.com/problems/minimum-size-subarray-sum/"),
                new QuestionSeedDef("variable-size-sliding-window", "Fruit Into Baskets", "MEDIUM", "https://leetcode.com/problems/fruit-into-baskets/"),

                // Prefix Sum
                new QuestionSeedDef("prefix-sum-pattern", "Range Sum Query - Immutable", "EASY", "https://leetcode.com/problems/range-sum-query-immutable/"),
                new QuestionSeedDef("prefix-sum-pattern", "Find Pivot Index", "EASY", "https://leetcode.com/problems/find-pivot-index/"),
                new QuestionSeedDef("prefix-sum-pattern", "Subarray Sum Equals K", "MEDIUM", "https://leetcode.com/problems/subarray-sum-equals-k/"),
                new QuestionSeedDef("prefix-sum-pattern", "Continuous Subarray Sum", "MEDIUM", "https://leetcode.com/problems/continuous-subarray-sum/"),

                // Difference Array
                new QuestionSeedDef("difference-array", "Corporate Flight Bookings", "MEDIUM", "https://leetcode.com/problems/corporate-flight-bookings/"),
                new QuestionSeedDef("difference-array", "Car Pooling", "MEDIUM", "https://leetcode.com/problems/car-pooling/"),

                // Kadane's Algorithm
                new QuestionSeedDef("kadanes-algorithm", "Maximum Subarray", "MEDIUM", "https://leetcode.com/problems/maximum-subarray/"),
                new QuestionSeedDef("kadanes-algorithm", "Maximum Sum Circular Subarray", "MEDIUM", "https://leetcode.com/problems/maximum-sum-circular-subarray/"),

                // HashMap / Frequency Counting
                new QuestionSeedDef("hashmap-frequency-counting", "Two Sum", "EASY", "https://leetcode.com/problems/two-sum/"),
                new QuestionSeedDef("hashmap-frequency-counting", "Valid Anagram", "EASY", "https://leetcode.com/problems/valid-anagram/"),
                new QuestionSeedDef("hashmap-frequency-counting", "Group Anagrams", "MEDIUM", "https://leetcode.com/problems/group-anagrams/"),
                new QuestionSeedDef("hashmap-frequency-counting", "Top K Frequent Elements", "MEDIUM", "https://leetcode.com/problems/top-k-frequent-elements/"),

                // Sorting
                new QuestionSeedDef("sorting-based-techniques", "Merge Intervals", "MEDIUM", "https://leetcode.com/problems/merge-intervals/"),
                new QuestionSeedDef("sorting-based-techniques", "Non-overlapping Intervals", "MEDIUM", "https://leetcode.com/problems/non-overlapping-intervals/"),

                // Binary Search
                new QuestionSeedDef("binary-search-pattern", "Binary Search", "EASY", "https://leetcode.com/problems/binary-search/"),
                new QuestionSeedDef("binary-search-pattern", "Search a 2D Matrix", "MEDIUM", "https://leetcode.com/problems/search-a-2d-matrix/"),
                new QuestionSeedDef("binary-search-pattern", "Find Minimum in Rotated Sorted Array", "MEDIUM", "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/"),
                new QuestionSeedDef("binary-search-pattern", "Search in Rotated Sorted Array", "MEDIUM", "https://leetcode.com/problems/search-in-rotated-sorted-array/"),

                // Binary Search on Answer
                new QuestionSeedDef("binary-search-on-answer", "Koko Eating Bananas", "MEDIUM", "https://leetcode.com/problems/koko-eating-bananas/"),
                new QuestionSeedDef("binary-search-on-answer", "Capacity To Ship Packages Within D Days", "MEDIUM", "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/"),
                new QuestionSeedDef("binary-search-on-answer", "Split Array Largest Sum", "HARD", "https://leetcode.com/problems/split-array-largest-sum/"),

                // Dutch National Flag
                new QuestionSeedDef("dutch-national-flag", "Sort Colors", "MEDIUM", "https://leetcode.com/problems/sort-colors/"),

                // Matrix Traversal
                new QuestionSeedDef("matrix-traversal", "Spiral Matrix", "MEDIUM", "https://leetcode.com/problems/spiral-matrix/"),
                new QuestionSeedDef("matrix-traversal", "Rotate Image", "MEDIUM", "https://leetcode.com/problems/rotate-image/"),
                new QuestionSeedDef("matrix-traversal", "Set Matrix Zeroes", "MEDIUM", "https://leetcode.com/problems/set-matrix-zeroes/"),

                // Linked List
                new QuestionSeedDef("fast-slow-pointers", "Linked List Cycle", "EASY", "https://leetcode.com/problems/linked-list-cycle/"),
                new QuestionSeedDef("fast-slow-pointers", "Middle of the Linked List", "EASY", "https://leetcode.com/problems/middle-of-the-linked-list/"),
                new QuestionSeedDef("linked-list-reversal", "Reverse Linked List", "EASY", "https://leetcode.com/problems/reverse-linked-list/"),
                new QuestionSeedDef("linked-list-reversal", "Reverse Linked List II", "MEDIUM", "https://leetcode.com/problems/reverse-linked-list-ii/"),
                new QuestionSeedDef("merge-two-sorted-lists", "Merge Two Sorted Lists", "EASY", "https://leetcode.com/problems/merge-two-sorted-lists/"),
                new QuestionSeedDef("dummy-node-technique", "Remove Nth Node From End of List", "MEDIUM", "https://leetcode.com/problems/remove-nth-node-from-end-of-list/"),
                new QuestionSeedDef("cycle-detection", "Linked List Cycle II", "MEDIUM", "https://leetcode.com/problems/linked-list-cycle-ii/"),

                // Stack and Queue
                new QuestionSeedDef("monotonic-stack", "Daily Temperatures", "MEDIUM", "https://leetcode.com/problems/daily-temperatures/"),
                new QuestionSeedDef("monotonic-stack", "Largest Rectangle in Histogram", "HARD", "https://leetcode.com/problems/largest-rectangle-in-histogram/"),
                new QuestionSeedDef("monotonic-queue", "Sliding Window Maximum", "HARD", "https://leetcode.com/problems/sliding-window-maximum/"),
                new QuestionSeedDef("next-greater-element", "Next Greater Element I", "EASY", "https://leetcode.com/problems/next-greater-element-i/"),
                new QuestionSeedDef("stack-expression-processing", "Valid Parentheses", "EASY", "https://leetcode.com/problems/valid-parentheses/"),
                new QuestionSeedDef("stack-expression-processing", "Evaluate Reverse Polish Notation", "MEDIUM", "https://leetcode.com/problems/evaluate-reverse-polish-notation/"),
                new QuestionSeedDef("bfs-level-order-traversal", "Binary Tree Level Order Traversal", "MEDIUM", "https://leetcode.com/problems/binary-tree-level-order-traversal/"),

                // Trees
                new QuestionSeedDef("dfs-traversal", "Maximum Depth of Binary Tree", "EASY", "https://leetcode.com/problems/maximum-depth-of-binary-tree/"),
                new QuestionSeedDef("dfs-traversal", "Path Sum", "EASY", "https://leetcode.com/problems/path-sum/"),
                new QuestionSeedDef("tree-recursion", "Invert Binary Tree", "EASY", "https://leetcode.com/problems/invert-binary-tree/"),
                new QuestionSeedDef("tree-recursion", "Symmetric Tree", "EASY", "https://leetcode.com/problems/symmetric-tree/"),
                new QuestionSeedDef("bst-properties", "Validate Binary Search Tree", "MEDIUM", "https://leetcode.com/problems/validate-binary-search-tree/"),
                new QuestionSeedDef("bst-properties", "Kth Smallest Element in a BST", "MEDIUM", "https://leetcode.com/problems/kth-smallest-element-in-a-bst/"),
                new QuestionSeedDef("lowest-common-ancestor", "Lowest Common Ancestor of a Binary Search Tree", "MEDIUM", "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/"),
                new QuestionSeedDef("lowest-common-ancestor", "Lowest Common Ancestor of a Binary Tree", "MEDIUM", "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/"),
                new QuestionSeedDef("tree-diameter", "Diameter of Binary Tree", "EASY", "https://leetcode.com/problems/diameter-of-binary-tree/"),
                new QuestionSeedDef("tree-diameter", "Binary Tree Maximum Path Sum", "HARD", "https://leetcode.com/problems/binary-tree-maximum-path-sum/"),

                // Graphs
                new QuestionSeedDef("graph-dfs", "Number of Islands", "MEDIUM", "https://leetcode.com/problems/number-of-islands/"),
                new QuestionSeedDef("graph-dfs", "Clone Graph", "MEDIUM", "https://leetcode.com/problems/clone-graph/"),
                new QuestionSeedDef("graph-bfs", "Shortest Path in Binary Matrix", "MEDIUM", "https://leetcode.com/problems/shortest-path-in-binary-matrix/"),
                new QuestionSeedDef("graph-bfs", "Rotting Oranges", "MEDIUM", "https://leetcode.com/problems/rotting-oranges/"),
                new QuestionSeedDef("topological-sorting", "Course Schedule", "MEDIUM", "https://leetcode.com/problems/course-schedule/"),
                new QuestionSeedDef("topological-sorting", "Course Schedule II", "MEDIUM", "https://leetcode.com/problems/course-schedule-ii/"),
                new QuestionSeedDef("shortest-path", "Network Delay Time", "MEDIUM", "https://leetcode.com/problems/network-delay-time/"),
                new QuestionSeedDef("union-find-dsu", "Redundant Connection", "MEDIUM", "https://leetcode.com/problems/redundant-connection/"),
                new QuestionSeedDef("union-find-dsu", "Number of Provinces", "MEDIUM", "https://leetcode.com/problems/number-of-provinces/"),
                new QuestionSeedDef("minimum-spanning-tree", "Min Cost to Connect All Points", "MEDIUM", "https://leetcode.com/problems/min-cost-to-connect-all-points/"),

                // Backtracking
                new QuestionSeedDef("subsets-pattern", "Subsets", "MEDIUM", "https://leetcode.com/problems/subsets/"),
                new QuestionSeedDef("subsets-pattern", "Subsets II", "MEDIUM", "https://leetcode.com/problems/subsets-ii/"),
                new QuestionSeedDef("permutations-pattern", "Permutations", "MEDIUM", "https://leetcode.com/problems/permutations/"),
                new QuestionSeedDef("combinations-pattern", "Combination Sum", "MEDIUM", "https://leetcode.com/problems/combination-sum/"),
                new QuestionSeedDef("backtracking-constraints", "N-Queens", "HARD", "https://leetcode.com/problems/n-queens/"),
                new QuestionSeedDef("backtracking-constraints", "Word Search", "MEDIUM", "https://leetcode.com/problems/word-search/"),

                // Dynamic Programming
                new QuestionSeedDef("1d-dynamic-programming", "Climbing Stairs", "EASY", "https://leetcode.com/problems/climbing-stairs/"),
                new QuestionSeedDef("1d-dynamic-programming", "House Robber", "MEDIUM", "https://leetcode.com/problems/house-robber/"),
                new QuestionSeedDef("1d-dynamic-programming", "Coin Change", "MEDIUM", "https://leetcode.com/problems/coin-change/"),
                new QuestionSeedDef("2d-dynamic-programming", "Unique Paths", "MEDIUM", "https://leetcode.com/problems/unique-paths/"),
                new QuestionSeedDef("2d-dynamic-programming", "Edit Distance", "MEDIUM", "https://leetcode.com/problems/edit-distance/"),
                new QuestionSeedDef("knapsack-pattern", "Partition Equal Subset Sum", "MEDIUM", "https://leetcode.com/problems/partition-equal-subset-sum/"),
                new QuestionSeedDef("longest-common-subsequence", "Longest Common Subsequence", "MEDIUM", "https://leetcode.com/problems/longest-common-subsequence/"),
                new QuestionSeedDef("longest-increasing-subsequence", "Longest Increasing Subsequence", "MEDIUM", "https://leetcode.com/problems/longest-increasing-subsequence/"),
                new QuestionSeedDef("grid-dp", "Minimum Path Sum", "MEDIUM", "https://leetcode.com/problems/minimum-path-sum/"),
                new QuestionSeedDef("partition-dp", "Palindrome Partitioning", "MEDIUM", "https://leetcode.com/problems/palindrome-partitioning/"),
                new QuestionSeedDef("partition-dp", "Burst Balloons", "HARD", "https://leetcode.com/problems/burst-balloons/"),
                new QuestionSeedDef("memoization-tabulation", "Fibonacci Number", "EASY", "https://leetcode.com/problems/fibonacci-number/"),

                // Other Patterns
                new QuestionSeedDef("greedy-strategy", "Jump Game", "MEDIUM", "https://leetcode.com/problems/jump-game/"),
                new QuestionSeedDef("greedy-strategy", "Gas Station", "MEDIUM", "https://leetcode.com/problems/gas-station/"),
                new QuestionSeedDef("bit-manipulation-pattern", "Single Number", "EASY", "https://leetcode.com/problems/single-number/"),
                new QuestionSeedDef("bit-manipulation-pattern", "Number of 1 Bits", "EASY", "https://leetcode.com/problems/number-of-1-bits/"),
                new QuestionSeedDef("trie-based-searching", "Implement Trie (Prefix Tree)", "MEDIUM", "https://leetcode.com/problems/implement-trie-prefix-tree/"),
                new QuestionSeedDef("trie-based-searching", "Word Search II", "HARD", "https://leetcode.com/problems/word-search-ii/"),
                new QuestionSeedDef("heap-top-k-elements", "Kth Largest Element in an Array", "MEDIUM", "https://leetcode.com/problems/kth-largest-element-in-an-array/"),
                new QuestionSeedDef("heap-top-k-elements", "Find Median from Data Stream", "HARD", "https://leetcode.com/problems/find-median-from-data-stream/"),
                new QuestionSeedDef("divide-and-conquer", "Merge k Sorted Lists", "HARD", "https://leetcode.com/problems/merge-k-sorted-lists/")
        );

        int count = 0;
        List<Question> existingQuestions = questionRepository.findAll();

        for (QuestionSeedDef def : qDefs) {
            Pattern pattern = patterns.get(def.patternSlug);
            if (pattern == null) continue;

            boolean exists = existingQuestions.stream()
                    .anyMatch(q -> q.getTitle().equalsIgnoreCase(def.title) && q.getPatternId().equals(pattern.getId()));

            if (!exists) {
                Question q = new Question();
                q.setPatternId(pattern.getId());
                q.setTitle(def.title);
                q.setDifficulty(def.difficulty);
                q.setExternalUrl(def.url);
                q.setActive(true);
                q.setCreatedAt(Instant.now());
                questionRepository.save(q);
                count++;
            }
        }

        return count;
    }

    private record TopicDef(String name, String slug, String description, String detailedLearningDescription, int displayOrder, String icon) {}
    private record PatternDef(String name, String slug, String primaryTopicSlug, List<String> relatedTopicSlugs,
                              String description, String detailedExplanation, String whenToUse, String howToRecognize,
                              String basicApproach, String timeComplexityOverview, String spaceComplexityOverview, int displayOrder) {}
    private record QuestionSeedDef(String patternSlug, String title, String difficulty, String url) {}
}
