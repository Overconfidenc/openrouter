import OpenAI from 'openai';
import fs from 'fs/promises'; 
import path from 'path';

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: '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',
});
const GROUP_NUMBER = 321702;
const SIMPLIFIED_SCHEDULE_PATH = `schedule_${GROUP_NUMBER}_simple.json`; 
const NOTES_DIRECTORY = './notes'; 
async function loadJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn(`Файл данных не найден: ${filePath}.`);
      return null;
    }
    throw new Error(`Ошибка при чтении файла ${filePath}: ${error.message}`);
  }
}

async function loadNotes(dirPath) {
    try {
        await fs.access(dirPath); 
        const files = await fs.readdir(dirPath);
        
        const noteFiles = files.filter(file => file.endsWith('.json') && file.startsWith('note'));
        
        const notes = await Promise.all(noteFiles.map(async (fileName) => {
            const filePath = path.join(dirPath, fileName);
            const noteData = await loadJsonFile(filePath);
            return {
                fileName: fileName,
                content: noteData
            };
        }));
        
        return notes.filter(n => n.content !== null); 
    } catch (error) {
        if (error.code === 'ENOENT') {
             console.warn(`Заметки не найдены`);
             return [];
        }
        throw new Error(`Ошибка: ${error.message}`);
    }
}

async function sendPrompt(prompt) {
  try {
    const completion = await client.chat.completions.create({
      model: "google/gemini-2.5-flash", 
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1024
    });
    return completion.choices[0].message.content;

  } catch (error) {
    console.error("Ошибка при запросе к API:", error);
    return "Произошла ошибка при получении ответа от консультанта.";
  }
}

async function runConsultationAgent() {
    console.log(`\n Агент-консультант запускается...`);
    
    
    const simplifiedSchedule = await loadJsonFile(SIMPLIFIED_SCHEDULE_PATH);
    const notes = await loadNotes(NOTES_DIRECTORY);

    if (!simplifiedSchedule) {
        console.error("Файл упрощенного расписания не найден");
        return;
    }

    
    const scheduleJsonString = JSON.stringify(simplifiedSchedule, null, 2);
    const notesJsonString = notes.length > 0 ? JSON.stringify(notes.map(n => n.content), null, 2) : "Нет активных заметок.";

    let prompt = `Ты — консультант по расписанию в университете. Твоя задача — проанализировать предоставленное расписание группы и все активные заметки, а затем дать краткий, полезный и конкретный совет или сводку.

---
РОЛЬ И ИНСТРУКЦИЯ
1. Сначала проанализируй расписание, чтобы понять структуру недели и предметы.
2. Затем проанализируй заметки:
   - Найди конфликты (заметка установлена на конкретное время, когда уже есть пара в расписании).
   - Определи, какие предметы имеют высокий приоритет в заметках.
3. Дай совет в формате:
   - Заголовок (например: "Сводка по расписанию и заметкам для 321702")
   - Общий статус (например: "В расписании обнаружен 1 конфликт с заметкой.")
   - Краткий совет (фокусируйся на ближайших высокоприоритетных событиях, конфликтах или на предметах, по которым нет заметок).
4. Весь ответ должен быть на русском языке.
---

РАСПИСАНИЕ ГРУППЫ (JSON)
${scheduleJsonString}
---

ЗАМЕТКИ ПОЛЬЗОВАТЕЛЯ (JSON)
${notesJsonString}
---

Твой краткий совет:
`;

    
    console.log(`\n Отправка промта LLM-консультанту`);
    const response = await sendPrompt(prompt);
    
    
    console.log(`Ответ:\n`);
    console.log(response);
}
runConsultationAgent();
