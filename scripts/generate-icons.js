const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [16, 32, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  try {
    // SVGファイルを読み込む
    const svgBuffer = await fs.readFile(inputSvg);

    // 各サイズのアイコンを生成
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      // faviconのエイリアスを作成
      if (size === 16) {
        await fs.copyFile(outputPath, path.join(outputDir, 'favicon-16x16.png'));
      } else if (size === 32) {
        await fs.copyFile(outputPath, path.join(outputDir, 'favicon-32x32.png'));
        // 32x32をfavicon.icoとしても使用
        await fs.copyFile(outputPath, path.join(outputDir, '../favicon.ico'));
      }
    }

    console.log('アイコンの生成が完了しました！');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

generateIcons(); 