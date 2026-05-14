const STORAGE_KEY = "mimo-orbit-evidence-studio-v1";

const fields = [
  "projectName",
  "role",
  "valueProp",
  "agentTool",
  "modelSeries",
  "usageScene",
  "problem",
  "features",
  "result",
  "githubUrl",
  "demoUrl",
  "proofNotes",
];

const sampleData = {
  projectName: "Agent 项目证据整理生成器",
  role: "独立开发者 / AI 工作流实践者",
  valueProp: "帮助开发者把 Agent 项目成果快速整理成可提交的申请材料与公开证明页面",
  agentTool: "Codex",
  modelSeries: "GPT 系列",
  usageScene: "静态网站搭建、申请文案整理、README 生成、GitHub 发布准备",
  problem:
    "很多开发者已经在用 Agent 工具做项目，但在申请资源激励时，往往缺少一份结构化、清晰、可验证的成果说明，导致项目价值难以快速被评估。",
  features:
    "我用 Agent 工作流搭建了一个轻量静态工具页，支持录入项目关键信息、生成可直接提交的申请摘要、导出 README 片段、整理 proof checklist，并对 GitHub 与 Demo 链接做基础校验。",
  result:
    "最终产出了一个可公开展示的 GitHub Pages 项目，以及一套可直接复用的申请材料模板，降低了整理成果和提交证明的成本，也让项目价值更容易被审核方理解。",
  githubUrl: "https://github.com/your-name/agent-evidence-studio",
  demoUrl: "https://your-name.github.io/agent-evidence-studio/",
  proofNotes:
    "1) 首页整体截图；2) 申请摘要导出截图；3) README 片段截图；4) 本地运行终端截图；5) GitHub Pages 在线页截图。",
};

const form = document.querySelector("#evidenceForm");
const statusMessage = document.querySelector("#statusMessage");
const summaryOutput = document.querySelector("#summaryOutput");
const readmeOutput = document.querySelector("#readmeOutput");
const proofOutput = document.querySelector("#proofOutput");
const completionList = document.querySelector("#completionList");
const generateBtn = document.querySelector("#generateBtn");
const copySummaryBtn = document.querySelector("#copySummaryBtn");
const copyReadmeBtn = document.querySelector("#copyReadmeBtn");
const resetBtn = document.querySelector("#resetBtn");
const loadSampleBtn = document.querySelector("#loadSampleBtn");

function getField(id) {
  return document.getElementById(id);
}

function readState() {
  return fields.reduce((accumulator, key) => {
    accumulator[key] = getField(key).value.trim();
    return accumulator;
  }, {});
}

function writeState(state) {
  fields.forEach((key) => {
    const value = state[key] || "";
    getField(key).value = value;
  });
  updateCompletion(readState());
}

function saveDraft() {
  const state = readState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  updateCompletion(state);
}

function loadDraft() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    updateCompletion(readState());
    return;
  }

  try {
    writeState(JSON.parse(stored));
    setStatus("已恢复本地草稿。", "success");
  } catch (error) {
    console.error(error);
    setStatus("草稿恢复失败，已忽略旧数据。", "error");
  }
}

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = "status-message";
  if (type) {
    statusMessage.classList.add(type);
  }
}

function isValidUrl(value) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function validate(state) {
  const missing = [];

  if (!state.projectName) missing.push("项目名");
  if (!state.role) missing.push("角色");
  if (!state.agentTool) missing.push("Agent 工具");
  if (!state.modelSeries) missing.push("模型系列");
  if (!state.problem) missing.push("问题描述");
  if (!state.features) missing.push("功能描述");
  if (!state.result) missing.push("结果描述");

  if (state.githubUrl && !isValidUrl(state.githubUrl)) {
    missing.push("有效的 GitHub 链接");
  }

  if (state.demoUrl && !isValidUrl(state.demoUrl)) {
    missing.push("有效的 Demo 链接");
  }

  return missing;
}

