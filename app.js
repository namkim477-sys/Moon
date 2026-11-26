const restaurants = [
  { id: "dolsot", name: "온기 돌솥밥", category: "한식", menu: "제육 돌솥비빔밥", price: 9500, emoji: "🍚", distance: 4, tags: ["제육", "돼지고기", "매운 음식", "비빔밥"] },
  { id: "gukbap", name: "든든 국밥집", category: "한식", menu: "돼지국밥", price: 9000, emoji: "🍲", distance: 5, tags: ["돼지고기", "국밥"] },
  { id: "bibim", name: "초록식탁", category: "한식", menu: "야채 비빔밥", price: 8500, emoji: "🥗", distance: 6, tags: ["비빔밥", "야채"] },
  { id: "kimbap", name: "소담 김밥", category: "분식", menu: "참치김밥 세트", price: 6500, emoji: "🍙", distance: 3, tags: ["참치", "김밥"] },
  { id: "tteok", name: "달콤 떡볶이", category: "분식", menu: "로제 떡볶이", price: 8500, emoji: "🍢", distance: 5, tags: ["매운 음식", "떡볶이", "로제"] },
  { id: "mandu", name: "만두공방", category: "분식", menu: "고기만두 정식", price: 7800, emoji: "🥟", distance: 7, tags: ["고기", "만두"] },
  { id: "ramen", name: "멘야 하루", category: "일식", menu: "돈코츠 라멘", price: 10500, emoji: "🍜", distance: 4, tags: ["돼지고기", "라멘"] },
  { id: "don", name: "오늘의 돈부리", category: "일식", menu: "가츠동", price: 9500, emoji: "🍱", distance: 6, tags: ["돼지고기", "돈까스", "튀김"] },
  { id: "sushi", name: "스시 한입", category: "일식", menu: "연어 초밥 8p", price: 14500, emoji: "🍣", distance: 8, tags: ["해산물", "연어", "생선"] },
  { id: "udon", name: "유키 우동", category: "일식", menu: "붓카케 우동", price: 8500, emoji: "🍜", distance: 5, tags: ["우동", "면"] },
  { id: "jajang", name: "홍콩반점 1988", category: "중식", menu: "짜장면", price: 7500, emoji: "🥢", distance: 4, tags: ["짜장", "면"] },
  { id: "mala", name: "마라정원", category: "중식", menu: "마라탕", price: 11000, emoji: "🥘", distance: 7, tags: ["매운 음식", "마라", "해산물"] },
  { id: "friedrice", name: "팬더 키친", category: "중식", menu: "새우 볶음밥", price: 9000, emoji: "🍤", distance: 6, tags: ["새우", "해산물"] },
  { id: "tang", name: "북경 탕수육", category: "중식", menu: "미니 탕수육 정식", price: 12000, emoji: "🥡", distance: 9, tags: ["돼지고기", "튀김"] },
  { id: "pasta", name: "파스타 오후", category: "양식", menu: "토마토 파스타", price: 12500, emoji: "🍝", distance: 5, tags: ["토마토", "파스타"] },
  { id: "burger", name: "버거 스테이션", category: "양식", menu: "클래식 치즈버거", price: 10500, emoji: "🍔", distance: 4, tags: ["소고기", "치즈"] },
  { id: "curry", name: "노란 카레집", category: "양식", menu: "치킨 카레", price: 9800, emoji: "🍛", distance: 7, tags: ["닭고기", "카레"] },
  { id: "sandwich", name: "런치 클럽", category: "양식", menu: "에그 샌드위치", price: 8000, emoji: "🥪", distance: 3, tags: ["달걀", "샌드위치"] },
  { id: "soup", name: "맑은 한상", category: "한식", menu: "소고기 미역국", price: 10000, emoji: "🍲", distance: 8, tags: ["소고기", "국"] },
];

const state = { category: "전체", budget: "10000", exclusions: [], seen: new Set(), winner: null, spinning: false, toastTimer: null, copyTimer: null };
const $ = (selector) => document.querySelector(selector);
const categoryButtons = [...document.querySelectorAll(".category-chip")];
const budgetButtons = [...document.querySelectorAll(".budget-chip")];

