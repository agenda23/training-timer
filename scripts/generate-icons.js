import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = 'public/icons/icon.svg';
const outputDir = 'public/icons';

// 出力ディレクトリが存在することを確認
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  try {
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`Generated: ${outputPath}`);
    }

    // favicon用のアイコンも生成
    await sharp(inputSvg)
      .resize(16, 16)
      .png()
      .toFile(path.join(outputDir, 'favicon-16x16.png'));
    
    await sharp(inputSvg)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));

    // faviconファイルも生成
    await sharp(inputSvg)
      .resize(32, 32)
      .png()
      .toFile('public/favicon.ico');

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 