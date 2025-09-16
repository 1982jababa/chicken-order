// 價格設定，包括點心和套餐
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
  { name: "檸檬", price: 0 },
  { name: "綜合", price: 5 },
  { name: "特調", price: 10 }
];

// 點心系列
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

// 飲料
const drinksList = [
  { name: "冬瓜紅茶", price: 10 },
  { name: "泡沫綠茶", price: 10 },
  { name: "可樂", price: 20 },
  { name: "雪碧", price: 20 }
];

// 套餐
const comboList = [
  { name: "1號套餐：雞排 + 薯條 + 飲料", price: 120 },
  { name: "3號套餐：腿排 + 薯條 + 飲料", price: 120 }
];

// 建立選項：單選、複選
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
  if (mainIdx) {
    total += mainDishList[mainIdx.value].price;
  }
  // 口味
  const flavorIdx = document.querySelector('input[name="flavor"]:checked');
  if (flavorIdx) {
    total += flavorList[flavorIdx.value].price;
  }
  // 點心
  document.querySelectorAll('input[name="snacks"]:checked').forEach(cb => {
    total += snackList[cb.value].price;
  });
  // 飲料
  document.querySelectorAll('input[name="drinks"]:checked').forEach(cb => {
    total += drinksList[cb.value].price;
  });
  // 套餐（擇一，可不選）
  const comboIdx = document.querySelector('input[name="combo"]:checked');
  if (comboIdx) {
    total += comboList[comboIdx.value].price;
  }

  return total;
}

function updateTotalDisplay() {
  const total = calculateTotal();
  document.getElementById('totalPrice').innerText = total;
}

document.addEventListener('DOMContentLoaded', () => {
  createRadioOptions(mainDishList, 'mainDish', 'mainDish');
  createRadioOptions(flavorList, 'flavor', 'flavor');
  createCheckboxOptions(snackList, 'snacks');
  createCheckboxOptions(drinksList, 'drinks');
  createRadioOptions(comboList, 'combo', 'combo');

  // 當有改變選項時更新總價
  document.getElementById('orderForm').addEventListener('change', updateTotalDisplay);

  // 表單送出
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

    const tbody = document.querySelector("#orderTable tbody");
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${name}</td>
      <td>${mainName}</td>
      <td>${flavorName}</td>
      <td>${snackNames}</td>
      <td>${drinkNames}</td>
      <td>${comboName}</td>
      <td>${price}</td>
    `;

    // 重設表單 & 清總價
    document.getElementById('orderForm').reset();
    updateTotalDisplay();
  });
});
