let title = document.getElementById('title');
let price = document.getElementById('price');
let taxes = document.getElementById('tax');
let ads = document.getElementById('ads');
let discount = document.getElementById('discount');
let total = document.getElementById('total');
let count = document.getElementById('count');
let category = document.getElementById('category');
let submit = document.getElementById('submit');
let mode = 'create';
let tmp;
let sermode = 'title';

// --- Sorting and Export Features ---
// Track current sort state
let currentSort = { key: null, asc: true };

// Sorting function
function sortData(key) {
    currentSort.asc = currentSort.key === key ? !currentSort.asc : true;
    currentSort.key = key;
    datapro.sort((a, b) => {
        if (key === 'id') {
            return currentSort.asc ? datapro.indexOf(a) - datapro.indexOf(b) : datapro.indexOf(b) - datapro.indexOf(a);
        }
        if (!isNaN(+a[key]) && !isNaN(+b[key])) {
            return currentSort.asc ? +a[key] - +b[key] : +b[key] - +a[key];
        }
        return currentSort.asc ? String(a[key]).localeCompare(String(b[key])) : String(b[key]).localeCompare(String(a[key]));
    });
    showData();
}

// Add event listeners to table headers for sorting
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => sortData(th.getAttribute('data-sort')));
    });
    // Export buttons
    document.getElementById('export-csv').addEventListener('click', exportCSV);
    document.getElementById('export-json').addEventListener('click', exportJSON);
});

