/**
 * NETWATCH — Atomic File Writer
 * Novelty & Innovation #5: Prevents partial writes, corruption, and race conditions.
 * Strategy: Temp file creation -> Disk flush -> JSON validation -> Atomic rename.
 */

const fs = require('fs');
const path = require('path');

function atomicWriteJson(targetPath, data) {
  const dir = path.dirname(targetPath);
  fs.mkdirSync(dir, { recursive: true });

  const tempPath = `${targetPath}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 8)}`;
  const backupPath = `${targetPath}.bak`;

  const serialized = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  // 1. Verify JSON is parseable before writing
  try {
    JSON.parse(serialized);
  } catch (err) {
    throw new Error(`Data is not valid JSON prior to write: ${err.message}`);
  }

  // 2. Write to temporary file with explicit sync
  try {
    const fd = fs.openSync(tempPath, 'w');
    fs.writeFileSync(fd, serialized, 'utf8');
    fs.fsyncSync(fd);
    fs.closeSync(fd);

    // 3. Verify the written temp file
    const verifyContent = fs.readFileSync(tempPath, 'utf8');
    JSON.parse(verifyContent);

    // 4. Create backup of current target if it exists
    if (fs.existsSync(targetPath)) {
      try {
        fs.copyFileSync(targetPath, backupPath);
      } catch (_) {}
    }

    // 5. Atomic rename to target
    fs.renameSync(tempPath, targetPath);
    return true;
  } catch (writeErr) {
    // Safe cleanup of temp file
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (_) {}
    }
    throw new Error(`Atomic write failed for ${targetPath}: ${writeErr.message}`);
  }
}

module.exports = {
  atomicWriteJson
};
