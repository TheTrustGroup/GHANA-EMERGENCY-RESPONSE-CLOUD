import * as fs from 'fs';
import * as path from 'path';

interface CleanupReport {
  unusedFiles: string[];
  duplicateCode: string[];
  largeFiles: string[];
  consoleStatements: string[];
  todoComments: string[];
  debugCode: string[];
}

async function analyzeProject(): Promise<CleanupReport> {
  const report: CleanupReport = {
    unusedFiles: [],
    duplicateCode: [],
    largeFiles: [],
    consoleStatements: [],
    todoComments: [],
    debugCode: [],
  };

  // Find all TypeScript/JavaScript files
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
        if (!filePath.includes('node_modules') && !filePath.includes('.next') && !filePath.includes('.git')) {
          results.push(...findFiles(filePath, pattern));
        }
      } else if (pattern.test(file)) {
        results.push(filePath);
      }
    }

    return results;
  };

  const sourceFiles = findFiles('src', /\.(ts|tsx|js|jsx)$/);

  for (const file of sourceFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      // Check file size
      if (content.length > 500 * 1024) { // > 500KB
        report.largeFiles.push(`${file} (${Math.round(content.length / 1024)}KB)`);
      }

      // Find console statements (excluding console.error which we keep)
      lines.forEach((line, index) => {
        if (/console\.(log|warn|debug)/.test(line) && !line.trim().startsWith('//')) {
          report.consoleStatements.push(`${file}:${index + 1} - ${line.trim()}`);
        }
      });

      // Find TODO comments
      lines.forEach((line, index) => {
        if (/\/\/\s*TODO|\/\/\s*FIXME|\/\/\s*HACK/.test(line)) {
          report.todoComments.push(`${file}:${index + 1} - ${line.trim()}`);
        }
      });

      // Find debug code
      lines.forEach((line, index) => {
        if (/debugger|console\.trace/.test(line)) {
          report.debugCode.push(`${file}:${index + 1} - ${line.trim()}`);
        }
      });
    } catch (error) {
      // Skip files that can't be read
      console.warn(`Warning: Could not read ${file}`);
    }
  }

  return report;
}

async function generateReport() {
  console.log('🔍 Analyzing project for cleanup...\n');
  
  const report = await analyzeProject();

  console.log('📊 CLEANUP REPORT\n');
  console.log('='.repeat(60));

  if (report.largeFiles.length > 0) {
    console.log('\n⚠️  LARGE FILES (Consider splitting):');
    report.largeFiles.forEach(f => console.log(`   ${f}`));
  }

  if (report.consoleStatements.length > 0) {
    console.log(`\n⚠️  CONSOLE STATEMENTS (${report.consoleStatements.length} found):`);
    report.consoleStatements.slice(0, 10).forEach(s => console.log(`   ${s}`));
    if (report.consoleStatements.length > 10) {
      console.log(`   ... and ${report.consoleStatements.length - 10} more`);
    }
  }

  if (report.todoComments.length > 0) {
    console.log(`\n📝 TODO COMMENTS (${report.todoComments.length} found):`);
    report.todoComments.forEach(t => console.log(`   ${t}`));
  }

  if (report.debugCode.length > 0) {
    console.log(`\n🐛 DEBUG CODE (${report.debugCode.length} found):`);
    report.debugCode.forEach(d => console.log(`   ${d}`));
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Analysis complete!\n');

  // Save report
  fs.writeFileSync(
    'cleanup-report.json',
    JSON.stringify(report, null, 2)
  );
  console.log('📄 Report saved to: cleanup-report.json\n');
}

generateReport().catch(console.error);
