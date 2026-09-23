import { visit } from 'unist-util-visit';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

interface RemarkImgOptions {
  publicDir: string;   // public目录的绝对路径
  outputDir: string;   // 图片输出子目录，如 '/images/blog'
  mdFilePath: string;  // md文件的绝对路径
}

/**
 * 生成文件名的hash值
 * @param content 文件内容
 * @param length hash长度，默认6位
 * @returns hash字符串
 */
function generateHash(content: Buffer, length: number = 6): string {
  const hash = crypto.createHash('md5').update(content).digest('hex');
  return hash.substring(0, length);
}

/**
 * remark插件：处理markdown中的相对路径图片
 * 1. 检测相对路径的图片引用（./ 或 ../）
 * 2. 复制图片到public目录
 * 3. 生成带hash的文件名
 * 4. 修改AST中的url为新路径
 */
export function remarkCopyImg(options: RemarkImgOptions) {
  return (tree: any, file: any) => {
    const mdFilePath = options.mdFilePath;
    if (!mdFilePath) {
      console.log('[remark-copy-img] mdFilePath not provided, skipping');
      return;
    }
    console.log('[remark-copy-img] Processing file:', mdFilePath);
    const mdDir = path.dirname(mdFilePath); // md文件所在目录

    visit(tree, 'image', (node) => {
      const src = node.url;

      // 只处理相对路径的图片
      if (src.startsWith('./') || src.startsWith('../')) {
        console.log('[remark-copy-img] Found relative image:', src);
        const imgPath = path.resolve(mdDir, src);

        // 检查图片文件是否存在
        if (!fs.existsSync(imgPath)) {
          console.warn(`[remark-copy-img] Image not found: ${imgPath}`);
          return;
        }

        const imgName = path.basename(imgPath);
        const ext = path.extname(imgName);
        const nameWithoutExt = path.basename(imgName, ext);

        // 读取图片内容并生成hash
        const imgContent = fs.readFileSync(imgPath);
        const hash = generateHash(imgContent);

        // 生成新的文件名（带hash）
        const newImgName = `${nameWithoutExt}-${hash}${ext}`;

        // 确定主题目录（content下的子目录）
        // 例如：content/CSS/assets/img.png -> CSS
        // 例如：content/framework/Spring/assets/img.png -> framework/Spring
        const relativePath = path.relative(path.join(process.cwd(), 'content'), mdDir);
        const themeName = relativePath.split(path.sep)[0] || 'default';

        // 目标路径：public/images/blog/主题名/图片名
        const destDir = path.join(options.publicDir, options.outputDir, themeName);
        const destPath = path.join(destDir, newImgName);

        // 创建目标目录
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        // 复制图片到public目录（如果不存在）
        if (!fs.existsSync(destPath)) {
          fs.copyFileSync(imgPath, destPath);
          console.log(`[remark-copy-img] Copied: ${imgPath} -> ${destPath}`);
        }

        // 修改node中的url为新的路径
        node.url = `${options.outputDir}/${themeName}/${newImgName}`;
      }
    });
  };
}