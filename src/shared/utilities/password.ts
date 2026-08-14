import { randomInt } from 'crypto';

const LOWER = 'abcdefghijkmnopqrstuvwxyz'; // sans « l »
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sans « I » ni « O »
const DIGITS = '23456789'; // sans « 0 » ni « 1 »
const SYMBOLS = '!@#$%&*?';

const ALPHABET = LOWER + UPPER + DIGITS + SYMBOLS;

/**
 * Mot de passe temporaire pour un compte créé par un administrateur.
 *
 * Les caractères ambigus (l/I/1, O/0) sont exclus : ce mot de passe est lu
 * dans un e-mail puis recopié à la main.
 *
 * `randomInt` (crypto) et non `Math.random` : c'est un secret d'authentification.
 */
export function generateTemporaryPassword(length = 14): string {
  // Au moins un caractère de chaque classe, pour satisfaire toute règle de
  // complexité côté formulaire de réinitialisation.
  const required = [
    LOWER[randomInt(0, LOWER.length)],
    UPPER[randomInt(0, UPPER.length)],
    DIGITS[randomInt(0, DIGITS.length)],
    SYMBOLS[randomInt(0, SYMBOLS.length)],
  ];

  const rest = Array.from(
    { length: Math.max(0, length - required.length) },
    () => ALPHABET[randomInt(0, ALPHABET.length)],
  );

  const chars = [...required, ...rest];

  // Mélange de Fisher-Yates : sans cela les quatre premiers caractères
  // trahiraient toujours la même structure.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}
