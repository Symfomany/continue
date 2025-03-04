/**
 * A simple calculator class that performs basic arithmetic operations.
 * Supports method chaining for fluent API.
 */

class Calculator {
  /**
   * Creates a new Calculator instance.
   * Initializes the result to 0.
   */
  constructor() {
    this.result = 0;
  }

  add(number) {
    this.result += number;
    return this;
  }
  /**
   * Subtracts a number from the current result.
   * @param {number} number The number to subtract.
   * @returns {Calculator} The Calculator object for method chaining.
   * @throws {Error} If the input is not a number.
   */
  subtract(number) {
    if (typeof number !== 'number') {
      throw new Error("Input must be a number");
    }
    this.result -= number;
    return this;
  }

  /**
   * Multiplies the current result by a number.
   * @param {number} number The number to multiply by.
   * @returns {Calculator} The Calculator object for method chaining.
   * @throws {Error} If the input is not a number.
   */
  multiply(number) {
    if (typeof number !== 'number') {
      throw new Error("Input must be a number");
    }
    this.result *= number;
    return this;
  }

  /**
   * Divides the current result by a number.
   * @param {number} number The number to divide by.
   * @returns {Calculator} The Calculator object for method chaining.
   * @throws {Error} If the input is not a number or if the number is zero.
   */
  divide(number) {
    if (typeof number !== 'number') {
      throw new Error("Input must be a number");
    }
    if (number === 0) {
      throw new Error("Cannot divide by zero");
    }
    this.result /= number;
    return this;
  }
  getResult() {
    return this.result;
  }

  reset() {
    this.result = 0;
    return this;
  }
}


