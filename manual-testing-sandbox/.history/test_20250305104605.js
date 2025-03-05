class Calculator {
  constructor() {
    this.result = 0;
  }

  add(number) {
    this.result += number;
    return this;
  }
  subtract(number) {
    this.result -= number;
    return this;
  }
  multiply(number) {
    this.result *= number;
    return this;
  }

  divide(number) {
    if (number === 0) {
      throw new Error("Cannot divide by zero");
    }
    this.result /= number;
    return this;
  }
  modulo(number) {
    if (number === 0) {
      throw new Error("Cannot modulo by zero");
    }
    this.result %= number;
    return this;
  }
  /**
   *  Retourne le résultat courant.
   *  @returns {number} Le résultat.
   */
  getResult() {
    return this.result;
  }

  /**
   * Réinitialise le résultat à 0.
   * @returns {object} L'objet lui-même pour permettre l'enchaînement des méthodes.
   */
  reset() {
    this.result = 0;
    return this;
  }
}