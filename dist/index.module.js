/* --------------------------- */
/* @zooduck/build-tools v0.0.3 */
/* --------------------------- */
import * as fs from 'node:fs/promises';
import path from 'node:path';
class BuildTools {
  async copyModules(src, dest, modulesToCopy = []) {
    await fs.rm(dest, { recursive: true, force: true });
    await fs.mkdir(dest, { recursive: true });
    if (modulesToCopy.length) {
      for (const moduleName of modulesToCopy) {
        await fs.cp(path.join(src, moduleName), path.join(dest, moduleName), { recursive: true });
      }
    } else {
      await fs.cp(src, dest, { recursive: true });
    }
  }
  async createJSExportFromCSS(cssFile) {
    const directory = path.dirname(cssFile);
    const filename = path.basename(cssFile);
    const fileContents = await fs.readFile(cssFile, { encoding: 'utf-8' });
    fs.writeFile(path.join(directory, filename.replace('.css', '.css.js')), `export default \`\n${fileContents.trim()}\n\`;`);
  };
  async removeCommentsFromFile(filePath) {
    const fileContents = await fs.readFile(filePath, { encoding: 'utf-8' });
    const fileContentsWithCommentsRemoved = this.#removeCommentsFromString(fileContents);
    await fs.writeFile(filePath, fileContentsWithCommentsRemoved);
  }
  async stampFileWithVersion(pathToFile, pathToPackageJSON) {
    const pkg = await fs.readFile(pathToPackageJSON);
    const { name, version } = JSON.parse(pkg);
    const fileContents = await fs.readFile(pathToFile, { encoding: 'utf-8' });
    const versionText = `${name} v${version}`;
    const dashLine = Array.from({ length: versionText.length }).map(() => {
      return '-';
    }).join('');
    const versionComment = `/* ${dashLine} */\n/* ${versionText} */\n/* ${dashLine} */`;
    await fs.writeFile(
      pathToFile,
      `${versionComment}\n${fileContents}`
    );
  }
  #removeCommentsFromString(fileContents) {
    const COMMENT_BLOCK_START_REGEX = /\s+\/\*|^\/\*/;
    const COMMENT_BLOCK_END_REGEX = /\*\//;
    const EMPTY_LINE_REGEX = /[\n\r]\s*$/gm;
    const SINGLE_LINE_COMMENT_REGEX = /(?:[ ]+\/{2}|^\/{2})[^\n\r]*/gm;
    const commentBlockEndIndexes = [];
    const commentBlockStartIndexes = [];
    let commentBlockMatch = fileContents.match(COMMENT_BLOCK_START_REGEX);
    let indexAdjust = 0;
    let count = 0;
    while (commentBlockMatch) {
      const { index } = commentBlockMatch;
      indexAdjust += index;
      if (count % 2 === 0) {
        commentBlockMatch = fileContents.substring(indexAdjust).match(COMMENT_BLOCK_START_REGEX);
        commentBlockMatch && commentBlockStartIndexes.push(commentBlockMatch.index + indexAdjust);
      } else {
        commentBlockMatch = fileContents.substring(indexAdjust).match(COMMENT_BLOCK_END_REGEX);
        commentBlockMatch && commentBlockEndIndexes.push(commentBlockMatch.index + commentBlockMatch[0].length + indexAdjust);
      }
      count += 1;
    }
    const commentBlockIndexes = commentBlockStartIndexes.map((startIndex, index) => {
      const endIndex = commentBlockEndIndexes[index];
      return [startIndex, endIndex];
    });
    let result = fileContents;
    indexAdjust = 0;
    commentBlockIndexes.forEach(([startIndex, endIndex]) => {
      if (!endIndex) {
        return;
      }
      const blockToReplace = result.slice(startIndex + indexAdjust, endIndex + indexAdjust);
      result = result.replace(blockToReplace, '');
      indexAdjust += (startIndex - endIndex);
    });
    result = result.replace(SINGLE_LINE_COMMENT_REGEX, '');
    result = result.replace(EMPTY_LINE_REGEX, '');
    return result.trim();
  }
}
const buildTools = new BuildTools();
export { buildTools };