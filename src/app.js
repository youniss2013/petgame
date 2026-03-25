const STORAGE_KEY = "pet-class-system-v1";

const PETS = [
  "布偶猫", "萨摩耶", "金毛", "柯基", "橘猫", "边牧", "阿拉斯加", "柴犬",
  "英短猫", "美短猫", "折耳猫", "暹罗猫", "博美", "拉布拉多", "哈士奇", "秋田犬",
  "小兔", "仓鼠", "龙猫", "小乌龟", "海豚", "海豹", "小熊猫", "猫头鹰",
  "小恐龙", "独角兽", "青龙", "白虎", "朱雀", "玄武", "貔貅", "麒麟",
  "九尾狐", "应龙", "凤凰", "饕餮", "白泽", "穷奇", "鲲鹏", "毕方",
  "精卫", "谛听"
];

const DEFAULT_RULES = [
  { id: uid(), name: "作业优秀", score: 1, category: "学习" },
  { id: uid(), name: "主动发言", score: 1, category: "学习" },
  { id: uid(), name: "课堂提问有价值", score: 2, category: "学习" },
  { id: uid(), name: "背诵过关", score: 1, category: "学习" },
  { id: uid(), name: "测验进步明显", score: 2, category: "学习" },
  { id: uid(), name: "阅读打卡完成", score: 1, category: "学习" },
  { id: uid(), name: "帮助同学", score: 2, category: "行为" },
  { id: uid(), name: "主动值日", score: 1, category: "行为" },
  { id: uid(), name: "拾金不昧", score: 5, category: "行为" },
  { id: uid(), name: "文明礼貌", score: 1, category: "行为" },
  { id: uid(), name: "课堂专注", score: 1, category: "行为" },
  { id: uid(), name: "运动达标", score: 1, category: "健康" },
  { id: uid(), name: "课间眼保健操认真", score: 1, category: "健康" },
  { id: uid(), name: "不交作业", score: -1, category: "学习" },
  { id: uid(), name: "作业抄袭", score: -3, category: "学习" },
  { id: uid(), name: "课堂扰乱", score: -2, category: "行为" },
  { id: uid(), name: "迟到", score: -1, category: "行为" },
  { id: uid(), name: "顶撞同学", score: -2, category: "行为" },
  { id: uid(), name: "卫生不达标", score: -1, category: "行为" },
  { id: uid(), name: "考试作弊", score: -5, category: "学习" }
];

const DEFAULT_SHOP = [
  { id: uid(), name: "免作业一次", cost: 2 },
  { id: uid(), name: "抽奖一次", cost: 1 },
  { id: uid(), name: "文具礼包", cost: 3 }
];

const state = loadState();
state.ui = state.ui || { viewMode: "teacher" };
state.ui.logRenderLimit = state.ui.logRenderLimit || 30;
state.sync = state.sync || {
  apiBase: "http://127.0.0.1:8000",
  token: "",
  username: "",
  role: "",
  parentTeacherUsername: "",
  parentChildName: "",
  parentChildId: "",
  inviteCode: "",
  remoteVersion: 0,
  eventsVersion: 0,
  stateEtag: "",
  eventsEtag: ""
};
let syncTimer = null;
let autoSyncInterval = null;

const el = {
  viewModeSelect: byId("viewModeSelect"),
  apiBaseInput: byId("apiBaseInput"),
  usernameInput: byId("usernameInput"),
  passwordInput: byId("passwordInput"),
  parentTeacherUsernameInput: byId("parentTeacherUsernameInput"),
  parentChildNameInput: byId("parentChildNameInput"),
  inviteCodeInput: byId("inviteCodeInput"),
  parentRegisterTokenInput: byId("parentRegisterTokenInput"),
  parentChildIdSelect: byId("parentChildIdSelect"),
  loadInviteStudentsBtn: byId("loadInviteStudentsBtn"),
  genInviteCodeBtn: byId("genInviteCodeBtn"),
  copyParentTokenBtn: byId("copyParentTokenBtn"),
  applyParentTokenBtn: byId("applyParentTokenBtn"),
  roleInput: byId("roleInput"),
  registerBtn: byId("registerBtn"),
  loginBtn: byId("loginBtn"),
  syncNowBtn: byId("syncNowBtn"),
  teacherLayout: document.querySelector("main.layout"),
  studentView: byId("studentView"),
  classForm: byId("classForm"),
  classNameInput: byId("classNameInput"),
  classList: byId("classList"),
  currentClassLabel: byId("currentClassLabel"),
  studentForm: byId("studentForm"),
  studentNameInput: byId("studentNameInput"),
  studentGroupInput: byId("studentGroupInput"),
  batchStudentsInput: byId("batchStudentsInput"),
  batchImportBtn: byId("batchImportBtn"),
  studentList: byId("studentList"),
  ruleForm: byId("ruleForm"),
  ruleNameInput: byId("ruleNameInput"),
  ruleScoreInput: byId("ruleScoreInput"),
  ruleCategoryInput: byId("ruleCategoryInput"),
  ruleList: byId("ruleList"),
  scoreStudentSelect: byId("scoreStudentSelect"),
  scoreRuleSelect: byId("scoreRuleSelect"),
  scoreRemarkInput: byId("scoreRemarkInput"),
  applyRuleBtn: byId("applyRuleBtn"),
  customScoreInput: byId("customScoreInput"),
  customScoreReasonInput: byId("customScoreReasonInput"),
  customScoreBtn: byId("customScoreBtn"),
  logList: byId("logList"),
  loadMoreLogsBtn: byId("loadMoreLogsBtn"),
  petList: byId("petList"),
  rankingList: byId("rankingList"),
  levelExpInput: byId("levelExpInput"),
  saveLevelExpBtn: byId("saveLevelExpBtn"),
  shopItemForm: byId("shopItemForm"),
  shopItemNameInput: byId("shopItemNameInput"),
  shopItemCostInput: byId("shopItemCostInput"),
  shopList: byId("shopList"),
  studentCardTpl: byId("studentCardTpl"),
  seedDataBtn: byId("seedDataBtn"),
  exportBtn: byId("exportBtn"),
  importBtn: byId("importBtn"),
  importFile: byId("importFile"),
  copySyncCodeBtn: byId("copySyncCodeBtn"),
  applySyncCodeBtn: byId("applySyncCodeBtn"),
  progressRankingList: byId("progressRankingList"),
  exportWeeklyReportBtn: byId("exportWeeklyReportBtn"),
  studentViewStudentSelect: byId("studentViewStudentSelect"),
  studentViewRefreshBtn: byId("studentViewRefreshBtn"),
  studentShowcase: byId("studentShowcase"),
  studentModeProgressList: byId("studentModeProgressList")
};

