const fs = require('fs');
const zlib = require('zlib');

const generateCss = async (outputCss) => {
    const res = await (await fetch('https://www.sec.gov/files/company_tickers.json')).json();
    const resultImagesCss = Object.values(res).filter( t => !!t ).map( t => {
        try {
            const data = fs.readFileSync(`./public/tickers/${t.ticker}.png`);
            const base64 = data.toString('base64');
            return `.t-logo-${t.ticker} { background-image: url(data:image/png;base64,${base64}); }`;
        } catch(e) {
            //console.error(e);
        }
    }).filter(s => !!s).join('\r\n');
    const resultCss = `/*!
 * MIT License
 * 
 * Copyright (c) 2025 Quentin Vanhauteghem
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
${resultImagesCss}`;

    fs.writeFileSync(outputCss, resultCss);
}

const compressFile = (inputPath, outputPath) => {
    const input = fs.createReadStream(inputPath);
    const gzip = zlib.createGzip();
    const output = fs.createWriteStream(outputPath);

    return new Promise((res) => {
        input.pipe(gzip).pipe(output).on('finish', () => {
            res();
        });
    })
};

(async () => {
    const outputCss = './public/sec_companies_logos.css';
    await generateCss(outputCss);
    await compressFile(outputCss, outputCss + '.gz');
})();