import { Client } from '@gradio/client'
import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, resolve, sep } from 'node:path'
const require = createRequire(import.meta.url)
global.EventSource = require('eventsource')

const languages: { [key: string]: string } = {
  es: 'Spanish',
  de: 'German',
  da: 'Danish',
}

const writeToFile = async (destinationPath: string, content: string) => {
  try {
    // Ensure the destination directory exists, create it if necessary
    const destinationDir = dirname(destinationPath)
    await mkdir(destinationDir, { recursive: true })

    // Write content to the destination file
    await writeFile(destinationPath, content)

    console.log(`Content written to ${destinationPath}`)
  } catch (err) {
    console.error('Error:', err)
  }
}

const localizeTranslationFiles = async () => {
  const app = await Client.connect(
    'https://gundeep-open-translate.hf.space/--replicas/7xrk4/',
    {
      hf_token: process.env.HF_TOKEN as `hf_${string}`,
    },
  )
  const dir = './public/locales/en'
  const files = await readdir(dir)

  for (const file of files) {
    const fullPath = resolve(dir, file)
    const fileContent = await readFile(fullPath, 'utf-8')

    console.log(`Translating file ${file}..`)
    const defaultTranslations = JSON.parse(fileContent)

    const destinationSplit = fullPath.split(sep)
    const localeIndex = destinationSplit.findLastIndex((val) => val === 'en')

    for (const isoCode in languages) {
      let translations: { [key: string]: string } = {}
      destinationSplit[localeIndex] = isoCode
      const destination = destinationSplit.join(sep)
      // If previous translations for this language exists, use them as the default

      if (existsSync(destination)) {
        const destinationFileContent = await readFile(destination, 'utf-8')
        translations = JSON.parse(destinationFileContent)
      }

      const language = languages[isoCode]

      for (const key in defaultTranslations) {
        if (translations[key]) {
          // If the key already exists, skip it.
          continue
        }
        const text = defaultTranslations[key]

        try {
          const response = await app.predict('/translate', [
            text, // string  in 'Input Text' Textbox component
            'Auto Detect', // string  in 'Source Language' Dropdown component
            language, // string  in 'Target Language' Dropdown component
          ])

          console.log('Translated key', key)

          const result = response as {
            data: string[]
          }

          if (result.data.length > 0) {
            translations[key] = result.data[0]
          }
        } catch (err) {}
      }

      // Save the translations file
      await writeToFile(destination, JSON.stringify(translations, null, 2))
    }
  }
}

localizeTranslationFiles()
