// Подключение к вашему проекту в Supabase
const SUPABASE_URL = 'https://jwzqkczrjdwybhdpjgks.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_50jNkdVDo9fSyBt788C5zw_lIv_InbV';

// Инициализация клиента Supabase
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// Функция загрузки данных из таблицы products
async function loadProducts() {
    const tableBody = document.getElementById('table-body');
    
    // Сообщение о загрузке
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #888;">Загрузка данных из Supabase...</td></tr>`;

    try {
        // Запрос к базе данных (сортировка по id)
        const { data: products, error } = await _supabase
            .from('products')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            throw error;
        }

        // Очищаем таблицу перед отрисовкой
        tableBody.innerHTML = '';

        if (!products || products.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #888;">Таблица пуста</td></tr>`;
            updateSummary(0, 0, 0);
            return;
        }

        let totalQuantity = 0;
        let totalSum = 0;

        // Заполняем таблицу данными
        products.forEach(product => {
            const row = document.createElement('tr');
            
            // Форматирование цен и сумм
            const priceFormatted = Number(product.price).toLocaleString('ru-RU', { minimumFractionDigits: 2 });
            const totalFormatted = Number(product.total).toLocaleString('ru-RU', { minimumFractionDigits: 2 });

            row.innerHTML = `
                <td>${product.id}</td>
                <td>${escapeHtml(product.name)}</td>
                <td class="numeric">${priceFormatted}</td>
                <td class="numeric">${product.quantity}</td>
                <td class="numeric total-cell">${totalFormatted}</td>
            `;
            
            tableBody.appendChild(row);

            // Подсчет общей статистики
            totalQuantity += Number(product.quantity);
            totalSum += Number(product.total);
        });

        // Вывод итогов
        updateSummary(products.length, totalQuantity, totalSum);

    } catch (error) {
        console.error('Ошибка при загрузке данных:', error.message);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 20px; color: #ff5252;">Ошибка загрузки: ${error.message}</td></tr>`;
    }
}

// Функция обновления итогов внизу страницы
function updateSummary(modelsCount, totalItems, summaryCost) {
    const summaryContainer = document.getElementById('summary-container');
    if (summaryContainer) {
        summaryContainer.innerHTML = `
            <span>Моделей: <strong>${modelsCount}</strong></span>
            <span>Всего штук: <strong>${totalItems}</strong></span>
            <span>Общая стоимость: <strong style="color: #3ecf8e;">${summaryCost.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</strong></span>
        `;
    }
}

// Защита от XSS-инъекций
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}
