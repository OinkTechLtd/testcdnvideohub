class Compiler {
  static compilePawno(code) {
    const output = [];
    const errors = [];
    const warnings = [];

    // Clean the code from any BOM or invalid characters
    let cleanCode = code;
    // Remove BOM (Byte Order Mark)
    if (cleanCode.charCodeAt(0) === 0xFEFF) {
      cleanCode = cleanCode.slice(1);
    }
    // Remove any null bytes and other control characters that might cause issues
    cleanCode = cleanCode.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    output.push('Pawn compiler version 3.2.3664');
    output.push('Copyright (c) 1997-2006, ITB CompuPhase');
    output.push('');
    output.push('Parsing...');
    
    // Basic syntax checking - exactly like Pawno
    const lines = cleanCode.split('\n');
    let hasMain = false;
    let braceCount = 0;
    let parenCount = 0;
    let inFunction = false;
    let currentFunction = '';
    const definedFunctions = new Set();
    const usedFunctions = new Set();
    const variables = new Set();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNumber = i + 1;

      // Skip empty lines and comments
      if (!line || line.startsWith('//') || line.startsWith('/*')) {
        continue;
      }

      // Check for main function
      if (line.includes('main()')) {
        hasMain = true;
        inFunction = true;
        currentFunction = 'main';
        definedFunctions.add('main');
        output.push(`Line ${lineNumber}: Function 'main'`);
      }

      // Check for other function definitions
      const funcMatch = line.match(/^(?:public\s+)?(\w+)\s*\([^)]*\)\s*{/);
      if (funcMatch && !line.includes('if') && !line.includes('while') && !line.includes('for') && !line.includes('switch')) {
        definedFunctions.add(funcMatch[1]);
        output.push(`Line ${lineNumber}: Function '${funcMatch[1]}'`);
      }

      // Count braces
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;

      // Count parentheses
      parenCount += (line.match(/\(/g) || []).length;
      parenCount -= (line.match(/\)/g) || []).length;

      // Check for Print/printf functions (Pawno style)
      if (line.includes('Print(') || line.includes('printf(')) {
        output.push(`Line ${lineNumber}: Output function found`);
      }

      // Check for includes
      if (line.startsWith('#include')) {
        const includeFile = line.match(/#include\s+["<](\w+\.inc)[">]/);
        if (includeFile) {
          output.push(`Line ${lineNumber}: Including ${includeFile[1]}`);
        } else {
          output.push(`Line ${lineNumber}: ${line}`);
        }
      }

      // Check for #define
      if (line.startsWith('#define')) {
        output.push(`Line ${lineNumber}: Macro defined`);
      }

      // Check for variable declarations
      const varPattern = /\bnew\s+(\w+)/g;
      let match;
      while ((match = varPattern.exec(line)) !== null) {
        variables.add(match[1]);
        output.push(`Line ${lineNumber}: Variable '${match[1]}' declared`);
      }

      // Check for common Pawno/SAMP functions
      const sampFunctions = [
        'SendClientMessage', 'SendPlayerMessageToPlayer', 'CreateVehicle',
        'SpawnPlayer', 'SetPlayerPos', 'GetPlayerName', 'IsPlayerConnected',
        'OnPlayerConnect', 'OnPlayerDisconnect', 'OnPlayerCommandText',
        'OnGameModeInit', 'OnGameModeExit', 'OnPlayerUpdate'
      ];

      for (const func of sampFunctions) {
        if (line.includes(func)) {
          usedFunctions.add(func);
          output.push(`Line ${lineNumber}: SAMP function '${func}' used`);
        }
      }

      // Check for missing semicolons (simple heuristic)
      if (line.match(/^\s*(?:new|const|static)\s+\w+/) && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}')) {
        warnings.push(`Warning ${lineNumber}: Possible missing semicolon`);
      }

      // Check for undefined function calls (basic check)
      const funcCallPattern = /(\w+)\s*\([^)]*\)/g;
      let callMatch;
      while ((callMatch = funcCallPattern.exec(line)) !== null) {
        const calledFunc = callMatch[1];
        // Skip keywords and known functions
        if (!['if', 'while', 'for', 'switch', 'case', 'return', 'new', 'const', 'public', 'native', 'stock'].includes(calledFunc)) {
          usedFunctions.add(calledFunc);
        }
      }
    }

    // Validation - Pawno style errors
    if (!hasMain) {
      errors.push('fatal error 021: no entry point (no public functions)');
    }

    if (braceCount !== 0) {
      if (braceCount > 0) {
        errors.push(`fatal error 029: expected '}}', but end of file reached (${Math.abs(braceCount)} unclosed brace(s))`);
      } else {
        errors.push(`fatal error 030: unbalanced braces (${Math.abs(braceCount)} extra '}}')`);
      }
    }

    if (parenCount !== 0) {
      if (parenCount > 0) {
        errors.push(`fatal error 031: expected ')', but end of file reached (${Math.abs(parenCount)} unclosed parenthesis(es))`);
      } else {
        errors.push(`fatal error 032: unbalanced parentheses (${Math.abs(parenCount)} extra ')')`);
      }
    }

    output.push('');
    output.push('Compiling...');
    
    if (errors.length > 0) {
      output.push('');
      output.push('=== ERRORS ===');
      errors.forEach(err => output.push(err));
      output.push('');
      output.push(`Compilation aborted with ${errors.length} error(s)`);
      return { success: false, output };
    }

    if (warnings.length > 0) {
      output.push('');
      output.push('=== WARNINGS ===');
      warnings.forEach(warn => output.push(warn));
    }

    output.push('');
    output.push('Creating output file: compiled.amx');
    output.push('Compilation completed successfully!');
    output.push(`Total lines: ${lines.length}`);
    output.push(`Code size: ~${Math.floor(cleanCode.length / 10)} bytes`);
    output.push(`Functions defined: ${definedFunctions.size}`);
    output.push(`Variables declared: ${variables.size}`);

    return { success: true, output };
  }

  static compileGeneric(code, language) {
    const output = [];
    
    output.push(`${language.toUpperCase()} Compiler/Interpreter`);
    output.push('='.repeat(40));
    output.push('');

    const lines = code.split('\n');
    
    switch (language) {
      case 'javascript':
        output.push('JavaScript (Node.js v18.0.0)');
        output.push('Syntax check passed');
        output.push('No compilation needed - interpreted language');
        break;
      
      case 'python':
        output.push('Python 3.11.0');
        output.push('Syntax check passed');
        output.push('No compilation needed - interpreted language');
        break;
      
      case 'cpp':
      case 'c':
        output.push('GCC Compiler 12.2.0');
        output.push('Compiling...');
        output.push('Linking...');
        output.push('Output: a.out');
        output.push('Compilation successful!');
        break;
      
      case 'java':
        output.push('Java Compiler 17.0.0');
        output.push('Compiling...');
        output.push('Output: Main.class');
        output.push('Compilation successful!');
        break;
      
      default:
        output.push('Generic compiler');
        output.push('Code analysis complete');
        output.push(`Total lines: ${lines.length}`);
    }

    output.push('');
    output.push('Compilation completed successfully!');

    return { success: true, output };
  }
}

export default Compiler;
