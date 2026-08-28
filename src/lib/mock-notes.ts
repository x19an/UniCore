import { Course, Note } from "./types";
export type { Note } from "./types";

export const MOCK_COURSES: Course[] = [
  {
    id: "a1000000-0000-4000-8000-000000000001",
    name: "Introduction to Computer Science",
    code: "CS101",
    days: ["Mon", "Wed"],
    creditHours: 3,
    requiredAttendance: 75,
  },
  {
    id: "a1000000-0000-4000-8000-000000000002",
    name: "Data Structures and Algorithms",
    code: "CS201",
    days: ["Tue", "Thu"],
    creditHours: 4,
    requiredAttendance: 80,
  },
  {
    id: "a1000000-0000-4000-8000-000000000003",
    name: "Artificial Intelligence",
    code: "CS401",
    days: ["Mon", "Fri"],
    creditHours: 3,
    requiredAttendance: 75,
  },
];

export const MOCK_NOTES: Note[] = [
  {
    id: "b1000000-0000-4000-8000-000000000001",
    courseId: "a1000000-0000-4000-8000-000000000001",
    courseName: "Introduction to Computer Science",
    title: "Variables, Types, and Memory Model",
    date: "2026-08-10",
    lectureNumber: 1,
    content: `
# Variables and Data Types

In this introductory lecture, we explored how programming languages manage state and interact with memory.

## Fundamental Primitive Types
- **Integer**: 32-bit or 64-bit whole numbers (e.g. \`42\`, \`-17\`).
- **Float/Double**: IEEE 754 floating-point representations for decimals (e.g. \`3.14159\`).
- **Boolean**: Logical flags evaluated to \`true\` or \`false\`.
- **Character & String**: UTF-8 and ASCII encoded textual sequences.

## Variable Declaration & Scope
\`\`\`typescript
// Block-scoped constant declaration
const maxRetries: number = 3;

// Mutable variable with type inference
let currentAttempt = 0;
while (currentAttempt < maxRetries) {
  console.log(\`Attempt \${currentAttempt + 1}\`);
  currentAttempt++;
}
\`\`\`

> [!NOTE]
> Always declare variables with the narrowest scope possible to prevent unexpected side effects and state pollution.

### Key Takeaways
- Static typing catches discrepancies during compilation.
- Stack vs Heap memory allocation dictates variable lifecycle.
    `.trim(),
    tags: ["basics", "variables", "memory", "types"],
  },
  {
    id: "b1000000-0000-4000-8000-000000000002",
    courseId: "a1000000-0000-4000-8000-000000000001",
    courseName: "Introduction to Computer Science",
    title: "Control Flow and Iteration Patterns",
    date: "2026-08-12",
    lectureNumber: 2,
    content: `
# Control Structures and Loops

Control structures dictate the path of code execution based on conditional predicates.

## Branching Logic
1. **Selection Statements**: \`if\`, \`else if\`, \`else\`, and \`switch\` patterns.
2. **Short-Circuit Evaluation**: Using logical AND (\`&&\`) and OR (\`||\`) for early bailouts.

\`\`\`python
def process_user(user):
    if not user or not user.is_active:
        return None
    return user.get_profile()
\`\`\`

## Iteration Constructs
- **For Loops**: Best when the iteration count or collection bounds are known.
- **While Loops**: Best for event loops or non-deterministic termination conditions.
- **Do-While Loops**: Guarantees at least one execution pass before evaluating the test predicate.

> [!WARNING]
> Ensure loop invariant conditions advance toward termination to prevent infinite cycles.
    `.trim(),
    tags: ["loops", "branching", "control-flow"],
  },
  {
    id: "b1000000-0000-4000-8000-000000000003",
    courseId: "a1000000-0000-4000-8000-000000000002",
    courseName: "Data Structures and Algorithms",
    title: "Arrays vs Linked Lists Complexity Analysis",
    date: "2026-08-15",
    lectureNumber: 1,
    content: `
# Linear Data Structures: Arrays & Linked Lists

A deep dive into memory layout, cache locality, and asymptotic time complexity.

## Complexity Comparison

| Operation | Dynamic Array | Singly Linked List | Doubly Linked List |
| :--- | :--- | :--- | :--- |
| Random Access (\`[i]\`) | **O(1)** | O(n) | O(n) |
| Insert at Head | O(n) | **O(1)** | **O(1)** |
| Insert at Tail | **O(1)** amortized | O(n) or O(1) w/ tail | **O(1)** |
| Delete Node (given pointer) | O(n) | O(n) | **O(1)** |

## Memory & Hardware Locality
- **Arrays**: Occupy contiguous memory blocks, resulting in high CPU cache line utilization and predictive prefetching.
- **Linked Lists**: Dispersed memory allocations across the heap, incurring pointer overhead and cache misses.

\`\`\`cpp
struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};
\`\`\`
    `.trim(),
    tags: ["arrays", "linked-lists", "big-o", "performance"],
  },
  {
    id: "b1000000-0000-4000-8000-000000000004",
    courseId: "a1000000-0000-4000-8000-000000000002",
    courseName: "Data Structures and Algorithms",
    title: "Stacks, Queues, and Priority Buffers",
    date: "2026-08-17",
    lectureNumber: 2,
    content: `
# Stacks, Queues & Deques

Abstract data types for ordered sequential processing.

## 1. Stacks (LIFO - Last In First Out)
- **Primary Operations**: \`push(item)\`, \`pop()\`, \`peek()\`
- **Applications**:
  - Compiler syntax parsing & parenthesis balancing
  - Call stack and recursion unwinding
  - Browser navigation history and undo/redo stacks

## 2. Queues (FIFO - First In First Out)
- **Primary Operations**: \`enqueue(item)\`, \`dequeue()\`, \`front()\`
- **Applications**:
  - CPU job scheduling and message broker buffers
  - Breadth-First Search (BFS) graph traversal

\`\`\`typescript
class Queue<T> {
  private items: T[] = [];
  
  enqueue(item: T): void {
    this.items.push(item);
  }
  
  dequeue(): T | undefined {
    return this.items.shift();
  }
  
  peek(): T | undefined {
    return this.items[0];
  }
}
\`\`\`
    `.trim(),
    tags: ["stacks", "queues", "algorithms", "bfs"],
  },
  {
    id: "b1000000-0000-4000-8000-000000000005",
    courseId: "a1000000-0000-4000-8000-000000000003",
    courseName: "Artificial Intelligence",
    title: "Foundations of Machine Learning & Optimization",
    date: "2026-08-18",
    lectureNumber: 1,
    content: `
# Introduction to Machine Learning Paradigms

Machine learning allows computational systems to discern underlying statistical patterns without explicit hard-coded rules.

## Core Learning Categories

### 1. Supervised Learning
- Trained on ground truth labeled datasets \`{(x_i, y_i)}\`.
- **Classification**: Discrete targets (e.g. spam detection, image categorization).
- **Regression**: Continuous targets (e.g. house price forecasting, temperature trends).

### 2. Unsupervised Learning
- Uncovers latent structures in unlabeled feature spaces \`{x_i}\`.
- **Clustering**: K-Means, DBSCAN, Hierarchical Clustering.
- **Dimensionality Reduction**: Principal Component Analysis (PCA), t-SNE, UMAP.

### 3. Reinforcement Learning
- Agent discovers optimal policy \`pi(a|s)\` via environment exploration and scalar reward signals.

## Gradient Descent Optimization
\`\`\`python
# Gradient descent parameter update
# theta = theta - learning_rate * grad(Loss)
def update_weights(w, b, dw, db, lr=0.01):
    w -= lr * dw
    b -= lr * db
    return w, b
\`\`\`
    `.trim(),
    tags: ["machine-learning", "ai", "optimization", "gradients"],
  },
];
