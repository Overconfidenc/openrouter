// routes.js
import express from "express";
import { transformSchedule } from "./transform.js";
import { generateConsultation } from "./agent.js";

const router = express.Router();

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Payload must be an object" };
  }
  if (typeof payload.number !== "number" || !Number.isInteger(payload.number)) {
    return { ok: false, error: "Missing or invalid 'number' (must be integer)" };
  }
  if (typeof payload.text !== "string") {
    return { ok: false, error: "Missing or invalid 'text' (must be string)" };
  }
  return { ok: true };
}

router.post("/consult", async (req, res, next) => {
  try {
    const payload = req.body;

    // 1. Валидация
    const v = validatePayload(payload);
    if (!v.ok) {
      return res.status(400).json({ success: false, error: v.error });
    }

    const { number, text } = payload;

    // 2. Получение и трансформация расписания
    console.log(`Запрос расписания для группы ${number}...`);
    let scheduleData;
    try {
        scheduleData = await transformSchedule(number);
    } catch (e) {
        return res.status(404).json({ success: false, error: `Не удалось получить расписание: ${e.message}` });
    }

    // 3. Генерация ответа агентом
    console.log(`Генерация консультации с учетом заметки...`);
    const markdownResponse = await generateConsultation(scheduleData, text);

    // 4. Возврат ответа
    return res.status(200).json({ 
        success: true, 
        data: {
            group: number,
            markdown: markdownResponse
        } 
    });

  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  console.error("API error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

export default router;