export function codeblock(content: string, language: string = "js") {
  const replaceBackticks = content.replace(/`/g, "\\`");
  return `\`\`\`${language}\n${replaceBackticks}\n\`\`\``;
}

export function codeblockInline(content: string, language: string = "js") {
  const replaceBackticks = content.replace(/`/g, "\\`");
  return `\`\`${replaceBackticks}\`\``;
}
