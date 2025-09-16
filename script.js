// 價格與品項設定
const mainDishList = [
  { name: "脆皮雞排", price: 85 },
  { name: "無骨雞塊", price: 70 },
  { name: "無骨雞腿排", price: 85 },
  { name: "鮮蝦+白飯", price: 70 },
  { name: "無敵雞塊(大)", price: 120 }
];

const flavorList = [
  { name: "原味", price: 0 },
  { name: "胡椒", price: 0 },
  { name: "辣味", price: 0 },
  { name: "梅粉", price: 5 },
  { name: "綜合", price: 5 },
  { name: "特調", price: 10 },
  { name: "咖哩", price: 5 }
];

const snackList = [
  { name: "柳葉魚", price: 39 },
  { name: "脆皮七里香", price: 30 },
  { name: "脆皮雞心", price: 30 },
  { name: "脆皮雞翅", price: 30 },
  { name: "脆薯（大份）", price: 50 },
  { name: "脆薯（小份）", price: 30 },
  { name: "貢丸", price: 30 },
  { name: "噗波起司球", price: 30 },
  { name: "起司條（2入）", price: 30 },
  { name: "美式洋蔥圈", price: 30 },
  { name: "包心小湯圓", price: 30 },
  { name: "甜不辣（大份）", price: 50 },
  { name: "甜不辣（小份）", price: 20 },
  { name: "QQ地瓜球", price: 20 },
  { name: "QQ芋球", price: 20 },
  { name: "銀絲卷", price: 20 },
  { name: "燻乳銀絲卷", price: 25 },
  { name: "梅子地瓜（大）", price: 50 },
  { name: "梅子地瓜（小）", price: 20 },
  { name: "米腸", price: 20 },
  { name: "花枝丸（大份）", price: 50 },
  { name: "花枝丸（小份）", price: 20 },
  { name: "米血糕", price: 20 },
  { name: "百頁豆腐", price: 20 },
  { name: "蘿蔔糕", price: 20 },
  { name: "芋頭餅", price: 20 },
  { name: "四季豆", price: 30 },
  { name: "杏包菇", price: 30 },
  { name: "花椰菜", price: 30 },
  { name: "鮮香菇", price: 30 },
  { name: "玉米筍", price: 30 },
  { name: "炸茄子", price: 30 }
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

// 你的 Google Sheets Web App URL
const googleScriptURL = 'https://script.google.com/macros/s/AKfycbyrA_MVNiHvIlQ0nI-Dh1_ta3LlaDaqg5hLl23qXuQgT3fszsaPpyILSItrmceJ5tT3/exec';

// localStorage 儲存、讀取
function loadOrders() {
  const data = localStorage.getItem('orders');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
}

function renderOrders() {
  const orders = loadOrders();
  const tbody = document.querySelector("#orderTable tbody");
  tbody.innerHTML = '';
  orders.forEach(order => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${order.name}</td>
      <td>${order.mainName}</td>
      <td>${order.flavorName}</td>
      <td>${order.snackNames}</td>
      <td>${order.drinkNames}</td>
      <td>${order.comboName}</td>
      <td>${order.price}</td>
    `;
  });
  // 彙整所有訂單的總金額
  const totalAll = orders.reduce((sum, o) => sum + (o.price || 0), 0);
  let footer = document.querySelector("#orderTable tfoot");
  if (!footer) {
    footer = document.createElement('tfoot');
    document.querySelector("#orderTable").appendChild(footer);
  }
  footer.innerHTML = `<tr>
    <td colspan="6" style="text-align:right;">總金額合計：</td><td>${totalAll}</td>
  </tr>`;
}

function createRadioOptions(list, containerId, groupName) {
  const container = document.getElementById(containerId);
  list.forEach((item, idx) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = groupName;
    input.value = idx;
    label.appendChild(input);
    label.append(`${item.name}（$${item.price}）`);
    container.appendChild(label);
    container.appendChild(document.createElement('br'));
  });
}

function createCheckboxOptions(list, containerId) {
  const container = document.getElementById(containerId);
  list.forEach((item, idx) => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = containerId;
    input.value = idx;
    label.appendChild(input);
    label.append(`${item.name}（$${item.price}）`);
    container.appendChild(label);
    container.appendChild(document.createElement('br'));
  });
}

function calculateTotal() {
  let total = 0;
  // 主餐
  const mainIdx = document.querySelector('input[name="mainDish"]:checked');
  if (mainIdx) total += mainDishList[mainIdx.value].price;
  // 口味
  const flavorIdx = document.querySelector('input[name="flavor"]:checked');
  if (flavorIdx) total += flavorList[flavorIdx.value].price;
  // 點心
  document.querySelectorAll('input[name="snacks"]:checked').forEach(cb => {
    total += snackList[cb.value].price;
  });
  // 飲料
  document.querySelectorAll('input[name="drinks"]:checked').forEach(cb => {
    total += drinksList[cb.value].price;
  });
  // 套餐
  const comboIdx = document.querySelector('input[name="combo"]:checked');
  if (comboIdx) total += comboList[comboIdx.value].price;

  return total;
}

function updateTotalDisplay() {
  document.getElementById('totalPrice').innerText = calculateTotal();
}

document.addEventListener('DOMContentLoaded', () => {
  // 建立選項
  createRadioOptions(mainDishList, 'mainDish', 'mainDish');
  createRadioOptions(flavorList, 'flavor', 'flavor');
  createCheckboxOptions(snackList, 'snacks');
  createCheckboxOptions(drinksList, 'drinks');
  createRadioOptions(comboList, 'combo', 'combo');

  renderOrders();
  updateTotalDisplay();

  document.getElementById('orderForm').addEventListener('change', updateTotalDisplay);

  document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    if (!name) {
      alert("請輸入姓名");
      return;
    }

    const mainIdx = document.querySelector('input[name="mainDish"]:checked')?.value;
    const flavorIdx = document.querySelector('input[name="flavor"]:checked')?.value;
    const snackIdxs = Array.from(document.querySelectorAll('input[name="snacks"]:checked')).map(cb => cb.value);
    const drinkIdxs = Array.from(document.querySelectorAll('input[name="drinks"]:checked')).map(cb => cb.value);
    const comboIdx = document.querySelector('input[name="combo"]:checked')?.value;

    const mainName = mainIdx !== undefined ? mainDishList[mainIdx].name : "";
    const flavorName = flavorIdx !== undefined ? flavorList[flavorIdx].name : "";
    const snackNames = snackIdxs.map(i => snackList[i].name).join(", ");
    const drinkNames = drinkIdxs.map(i => drinksList[i].name).join(", ");
    const comboName = comboIdx !== undefined ? comboList[comboIdx].name : "";

    const price = calculateTotal();

    // 加到 local 儲存
    const orders = loadOrders();
    orders.push({
      name,
      mainName,
      flavorName,
      snackNames,
      drinkNames,
      comboName,
      price
    });
    saveOrders(orders);
    renderOrders();

    // POST 給 Google Sheets
    const formData = new FormData();
    formData.append('timestamp', new Date().toISOString());
    formData.append('姓名', name);
    formData.append('主餐', mainName);
    formData.append('口味', flavorName);
    formData.append('點心', snackNames);
    formData.append('飲料', drinkNames);
    formData.append('套餐', comboName);
    formData.append('金額', price);

    fetch(googleScriptURL, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    }).then(()=> {
      console.log('送 Google Sheets 成功');
    }).catch(err => {
      console.error('傳送失敗: ', err);
    });

    // 重設表單
    document.getElementById('orderForm').reset();
    updateTotalDisplay();
  });
});
