node -e "
const sharp = require('sharp');
async function go() {
  const svg = '<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><rect width=\"512\" height=\"512\" rx=\"112\" fill=\"#FFC300\"/><text x=\"256\" y=\"340\" text-anchor=\"middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"356\" font-weight=\"900\" fill=\"#000814\">G</text></svg>';
  await sharp(Buffer.from(svg)).resize(192,192).png().toFile('public/icon-192.png');
  await sharp(Buffer.from(svg)).resize(512,512).png().toFile('public/icon-512.png');
  const appleSvg = '<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 180 180\"><rect width=\"180\" height=\"180\" rx=\"40\" fill=\"#FFC300\"/><text x=\"90\" y=\"122\" text-anchor=\"middle\" font-family=\"Arial, Helvetica, sans-serif\" font-size=\"126\" font-weight=\"900\" fill=\"#000814\">G</text></svg>';
  await sharp(Buffer.from(appleSvg)).resize(180,180).png().toFile('public/apple-touch-icon.png');
  console.log('Done!');
}
go();
"