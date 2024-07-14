import bcrypt from 'bcryptjs';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(32);
	return argon2.hash(password, { salt: salt, type: argon2.argon2id });
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
	if (isOldAlgorithm(hash)) {
		return bcrypt.compare(password, hash);
	}

	return argon2.verify(hash, password);
}

export function isOldAlgorithm(hash: string): boolean {
	return hash.startsWith('$2');
}
