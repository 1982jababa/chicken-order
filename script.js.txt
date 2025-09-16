const mainDishList = ["脆皮雞排", "無骨雞排", "無骨雞腿排", "鮮蝦+白飯", "無敵雞塊(大)"];
const sideItemsList = ["甜不辣", "百頁豆腐", "起司條", "銀絲卷", "地瓜球", "米血糕", "杏鮑菇", "花椰菜"];
const drinksList = ["泡沫紅茶", "泡沫綠茶", "冬瓜茶"];

function createOptions(list, containerId, type) {
  const container = document.getElementById(containerId);
  list.forEach(item => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = type;
    input.name = containerId;
    input.value = item;
    label.appendChild(input);
    label.append(` ${item}`);
    container.appendChild(label);
    container.appendChild(document.createElement('br'));
  });
}

createOptions(mainDishList, 'mainDish', 'radio');
createOptions(sideItemsList, 'sideItems', 'checkbox');
createOptions(drinksList, 'drinks', 'checkbox');

document.getElementById('orderForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value.trim();
  const mainDish = document.querySelector('input[name="mainDish"]:checked')?.value || '';
  const sideItems = Array.from(document.querySelectorAll('input[name="sideItems"]:checked')).map(i => i.value).join(", ");
  const drinks = Array.from(document.querySelectorAll('input[name="drinks"]:checked')).map(i => i.value).join(", ");

  const tbody = document.querySelector("#orderTable tbody");
  const row = tbody.insertRow();
  row.innerHTML = `<td>${name}</td><td>${mainDish}</td><td>${sideItems}</td><td>${drinks}</td>`;

  this.reset();
});
