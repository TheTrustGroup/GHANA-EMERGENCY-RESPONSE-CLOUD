import * as fs from 'fs';
import * as path from 'path';

function cleanupProject() {
  console.log('🧹 Starting automated cleanup...\n');

  const findFiles = (dir: string, pattern: RegExp): string[] => {
    const results: string[] = [];

    if (!fs.existsSync(dir)) {
      return results;
    }

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        if (
          !filePath.includes('node_modules') &&
          !filePath.includes('.next') &&
          !filePath.includes('.git')
        ) {
          results.push(...findFiles(filePath, pattern));
        }
      } else if (pattern.test(file)) {
        results.push(filePath);
      }
    }

    return results;
  };

  const sourceFiles = findFiles('src', /\.(ts|tsx|js|jsx)$/);
  let cleanedCount = 0;

  for (const file of sourceFiles) {
    try {
      let content = fs.readFileSync(file, 'utf-8');
      const originalContent = content;

      // Remove console.log and console.debug statements (keep console.error)
      content = content.replace(/\s*console\.log\([^)]*\);?\n?/g, '');
      content = content.replace(/\s*console\.debug\([^)]*\);?\n?/g, '');

      // Remove debugger statements
      content = content.replace(/\s*debugger;?\n?/g, '');

      // Remove multiple empty lines (keep max 2 consecutive)
      content = content.replace(/\n\n\n+/g, '\n\n');

      // Remove trailing whitespace
      content = content
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n');

      // Ensure file ends with newline
      if (content && !content.endsWith('\n')) {
        content += '\n';
      }

      if (content !== originalContent) {
        fs.writeFileSync(file, content);
        cleanedCount++;
        console.log(`✅ Cleaned: ${file}`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not clean ${file}: ${error}`);
    }
  }

  console.log(`\n✅ Cleanup complete! Cleaned ${cleanedCount} files.\n`);
}

cleanupProject();
