import { randomBytes, scrypt as scryptCallback, scryptSync, timingSafeEqual } from "node:crypto";

const PASSWORD_KEY_LENGTH = 64;
const SCRYPT_COST = 16_384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;

function scryptAsync(
  password: string,
  salt: Buffer,
  keyLength: number,
  cost: number,
  blockSize: number,
  parallelization: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(
      password,
      salt,
      keyLength,
      {
        N: cost,
        p: parallelization,
        r: blockSize,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

function serializeHash(salt: Buffer, hash: Buffer): string {
  return [
    "scrypt",
    String(SCRYPT_COST),
    String(SCRYPT_BLOCK_SIZE),
    String(SCRYPT_PARALLELIZATION),
    salt.toString("hex"),
    hash.toString("hex"),
  ].join("$");
}

function parseHash(serialized: string): {
  blockSize: number;
  cost: number;
  hash: Buffer;
  parallelization: number;
  salt: Buffer;
} {
  const [algorithm, cost, blockSize, parallelization, salt, hash] = serialized.split("$");

  if (
    algorithm !== "scrypt" ||
    !cost ||
    !blockSize ||
    !parallelization ||
    !salt ||
    !hash
  ) {
    throw new Error("Invalid password hash format.");
  }

  return {
    blockSize: Number(blockSize),
    cost: Number(cost),
    hash: Buffer.from(hash, "hex"),
    parallelization: Number(parallelization),
    salt: Buffer.from(salt, "hex"),
  };
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(
    password,
    salt,
    PASSWORD_KEY_LENGTH,
    SCRYPT_COST,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLELIZATION,
  );

  return serializeHash(salt, hash);
}

export function hashPasswordSync(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, PASSWORD_KEY_LENGTH, {
    N: SCRYPT_COST,
    p: SCRYPT_PARALLELIZATION,
    r: SCRYPT_BLOCK_SIZE,
  });

  return serializeHash(salt, hash);
}

export async function verifyPassword(password: string, serializedHash: string): Promise<boolean> {
  const parsed = parseHash(serializedHash);
  const candidateHash = await scryptAsync(
    password,
    parsed.salt,
    parsed.hash.length,
    parsed.cost,
    parsed.blockSize,
    parsed.parallelization,
  );

  return timingSafeEqual(candidateHash, parsed.hash);
}
