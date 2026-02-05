function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const toggleBtn = document.getElementById('sidebarToggle');
  sidebar.classList.toggle('collapsed');
  mainContent.classList.toggle('expanded');
  const icon = toggleBtn.querySelector('i');
  if (sidebar.classList.contains('collapsed')) {
    icon.classList.remove('fa-chevron-left');
    icon.classList.add('fa-chevron-right');
  } else {
    icon.classList.remove('fa-chevron-right');
    icon.classList.add('fa-chevron-left');
  }
}
function resetCustomSelect(select) {
  const wrapper = select.closest('.custom-select-wrapper');
  if (wrapper) {
    const triggerSpan = wrapper.querySelector('.custom-select-trigger span');
    if (triggerSpan) triggerSpan.textContent = select.options[0].textContent;
    wrapper.querySelectorAll('.custom-option').forEach(o => o.classList.remove('selected'));
    wrapper.classList.remove('open');
  }
}
function setupDateFilters(yearId, monthGroupId, monthId, callback) {
  const yearEl = document.getElementById(yearId);
  const monthGroup = document.getElementById(monthGroupId);
  const monthEl = document.getElementById(monthId);
  if (!yearEl) return;
  const toggle = () => {
    if (yearEl.value && yearEl.value !== yearEl.options[0].textContent) {
      if (monthGroup) {
        monthGroup.style.display = 'block';
        monthGroup.classList.add('fade-in');
      }
    } else {
      if (monthGroup) monthGroup.style.display = 'none';
      if (monthEl) {
        monthEl.selectedIndex = 0;
        resetCustomSelect(monthEl);
      }
    }
    if (callback) callback();
  };
  yearEl.addEventListener('change', toggle);
  if (monthEl) monthEl.addEventListener('change', () => { if (callback) callback(); });
  toggle();
}
window.validateAndSubmit = function (e) {
  const btn = e.submitter || e.target;
  let container = btn.closest('form') || btn.closest('.customer-form, .form-section');
  if (!container) return;
  const inputs = container.querySelectorAll('input, select');
  let isValid = true;
  let firstInvalid = null;
  inputs.forEach(input => {
    if (input.hasAttribute('required')) {
      if (!input.value.trim()) {
        isValid = false;
        input.style.border = '1px solid #e74c3c';
        input.parentElement.classList.add('error');
        if (!firstInvalid) firstInvalid = input;
        if (input.tagName === 'SELECT') {
          const wrapper = input.closest('.custom-select-wrapper');
          if (wrapper) wrapper.querySelector('.custom-select-trigger').style.border = '1px solid #e74c3c';
        }
      } else {
        input.style.border = '';
        input.parentElement.classList.remove('error');
        if (input.tagName === 'SELECT') {
          const wrapper = input.closest('.custom-select-wrapper');
          if (wrapper) wrapper.querySelector('.custom-select-trigger').style.border = '';
        }
      }
    }
  });
  if (!isValid) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
    if (firstInvalid) firstInvalid.focus();
  } else {
    if (e) e.preventDefault();
    showToast('تمت العملية بنجاح', 'success');
  }
};
function initFormValidation() {
  document.querySelectorAll('input, select').forEach(input => {
    ['input', 'change'].forEach(evt => input.addEventListener(evt, function () {
      if (this.value.trim()) {
        this.style.border = '';
        if (this.tagName === 'SELECT') {
          const wrapper = this.closest('.custom-select-wrapper');
          if (wrapper) wrapper.querySelector('.custom-select-trigger').style.border = '';
        }
      }
    }));
  });
}
function initImagePreviews() {
  document.querySelectorAll('.image-upload-wrapper').forEach(wrapper => {
    const preview = wrapper.querySelector('.image-preview');
    if (preview && preview.getAttribute('src') && preview.style.display !== 'none') {
      wrapper.classList.add('has-image');
      const content = wrapper.querySelector('.upload-content');
      if (content) content.style.display = 'none';
    }
  });
}
function initFileUploads() {
  const fileInput = document.getElementById('employeeAttachments');
  if (fileInput) {
    const label = document.querySelector('label[for="employeeAttachments"] span');
    if (!label.dataset.original) label.dataset.original = label.textContent;
    fileInput.addEventListener('change', function () {
      if (this.files && this.files.length > 0) {
        label.textContent = this.files.length === 1 ? this.files[0].name : `تم تحديد ${this.files.length} ملفات`;
        label.style.color = '#2ecc71';
        label.style.fontWeight = 'bold';
      } else {
        label.textContent = label.dataset.original;
        label.style.color = '';
        label.style.fontWeight = '';
      }
    });
  }
}
function handleImageUpload(input, previewId) {
  const preview = document.getElementById(previewId);
  const file = input.files && input.files[0];
  const wrapper = input.closest('.image-upload-wrapper');
  const content = wrapper ? wrapper.querySelector('.upload-content') : null;
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = 'block';
      if (wrapper) wrapper.classList.add('has-image');
      if (content) content.style.display = 'none';
    }
    reader.readAsDataURL(file);
  } else {
    preview.src = '';
    preview.style.display = 'none';
    if (wrapper) wrapper.classList.remove('has-image');
    if (content) content.style.display = 'flex';
  }
}
function populateFilters() {
  const rows = document.querySelectorAll('.customer-row');
  if (rows.length === 0) return;
  const jobs = new Set();
  const entities = new Set();
  rows.forEach(row => {
    const job = row.querySelector('.col-job')?.textContent.trim();
    if (job) jobs.add(job);
    const entity = row.querySelector('.col-entity')?.textContent.trim();
    if (entity) entities.add(entity);
  });
  document.querySelectorAll('.filter-select').forEach(select => {
    if (select.options.length > 1) return;
    const placeholder = select.options[0].textContent;
    let source = placeholder.includes('المهنة') ? jobs : (placeholder.includes('جهة العمل') ? entities : null);
    if (source) {
      source.forEach(val => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = val;
        select.appendChild(opt);
      });
    }
  });
}
function initCustomSelects() {
  document.querySelectorAll('select').forEach(select => {
    if (select.parentNode.classList.contains('custom-select-wrapper')) return;
    const existingIcon = select.parentNode.querySelector('.dropdown-icon, .fa-chevron-down');
    if (existingIcon) existingIcon.remove();
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    const textSpan = document.createElement('span');
    textSpan.innerHTML = select.options[select.selectedIndex] ? select.options[select.selectedIndex].textContent : '&nbsp;';
    trigger.appendChild(textSpan);
    const arrow = document.createElement('i');
    arrow.className = 'fas fa-chevron-down dropdown-icon';
    trigger.appendChild(arrow);
    wrapper.appendChild(trigger);
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'custom-options';
    Array.from(select.options).forEach(option => {
      if (option.disabled) return;
      const customOption = document.createElement('div');
      customOption.className = 'custom-option';
      customOption.textContent = option.textContent;
      customOption.dataset.value = option.value;
      if (option.selected) customOption.classList.add('selected');
      customOption.addEventListener('click', function (e) {
        e.stopPropagation();
        wrapper.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        textSpan.textContent = this.textContent;
        select.value = this.dataset.value;
        select.dispatchEvent(new Event('change'));
        wrapper.classList.remove('open');
      });
      optionsContainer.appendChild(customOption);
    });
    wrapper.appendChild(optionsContainer);
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      document.querySelectorAll('.custom-select-wrapper').forEach(o => { if (o !== wrapper) o.classList.remove('open'); });
      wrapper.classList.toggle('open');
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.custom-select-wrapper')) document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
  });
}
function performFilter() {
  const container = document.querySelector('.customers-list-container, .employees-list-container, .reports-list-container, .accounts-list-container, .permissions-list-container');
  if (!container) return;
  let table = null;
  const typeFilter = document.getElementById('accountTypeFilter');
  if (typeFilter) {
    if (typeFilter.value === 'employee') table = document.getElementById('employeeAccountsTable');
    else if (typeFilter.value === 'customer') table = document.getElementById('customerAccountsTable');
  }
  if (!table) {
    const tables = container.querySelectorAll('.custom-table');
    for (const t of tables) {
      if (t.offsetParent !== null || window.getComputedStyle(t).display !== 'none') { table = t; break; }
    }
    if (!table && tables.length) table = tables[0];
  }
  if (!table) return;
  table.style.display = '';
  const searchInput = document.querySelector('.main-search-input');
  const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const rows = table.querySelectorAll('tbody tr');
  let visibleCount = 0;
  const activeFilters = {};
  document.querySelectorAll('.filter-select').forEach(select => {
    if (select.id === 'accountTypeFilter') return;
    if (!select.id.startsWith('stats') && select.closest('.filter-group') && select.closest('.filter-group').offsetParent === null) return;
    if (select.selectedIndex > 0 && select.value !== 'all') {
      activeFilters[select.options[0].textContent.trim()] = select.value.toLowerCase().trim();
    }
  });
  rows.forEach(row => {
    let isVisible = true;
    const rowText = row.textContent.toLowerCase();

    // Custom Search Logic for Customers / Index
    let searchContext = rowText;
    if (document.querySelector('.customers-list-container')) {
      let codeIdx = 1, nameIdx = 2, phoneIdx = 5;
      if (!table.querySelector('th.col-th-id')) { codeIdx = 0; nameIdx = 1; phoneIdx = 3; }
      const code = row.cells[codeIdx]?.textContent || '';
      const name = row.cells[nameIdx]?.textContent || '';
      const phoneCell = row.cells[phoneIdx];
      let phoneInfo = phoneCell ? phoneCell.textContent.trim() : '';
      if (phoneCell) {
        const links = phoneCell.querySelectorAll('a');
        if (links.length) links.forEach(l => phoneInfo += (l.getAttribute('href') || '') + ' ');
      }
      searchContext = (code + ' ' + name + ' ' + phoneInfo).toLowerCase();
    }

    if (searchText && !searchContext.includes(searchText)) isVisible = false;

    if (isVisible && Object.keys(activeFilters).length > 0) {
      for (const [key, value] of Object.entries(activeFilters)) {
        if (key.includes('السنة') || key.includes('الشهر')) {
          const dateMatch = rowText.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
          let rYear = null, rMonth = null;
          if (dateMatch) { rYear = parseInt(dateMatch[1]); rMonth = parseInt(dateMatch[2]); }
          else if (row.dataset.year) { rYear = parseInt(row.dataset.year); if (row.dataset.month) rMonth = parseInt(row.dataset.month); }

          if (rYear) {
            if (activeFilters['السنة'] && rYear !== parseInt(activeFilters['السنة'])) isVisible = false;
            if (isVisible && activeFilters['الشهر']) {
              const months = { 'يناير': 1, 'فبراير': 2, 'مارس': 3, 'أبريل': 4, 'مايو': 5, 'يونيو': 6, 'يوليو': 7, 'أغسطس': 8, 'سبتمبر': 9, 'أكتوبر': 10, 'نوفمبر': 11, 'ديسمبر': 12 };
              let mVal = months[activeFilters['الشهر']] || parseInt(activeFilters['الشهر']);
              if (rMonth && mVal && rMonth !== mVal) isVisible = false;
            }
          } else { isVisible = false; }
          if (!isVisible) break;
          continue;
        }
        if (key.includes('الفترة') || key.includes('Time')) {
          // ... (Simple Date match regex reuse)
          const dm = rowText.match(/(\d{4})[\/\-\s]*(\d{1,2})[\/\-\s]*(\d{1,2})/);
          if (dm) {
            const rd = new Date(parseInt(dm[1]), parseInt(dm[2]) - 1, parseInt(dm[3]));
            rd.setHours(0, 0, 0, 0);
            const today = new Date(); today.setHours(0, 0, 0, 0);
            if (value === 'today' && rd.getTime() !== today.getTime()) isVisible = false;
            else if (value === 'week') {
              const last7 = new Date(today); last7.setDate(today.getDate() - 7);
              if (rd < last7 || rd > today) isVisible = false;
            }
            else if (value === 'month' && (rd.getMonth() !== today.getMonth() || rd.getFullYear() !== today.getFullYear())) isVisible = false;
          }
          if (!isVisible) break;
          continue;
        }
        if (key.includes('الخصم') || key.includes('Discount')) {
          const pm = rowText.match(/(\d+)%/);
          if (pm) {
            const p = parseInt(pm[1]);
            if ((value === 'high' && p <= 20) || (value === 'medium' && (p < 10 || p > 20)) || (value === 'low' && p >= 10)) isVisible = false;
          }
          continue;
        }
        if ((key.includes('الحالة') || key.includes('Status'))) {
          if (value === 'نشط' && rowText.includes('غير نشط') && !rowText.replace('غير نشط', '').includes('نشط')) { isVisible = false; break; }
        }
        if (!rowText.includes(value)) { isVisible = false; break; }
      }
    }
    row.style.display = isVisible ? '' : 'none';
    if (isVisible) visibleCount++;
  });
  let noRes = document.getElementById('noResultsMsg');
  if (!noRes && container) {
    noRes = document.createElement('div'); noRes.id = 'noResultsMsg'; noRes.className = 'no-results-message';
    noRes.innerHTML = `<div class="no-results-content"><div class="icon-wrapper"><i class="fas fa-search"></i></div><h3 class="no-results-title">لا توجد نتائج مطابقة</h3><p class="no-results-desc">لم نعثر على أي بيانات تطابق معايير البحث الخاصة بك.</p></div>`;
    container.appendChild(noRes);
  }
  if (visibleCount === 0) {
    if (table) table.style.display = 'none';
    if (noRes) noRes.style.display = 'block';
  } else {
    if (table) table.style.display = '';
    if (noRes) noRes.style.display = 'none';
  }
}
function initSearchListeners() {
  const searchInput = document.querySelector('.main-search-input');
  if (searchInput) {
    ['input', 'click'].forEach(evt => searchInput.addEventListener(evt, performFilter));
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); scrollToResults(); } });
  }
  const resetBtn = document.querySelector('.filter-icon-wrapper');
  if (resetBtn) {
    resetBtn.style.cursor = 'pointer';
    resetBtn.addEventListener('click', () => {
      document.querySelectorAll('.filter-select').forEach(sel => {
        if (sel.id !== 'accountTypeFilter') {
          sel.selectedIndex = 0;
          resetCustomSelect(sel);
        }
      });
      if (searchInput) searchInput.value = '';
      performFilter();
      ['centerFilterGroup', 'monthFilterGroup', 'reportMonthFilterGroup', 'permissionsMonthFilterGroup', 'statsMonthFilterGroup'].forEach(id => {
        const el = document.getElementById(id); if (el) el.style.display = 'none';
      });
    });
  }
  document.querySelectorAll('.filter-select').forEach(s => s.addEventListener('change', performFilter));

  // Setup Date Filters for various pages
  setupDateFilters('yearFilter', 'monthFilterGroup', 'monthFilter', performFilter);
  setupDateFilters('reportYearFilter', 'reportMonthFilterGroup', 'reportMonthFilter', performFilter);
  setupDateFilters('permissionsYearFilter', 'permissionsMonthFilterGroup', 'permissionsMonthFilter', performFilter);
  setupDateFilters('statsYearFilter', 'statsMonthFilterGroup', 'statsMonthFilter', typeof updateAccountStats !== 'undefined' ? updateAccountStats : performFilter);

  // Stats logic
  if (document.getElementById('statsYearFilter')) {
    // If setupDateFilters called performs callback, updateAccountStats needs to be defined globally or we rely on performFilter triggering it?
    // updateAccountStats is defined in another scope in original. I'll make it global.
  }

  const actType = document.getElementById('accountTypeFilter');
  if (actType) {
    actType.addEventListener('change', function () {
      const isEmp = this.value === 'employee';
      ['employeeFilterGroup', 'employeeAccountsTableWrapper'].forEach(id => document.getElementById(id)?.classList.toggle('d-none', !isEmp));
      ['customerFilterGroup', 'customerAccountsTableWrapper'].forEach(id => document.getElementById(id)?.classList.toggle('d-none', isEmp));
      document.querySelectorAll('.filter-select').forEach(s => { if (s !== this) { s.selectedIndex = 0; resetCustomSelect(s); } });
      const tbl = document.getElementById(isEmp ? 'employeeAccountsTableWrapper' : 'customerAccountsTableWrapper')?.querySelector('table');
      if (tbl) tbl.style.display = '';
      setTimeout(performFilter, 0);
    });
  }
}
function scrollToResults() {
  const c = document.querySelector('.customers-list-container, .employees-list-container, .reports-list-container, .accounts-list-container, .permissions-list-container');
  if (c) {
    const y = c.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}
function initSidebarIcons() {
  const map = {
    'الصفحة الرئيسية': 'home-icon.png', 'العملاء': 'customers-icon.png', 'المندوبين': 'employees-icon.png',
    'الخصومات': 'discounts-icon.png', 'الحسابات': 'accounts-icon.png', 'التقارير': 'reports-icon.png',
    'الأذونات': 'permissions-icon.png', 'سجل النشاط': 'activity-icon.png', 'تسجيل الخروج': 'logout-icon.png'
  };
  document.querySelectorAll('.sidebar-menu a').forEach(a => {
    if (a.querySelector('.sidebar-icon')) return;
    const file = map[a.textContent.trim()];
    if (file) {
      const img = document.createElement('img');
      img.src = `images/${file}`; img.className = 'sidebar-icon'; img.alt = a.textContent.trim();
      a.insertBefore(img, a.firstChild);
    }
  });
}
function animateValue(el, end, suffix, prefix = '') {
  const start = parseInt(el.textContent.replace(/\D/g, '')) || 0;
  if (start === end) return;
  const startTime = performance.now();
  const update = (now) => {
    const prog = Math.min((now - startTime) / 500, 1);
    const val = Math.floor(start + (end - start) * (1 - Math.pow(1 - prog, 3)));
    el.textContent = prefix + val.toLocaleString() + suffix;
    if (prog < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}
function animateStats() {
  document.querySelectorAll('.stat-value').forEach(stat => {
    const target = parseInt(stat.textContent.replace(/\D/g, ''));
    if (!isNaN(target)) animateValue(stat, target, '', '');
  });
}
function toggleNotifications() {
  if (window.innerWidth <= 768) window.location.href = 'notifications.html';
  else document.getElementById('notificationDropdown')?.classList.toggle('show');
}
function initNotificationsPage() {
  const searchInput = document.getElementById('notificationSearch');
  const cards = document.querySelectorAll('.n-card');
  const btns = document.querySelectorAll('.n-filter-btn');
  if (!searchInput && !btns.length) return;
  let filter = 'all';
  const apply = () => {
    const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let count = 0;
    cards.forEach(c => {
      let show = true;
      if (filter === 'unread') show = c.classList.contains('unread');
      else if (filter !== 'all') {
        const txt = (c.querySelector('.n-title')?.textContent + ' ' + c.querySelector('.n-desc')?.textContent).toLowerCase();
        const keys = filter === 'accounts' ? ['حساب', 'صلاحي', 'مستخدم', 'موافق'] : ['عميل', 'فاتورة', 'مندوب'];
        show = keys.some(k => txt.includes(k));
      }
      if (show && term) {
        const txt = (c.querySelector('.n-title')?.textContent + ' ' + c.querySelector('.n-desc')?.textContent).toLowerCase();
        if (!txt.includes(term)) show = false;
      }
      c.style.display = show ? 'flex' : 'none';
      if (show) count++;
    });
    document.querySelectorAll('.n-timeline-group').forEach(g => {
      g.style.display = Array.from(g.querySelectorAll('.n-card')).some(c => c.style.display !== 'none') ? 'block' : 'none';
    });
    const nr = document.getElementById('noResultsMessage'); if (nr) nr.style.display = count === 0 ? 'block' : 'none';
    const cntEl = document.querySelector('.n-page-header p .text-danger'); if (cntEl) cntEl.textContent = count;
  };
  if (searchInput) searchInput.addEventListener('input', apply);
  btns.forEach(b => b.addEventListener('click', function () {
    btns.forEach(x => x.classList.remove('active')); this.classList.add('active');
    filter = this.getAttribute('data-filter'); apply();
  }));
}
function initLinkedFilters() {
  const gov = document.getElementById('governorateSelect');
  const grp = document.getElementById('centerFilterGroup');
  const cen = document.getElementById('centerSelect');
  if (gov && grp && cen) {
    if (gov.selectedIndex > 0) grp.style.display = 'block';
    gov.addEventListener('change', function () {
      if (this.selectedIndex > 0) grp.style.display = 'block';
      else {
        grp.style.display = 'none'; cen.selectedIndex = 0; resetCustomSelect(cen);
      }
    });
  }
}
let childCounter = 0;
function toggleGoldenCardFeatures() {
  const type = document.getElementById('cardType');
  const isGold = type && type.value === 'golden';
  document.querySelectorAll('.golden-feature').forEach(f => f.style.display = isGold ? 'block' : 'none');
  const sec = document.getElementById('childrenSection'); if (sec) sec.style.display = isGold ? 'flex' : 'none'; // logic simplified based on CSS usually handling hiding
  // Detailed logic from original maintained for specific input hiding
  const inp = document.getElementById('childrenNames');
  const btn = document.getElementById('addChildBtn');
  const cont = document.getElementById('childrenWithImagesContainer');
  if (isGold) {
    if (inp) { inp.style.display = 'none'; if (inp.parentElement.classList.contains('input-group')) inp.parentElement.style.display = 'none'; }
    if (btn) btn.style.display = 'inline-flex';
  } else {
    if (inp) { inp.style.display = 'block'; if (inp.parentElement.classList.contains('input-group')) inp.parentElement.style.display = 'flex'; }
    if (btn) btn.style.display = 'none';
    if (cont) { cont.style.display = 'none'; cont.innerHTML = ''; childCounter = 0; }
  }
}
function addChildWithImage() {
  const c = document.getElementById('childrenWithImagesContainer');
  if (!c) return;
  c.style.display = 'flex';
  childCounter = c.children.length + 1;
  const id = `child_${Date.now()}`, imgId = `img_${Date.now()}`, prevId = `prev_${Date.now()}`;
  const row = document.createElement('div'); row.className = 'child-dynamic-row'; row.id = id;
  row.innerHTML = `<div class="image-upload-wrapper square-upload"><input type="file" id="${imgId}" accept="image/*" hidden onchange="handleImageUpload(this, '${prevId}')"/><label for="${imgId}" class="image-upload-label"><div class="upload-content"><span>صورة</span><img src="images/image-icon.png" class="image-icon"></div><img id="${prevId}" class="image-preview" style="display:none;"/></label></div><div class="input-group flex-grow-1 position-relative"><button type="button" class="remove-child-btn-floating" onclick="document.getElementById('${id}').remove(); renumberChildren();"><i class="fas fa-times"></i></button><input type="text" placeholder="اسم الابن ${childCounter}" style="padding-right: 45px;"/></div>`;
  c.appendChild(row);
}
function renumberChildren() {
  const c = document.getElementById('childrenWithImagesContainer');
  if (c) {
    if (c.children.length === 0) c.style.display = 'none';
    c.querySelectorAll('.child-dynamic-row input[type="text"]').forEach((inp, i) => inp.placeholder = `اسم الابن ${i + 1}`);
  }
}
function updateAccountStats() {
  const yEl = document.getElementById('statsYearFilter');
  const mEl = document.getElementById('statsMonthFilter');
  const y = yEl ? yEl.value : null;
  const m = mEl ? mEl.value : null;
  const rev = document.getElementById('totalRevenueStat');
  if (!rev) return;
  let factor = 1;
  if (y === '2024') factor = 1.05; if (y === '2025') factor = 1.25; if (y === '2026') factor = 0.8;
  const mNum = parseInt(m);
  if (m && !isNaN(mNum)) factor *= (0.9 + (mNum / 20));
  let base = { t: 150000, gc: 85, gr: 85000, nc: 120, nr: 65000 };
  if (m && !isNaN(mNum)) { for (let k in base) base[k] = Math.floor(base[k] / 12); }
  animateValue(rev, Math.floor(base.t * factor), ' ج.م');
  const gel = document.getElementById('goldenCardsCount'); if (gel) animateValue(gel, Math.floor(base.gc * factor), ' كارت');
  const grel = document.getElementById('goldenCardsRevenue'); if (grel) animateValue(grel, Math.floor(base.gr * factor), ' ج.م', '+ ');
  const nel = document.getElementById('normalCardsCount'); if (nel) animateValue(nel, Math.floor(base.nc * factor), ' كارت');
  const nrel = document.getElementById('normalCardsRevenue'); if (nrel) animateValue(nrel, Math.floor(base.nr * factor), ' ج.م', '+ ');
}
function initPrintButton() {
  const btn = document.querySelector('.header-icon-btn i.fa-print')?.closest('button');
  if (btn) btn.addEventListener('click', () => window.print());
}
window.addEventListener('click', e => {
  const d = document.getElementById('notificationDropdown');
  const b = document.querySelector('.notification-btn');
  if (d && b && !d.contains(e.target) && !b.contains(e.target)) d.classList.remove('show');
});
document.addEventListener('DOMContentLoaded', () => {
  const sb = document.getElementById('sidebar');
  if (sb) sb.addEventListener('click', function (e) { if (window.innerWidth <= 768 && e.target === this && sb.classList.contains('collapsed')) toggleSidebar(); });
  populateFilters();
  initCustomSelects();
  initSearchListeners();
  initSidebarIcons();
  initPrintButton();
  animateStats();
  initImagePreviews();
  initLinkedFilters();
  initFormValidation();
  initNotificationsPage();
  initFileUploads();
});
