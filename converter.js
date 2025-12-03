// converter.js
export async function getSchedule(numberInput) {
    const url = `https://iis.bsuir.by/api/v1/schedule?studentGroup=${numberInput}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Неизвестная ошибка" }));
        throw new Error(`Ошибка API БГУИР: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
}