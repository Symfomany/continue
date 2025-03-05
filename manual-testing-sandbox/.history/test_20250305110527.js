/**
 * Classe permettant de réaliser des calculs enchaînés.
 */
class Calculator {
  constructor() {
    /**
     * Résultat courant du calcul.
     * @type {number}
     */
    this.result = 0;
  }

  /**
   * Ajoute un nombre au résultat courant.
   * @param {number} number - Le nombre à ajouter.
   * @returns {Calculator} L'instance de la classe Calculator pour permettre l'enchaînement des méthodes.
   * @throws {Error} Si le paramètre n'est pas un nombre.
   */
  add(number) {
    if (typeof number !== 'number') {
      throw new Error("Le paramètre doit être un nombre.");
    }
    this.result += number;
    return this;
  }

  /**
   * Soustrait un nombre au résultat courant.
   * @param {number} number - Le nombre à soustraire.
   * @returns {Calculator} L'instance de la classe Calculator pour permettre l'enchaînement des méthodes.
   * @throws {Error} Si le paramètre n'est pas un nombre.
   */
  subtract(number) {
    if (typeof number !== 'number') {
      throw new Error("Le paramètre doit être un nombre.");
    }
    this.result -= number;
    return this;
  }

  /**
   * Multiplie le résultat courant par un nombre.
   * @param {number} number - Le nombre par lequel multiplier.
   * @returns {Calculator} L'instance de la classe Calculator pour permettre l'enchaînement des méthodes.
   * @throws {Error} Si le paramètre n'est pas un nombre.
   */
  multiply(number) {
    if (typeof number !== 'number') {
      throw new Error("Le paramètre doit être un nombre.");
    }
    this.result *= number;
    return this;
  }
}