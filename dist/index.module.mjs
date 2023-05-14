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
  removeCommentsFromFile = async (filePath) => {
    const fileContents = await fs.readFile(filePath, { encoding: 'utf-8' });
    const fileContentsWithCommentsRemoved = this.#removeCommentsFromString(fileContents);
    await fs.writeFile(filePath, fileContentsWithCommentsRemoved);
  }
  #removeCommentsFromString = (fileContents) => {
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