
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  
  apiKey: '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',
});

export async function generateConsultation(scheduleData, userNotesText) {
  try {
    const scheduleJsonString = JSON.stringify(scheduleData, null, 2);
    
    const notesContent = userNotesText ? `Текст заметки пользователя: "${userNotesText}"` : "Заметок нет.";

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

РАСПИСАНИЕ ГРУППЫ (JSON)
${scheduleJsonString}
---

ЗАМЕТКИ ПОЛЬЗОВАТЕЛЯ
${notesContent}
`;

    const completion = await client.chat.completions.create({
      model: "google/gemma-3-27b-it:free", 
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1024
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error("Ошибка при запросе к AI:", error);
    throw new Error("Не удалось получить консультацию от AI.");
  }
}