// Export to CSV
function exportCSV() {
    if (!datapro.length) return showAlert('No data to export.', 'warning');
    const headers = Object.keys(datapro[0]);
    const rows = datapro.map(obj => headers.map(h => '"' + String(obj[h]).replace(/"/g, '""') + '"').join(','));
    const csv = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export to JSON
function exportJSON() {
    if (!datapro.length) return showAlert('No data to export.', 'warning');
    const json = JSON.stringify(datapro, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Use const/let, arrow functions, and add comments for clarity
const getTotal = () => {
    if (price.value !== '') {
        const result = (+price.value + +taxes.value + +ads.value) - +discount.value;
        total.innerHTML = result;
        total.style.background = 'green';
    } else {
        total.innerHTML = '';
        total.style.background = 'red';
    }
};

// Initialize product data from localStorage
let datapro = localStorage.product ? JSON.parse(localStorage.product) : [];

// Handle form submission (create/update)
submit.onclick = () => {
    // Input validation (already present)
    let errors = [];
    if (!title.value.trim()) errors.push('Title is required.');
    if (!price.value.trim() || isNaN(price.value) || +price.value < 0) errors.push('Price must be a non-negative number.');
    if (!taxes.value.trim() || isNaN(taxes.value) || +taxes.value < 0) errors.push('Tax must be a non-negative number.');
    if (!ads.value.trim() || isNaN(ads.value) || +ads.value < 0) errors.push('Ads must be a non-negative number.');
    if (!discount.value.trim() || isNaN(discount.value) || +discount.value < 0) errors.push('Discount must be a non-negative number.');
    if (!count.value.trim() || isNaN(count.value) || +count.value < 1) errors.push('Count must be at least 1.');
    if (!category.value.trim()) errors.push('Category is required.');

    if (errors.length > 0) {
        showAlert(errors.join('<br>'), 'danger');
        return;
    }

    const newPro = {
        title: title.value,
        price: price.value,
        taxes: taxes.value,
        ads: ads.value,
        discount: discount.value,
        total: total.innerHTML,
        count: count.value,
        category: category.value,
    };

    if (mode === 'create') {
        if (newPro.count > 1) {
            for (let i = 0; i < newPro.count; i++) {
                datapro.push(newPro);
            }
        } else {
            datapro.push(newPro);
        }
        showAlert('Product(s) created successfully!', 'success');
    } else {
        datapro[tmp] = newPro;
        mode = 'create';
        count.style.display = 'block';
        showAlert('Product updated successfully!', 'success');
    }

    localStorage.setItem('product', JSON.stringify(datapro));
    clearData();
    showData();
};

// Show Bootstrap alert
function showAlert(message, type) {
    const alertArea = document.getElementById('alert-area');
    alertArea.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
    setTimeout(() => {
        if (alertArea.firstChild) {
            alertArea.firstChild.classList.remove('show');
            alertArea.firstChild.classList.add('hide');
        }
    }, 3500);
}

// Clear form fields
const clearData = () => {
    title.value = '';
    price.value = '';
    taxes.value = '';
    ads.value = '';
    discount.value = '';
    total.innerHTML = '';
    count.value = '';
    category.value = '';
};

// Render product table
const showData = () => {
    getTotal();
    let table = '';
    datapro.forEach((pro, i) => {
        table += `
        <tr>
            <td>${i}</td>
            <td>${pro.title}</td>
            <td>${pro.price}</td>
            <td>${pro.taxes}</td>
            <td>${pro.ads}</td>
            <td>${pro.discount}</td>
            <td>${pro.total}</td>
            <td>${pro.category}</td>
            <td><button onclick="updateData(${i})" id="update">Update</button></td>
            <td><button onclick="deleteData(${i})" id="delete">Delete</button></td>
        </tr>
        `;
    });
    document.getElementById('tbody').innerHTML = table;
    const deletebtn = document.getElementById('deleteAll');
    if (datapro.length > 0) {
        deletebtn.innerHTML = `<button onclick="deleteAll()">deleteAll (${datapro.length})</button>`;
    } else {
        deletebtn.innerHTML = '';
    }
};

showData();

// Delete a product
const deleteData = i => {
    datapro.splice(i, 1);
    localStorage.product = JSON.stringify(datapro);
    showData();
};

// Delete all products
const deleteAll = () => {
    localStorage.clear();
    datapro.splice(0);
    showData();
};

// Update a product
const updateData = i => {
    title.value = datapro[i].title;
    title.autofocus;
    price.value = datapro[i].price;
    taxes.value = datapro[i].taxes;
    ads.value = datapro[i].ads;
    discount.value = datapro[i].discount;
    getTotal();
    count.style.display = 'none';
    category.value = datapro[i].category;
    submit.innerHTML = 'Update';
    mode = 'Update';
    tmp = i;
    scroll({ top: 0, behavior: 'smooth' });
};

// Search mode toggle
const getsermode = id => {
    const search = document.getElementById('search');
    if (id === 'searchtitle') {
        sermode = 'title';
        search.placeholder = 'Search by title';
    } else {
        sermode = 'category';
        search.placeholder = 'Search by category';
    }
    search.focus();
    search.value = '';
    showData();
};

// Search data
const searchdata = value => {
    let table = '';
    if (sermode === 'title') {
        datapro.forEach((pro, i) => {
            if (pro.title.includes(value)) {
                table += `
                <tr>
                    <td>${i}</td>
                    <td>${pro.title}</td>
                    <td>${pro.price}</td>
                    <td>${pro.taxes}</td>
                    <td>${pro.ads}</td>
                    <td>${pro.discount}</td>
                    <td>${pro.total}</td>
                    <td>${pro.category}</td>
                    <td><button onclick="updateData(${i})" id="update">Update</button></td>
                    <td><button onclick="deleteData(${i})" id="delete">Delete</button></td>
                </tr>
                `;
            }
        });
    } else {
        datapro.forEach((pro, i) => {
            if (pro.category.includes(value)) {
                table += `
                <tr>
                    <td>${i}</td>
                    <td>${pro.title}</td>
                    <td>${pro.price}</td>
                    <td>${pro.taxes}</td>
                    <td>${pro.ads}</td>
                    <td>${pro.discount}</td>
                    <td>${pro.total}</td>
                    <td>${pro.category}</td>
                    <td><button onclick="updateData(${i})" id="update">Update</button></td>
                    <td><button onclick="deleteData(${i})" id="delete">Delete</button></td>
                </tr>
                `;
            }
        });
    }
    document.getElementById('tbody').innerHTML = table;
};

// --- Theme Switcher ---
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

const setTheme = (theme) => {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        themeIcon.textContent = '🌙';
    }
    localStorage.setItem('theme', theme);
};

// Toggle theme on button click
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        setTheme(isDark ? 'light' : 'dark');
    });
}

// On load, apply saved theme
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
});

//clean
