import { getSchedule, triggerDownload } from './converter.js';
import { transformSchedule } from './transform.js';

const inputEl = document.getElementById('groupInput');
const buttonEl = document.getElementById('searchButton');
const resultEl = document.getElementById('result');

function showMessage(message, isError = false) {
    resultEl.style.display = 'block';
    resultEl.textContent = message;
    if (isError) {
        resultEl.classList.add('error');
    } else {
        resultEl.classList.remove('error');
    }
}
async function handleProcess() {
    const groupNumber = inputEl.value;
    if (!groupNumber) {
        showMessage("Пожалуйста, введите номер группы.", true);
        return;
    }
    buttonEl.disabled = true;
    try {
        showMessage("1/3: Загрузка исходных данных с API БГУИР...", false);
        const rawData = await getSchedule(groupNumber);
        triggerDownload(rawData, `schedule_${groupNumber}.json`);
        showMessage("2/3: Обработка данных...", false);
        const simpleData = transformSchedule(rawData);
        showMessage("3/3: Подготовка упрощенного файла...", false);
        triggerDownload(simpleData, `schedule_${groupNumber}_simple.json`);
        showMessage(`Готово! Файлы для группы ${groupNumber} скачиваются.`);
    } catch (error) {
        console.error(error);
        showMessage(`Ошибка: ${error.message}`, true);
    } finally {
        buttonEl.disabled = false;
    }
}
buttonEl.addEventListener('click', handleProcess);

const modal = document.getElementById('noteModal');
const openModalBtn = document.getElementById('openNoteModalButton');
const closeModalBtn = document.getElementById('closeNoteModalButton');
const saveNoteBtn = document.getElementById('saveNoteButton');
const cancelNoteBtn = document.getElementById('cancelNoteButton');
const noteForm = document.getElementById('noteForm');
const noteTimeInput = document.getElementById('noteTime');
const noteTimeUndefined = document.getElementById('noteTimeUndefined');

function openModal() {
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
    noteForm.reset(); 
    noteTimeInput.disabled = false; 
}

noteTimeUndefined.addEventListener('change', function() {
    if (this.checked) {
        noteTimeInput.disabled = true; 
        noteTimeInput.value = ''; 
    } else {
        noteTimeInput.disabled = false; 
    }
});

noteForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
    const noteData = {
        subject: document.getElementById('noteSubject').value || 'Без темы',
        priority: document.getElementById('notePriority').value,
        time: noteTimeInput.disabled ? 'Не определено' : noteTimeInput.value,
        text: document.getElementById('noteText').value
    };
    const safeSubject = noteData.subject.replace(/[^a-z0-9а-я\s]/gi, '').replace(/\s+/g, '_');
    const filename = `note_${safeSubject}.json`;
    try {
        triggerDownload(noteData, filename);
        console.log("Заметка сохранена и скачивается:", noteData);
        closeModal(); 
        showMessage(`Заметка "${noteData.subject}" сохранена и скачивается!`);
    } catch (error) {
        console.error("Ошибка скачивания заметки:", error);
        showMessage(`Ошибка при скачивании заметки: ${error.message}`, true);
    }
    setTimeout(() => {
        if (resultEl.textContent.includes("Заметка")) {
             resultEl.style.display = 'none';
        }
    }, 4000);
});

openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelNoteBtn.addEventListener('click', closeModal);

window.addEventListener('click', function(event) {
    if (event.target == modal) {
        closeModal();
    }
});