bindEvents();
render();

function bindEvents() {
  el.viewModeSelect.addEventListener("change", () => {
    state.ui.viewMode = el.viewModeSelect.value;
    saveAndRender();
  });

  el.apiBaseInput.addEventListener("change", () => {
    state.sync.apiBase = (el.apiBaseInput.value || "").trim();
    saveAndRender();
  });

  el.roleInput.addEventListener("change", () => {
    renderSyncStatus();
  });

  el.registerBtn.addEventListener("click", async () => {
    const apiBase = (el.apiBaseInput.value || "").trim();
    const username = (el.usernameInput.value || "").trim();
    const password = (el.passwordInput.value || "").trim();
    const role = el.roleInput.value;
    const parentTeacherUsername = (el.parentTeacherUsernameInput.value || "").trim();
    const parentChildName = (el.parentChildNameInput.value || "").trim();
    const inviteCode = (el.inviteCodeInput.value || "").trim();
    const parentChildId = (el.parentChildIdSelect.value || "").trim();
    if (!apiBase || !username || !password) return alert("请填写后端地址、账号和密码");
    if (role === "parent" && (!inviteCode || !parentChildId)) {
      return alert("家长注册请先填写邀请码并加载学生后选择孩子");
    }
    try {
      const res = await fetch(`${apiBase}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username, password, role, parentTeacherUsername, parentChildName, inviteCode, parentChildId
        })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "注册失败");
      alert("注册成功，请继续登录。");
    } catch (_) {
      alert("注册失败，请检查后端是否运行。");
    }
  });

  el.loginBtn.addEventListener("click", async () => {
    const apiBase = (el.apiBaseInput.value || "").trim();
    const username = (el.usernameInput.value || "").trim();
    const password = (el.passwordInput.value || "").trim();
    if (!apiBase || !username || !password) return alert("请填写后端地址、账号和密码");
    try {
      const res = await fetch(`${apiBase}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "登录失败");
      state.sync.apiBase = apiBase;
      state.sync.username = username;
      state.sync.token = data.token;
      state.sync.role = data.role || "teacher";
      await pullMe();
      const pulled = await pullRemoteState();
      if (!pulled) return alert("登录成功但拉取远端数据失败");
      startAutoSync();
      saveAndRender();
      alert(`登录成功，当前角色：${state.sync.role === "teacher" ? "班主任" : "家长"}`);
    } catch (_) {
      alert("登录失败，请检查后端是否运行。");
    }
  });

  el.syncNowBtn.addEventListener("click", async () => {
    if (!isOnline()) return alert("请先登录在线账号");
    const ok = await pushRemoteState();
    if (ok) alert("同步完成。");
  });

  el.genInviteCodeBtn.addEventListener("click", async () => {
    if (!isOnline() || state.sync.role !== "teacher") return alert("请先以班主任账号登录");
    try {
      const res = await fetch(`${state.sync.apiBase}/api/share-code`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${state.sync.token}` }
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "生成邀请码失败");
      state.sync.inviteCode = data.shareCode || "";
      saveAndRender();
      prompt("邀请码已生成，可复制给家长：", state.sync.inviteCode);
    } catch (_) {
      alert("生成邀请码失败");
    }
  });

  el.copyParentTokenBtn.addEventListener("click", async () => {
    if (!state.sync.inviteCode) return alert("请先生成邀请码");
    const payload = {
      apiBase: state.sync.apiBase || "",
      inviteCode: state.sync.inviteCode || "",
      role: "parent",
      v: 1
    };
    const token = "PCS1-" + btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    try {
      await navigator.clipboard.writeText(token);
      alert("家长注册口令已复制。");
    } catch (_) {
      prompt("复制失败，请手动复制家长注册口令：", token);
    }
  });

  el.applyParentTokenBtn.addEventListener("click", async () => {
    const raw = (el.parentRegisterTokenInput.value || "").trim() || prompt("请粘贴家长注册口令：") || "";
    if (!raw) return;
    try {
      const token = raw.startsWith("PCS1-") ? raw.slice(5) : raw;
      const txt = decodeURIComponent(escape(atob(token)));
      const obj = JSON.parse(txt);
      if (!obj?.apiBase || !obj?.inviteCode) throw new Error("bad");
      el.apiBaseInput.value = obj.apiBase;
      el.inviteCodeInput.value = obj.inviteCode;
      el.roleInput.value = "parent";
      state.sync.apiBase = obj.apiBase;
      state.sync.inviteCode = obj.inviteCode;
      renderSyncStatus();
      await loadStudentsByInviteCode();
      alert("口令解析成功，已自动填充。请继续选择孩子并注册。");
    } catch (_) {
      alert("家长注册口令无效。");
    }
  });

  el.loadInviteStudentsBtn.addEventListener("click", async () => {
    await loadStudentsByInviteCode();
  });

  el.classForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = el.classNameInput.value.trim();
    if (!name) return;
    state.classes.push({ id: uid(), name });
    state.currentClassId = state.classes[state.classes.length - 1].id;
    el.classNameInput.value = "";
    saveAndRender();
  });

  el.studentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cls = getCurrentClass();
    if (!cls) return alert("请先选择班级");
    const name = el.studentNameInput.value.trim();
    if (!name) return;
    cls.students.push(createStudent(name, el.studentGroupInput.value.trim()));
    el.studentNameInput.value = "";
    el.studentGroupInput.value = "";
    saveAndRender();
  });

  el.batchImportBtn.addEventListener("click", () => {
    const cls = getCurrentClass();
    if (!cls) return alert("请先选择班级");
    const lines = el.batchStudentsInput.value.split("\n").map((x) => x.trim()).filter(Boolean);
    for (const line of lines) {
      const [name, group] = line.split(",").map((x) => x.trim());
      if (name) cls.students.push(createStudent(name, group || ""));
    }
    el.batchStudentsInput.value = "";
    saveAndRender();
  });

  el.ruleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = el.ruleNameInput.value.trim();
    const score = Number(el.ruleScoreInput.value);
    if (!name || Number.isNaN(score) || score === 0) return alert("请输入有效规则");
    state.rules.push({ id: uid(), name, score, category: el.ruleCategoryInput.value });
    el.ruleNameInput.value = "";
    el.ruleScoreInput.value = "";
    saveAndRender();
  });

  el.applyRuleBtn.addEventListener("click", () => {
    const cls = getCurrentClass();
    if (!cls) return;
    const sid = el.scoreStudentSelect.value;
    const rid = el.scoreRuleSelect.value;
    const st = cls.students.find((s) => s.id === sid);
    const rule = state.rules.find((r) => r.id === rid);
    if (!st || !rule) return;
    applyScore(st, rule.score, `规则：${rule.name}`, el.scoreRemarkInput.value.trim(), rule);
    el.scoreRemarkInput.value = "";
    saveAndRender();
  });

  el.customScoreBtn.addEventListener("click", () => {
    const cls = getCurrentClass();
    if (!cls) return;
    const sid = el.scoreStudentSelect.value;
    const st = cls.students.find((s) => s.id === sid);
    const score = Number(el.customScoreInput.value);
    const reason = el.customScoreReasonInput.value.trim();
    if (!st || Number.isNaN(score) || score === 0 || !reason) return alert("请输入有效分值和原因");
    applyScore(st, score, "自定义", reason);
    el.customScoreInput.value = "";
    el.customScoreReasonInput.value = "";
    saveAndRender();
  });

  el.saveLevelExpBtn.addEventListener("click", () => {
    const val = Number(el.levelExpInput.value);
    if (Number.isNaN(val) || val < 10) return alert("阈值至少为10");
    state.levelExp = val;
    saveAndRender();
  });

  el.shopItemForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = el.shopItemNameInput.value.trim();
    const cost = Number(el.shopItemCostInput.value);
    if (!name || Number.isNaN(cost) || cost <= 0) return alert("请输入有效奖励");
    state.shopItems.push({ id: uid(), name, cost });
    el.shopItemNameInput.value = "";
    el.shopItemCostInput.value = "";
    saveAndRender();
  });

  el.seedDataBtn.addEventListener("click", () => {
    if (!confirm("将覆盖当前数据并导入示例，是否继续？")) return;
    const seed = createSeedState();
    Object.assign(state, seed);
    saveAndRender();
  });

  el.exportBtn.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `班级宠物积分系统-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  el.importBtn.addEventListener("click", () => el.importFile.click());
  el.importFile.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const txt = await file.text();
    const obj = JSON.parse(txt);
    Object.assign(state, obj);
    state.ui = state.ui || { viewMode: "teacher" };
    saveAndRender();
  });

  el.copySyncCodeBtn.addEventListener("click", async () => {
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    try {
      await navigator.clipboard.writeText(code);
      alert("同步码已复制，可在另一设备粘贴导入。");
    } catch (_) {
      prompt("复制失败，请手动复制以下同步码：", code);
    }
  });

  el.applySyncCodeBtn.addEventListener("click", () => {
    const code = prompt("请粘贴同步码：");
    if (!code) return;
    try {
      const txt = decodeURIComponent(escape(atob(code.trim())));
      const obj = JSON.parse(txt);
      if (!obj || !Array.isArray(obj.classes)) throw new Error("bad");
      Object.assign(state, obj);
      state.ui = state.ui || { viewMode: "teacher" };
      saveAndRender();
      alert("同步成功。");
    } catch (_) {
      alert("同步码无效，请检查后重试。");
    }
  });

  el.exportWeeklyReportBtn.addEventListener("click", () => {
    const cls = getCurrentClass();
    if (!cls) return alert("请先选择班级");
    const rows = buildWeeklyReportRows(cls);
    if (!rows.length) return alert("近7天暂无有效记录");
    downloadCsv(`周报-${cls.name}-${todayText()}.csv`, rows);
  });

  el.studentViewRefreshBtn.addEventListener("click", () => {
    renderStudentShowcase();
  });

  el.loadMoreLogsBtn.addEventListener("click", () => {
    state.ui.logRenderLimit = (state.ui.logRenderLimit || 30) + 30;
    saveAndRender();
  });
}

function render() {
  renderSyncStatus();
  renderMode();
  renderClasses();
  renderStudents();
  renderRules();
  renderScoring();
  renderLogs();
  renderPetGallery();
  renderRanking();
  renderProgressRanking();
  renderShop();
  renderStudentViewSelect();
  renderStudentShowcase();
  renderStudentModeProgress();
  el.levelExpInput.value = state.levelExp;
}

function renderSyncStatus() {
  el.apiBaseInput.value = state.sync.apiBase || "";
  el.usernameInput.value = state.sync.username || "";
  el.roleInput.value = state.sync.role || el.roleInput.value || "teacher";
  el.parentTeacherUsernameInput.value = state.sync.parentTeacherUsername || "";
  el.parentChildNameInput.value = state.sync.parentChildName || "";
  el.inviteCodeInput.value = state.sync.inviteCode || "";
  el.parentRegisterTokenInput.value = "";
  const isParent = el.roleInput.value === "parent";
  el.parentTeacherUsernameInput.disabled = true;
  el.parentChildNameInput.disabled = true;
  el.inviteCodeInput.disabled = !isParent;
  el.parentChildIdSelect.disabled = !isParent;
  el.loadInviteStudentsBtn.disabled = !isParent;
  el.genInviteCodeBtn.disabled = !(isOnline() && state.sync.role === "teacher");
  el.copyParentTokenBtn.disabled = !(isOnline() && state.sync.role === "teacher" && state.sync.inviteCode);
  el.applyParentTokenBtn.disabled = !isParent;
}

function renderMode() {
  const mode = state.ui?.viewMode || "teacher";
  const isParent = state.sync.role === "parent";
  if (isParent && mode === "teacher") {
    state.ui.viewMode = "student";
  }
  const finalMode = state.ui.viewMode || mode;
  el.viewModeSelect.value = finalMode;
  el.viewModeSelect.disabled = isParent;
  const teacherHidden = finalMode === "student";
  el.teacherLayout.classList.toggle("hidden", teacherHidden);
  el.studentView.classList.toggle("hidden", !teacherHidden);
}

function renderClasses() {
  el.classList.innerHTML = "";
  for (const cls of state.classes) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span>${cls.name}</span>
      <div>
        <button data-act="switch">切换</button>
        <button data-act="del">删除</button>
      </div>
    `;
    row.querySelector("[data-act='switch']").onclick = () => {
      state.currentClassId = cls.id;
      saveAndRender();
    };
    row.querySelector("[data-act='del']").onclick = () => {
      if (!confirm(`确认删除班级 ${cls.name} 吗？`)) return;
      state.classes = state.classes.filter((x) => x.id !== cls.id);
      if (state.currentClassId === cls.id) state.currentClassId = state.classes[0]?.id || "";
      saveAndRender();
    };
    el.classList.appendChild(row);
  }
}

function renderStudents() {
  const cls = getCurrentClass();
  el.studentList.innerHTML = "";
  el.currentClassLabel.textContent = cls ? `当前班级：${cls.name}` : "请先选择班级";
  if (!cls) return;

  for (const st of cls.students) {
    const node = el.studentCardTpl.content.firstElementChild.cloneNode(true);
    node.querySelector(".student-name").textContent = st.name;
    node.querySelector(".student-group").textContent = st.group ? `小组：${st.group}` : "未分组";
    node.querySelector(".student-pet").textContent = `宠物：${st.pet || "未领养"}`;
    node.querySelector(".student-stats").textContent = `积分 ${st.score} | Lv.${st.level} | 徽章 ${st.badges}`;
    node.querySelector(".adopt-btn").onclick = () => {
      const pet = prompt(`请输入宠物名（可选：${PETS.join("、")}）`, st.pet || PETS[0]);
      if (!pet) return;
      st.pet = pet.trim();
      saveAndRender();
    };
    el.studentList.appendChild(node);
  }
}

function renderRules() {
  el.ruleList.innerHTML = "";
  for (const r of state.rules) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span>${r.name} <span class="badge">${r.category}</span></span>
      <div>
        <span class="${r.score > 0 ? "up" : "down"}">${r.score > 0 ? "+" : ""}${r.score}</span>
        <button data-id="${r.id}">删除</button>
      </div>
    `;
    row.querySelector("button").onclick = () => {
      state.rules = state.rules.filter((x) => x.id !== r.id);
      saveAndRender();
    };
    el.ruleList.appendChild(row);
  }
}

function renderScoring() {
  const cls = getCurrentClass();
  fillSelect(el.scoreStudentSelect, (cls?.students || []).map((s) => ({ value: s.id, label: s.name })));
  fillSelect(el.scoreRuleSelect, state.rules.map((r) => ({ value: r.id, label: `${r.name}(${r.score > 0 ? "+" : ""}${r.score})` })));
}

function renderLogs() {
  const cls = getCurrentClass();
  el.logList.innerHTML = "";
  if (!cls) {
    el.loadMoreLogsBtn.disabled = true;
    return;
  }
  const allLogs = [...getEventsForClass(cls.id)].reverse();
  const limit = state.ui.logRenderLimit || 30;
  const logs = allLogs.slice(0, limit);
  for (const log of logs) {
    const row = document.createElement("div");
    row.className = "row";
    const detailText = log.detail ? ` | ${log.detail}` : "";
    const statusText = log.reverted ? " [已撤回]" : "";
    row.innerHTML = `
      <span>${fmtTime(log.time)} ${log.studentName} ${log.delta > 0 ? "+" : ""}${log.delta}（${log.reason}）${detailText}${statusText}</span>
      <button ${log.reverted ? "disabled" : ""}>撤回</button>
    `;
    row.querySelector("button").onclick = () => undoLog(log.id);
    el.logList.appendChild(row);
  }
  el.loadMoreLogsBtn.disabled = logs.length >= allLogs.length;
}

function renderPetGallery() {
  el.petList.innerHTML = "";
  for (const pet of PETS) {
    const d = document.createElement("div");
    d.className = "pet-item";
    d.textContent = pet;
    el.petList.appendChild(d);
  }
}

function renderRanking() {
  const cls = getCurrentClass();
  el.rankingList.innerHTML = "";
  if (!cls) return;
  const sorted = [...cls.students].sort((a, b) => b.score - a.score || b.level - a.level);
  sorted.forEach((st, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span>#${i + 1} ${st.name}（${st.pet || "未领养"}）</span>
      <span>积分 ${st.score} | Lv.${st.level} | 徽章 ${st.badges}</span>
    `;
    el.rankingList.appendChild(row);
  });
}

function renderShop() {
  const cls = getCurrentClass();
  el.shopList.innerHTML = "";
  if (!cls) return;
  for (const item of state.shopItems) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span>${item.name}（${item.cost}徽章）</span>
      <div>
        <button data-act="exchange">兑换</button>
        <button data-act="del">删除</button>
      </div>
    `;
    row.querySelector("[data-act='exchange']").onclick = () => {
      const sid = el.scoreStudentSelect.value;
      const st = cls.students.find((s) => s.id === sid);
      if (!st) return alert("请先选择学生");
      if (st.badges < item.cost) return alert("徽章不足");
      const before = pickStudentSnapshot(st);
      st.badges -= item.cost;
      const after = pickStudentSnapshot(st);
      appendEvent({
        classId: cls.id,
        studentId: st.id,
        studentName: st.name,
        delta: 0,
        reason: `兑换：${item.name}`,
        detail: `消耗徽章 ${item.cost}`,
        before,
        after,
        type: "exchange"
      });
      saveAndRender();
    };
    row.querySelector("[data-act='del']").onclick = () => {
      state.shopItems = state.shopItems.filter((x) => x.id !== item.id);
      saveAndRender();
    };
    el.shopList.appendChild(row);
  }
}

function renderProgressRanking() {
  const cls = getCurrentClass();
  el.progressRankingList.innerHTML = "";
  if (!cls) return;
  const progress = calculateWeeklyProgress(cls);
  if (!progress.length) {
    el.progressRankingList.innerHTML = `<div class="row"><span>近7天暂无数据</span></div>`;
    return;
  }
  progress.forEach((item, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `
      <span>#${i + 1} ${item.studentName}</span>
      <span class="${item.delta >= 0 ? "up" : "down"}">${item.delta >= 0 ? "+" : ""}${item.delta}</span>
    `;
    el.progressRankingList.appendChild(row);
  });
}

function renderStudentViewSelect() {
  const cls = getCurrentClass();
  fillSelect(el.studentViewStudentSelect, (cls?.students || []).map((s) => ({ value: s.id, label: s.name })));
}

function renderStudentShowcase() {
  const cls = getCurrentClass();
  if (!cls || !cls.students.length) {
    el.studentShowcase.textContent = "请先创建班级并添加学生";
    return;
  }
  const sid = el.studentViewStudentSelect.value || cls.students[0].id;
  const st = cls.students.find((s) => s.id === sid) || cls.students[0];
  const nextNeed = needExp(st.level);
  el.studentShowcase.innerHTML = `
    <h3>${st.name} 的学习伙伴：${st.pet || "未领养"}</h3>
    <p>当前等级：Lv.${st.level} ｜ 徽章：${st.badges}</p>
    <p>总积分：${st.score} ｜ 当前经验：${st.exp}/${nextNeed}</p>
    <p>继续完成课堂任务，为宠物升级。</p>
  `;
}

function renderStudentModeProgress() {
  const cls = getCurrentClass();
  el.studentModeProgressList.innerHTML = "";
  if (!cls) return;
  const progress = calculateWeeklyProgress(cls).slice(0, 10);
  progress.forEach((item, i) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<span>第${i + 1}名 ${item.studentName}</span><span>${item.delta >= 0 ? "+" : ""}${item.delta}</span>`;
    el.studentModeProgressList.appendChild(row);
  });
}

function applyScore(student, delta, reason, remark = "", rule = null) {
  const cls = getCurrentClass();
  if (!cls) return;
  const before = pickStudentSnapshot(student);
  student.score += delta;
  if (student.score < 0) student.score = 0;
  if (delta > 0) student.exp += delta;
  if (delta < 0) student.exp = Math.max(0, student.exp + delta);
  // 宠物升级逻辑：经验达到阈值时，循环升级并发放徽章。
  while (student.exp >= needExp(student.level)) {
    student.exp -= needExp(student.level);
    student.level += 1;
    student.badges += 1;
  }
  const after = pickStudentSnapshot(student);
  appendEvent({
    classId: cls.id,
    studentId: student.id,
    studentName: student.name,
    delta,
    reason,
    detail: remark,
    before,
    after,
    type: "score",
    ruleSnapshot: rule ? {
      id: rule.id,
      name: rule.name,
      score: rule.score,
      category: rule.category
    } : null
  });
}

function undoLog(logId) {
  const log = state.events.find((x) => x.id === logId);
  if (!log || log.reverted) return;
  const cls = state.classes.find((x) => x.id === log.classId);
  if (!cls) return;
  const st = cls.students.find((s) => s.id === log.studentId);
  if (!st) return;
  if (log.before) {
    restoreStudentSnapshot(st, log.before);
  } else {
    // 兼容旧日志：未携带快照时，按旧算法回滚。
    st.score = Math.max(0, st.score - (log.delta || 0));
    st.exp = Math.max(0, st.exp - (log.delta || 0));
  }
  log.reverted = true;
  log.revertedAt = Date.now();
  saveAndRender();
}

function fillSelect(selectEl, options) {
  selectEl.innerHTML = "";
  for (const op of options) {
    const node = document.createElement("option");
    node.value = op.value;
    node.textContent = op.label;
    selectEl.appendChild(node);
  }
}

function getCurrentClass() {
  return state.classes.find((x) => x.id === state.currentClassId);
}

function needExp(level) {
  return state.levelExp + (level - 1) * 10;
}

function createStudent(name, group = "") {
  return {
    id: uid(),
    name,
    group,
    score: 0,
    exp: 0,
    level: 1,
    badges: 0,
    pet: ""
  };
}

function pickStudentSnapshot(st) {
  return {
    score: st.score,
    exp: st.exp,
    level: st.level,
    badges: st.badges
  };
}

function restoreStudentSnapshot(st, snap) {
  st.score = Math.max(0, snap.score || 0);
  st.exp = Math.max(0, snap.exp || 0);
  st.level = Math.max(1, snap.level || 1);
  st.badges = Math.max(0, snap.badges || 0);
}

function createSeedState() {
  const clsId = uid();
  return {
    classes: [{
      id: clsId,
      name: "示例班级",
      students: [
        createStudent("张三", "一组"),
        createStudent("李四", "一组"),
        createStudent("王五", "二组")
      ]
    }],
    events: [],
    currentClassId: clsId,
    rules: structuredClone(DEFAULT_RULES),
    shopItems: structuredClone(DEFAULT_SHOP),
    levelExp: 40
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        classes: parsed.classes || [],
        events: normalizeEvents(parsed),
        currentClassId: parsed.currentClassId || "",
        rules: parsed.rules?.length ? parsed.rules : structuredClone(DEFAULT_RULES),
        shopItems: parsed.shopItems?.length ? parsed.shopItems : structuredClone(DEFAULT_SHOP),
        levelExp: parsed.levelExp || 40,
        ui: parsed.ui || { viewMode: "teacher" },
        sync: {
          apiBase: "http://127.0.0.1:8000",
          token: "",
          username: "",
          role: "",
          parentTeacherUsername: "",
          parentChildName: "",
          parentChildId: "",
          inviteCode: "",
          remoteVersion: 0,
          eventsVersion: 0,
          stateEtag: "",
          eventsEtag: "",
          ...(parsed.sync || {})
        }
      };
    } catch (_) {}
  }
  return {
    classes: [],
    events: [],
    currentClassId: "",
    rules: structuredClone(DEFAULT_RULES),
    shopItems: structuredClone(DEFAULT_SHOP),
    levelExp: 40,
    ui: { viewMode: "teacher" },
    sync: {
      apiBase: "http://127.0.0.1:8000",
      token: "",
      username: "",
      role: "",
      parentTeacherUsername: "",
      parentChildName: "",
      parentChildId: "",
      inviteCode: "",
      remoteVersion: 0,
      eventsVersion: 0,
      stateEtag: "",
      eventsEtag: ""
    }
  };
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (isOnline() && state.sync.role === "teacher") {
    queueAutoSync();
  }
  render();
}

function byId(id) {
  return document.getElementById(id);
}

function fmtTime(t) {
  return new Date(t).toLocaleString("zh-CN", { hour12: false });
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function isOnline() {
  return Boolean(state.sync?.apiBase && state.sync?.token);
}

function queueAutoSync() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    pushRemoteState();
  }, 1000);
}

function startAutoSync() {
  if (autoSyncInterval) return;
  autoSyncInterval = setInterval(() => {
    if (isOnline()) {
      pushRemoteState();
    }
  }, 15000);
}

async function pushRemoteState() {
  if (state.sync.role !== "teacher") return false;
  try {
    const stateRes = await fetch(`${state.sync.apiBase}/api/state`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.sync.token}`
      },
      body: JSON.stringify({ state: composeOnlineState(), baseVersion: state.sync.remoteVersion || 0 })
    });
    const stateData = await stateRes.json();
    if (stateRes.status === 409) {
      const choice = prompt(
        "检测到多端冲突，请输入处理方式：\n1=以远端覆盖本地\n2=以本地覆盖远端\n3=自动合并后提交\n其他=取消",
        "3"
      );
      if (choice === "1") {
        applyRemoteState(stateData.serverState, stateData.serverVersion || 0);
        await pullRemoteEvents(true);
        saveAndRender();
      } else if (choice === "2") {
        state.sync.remoteVersion = stateData.serverVersion || state.sync.remoteVersion || 0;
        return await pushRemoteState();
      } else if (choice === "3") {
        const merged = mergeStates(composeOnlineState(), stateData.serverState || {});
        applyRemoteState(merged, stateData.serverVersion || state.sync.remoteVersion || 0);
        state.sync.remoteVersion = stateData.serverVersion || state.sync.remoteVersion || 0;
        await pullRemoteEvents(true);
        return await pushRemoteState();
      }
      return false;
    }
    if (!stateRes.ok) return false;
    state.sync.remoteVersion = stateData.version || state.sync.remoteVersion || 0;

    const eventsRes = await fetch(`${state.sync.apiBase}/api/events`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.sync.token}`
      },
      body: JSON.stringify({ events: state.events || [], baseEventsVersion: state.sync.eventsVersion || 0 })
    });
    const eventsData = await eventsRes.json();
    if (eventsRes.status === 409) {
      state.sync.eventsVersion = eventsData.serverEventsVersion || state.sync.eventsVersion || 0;
      const merged = mergeLogs(eventsData.serverEvents || [], state.events || []);
      state.events = merged;
      return await pushRemoteState();
    }
    if (!eventsRes.ok) return false;
    state.sync.eventsVersion = eventsData.eventsVersion || state.sync.eventsVersion || 0;
    return true;
  } catch (_) {
    return false;
  }
}

async function pullRemoteState() {
  try {
    const headers = {
      "Authorization": `Bearer ${state.sync.token}`
    };
    if (state.sync.stateEtag) {
      headers["If-None-Match"] = state.sync.stateEtag;
    }
    const res = await fetch(`${state.sync.apiBase}/api/state`, {
      headers
    });
    if (res.status === 304) {
      return await pullRemoteEvents();
    }
    const data = await res.json();
    if (!res.ok) return false;
    const remote = data.state;
    state.sync.remoteVersion = data.version || 0;
    state.sync.stateEtag = res.headers.get("etag") || state.sync.stateEtag || "";
    if (!remote) {
      if (state.sync.role === "teacher") {
        await pushRemoteState();
      }
      return true;
    }
    applyRemoteState(remote, state.sync.remoteVersion);
    return await pullRemoteEvents();
  } catch (_) {
    return false;
  }
}

async function pullRemoteEvents(force = false) {
  try {
    const headers = {
      "Authorization": `Bearer ${state.sync.token}`
    };
    if (!force && state.sync.eventsEtag) {
      headers["If-None-Match"] = state.sync.eventsEtag;
    }
    const pageSize = 200;
    let page = 1;
    let total = 0;
    let all = [];
    while (true) {
      const res = await fetch(`${state.sync.apiBase}/api/events?page=${page}&pageSize=${pageSize}`, {
        headers
      });
      if (res.status === 304) {
        return true;
      }
      const data = await res.json();
      if (!res.ok) return false;
      all = all.concat(data.events || []);
      total = data.total || all.length;
      state.sync.eventsVersion = data.version || state.sync.eventsVersion || 0;
      state.sync.eventsEtag = res.headers.get("etag") || state.sync.eventsEtag || "";
      if (all.length >= total) break;
      page += 1;
    }
    state.events = all;
    return true;
  } catch (_) {
    return false;
  }
}

async function pullMe() {
  try {
    const res = await fetch(`${state.sync.apiBase}/api/me`, {
      headers: { "Authorization": `Bearer ${state.sync.token}` }
    });
    const data = await res.json();
    if (!res.ok) return false;
    state.sync.role = data.role || state.sync.role;
    state.sync.parentTeacherUsername = data.parentTeacherUsername || "";
    state.sync.parentChildName = data.parentChildName || "";
    state.sync.parentChildId = data.parentChildId || "";
    return true;
  } catch (_) {
    return false;
  }
}

function applyRemoteState(remote, version) {
  if (!remote) return;
  state.classes = remote.classes || [];
  state.events = normalizeEvents(remote);
  state.currentClassId = remote.currentClassId || "";
  state.rules = remote.rules?.length ? remote.rules : state.rules;
  state.shopItems = remote.shopItems?.length ? remote.shopItems : state.shopItems;
  state.levelExp = remote.levelExp || 40;
  state.ui = remote.ui || state.ui;
  state.sync.remoteVersion = version || state.sync.remoteVersion || 0;
}

function composeOnlineState() {
  return {
    classes: state.classes,
    currentClassId: state.currentClassId,
    rules: state.rules,
    shopItems: state.shopItems,
    levelExp: state.levelExp,
    ui: state.ui
  };
}

function mergeStates(localState, remoteState) {
  const merged = structuredClone(remoteState || {});
  const localClasses = localState.classes || [];
  const remoteClasses = merged.classes || [];
  const classMap = new Map();
  for (const c of remoteClasses) classMap.set(c.id, structuredClone(c));
  for (const c of localClasses) {
    if (!classMap.has(c.id)) {
      classMap.set(c.id, structuredClone(c));
      continue;
    }
    const rc = classMap.get(c.id);
    rc.name = c.name || rc.name;
    rc.students = mergeById(rc.students || [], c.students || []);
    classMap.set(c.id, rc);
  }
  merged.classes = [...classMap.values()];
  merged.events = mergeLogs(merged.events || [], localState.events || []);
  merged.currentClassId = localState.currentClassId || merged.currentClassId || merged.classes[0]?.id || "";
  merged.rules = mergeById(merged.rules || [], localState.rules || []);
  merged.shopItems = mergeById(merged.shopItems || [], localState.shopItems || []);
  merged.levelExp = Math.max(localState.levelExp || 40, merged.levelExp || 40);
  merged.ui = localState.ui || merged.ui || { viewMode: "teacher" };
  return merged;
}

function mergeById(baseList, patchList) {
  const map = new Map();
  for (const x of baseList) map.set(x.id, structuredClone(x));
  for (const x of patchList) map.set(x.id, structuredClone(x));
  return [...map.values()];
}

function mergeLogs(a, b) {
  const map = new Map();
  for (const x of a) map.set(x.id, structuredClone(x));
  for (const x of b) map.set(x.id, structuredClone(x));
  return [...map.values()].sort((x, y) => (x.time || 0) - (y.time || 0));
}

function calculateWeeklyProgress(cls) {
  const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const map = new Map();
  for (const st of cls.students) map.set(st.id, { studentId: st.id, studentName: st.name, delta: 0 });
  for (const log of getEventsForClass(cls.id)) {
    if (log.time < since || log.reverted) continue;
    if (typeof log.delta !== "number") continue;
    const item = map.get(log.studentId);
    if (!item) continue;
    item.delta += log.delta;
  }
  return [...map.values()].sort((a, b) => b.delta - a.delta);
}

function buildWeeklyReportRows(cls) {
  const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const rows = [["班级", "学生", "时间", "类型", "分值变化", "原因", "备注", "规则快照", "是否撤回"]];
  for (const log of getEventsForClass(cls.id)) {
    if (log.time < since) continue;
    rows.push([
      cls.name,
      log.studentName || "",
      fmtTime(log.time),
      log.type || "score",
      String(log.delta ?? 0),
      log.reason || "",
      log.detail || "",
      log.ruleSnapshot ? JSON.stringify(log.ruleSnapshot) : "",
      log.reverted ? "是" : "否"
    ]);
  }
  return rows;
}

function appendEvent(event) {
  state.events.push({
    id: uid(),
    time: Date.now(),
    reverted: false,
    ...event
  });
}

function getEventsForClass(classId) {
  return (state.events || []).filter((x) => x.classId === classId);
}

function normalizeEvents(source) {
  const directEvents = Array.isArray(source.events) ? source.events : [];
  if (directEvents.length > 0) return directEvents;
  const migrated = [];
  for (const cls of source.classes || []) {
    for (const log of cls.logs || []) {
      migrated.push({
        ...log,
        classId: cls.id
      });
    }
  }
  return migrated;
}

function downloadCsv(filename, rows) {
  const text = rows.map((r) => r.map(csvCell).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvCell(v) {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return `"${s.replaceAll("\"", "\"\"")}"`;
  }
  return s;
}

function todayText() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

async function loadStudentsByInviteCode() {
  const apiBase = (el.apiBaseInput.value || "").trim();
  const inviteCode = (el.inviteCodeInput.value || "").trim();
  if (!apiBase || !inviteCode) return alert("请先填写后端地址和邀请码");
  try {
    const res = await fetch(`${apiBase}/api/public/students?inviteCode=${encodeURIComponent(inviteCode)}`);
    const data = await res.json();
    if (!res.ok) return alert(data.error || "加载失败");
    const options = (data.students || []).map((s) => ({ value: s.id, label: `${s.name}（${s.className}）` }));
    fillSelect(el.parentChildIdSelect, options);
    if (!options.length) return alert("该邀请码下暂无学生，请班主任先创建班级并录入学生");
    state.sync.inviteCode = inviteCode;
    saveAndRender();
  } catch (_) {
    alert("加载失败，请检查后端");
  }
}
