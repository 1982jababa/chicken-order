/***** 你的 Google Apps Script Web App URL（已填） *****/
const googleScriptURL =
  'https://script.google.com/macros/s/AKfycbyrA_MVNiHvIlQ0nI-Dh1_ta3LlaDaqg5hLl23qXuQgT3fszsaPpyILSItrmceJ5tT3/exec';

/***** 菜單與價格（口味全部 0 元，含海苔、起司） *****/
const mainDishList = [
  { name: "脆皮雞排", price: 85 },
  { name: "無骨雞塊", price: 70 },
  { name: "無骨雞腿排", price: 85 },
  { name: "鮮蝦+白飯", price: 70 },
  { name: "無敵雞塊(大)", price: 120 }
];

const flavorList = [
  { name: "（不選）", price: 0 },
  { name: "原味", price: 0 },
  { name: "胡椒", price: 0 },
  { name: "辣味", price: 0 },
  { name: "梅粉", price: 0 },
  { name: "綜合", price: 0 },
  { name: "特調", price: 0 },
  { name: "咖哩", price: 0 },
  { name: "海苔", price: 0 },
  { name: "起司", price: 0 }
];

const snackList = [
  { name: "柳葉魚", price: 39 }, { name: "脆皮七里香", price: 30 }, { name: "脆皮雞心", price: 30 },
  { name: "脆皮雞翅", price: 30 }, { name: "脆薯（大份）", price: 50 }, { name: "脆薯（小份）", price: 30 },
  { name: "貢丸", price: 30 }, { name: "噗波起司球", price: 30 }, { name: "起司條（2入）", price: 30 },
  { name: "美式洋蔥圈", price: 30 }, { name: "包心小湯圓", price: 30 }, { name: "甜不辣（大份）", price: 50 },
  { name: "甜不辣（小份）", price: 20 }, { name: "QQ地瓜球", price: 20 }, { name: "QQ芋球", price: 20 },
  { name: "銀絲卷", price: 20 }, { name: "燻乳銀絲卷", price: 25 }, { name: "梅子地瓜（大）", price: 50 },
  { name: "梅子地瓜（小）", price: 20 }, { name: "米腸", price: 20 }, { name: "花枝丸（大份）", price: 50 },
  { name: "花枝丸（小份）", price: 20 }, { name: "米血糕", price: 20 }, { name: "百頁豆腐", price: 20 },
  { name: "蘿蔔糕", price: 20 }, { name: "芋頭餅", price: 20 }, { name: "四季豆", price: 30 },
  { name: "杏包菇", price: 30 }, { name: "花椰菜", price: 30 }, { name: "鮮香菇", price: 30 },
  { name: "玉米筍", price: 30 }, { name: "炸茄子", price: 30 }
];

const drinksList = [
  { name: "冬瓜紅茶", price: 10 },
  { name: "泡沫綠茶", price: 10 },
  { name: "可樂", price: 20 },
  { name: "雪碧", price: 20 }
];

const comboList = [
  { name: "1號套餐：雞排 + 薯條 + 飲料", price: 120 },
  { name: "3號套餐：腿排 + 薯條 + 飲料", price: 120 }
];

/***** 本機紀錄（讓頁面看到歷史） *****/
const loadOrders = () => JSON.parse(localStorage.getItem('orders') || '[]');
const saveOrders = (orders) => localStorage.setItem('orders', JSON.stringify(orders));

/***** UI 產生 *****/
function genRadio(list, containerId, groupName, onChange) {
  const host = document.getElementById(containerId);
  host.innerHTML = '';
  list.forEach((item, i) => {
    const label = document.createElement('label');
    label.className = 'inline';
    const input = Object.assign(document.createElement('input'), {
      type: 'radio', name: groupName, value: String(i)
    });
    if (onChange) input.addEventListener('change', onChange);
    label.append(input, `${item.name}（$${item.price}）`);
    host.appendChild(label);
  });
}

function buildFlavorSelect(id) {
  const sel = document.createElement('select');
  sel.id = id; sel.className = 'flavor-select';
  flavorList.forEach((f, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx);
    opt.textContent = f.name; // 全部 $0 不顯示加價
    sel.appendChild(opt);
  });
  sel.addEventListener('change', updateTotal);
  return sel;
}

function showMainFlavor() {
  const host = document.getElementById('mainFlavorHost');
  host.innerHTML = '';
  const selected = document.querySelector('input[name="mainDish"]:checked');
  if (!selected) return; // 口味可不選
  const box = document.createElement('div');
  box.className = 'inline';
  const label = document.createElement('label');
  label.textContent = '主餐口味：';
  const sel = buildFlavorSelect('mainFlavor');
  box.append(label, sel);
  host.appendChild(box);
  sel.focus(); // 自動聚焦，提醒選口味（可不選）
}

function genCheckboxSnacks() {
  const host = document.getElementById('snacks');
  host.innerHTML = '';
  snackList.forEach((item, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'snack-item';
    const cb = Object.assign(document.createElement('input'), {
      type: 'checkbox', name: 'snacks', value: String(i)
    });
    const label = document.createElement('label');
    label.textContent = `${item.name}（$${item.price}）`;
    const flavor = buildFlavorSelect(`snackFlavor-${i}`);
    flavor.disabled = true; // 勾選後才可挑口味
    cb.addEventListener('change', () => {
      flavor.disabled = !cb.checked;
      updateTotal();
      if (!flavor.disabled) flavor.focus(); // 勾了就提示選口味（可不選）
    });
    wrap.append(cb, label, flavor);
    host.appendChild(wrap);
  });
}

