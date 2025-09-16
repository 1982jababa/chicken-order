document.getElementById('orderForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  if (!name) return alert('請輸入姓名');

  // 主餐
  const mainIdx = document.querySelector('input[name="mainDish"]:checked')?.value;
  const mainName = mainIdx !== undefined ? mainDishList[Number(mainIdx)].name : '';

  // 主餐口味（可不選）
  const mainFlavorSel = document.getElementById('mainFlavor');
  const mainFlavor = mainFlavorSel ? flavorList[Number(mainFlavorSel.value)].name : '';

  // 點心 + 各自口味
  const snackChecks = Array.from(document.querySelectorAll('input[name="snacks"]:checked'));
  const snackFlavorPairs = snackChecks.map(cb => {
    const i = Number(cb.value);
    const sel = document.getElementById(`snackFlavor-${i}`);
    const flv = sel ? flavorList[Number(sel.value)].name : '';
    return flv ? `${snackList[i].name}（${flv}）` : snackList[i].name;
  });

  // 飲料
  const drinkNames = Array.from(document.querySelectorAll('input[name="drinks"]:checked'))
    .map(cb => drinksList[Number(cb.value)].name);

  // 套餐
  const comboIdx = document.querySelector('input[name="combo"]:checked')?.value;
  const comboName = comboIdx !== undefined ? comboList[Number(comboIdx)].name : '';

  // 總價（口味皆 0 元）
  const price = calcTotal();

  // —— 本機顯示（localStorage）——
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

  // —— 寫入 Google Sheet（URL-encoded）——
  const payload = new URLSearchParams();
  payload.set('timestamp', new Date().toISOString());
  payload.set('姓名', name || '');
  payload.set('主餐', mainName || '');
  payload.set('口味', mainFlavor || '');
  payload.set('點心', (snackFlavorPairs.join(', ') || ''));
  payload.set('飲料', (drinkNames.join(', ') || ''));
  payload.set('套餐', comboName || '');
  payload.set('金額', String(price || 0));

  fetch(googleScriptURL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: payload.toString()
  })
    .then(() => console.log('Google Sheet 已寫入（URL-encoded）'))
    .catch(err => console.error('送 Sheets 失敗：', err));

  // 重設表單
  e.target.reset();
  document.getElementById('mainFlavorHost').innerHTML = '';
  updateTotal();
});
