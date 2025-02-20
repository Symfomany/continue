
interface FileInfo {
  filename: string;
  language: string | null;
}

const LANG_MAP: { [key: string]: string } = {
  'js': 'JavaScript',
  'ts': 'TypeScript',
  'tsx': 'TypeScript',
  'jsx': 'JavaScript',
  'py': 'Python',
  'java': 'Java',
  'kt': 'Kotlin',
  'cpp': 'C++',
  'hpp': 'C++',
  'c': 'C',
  'h': 'C',
  'rb': 'Ruby',
  'go': 'Go',
  'rs': 'Rust',
  'php': 'PHP',
  'swift': 'Swift',
  'm': 'Objective-C',
  'mm': 'Objective-C++',
  'sh': 'Shell',
  'bash': 'Bash',
  'zsh': 'Zsh',
  'ps1': 'PowerShell',
  'bat': 'Batch',
  'cmd': 'Batch',
  'json': 'JSON',
  'html': 'HTML',
  'css': 'CSS',
  'scss': 'SCSS',
  'sass': 'Sass',
  'xml': 'XML',
  'yml': 'YAML',
  'yaml': 'YAML',
  'md': 'Markdown',
  'toml': 'TOML',
  'ini': 'INI',
  'sql': 'SQL',
  'lua': 'Lua',
  'dart': 'Dart',
  'groovy': 'Groovy',
  'vue': 'Vue',
  'svelte': 'Svelte'
};

export function getFileInfo(filePath: string): FileInfo {
  // Nettoyage du chemin de fichier
  const cleanPath = filePath
    .replace(/^file:\/\//, '') // Supprime le protocole file://
    .replace(/%([0-9A-Fa-f]{2})/g, (_, p1) => 
      String.fromCharCode(parseInt(p1, 16))) // Décode les caractères encodés
    .split(/[\\/]/) // Supporte les séparateurs Windows et Unix
    .filter(segment => segment.trim() !== '');

  // Extraction du nom de fichier avec extension
  const filenameWithParams = cleanPath.pop() || '';
  const [filename] = filenameWithParams.split(/[?#]/); // Supprime les paramètres d'URL

  // Gestion des fichiers sans extension et fichiers cachés
  const parts = filename.split('.');
  const hasMultipleExtensions = parts.length > 1;
  const isHiddenFile = parts[0] === '' && parts.length > 1;

  let ext = '';
  if (hasMultipleExtensions) {
    ext = (
      isHiddenFile 
        ? parts.slice(-1)[0] 
        : parts.slice(-2)[1]
    ).toLowerCase();
  }

  // Détection du langage avec fallback intelligent
  const language = LANG_MAP[ext] || 
    (filename.endsWith('.config') ? 'JSON' : null) ||
    (filename === 'Dockerfile' ? 'Docker' : null) ||
    (filename === 'Makefile' ? 'Makefile' : null);

  return {
    filename: filename,
    language
  };
}
