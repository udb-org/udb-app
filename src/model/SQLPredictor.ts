type State = string;
type StateSequence = string;
type SQL = string;

interface PredictionResult {
  sqlPattern: State;
  probability: number;
  explanation: string;
}

class SQLPredictor {
  private order: number;
  private smoothAlpha: number;
  private transitionCounts: Map<StateSequence, Map<State, number>>;
  private globalFreq: Map<State, number>;
  private stateCache: Map<SQL, State>;

  constructor(order: number = 1, smoothAlpha: number = 0.1) {
    this.order = order;
    this.smoothAlpha = smoothAlpha;
    this.transitionCounts = new Map();
    this.globalFreq = new Map();
    this.stateCache = new Map();
  }

  private sqlToState(sql: SQL): State {
    if (this.stateCache.has(sql)) {
      return this.stateCache.get(sql)!;
    }

    // Normalization
    const cleanSql = sql.toLowerCase().trim().replace(/\s+/g, ' ');
    
    // Extract operation
    const opMatch = cleanSql.match(/^(select|insert|update|delete|create|drop|alter)\b/);
    const op = opMatch ? opMatch[1] : 'other';
    
    // Extract primary table
    let table: string | null = null;
    const tableMatch = cleanSql.match(/(?:from|join|into|update|table)\s+(\w+)/i);
    if (tableMatch) {
      table = tableMatch[1];
    }
    
    // Generate state
    const state = table ? `${op}_${table}` : op;
    this.stateCache.set(sql, state);
    return state;
  }

  train(history: SQL[]): void {
    const states = history.map(sql => this.sqlToState(sql));
    
    // Update global frequency
    states.forEach(state => {
      this.globalFreq.set(state, (this.globalFreq.get(state) || 0) + 1);
    });

    // Build transition matrix
    for (let i = 0; i < states.length - this.order; i++) {
      const currentStates = states.slice(i, i + this.order);
      const nextState = states[i + this.order];
      const sequenceKey = currentStates.join('|');
      
      const transitions = this.transitionCounts.get(sequenceKey) || new Map<State, number>();
      transitions.set(nextState, (transitions.get(nextState) || 0) + 1);
      this.transitionCounts.set(sequenceKey, transitions);
    }
  }

  predict(currentSequence: SQL[], topK: number = 3): PredictionResult[] {
    const currentStates = currentSequence.map(sql => this.sqlToState(sql));
    
    if (currentStates.length !== this.order) {
      throw new Error(`Input sequence length must be ${this.order}`);
    }

    const sequenceKey = currentStates.join('|');
    const transitions = this.transitionCounts.get(sequenceKey) || new Map<State, number>();
    
    // Calculate total count with smoothing
    const totalTransitions = Array.from(transitions.values()).reduce((sum, count) => sum + count, 0);
    const total = totalTransitions + this.smoothAlpha * this.globalFreq.size;

    // Collect all possible states
    const candidates: Array<{ state: State; count: number }> = [];
    
    // Add observed transitions
    transitions.forEach((count, state) => {
      candidates.push({ state, count });
    });

    // Add smoothed unseen transitions
    this.globalFreq.forEach((_, state) => {
      if (!transitions.has(state)) {
        candidates.push({ state, count: 0 });
      }
    });

    // Calculate probabilities
    return candidates
      .map(({ state, count }) => ({
        state,
        probability: (count + this.smoothAlpha) / total
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, topK)
      .map(item => ({
        sqlPattern: item.state,
        probability: item.probability,
        explanation: this.generateExplanation(currentStates, item.state)
      }));
  }

  private generateExplanation(currentStates: State[], predictedState: State): string {
    const history = currentStates.join(' → ');
    return `Based on pattern [${history}], next likely operation is ${predictedState}`;
  }
}

// Example Usage
function main() {
  // Sample training data
  const trainingData: SQL[] = [
    "SELECT * FROM users WHERE id = 100",
    "UPDATE users SET last_login = NOW() WHERE id = 100",
    "INSERT INTO logs (user_id, action) VALUES (100, 'login')",
    "SELECT * FROM orders WHERE user_id = 100",
    "UPDATE orders SET status = 'shipped' WHERE user_id = 100",
    "SELECT * FROM users WHERE id = 200",
    "DELETE FROM sessions WHERE user_id = 200",
  ];

  // Initialize predictor
  const predictor = new SQLPredictor(2);
  predictor.train(trainingData);

  // Test predictions
  const testCases: SQL[][] = [
    [
      "SELECT * FROM users WHERE id = 300",
      "UPDATE users SET status = 'active'"
    ],
    [
      "DELETE FROM products WHERE id = 500",
      "INSERT INTO audit_log (msg) VALUES ('test')"
    ]
  ];

  testCases.forEach((sequence, index) => {
    console.log(`\nTest Case #${index + 1}:`);
    try {
      const results = predictor.predict(sequence);
      console.log(`Input Sequence:`);
      sequence.forEach(sql => console.log(`  ${sql}`));
      console.log('Predictions:');
      results.forEach(result => {
        console.log(`  ${result.sqlPattern.padEnd(20)} Probability: ${result.probability.toFixed(4)}`);
        console.log(`  Explanation: ${result.explanation}`);
      });
    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
  });
}

main();