function filteredRestaurants() {
  return restaurants.filter((place) => {
    const categoryMatch = state.category === "전체" || place.category === state.category;
    const budgetMatch = state.budget === "all" || place.price <= Number(state.budget);
    const haystack = `${place.name} ${place.menu} ${place.tags.join(" ")}`.toLocaleLowerCase();
    const exclusionMatch = !state.exclusions.some((word) => haystack.includes(word.toLocaleLowerCase()));
    return categoryMatch && budgetMatch && exclusionMatch;
  });
}

function render() {
  const candidates = filteredRestaurants();
  $("#candidate-count").textContent = candidates.length;
  $("#candidate-count-small").textContent = candidates.length;
  $("#pick-button").disabled = candidates.length === 0 || state.spinning;
  $("#pick-button").innerHTML = candidates.length ? '<span>🎲</span> 메뉴 뽑기 <span class="button-arrow">→</span>' : '<span>🎲</span> 메뉴 뽑기 (선택 불가)';
  $("#empty-message").hidden = candidates.length > 0;
  $("#candidate-list").innerHTML = candidates.length ? candidates.map((place) => `
    <article class="restaurant-card ${state.seen.has(place.id) ? "seen" : ""}">
      <div class="restaurant-emoji" aria-hidden="true">${place.emoji}</div>
      <div class="restaurant-info"><h3>${place.name}</h3><p>${place.category} · ${place.menu}</p></div>
      <span class="restaurant-price">${place.price.toLocaleString("ko-KR")}원</span>
      ${state.seen.has(place.id) ? '<span class="seen-badge">확인 완료</span>' : ""}
    </article>`).join("") : '<div class="no-candidates">조건에 맞는 식당이 없어요. 필터를 완화해 주세요.</div>';
  $("#tag-list").innerHTML = state.exclusions.map((tag, index) => `<span class="exclude-tag">${escapeHtml(tag)}<button type="button" data-remove="${index}" aria-label="${escapeHtml(tag)} 제외 메뉴 삭제">×</button></span>`).join("");
  if (!state.spinning && !state.winner && $("#all-seen-content").hidden === false) return;
}

function escapeHtml(value) { return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]); }
function clearWinner() {
  state.winner = null;
  state.seen.clear();
  $("#winner-content").hidden = true;
  $("#roulette-content").hidden = true;
  $("#all-seen-content").hidden = true;
  $("#result-content").hidden = false;
  $("#result-status").textContent = "대기 중";
  $("#result-status").className = "status-pill";
}
function setFiltersChanged() { clearWinner(); render(); }

categoryButtons.forEach((button) => button.addEventListener("click", () => {
  state.category = button.dataset.category;
  categoryButtons.forEach((item) => { const active = item === button; item.classList.toggle("selected", active); item.setAttribute("aria-pressed", String(active)); });
  setFiltersChanged();
}));
budgetButtons.forEach((button) => button.addEventListener("click", () => {
  state.budget = button.dataset.budget;
  budgetButtons.forEach((item) => { const active = item === button; item.classList.toggle("selected", active); item.setAttribute("aria-pressed", String(active)); });
  setFiltersChanged();
}));

function addExclusion(event) {
  event.preventDefault();
  const input = $("#exclude-input");
  const value = input.value.trim();
  const error = $("#input-error");
  if (!value) { error.textContent = "제외할 메뉴를 입력해 주세요."; input.focus(); return; }
  if (!/^[가-힣A-Za-z]{1,10}$/.test(value)) { error.textContent = "제외 메뉴는 한글·영문 10자 이내로 입력해 주세요."; input.focus(); return; }
  if (state.exclusions.length >= 3) { error.textContent = "제외 메뉴는 최대 3개까지 추가할 수 있어요."; return; }
  if (state.exclusions.some((tag) => tag.toLowerCase() === value.toLowerCase())) { error.textContent = "이미 추가한 메뉴예요."; return; }
  state.exclusions.push(value); input.value = ""; error.textContent = ""; setFiltersChanged(); input.focus();
}
$("#exclude-form").addEventListener("submit", addExclusion);
$("#exclude-input").addEventListener("input", () => { $("#input-error").textContent = ""; });
$("#tag-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  state.exclusions.splice(Number(button.dataset.remove), 1); $("#input-error").textContent = ""; setFiltersChanged();
});

