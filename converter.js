export async function getSchedule(numberInput) {
    const url = `https://iis.bsuir.by/api/v1/schedule?studentGroup=${numberInput}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Неизвестная ошибка" }));
        throw new Error(`Ошибка API: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
}

export function triggerDownload(data, filename) {
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
