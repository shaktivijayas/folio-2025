// Renders the Skills Lab board images from sources/data/lab.js
// Usage: node scripts/generate-skills-images.js
import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import labData from '../sources/data/lab.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'static', 'lab', 'images')

const FONT = `'Segoe UI', 'Helvetica Neue', Arial, sans-serif`
const BACKGROUND = '#13111b'

const escape = (text) => String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

// Rough text width estimate (no font metrics available in SVG-only rendering)
const measure = (text, fontSize) => text.length * fontSize * 0.5

const background = (width, height, accent) => `
    <defs>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
            gradientTransform="translate(${width * 0.08} ${height * 0.05}) scale(${width * 0.9} ${height * 1.1})">
            <stop offset="0" stop-color="${accent}" stop-opacity="0.28"/>
            <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
        </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="${BACKGROUND}"/>
    <rect width="${width}" height="${height}" fill="url(#glow)"/>`

const renderMain = (skill, index, total) =>
{
    const width = 1920
    const height = 1080
    const marginX = 140
    const maxX = width - marginX

    // Chips (wrapped rows)
    const chipFont = 46
    const chipHeight = 100
    const chipPadding = 42
    const chipGap = 26
    const rowGap = 30
    let x = marginX
    let y = 400
    let chips = ''

    for(const tool of skill.tools)
    {
        const chipWidth = measure(tool, chipFont) + chipPadding * 2

        if(x + chipWidth > maxX && x > marginX)
        {
            x = marginX
            y += chipHeight + rowGap
        }

        chips += `
            <rect x="${x}" y="${y}" width="${chipWidth}" height="${chipHeight}" rx="${chipHeight / 2}"
                fill="${skill.accent}" fill-opacity="0.12" stroke="${skill.accent}" stroke-opacity="0.75" stroke-width="3"/>
            <text x="${x + chipWidth / 2}" y="${y + chipHeight / 2 + chipFont * 0.36}" text-anchor="middle"
                font-family="${FONT}" font-size="${chipFont}" font-weight="600" fill="#f4f1ff">${escape(tool)}</text>`

        x += chipWidth + chipGap
    }

    const counter = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        ${background(width, height, skill.accent)}
        <text x="${marginX}" y="150" font-family="${FONT}" font-size="38" font-weight="700" letter-spacing="8"
            fill="${skill.accent}">SKILLS LAB</text>
        <text x="${maxX}" y="150" text-anchor="end" font-family="${FONT}" font-size="38" font-weight="600" letter-spacing="4"
            fill="#8f8aa3">${counter}</text>
        <text x="${marginX}" y="285" font-family="${FONT}" font-size="120" font-weight="800" fill="#ffffff">${escape(skill.title)}</text>
        <rect x="${marginX}" y="318" width="160" height="10" rx="5" fill="${skill.accent}"/>
        ${chips}
        <line x1="${marginX}" y1="880" x2="${maxX}" y2="880" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"/>
        <text x="${marginX}" y="945" font-family="${FONT}" font-size="34" font-weight="700" letter-spacing="6"
            fill="#8f8aa3">USED IN</text>
        <text x="${marginX}" y="1010" font-family="${FONT}" font-size="52" font-weight="600"
            fill="#e6e2f5">${escape(skill.proof.join('  ·  '))}</text>
    </svg>`
}

const renderMini = (skill) =>
{
    const width = 480
    const height = 272

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        ${background(width, height, skill.accent)}
        <rect x="6" y="6" width="${width - 12}" height="${height - 12}" rx="18" fill="none"
            stroke="${skill.accent}" stroke-opacity="0.6" stroke-width="4"/>
        <text x="${width / 2}" y="${height / 2 + 6}" text-anchor="middle" font-family="${FONT}" font-size="46" font-weight="800"
            fill="#ffffff">${escape(skill.title)}</text>
        <text x="${width / 2}" y="${height / 2 + 62}" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="600"
            letter-spacing="3" fill="${skill.accent}">${skill.tools.length} TOOLS</text>
    </svg>`
}

for(let i = 0; i < labData.length; i++)
{
    const skill = labData[i]

    await sharp(Buffer.from(renderMain(skill, i, labData.length))).png().toFile(path.join(outDir, skill.image))
    await sharp(Buffer.from(renderMini(skill))).png().toFile(path.join(outDir, skill.imageMini))

    console.log(`${skill.image}, ${skill.imageMini}`)
}