/***** 計價 *****/
function calcTotal() {
  let total = 0;
  // 主餐
  const mainIdx = document.querySelector('input[name="mainDish"]:checked')?.value;
  if (mainIdx !== undefined) total += mainDishList[Number(mainIdx)].price;

  // 點心
  document.querySelectorAll('input[name="snacks"]:checked').forEach(cb => {
    total += snackList[Number(cb.value)].price;
  });

  // 飲料
  document.querySelectorAll('input[name="drinks"]:checked').forEach(cb => {
    total += drinksList[Number(cb.value)].price;
  });

  // 套餐
  const combo = document.querySelector('input[name="combo"]:checked')?.value;
  if (combo !== undefined) total += comboList[Number(combo)].price;

  return total; // 口味 0 元，不影響總價
}
const updateTotal = () => document.getElementById('totalPrice').textContent = calcTotal();

/***** 訂單表格渲染 *****/
function renderOrders() {
  const orders = loadOrders();
  const tbody = document.querySelector('#orderTable tbody');
  const tfoot = document.querySelector('#orderTable tfoot');
  tbody.innerHTML = '';
  let sum = 0;
  orders.forEach(o => {
    sum += o.price;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.name}</td>
      <td>${o.main}</td>
      <td>${o.mainFlavor || ''}</td>
      <td>${o.snacksWithFlavors || ''}</td>
      <td>${o.drinks || ''}</td>
      <td>${o.combo || ''}</td>
      <td>${o.price}</td>
    `;
    tbody.appendChild(tr);
  });
  tfoot.innerHTML = `<tr><td colspan="6" style="text-align:right;">總金額合計：</td><td>${sum}</td></tr>`;
}

/***** 初始化 *****/
document.addEventListener('DOMContentLoaded', () => {
  // 主餐（選了就顯示口味）
  genRadio(mainDishList, 'mainDish', 'mainDish', () => { showMainFlavor(); updateTotal(); });

  // 飲料
  const drinksHost = document.getElementById('drinks');
  drinksList.forEach((d, i) => {
    const label = document.createElement('label');
    const cb = Object.assign(document.createElement('input'), { type:'checkbox', name:'drinks', value:String(i) });
    cb.addEventListener('change', updateTotal);
    label.append(cb, `${d.name}（$${d.price}）`);
    drinksHost.appendChild(label);
  });

  // 點心（勾選後右側出現口味下拉）
  genCheckboxSnacks();

  // 套餐
  genRadio(comboList, 'combo', 'combo', updateTotal);

  renderOrders();
  updateTotal();

  // 清除本機列表（不影響 Google Sheet）
  document.getElementById('clearOrders').addEventListener('click', () => {
    if (confirm('確定清除本機訂單列表？（不會刪 Google Sheet）')) {
      localStorage.removeItem('orders');
      renderOrders();
    }
  });

  // 送出
  document.getElementById('orderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    if (!name) return alert('請輸入姓名');

    const mainIdx = document.querySelector('input[name="mainDish"]:checked')?.value;
    const mainName = mainIdx !== undefined ? mainDishList[Number(mainIdx)].name : '';

    const mainFlavorSel = document.getElementById('mainFlavor');
    const mainFlavor = mainFlavorSel ? flavorList[Number(mainFlavorSel.value)].name : '';

    const snackChecks = Array.from(document.querySelectorAll('input[name="snacks"]:checked'));
    const snackFlavorPairs = snackChecks.map(cb => {
      const i = Number(cb.value);
      const sel = document.getElementById(`snackFlavor-${i}`);
      const flv = sel ? flavorList[Number(sel.value)].name : '';
      return flv ? `${snackList[i].name}（${flv}）` : snackList[i].name;
    });

    const drinkNames = Array.from(document.querySelectorAll('input[name="drinks"]:checked'))
      .map(cb => drinksList[Number(cb.value)].name);

    const comboIdx = document.querySelector('input[name="combo"]:checked')?.value;
    const comboName = comboIdx !== undefined ? comboList[Number(comboIdx)].name : '';

    const price = calcTotal();

    // 本機顯示
    const orders = loadOrders();
    orders.push({
      name,
      main: mainName,
      mainFlavor,
      snacksWithFlavors: snackFlavorPairs.join('、'),
      drinks: drinkNames.join('、'),
      combo: comboName,
      price
    });
    saveOrders(orders);
    renderOrders();

    // 送到 Google Sheet（表頭需完全一致）
    const fd = new FormData();
    fd.append('timestamp', new Date().toISOString());
    fd.append('姓名', name);
    fd.append('主餐', mainName);
    fd.append('口味', mainFlavor);                   // 主餐口味
    fd.append('點心', snackFlavorPairs.join(', '));  // 點心+各自口味
    fd.append('飲料', drinkNames.join(', '));
    fd.append('套餐', comboName);
    fd.append('金額', String(price));

    fetch(googleScriptURL, { method: 'POST', mode: 'no-cors', body: fd })
      .then(() => console.log('已送到 Google Sheets'))
      .catch(err => console.error('送 Sheets 失敗：', err));

    // 重設
    e.target.reset();
    document.getElementById('mainFlavorHost').innerHTML = '';
    updateTotal();
  });
});