function buildSummary(state) {
  const valueSentence = state.valueProp
    ? `这个项目的目标是${state.valueProp}。`
    : "";
  const sceneSentence = state.usageScene
    ? `我主要在${state.usageScene}场景下使用 ${state.agentTool}，底层模型以${state.modelSeries}为主。`
    : `我主要使用 ${state.agentTool}，底层模型以${state.modelSeries}为主。`;

  return [
    `我是一名${state.role}，最近完成了「${state.projectName}」这个 AI / Agent 驱动的小型项目。`,
    valueSentence,
    sceneSentence,
    `这个项目主要解决的问题是：${state.problem}`,
    `我实现的核心能力包括：${state.features}`,
    `当前已经形成的成果是：${state.result}`,
    state.githubUrl ? `项目仓库已公开：${state.githubUrl}` : "项目仓库链接将在发布后补充。",
    state.demoUrl ? `在线演示地址：${state.demoUrl}` : "在线演示地址将在 GitHub Pages 发布后补充。",
    "这套交付物可以直接作为项目成果证明，也方便审核方快速理解我的 Agent 工作流和实际产出。",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildReadmeSection(state) {
  const githubLine = state.githubUrl ? `- GitHub：${state.githubUrl}` : "- GitHub：待发布";
  const demoLine = state.demoUrl ? `- 在线演示：${state.demoUrl}` : "- 在线演示：待发布";

  return [
    "## 项目简介",
    "",
    `**${state.projectName}** 是一个面向 Xiaomi MiMo 激励计划准备场景的轻量工具页，用来整理 Agent 项目成果、证明材料与申请摘要。`,
    "",
    "### Why this project",
    "",
    `${state.problem}`,
    "",
    "### AI / Agent workflow",
    "",
    `- 常用 Agent 工具：${state.agentTool || "待填写"}`,
    `- 主要模型系列：${state.modelSeries || "待填写"}`,
    `- 使用场景：${state.usageScene || "待填写"}`,
    "",
    "### 已完成能力",
    "",
    `${state.features}`,
    "",
    "### 当前结果",
    "",
    `${state.result}`,
    "",
    "### 链接",
    "",
    githubLine,
    demoLine,
    "",
    "### 提交模板",
    "",
    "> 我使用 Agent 工具完成了一个真实可运行的项目，并通过公开仓库、在线 Demo、截图和 README 文档来证明项目成果与交付能力。",
  ].join("\n");
}

function buildProofChecklist(state) {
  return [
    "Proof Checklist",
    "",
    `[${state.githubUrl ? "x" : " "}] GitHub 项目链接`,
    `[${state.demoUrl ? "x" : " "}] 在线 Demo / GitHub Pages 链接`,
    `[${state.proofNotes ? "x" : " "}] 截图 / 录屏 / 终端说明`,
    "[ ] 首页整体截图",
    "[ ] 导出摘要截图",
    "[ ] README / 文档截图",
    "[ ] 本地运行终端截图",
    "[ ] 公开仓库 About 区已填写 Demo 链接",
    "",
    `补充说明：${state.proofNotes || "建议加入首页、导出区、终端运行与 GitHub Pages 截图。"} `,
  ].join("\n");
}

function updateCompletion(state) {
  const items = [
    { label: "项目名与角色已填写", done: Boolean(state.projectName && state.role) },
    { label: "Agent 工具与模型系列已填写", done: Boolean(state.agentTool && state.modelSeries) },
    { label: "问题、功能、结果三段已写完整", done: Boolean(state.problem && state.features && state.result) },
    { label: "GitHub 链接格式有效", done: !state.githubUrl || isValidUrl(state.githubUrl) },
    { label: "Demo 链接格式有效", done: !state.demoUrl || isValidUrl(state.demoUrl) },
    { label: "证明材料说明已补充", done: Boolean(state.proofNotes) },
  ];

  completionList.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.label;
    if (item.done) {
      li.classList.add("done");
    }
    completionList.appendChild(li);
  });
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus(`${label}已复制到剪贴板。`, "success");
  } catch (error) {
    console.error(error);
    setStatus(`复制${label}失败，请手动选择复制。`, "error");
  }
}

function generateOutputs() {
  const state = readState();
  const missing = validate(state);

  if (missing.length > 0) {
    setStatus(`还需要补充：${missing.join("、")}`, "error");
    return;
  }

  const summary = buildSummary(state);
  const readme = buildReadmeSection(state);
  const proof = buildProofChecklist(state);

  summaryOutput.textContent = summary;
  readmeOutput.textContent = readme;
  proofOutput.textContent = proof;
  setStatus("已生成申请摘要、README 片段和 proof checklist。", "success");
}

function resetDraft() {
  form.reset();
  localStorage.removeItem(STORAGE_KEY);
  summaryOutput.textContent = "点击“生成提交内容”后会在这里出现可直接提交的中文摘要。";
  readmeOutput.textContent = "README 片段会包含项目简介、AI 工作流说明、链接和 proof 建议。";
  proofOutput.textContent = "Proof checklist 会提醒你补齐 GitHub、Demo、截图和终端证据。";
  updateCompletion(readState());
  setStatus("已清空页面内容与本地草稿。");
}

function attachEvents() {
  fields.forEach((key) => {
    getField(key).addEventListener("input", saveDraft);
    getField(key).addEventListener("change", saveDraft);
  });

  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.scrollTarget);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  generateBtn.addEventListener("click", generateOutputs);
  copySummaryBtn.addEventListener("click", () => copyText(summaryOutput.textContent, "申请摘要"));
  copyReadmeBtn.addEventListener("click", () => copyText(readmeOutput.textContent, "README 片段"));
  resetBtn.addEventListener("click", resetDraft);
  loadSampleBtn.addEventListener("click", () => {
    writeState(sampleData);
    saveDraft();
    generateOutputs();
  });
}

function maybeLoadSampleFromQuery() {
  const url = new URL(window.location.href);
  const shouldLoadSample = url.searchParams.get("sample") === "1" || url.searchParams.get("demo") === "1";

  if (!shouldLoadSample) {
    return;
  }

  writeState(sampleData);
  saveDraft();
  generateOutputs();
  setStatus("已按链接参数加载演示示例。", "success");
}

attachEvents();
loadDraft();
maybeLoadSampleFromQuery();
