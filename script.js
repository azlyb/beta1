let contacts = [];
let profilePhotoBase64 = '';

document.getElementById('saveContact').addEventListener('click', saveContact);
document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
document.getElementById('photoInput').addEventListener('change', handlePhotoUpload);
document.getElementById('exportCsv').addEventListener('click', exportToCSV);
document.getElementById('exportVcf').addEventListener('click', exportToVCF);

// Capitalize firstName and lastName while typing
['firstName', 'lastName'].forEach(id => {
  document.getElementById(id).addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\b\w/g, l => l.toUpperCase());
  });
});

// Malaysia Phone format for phone1 and phone2
['phone1', 'phone2'].forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener('input', () => input.value = formatPhone(input.value));
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pastedData = (e.clipboardData || window.clipboardData).getData('text');
    input.value = formatPhone(pastedData);
  });
});

// Email Validation (on blur)
document.getElementById('email').addEventListener('blur', (e) => {
  const emailInput = e.target;
  if (emailInput.value.trim() && !validateEmail(emailInput.value.trim())) {
    emailInput.style.borderColor = 'red';
  } else {
    emailInput.style.borderColor = '';
  }
});

// Birthday Picker
flatpickr("#birthday", {
  dateFormat: "d/m/Y"
});

// ========= Functions =========

function saveContact() {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const phone1 = formatPhone(document.getElementById('phone1').value.trim());
  const phone2 = formatPhone(document.getElementById('phone2').value.trim());
  const email = document.getElementById('email').value.trim();
  const birthday = document.getElementById('birthday').value.trim();
  const tags = document.getElementById('tags').value;

  const contact = { firstName, lastName, phone1, phone2, email, birthday, tags, photo: profilePhotoBase64 };
  contacts.push(contact);
  renderContacts();
  clearForm();
}

function renderContacts() {
  const tbody = document.querySelector('#contactsTable tbody');
  tbody.innerHTML = '';
  contacts.forEach((c, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${c.firstName}</td>
      <td>${c.lastName}</td>
      <td>${c.phone1}</td>
      <td>${c.phone2}</td>
      <td>${c.email}</td>
      <td>${c.birthday}</td>
      <td>${c.tags}</td>
    `;
    tbody.appendChild(tr);
  });
}

function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      profilePhotoBase64 = evt.target.result.split(',')[1];
    };
    reader.readAsDataURL(file);
  }
}

function toggleDarkMode() {
  document.body.toggleAttribute('data-theme');
}

function formatPhone(value) {
  value = value.replace(/\D/g, '');
  if (!value.startsWith('6')) value = '6' + value;
  value = '+' + value;
  if (value.length > 5) value = value.slice(0, 5) + '-' + value.slice(5);
  if (value.length > 10) value = value.slice(0, 10) + value.slice(10);
  return value.slice(0, 15);
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function clearForm() {
  document.getElementById('firstName').value = '';
  document.getElementById('lastName').value = '';
  document.getElementById('phone1').value = '';
  document.getElementById('phone2').value = '';
  document.getElementById('email').value = '';
  document.getElementById('birthday').value = '';
  document.getElementById('tags').value = '';
  document.getElementById('photoInput').value = '';
  profilePhotoBase64 = '';
}

// Export to CSV
function exportToCSV() {
  if (contacts.length === 0) return alert('No contacts to export!');
  const headers = ["First Name", "Last Name", "Phone 1", "Phone 2", "Email", "Birthday", "Tags"];
  const rows = contacts.map(c => [
    c.firstName, c.lastName, c.phone1, c.phone2, c.email, c.birthday, c.tags
  ]);
  const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
  downloadFile('contacts.csv', csvContent);
}

// Export to VCF
function exportToVCF() {
  if (contacts.length === 0) return alert('No contacts to export!');
  let vcfContent = '';
  contacts.forEach(c => {
    vcfContent += "BEGIN:VCARD\nVERSION:3.0\n";
    if (c.photo) vcfContent += `PHOTO;ENCODING=b;TYPE=JPEG:${c.photo}\n`;
    vcfContent += `N:${c.lastName};${c.firstName};;;\nFN:${c.firstName} ${c.lastName}\n`;
    if (c.phone1) vcfContent += `TEL;TYPE=CELL:${c.phone1}\n`;
    if (c.phone2) vcfContent += `TEL;TYPE=HOME:${c.phone2}\n`;
    if (c.email) vcfContent += `EMAIL:${c.email}\n`;
    if (c.birthday) vcfContent += `BDAY:${formatBirthdayForVcf(c.birthday)}\n`;
    if (c.tags) vcfContent += `CATEGORIES:${c.tags}\n`;
    vcfContent += "END:VCARD\n";
  });
  downloadFile('contacts.vcf', vcfContent);
}

function formatBirthdayForVcf(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}