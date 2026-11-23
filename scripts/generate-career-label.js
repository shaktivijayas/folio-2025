// Renders a career line label mask texture (red = glowing text, green = dark backing box)
// The texture width fits the text; CareerArea stretches the label mesh to match.
// Usage: node scripts/generate-career-label.js <name> "<LINE 1 (bold)>" "<LINE 2>"
// careerIRLTeacher and careerOnlineTeacher signs are 3 lines tall: prefix with LABEL_HEIGHT=92
// Example: node scripts/generate-career-label.js careerHetic "CIT STUDENT" "4 YEARS BE CSE"
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const [ name, line1, line2 = '' ] = process.argv.slice(2)

if(!name || !line1)
{
    console.error('Usage: node scripts/generate-career-label.js <name> "<LINE 1>" "<LINE 2>"')
    process.exit(1)
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(root, 'static', 'career', `${name}.png`)

const HEIGHT = Number(process.env.LABEL_HEIGHT) || 60 // 92 for labels whose 3D sign was built for three lines
const FONT_SIZE = 30
const FONT = 'Arial, Helvetica, sans-serif'
const lines = [
    { text: line1, weight: 700, baseline: 25, top: 0 },
    { text: line2, weight: 400, baseline: 55, top: 30 }
].filter(line => line.text)

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Measure the rendered ink width of a line
const measure = async (text, weight) =>
{
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="${HEIGHT}">
        <text x="20" y="40" font-family="${FONT}" font-size="${FONT_SIZE}" font-weight="${weight}" fill="#fff">${escape(text)}</text>
    </svg>`
    const { info } = await sharp(Buffer.from(svg)).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true })

    return { width: info.width, left: -(info.trimOffsetLeft ?? 0) - 20 }
}

for(const line of lines)
{
    const size = await measure(line.text, line.weight)
    line.width = size.width
    line.left = size.left
    line.boxWidth = size.width + 4
}

// Even width keeps texture sampling clean
let width = Math.max(...lines.map(line => line.boxWidth))
width += width % 2

let content = ''
for(const line of lines)
{
    content += `
        <rect x="0" y="${line.top}" width="${line.boxWidth}" height="30" fill="#00ff00"/>
        <text x="${2 - line.left}" y="${line.baseline}" font-family="${FONT}" font-size="${FONT_SIZE}" font-weight="${line.weight}"
            fill="#ff0000">${escape(line.text)}</text>`
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${HEIGHT}">
    <rect width="${width}" height="${HEIGHT}" fill="#000000"/>
    ${content}
</svg>`

await sharp(Buffer.from(svg)).png().toFile(output)
console.log(`Wrote ${output} (${width}x${HEIGHT})`)