function resetFilters() {
  state.category = "전체"; state.budget = "10000"; state.exclusions = [];
  categoryButtons.forEach((item) => { const active = item.dataset.category === "전체"; item.classList.toggle("selected", active); item.setAttribute("aria-pressed", String(active)); });
  budgetButtons.forEach((item) => { const active = item.dataset.budget === "10000"; item.classList.toggle("selected", active); item.setAttribute("aria-pressed", String(active)); });
  $("#exclude-input").value = ""; $("#input-error").textContent = ""; clearWinner(); render();
}
$("#reset-button").addEventListener("click", resetFilters);
$("#empty-reset").addEventListener("click", resetFilters);
$("#result-reset").addEventListener("click", () => { clearWinner(); render(); window.scrollTo({ top: 0, behavior: "smooth" }); });
$("#all-seen-reset").addEventListener("click", () => { clearWinner(); render(); window.scrollTo({ top: 0, behavior: "smooth" }); });

function pickRestaurant() {
  if (state.spinning) return;
  const available = filteredRestaurants().filter((place) => !state.seen.has(place.id));
  if (!available.length) {
    $("#result-content").hidden = true; $("#winner-content").hidden = true; $("#roulette-content").hidden = true; $("#all-seen-content").hidden = false;
    $("#result-status").textContent = "모두 확인"; $("#result-status").className = "status-pill"; return;
  }
  state.spinning = true;
  $("#result-content").hidden = true; $("#winner-content").hidden = true; $("#all-seen-content").hidden = true; $("#roulette-content").hidden = false;
  $("#result-status").textContent = "추첨 중"; $("#result-status").className = "status-pill is-rolling";
  render();
  const names = available.map((place) => place.name);
  let rollIndex = 0;
  const rollingName = $("#rolling-name");
  rollingName.textContent = names[0];
  const roller = window.setInterval(() => { rollingName.textContent = names[rollIndex++ % names.length]; }, 100);
  window.setTimeout(() => {
    window.clearInterval(roller);
    const winner = available[Math.floor(Math.random() * available.length)];
    state.winner = winner; state.seen.add(winner.id); state.spinning = false;
    $("#roulette-content").hidden = true; $("#winner-content").hidden = false;
    $("#result-status").textContent = "오늘의 픽"; $("#result-status").className = "status-pill is-done";
    $("#winner-emoji").textContent = winner.emoji;
    $("#winner-category").textContent = `${winner.category} · 공강 점심 추천`;
    $("#winner-name").textContent = winner.name;
    $("#winner-menu").textContent = `대표 메뉴: ${winner.menu}`;
    $("#winner-price").textContent = `₩${winner.price.toLocaleString("ko-KR")}`;
    $("#winner-distance").textContent = `🚶 도보 ${winner.distance}분`;
    $("#share-preview").textContent = shareText(winner);
    const copy = $("#copy-button"); copy.textContent = "📋 결과 복사하기"; copy.classList.remove("copied");
    render(); $("#roulette-content").hidden = true; $("#winner-content").hidden = false;
  }, 2000);
}
function shareText(place) { return `[캠퍼스 점심 결정] 오늘의 식당: ${place.name} (대표메뉴: ${place.menu} / ${place.price.toLocaleString("ko-KR")}원)`; }
$("#pick-button").addEventListener("click", pickRestaurant);
$("#reroll-button").addEventListener("click", pickRestaurant);

function showToast(message) {
  const toast = $("#toast"); toast.textContent = message; toast.classList.add("visible");
  window.clearTimeout(state.toastTimer); state.toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}
async function copyResult() {
  if (!state.winner) return;
  const text = shareText(state.winner);
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
    else {
      const helper = document.createElement("textarea"); helper.value = text; helper.style.position = "fixed"; helper.style.opacity = "0"; document.body.append(helper); helper.select();
      const copied = document.execCommand("copy"); helper.remove(); if (!copied) throw new Error("copy unavailable");
    }
    const button = $("#copy-button"); button.textContent = "✓ 복사 완료! 단톡방에 붙여넣으세요"; button.classList.add("copied");
    window.clearTimeout(state.copyTimer); state.copyTimer = window.setTimeout(() => { button.textContent = "📋 결과 복사하기"; button.classList.remove("copied"); }, 2200);
  } catch {
    showToast("자동 복사에 실패했어요. 아래 문구를 길게 눌러 복사해 주세요.");
  }
}
$("#copy-button").addEventListener("click", copyResult);
$("#empty-message").hidden = true;
render();
