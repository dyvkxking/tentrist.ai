const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const contracts = [
  'Escrow',
  'SLAContract',
  'SlashManager',
  'ReputationLedger',
  'NodeRegistry'
];

// Go up from scripts/ -> contracts/ -> tentrist.ai/ then into backend
const artifactsDir = path.join(__dirname, '..', 'artifacts', 'contracts');
const baseBindingsDir = path.join(__dirname, '..', '..', 'backend', 'internal', 'contract', 'bindings');

console.log('Artifacts dir:', artifactsDir);
console.log('Bindings dir:', baseBindingsDir);

contracts.forEach(contractName => {
  const contractDir = path.join(baseBindingsDir, contractName.toLowerCase());

  // Create subdirectory for this contract
  if (!fs.existsSync(contractDir)) {
    fs.mkdirSync(contractDir, { recursive: true });
  }

  const artifactPath = path.join(artifactsDir, `${contractName}.sol`, `${contractName}.json`);
  const abiPath = path.join(contractDir, `${contractName}.abi`);
  const bytecodePath = path.join(contractDir, `${contractName}.bin`);

  if (!fs.existsSync(artifactPath)) {
    console.error(`Artifact not found: ${artifactPath}`);
    return;
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  if (!artifact.bytecode) {
    console.error(`No bytecode in artifact: ${artifactPath}`);
    return;
  }

  // Extract just the ABI array and write to .abi file
  const abi = artifact.abi;
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));

  // Write bytecode to .bin file (remove '0x' prefix if present)
  const bytecode = artifact.bytecode.startsWith('0x')
    ? artifact.bytecode.slice(2)
    : artifact.bytecode;
  fs.writeFileSync(bytecodePath, bytecode);

  console.log(`Generated ABI and bytecode for ${contractName}`);

  // Run abigen with extracted ABI file - each contract in its own package
  const outPath = path.join(contractDir, `${contractName}.go`);

  try {
    execSync(`abigen --abi="${abiPath}" --bin="${bytecodePath}" --pkg=${contractName.toLowerCase()} --out="${outPath}"`, {
      stdio: 'inherit',
      shell: true
    });
    console.log(`✓ Generated bindings for ${contractName}`);
  } catch (err) {
    console.error(`✗ Failed to generate bindings for ${contractName}`);
  }

  console.log('---');
});
